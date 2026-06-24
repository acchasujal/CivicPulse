import json
import logging
from typing import Optional, Literal
from pydantic import BaseModel, Field, model_validator
from sqlmodel import Session, select
from datetime import datetime

from app.models.cluster import Cluster
from app.models.issue import Issue
from app.models.impact_summary import ImpactSummary
from app.services.gemini_client import GeminiClient

logger = logging.getLogger("civicpulse")

class Agent3Output(BaseModel):
    affected_area_description: str = Field(..., description="Evidence-based description of the affected area")
    potential_consequences: str = Field(..., description="Potential consequences grounded in the evidence")
    risk_level: Literal["low", "moderate", "high"] = Field(..., description="Assessed risk level")
    evidence_count: int = Field(..., description="Count of reports/evidence in the cluster")

    @model_validator(mode="after")
    def validate_content(self) -> 'Agent3Output':
        # Check for forbidden pattern: "Officer Sharma has resolved"
        for val in [self.affected_area_description, self.potential_consequences]:
            if val and "officer sharma has resolved" in val.lower():
                logger.warning(
                    "agent_3_validation_failure | output contained forbidden text: 'Officer Sharma has resolved'"
                )
                raise ValueError("Forbidden content detected: 'Officer Sharma has resolved' is not allowed.")
        return self

async def analyze_cluster_impact(
    cluster_id: str,
    session: Session,
    gemini_client: Optional[GeminiClient] = None
) -> ImpactSummary:
    """
    Agent 3: Impact Intelligence.
    Synthesizes the community impact of all reports in the cluster.
    Enforces rules: no ward scores, no rankings, no names of officials/departments.
    """
    if gemini_client is None:
        gemini_client = GeminiClient()

    # 1. Fetch cluster
    cluster = session.get(Cluster, cluster_id)
    if not cluster:
        raise ValueError(f"Cluster with id {cluster_id} not found")

    # 2. Fetch all issues in the cluster
    issues = session.exec(
        select(Issue).where(Issue.cluster_id == cluster_id)
    ).all()

    if not issues:
        raise ValueError(f"No issues found for cluster {cluster_id}")

    # Compile issue data to provide context
    issue_type = issues[0].issue_type
    prompt_data = {
        "cluster_id": cluster.id,
        "area_label": cluster.area_label,
        "issue_type": issue_type,
        "evidence_count": len(issues),
        "issues": [
            {
                "id": issue.id,
                "severity": issue.severity,
                "description": issue.description,
                "user_note": issue.user_note
            }
            for issue in issues
        ]
    }

    system_instruction = (
        "You are Agent 3 (Impact Intelligence) for CivicPulse. "
        "Analyze the provided cluster of civic issues and synthesize an impact intelligence summary.\n"
        "Generate a structured JSON output matching the requested schema.\n"
        "Strictly adhere to these rules:\n"
        "1. Ground all descriptions and consequences purely in the provided issue details, severity, issue type, and counts. Do not speculate or invent evidence.\n"
        "2. Do NOT generate, display, or refer to any 'ward score', 'department ranking', 'officer resolution rates', 'performance metrics', or 'resolution estimates'.\n"
        "3. Do NOT mention, name, or attribute any action/responsibility to specific named officials or departments. Never output statements implying an official has resolved the issue (e.g. 'Officer Sharma has resolved').\n"
        "4. Set the risk_level based logically on the severity and count of the reports."
    )

    # 3. Call Gemini
    result = await gemini_client.generate_structured_output(
        prompt=json.dumps(prompt_data),
        response_schema=Agent3Output,
        system_instruction=system_instruction
    )

    # 4. Create or update ImpactSummary
    # Look for an existing summary for this cluster
    db_summary = session.exec(
        select(ImpactSummary).where(ImpactSummary.cluster_id == cluster_id)
    ).first()

    if db_summary:
        db_summary.affected_area_description = result.affected_area_description
        db_summary.potential_consequences = result.potential_consequences
        db_summary.risk_level = result.risk_level
        db_summary.evidence_count = result.evidence_count
        db_summary.generated_at = datetime.utcnow().isoformat() + "Z"
        session.add(db_summary)
        logger.info(f"agent_3_impact_updated | cluster_id={cluster_id} | summary_id={db_summary.id}")
    else:
        db_summary = ImpactSummary(
            cluster_id=cluster_id,
            affected_area_description=result.affected_area_description,
            potential_consequences=result.potential_consequences,
            risk_level=result.risk_level,
            evidence_count=result.evidence_count,
            generated_at=datetime.utcnow().isoformat() + "Z"
        )
        session.add(db_summary)
        logger.info(f"agent_3_impact_created | cluster_id={cluster_id} | summary_id={db_summary.id}")

    session.commit()
    session.refresh(db_summary)
    return db_summary
