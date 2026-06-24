import json
import logging
from typing import Optional, List
from pydantic import BaseModel, Field, model_validator
from sqlmodel import Session, select
from datetime import datetime

from app.models.cluster import Cluster
from app.models.issue import Issue
from app.models.impact_summary import ImpactSummary
from app.models.action_draft import ActionDraft
from app.services.gemini_client import GeminiClient

logger = logging.getLogger("civicpulse")

RTI_DISCLAIMER = "AI-generated draft. Review before submission."

class Agent4Output(BaseModel):
    complaint_draft: str = Field(..., description="Evidence-based formal complaint draft")
    rti_draft: str = Field(..., description="Formal RTI (Right to Information) draft. MUST begin with disclaimer.")
    community_summary: str = Field(..., description="Public-facing community evidence summary")

    @model_validator(mode="after")
    def validate_content(self) -> 'Agent4Output':
        # Enforce G2/Rule 1: RTI draft must begin with disclaimer
        if not self.rti_draft.strip().startswith(RTI_DISCLAIMER):
            logger.warning(
                f"agent_4_validation_failure | RTI draft did not start with disclaimer: '{RTI_DISCLAIMER}'"
            )
            raise ValueError(f"RTI draft content must start with: '{RTI_DISCLAIMER}'")
        return self

async def generate_action_drafts(
    cluster_id: str,
    session: Session,
    gemini_client: Optional[GeminiClient] = None
) -> List[ActionDraft]:
    """
    Agent 4: Action Generator.
    Generates three action drafts for the cluster: a complaint, an RTI request, and a community summary.
    Enforces the RTI disclaimer and strict grounding rules.
    """
    if gemini_client is None:
        gemini_client = GeminiClient()

    # 1. Fetch cluster
    cluster = session.get(Cluster, cluster_id)
    if not cluster:
        raise ValueError(f"Cluster with id {cluster_id} not found")

    # 2. Fetch existing impact summary
    impact = session.exec(
        select(ImpactSummary).where(ImpactSummary.cluster_id == cluster_id)
    ).first()
    if not impact:
        raise ValueError(f"ImpactSummary for cluster {cluster_id} not found — generate that first")

    # 3. Fetch member issues
    issues = session.exec(
        select(Issue).where(Issue.cluster_id == cluster_id)
    ).all()
    if not issues:
        raise ValueError(f"No issues found for cluster {cluster_id}")

    # Compile context
    issue_type = issues[0].issue_type
    prompt_data = {
        "cluster": {
            "id": cluster.id,
            "area_label": cluster.area_label,
            "report_count": cluster.report_count
        },
        "impact_summary": {
            "affected_area_description": impact.affected_area_description,
            "potential_consequences": impact.potential_consequences,
            "risk_level": impact.risk_level,
            "evidence_count": impact.evidence_count
        },
        "member_issues": [
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
        "You are Agent 4 (Action Generator) for CivicPulse. "
        "Generate a structured JSON output with three action drafts for this cluster of civic issues:\n"
        "- complaint_draft: A formal, evidence-based complaint draft for the municipal authority, listing the specific issues and requesting resolution.\n"
        "- rti_draft: A Right to Information (RTI) request draft to obtain information on the status of this infrastructure. It MUST begin with the exact sentence: 'AI-generated draft. Review before submission.' as the very first line.\n"
        "- community_summary: A public-facing community issue summary explaining the evidence collected, the community impact, and next steps.\n\n"
        "STRICT CONSTRAINTS:\n"
        f"1. The rti_draft MUST begin with: '{RTI_DISCLAIMER}'. Do not omit or alter this disclaimer.\n"
        "2. Ground all drafts strictly in the provided cluster details, issues, and impact summary. Do not make up facts or statistics not present in the input.\n"
        "3. Never generate officer performance claims, resolution claims, ward rankings, or fabricated statistics."
    )

    # 4. Call Gemini
    result = await gemini_client.generate_structured_output(
        prompt=json.dumps(prompt_data),
        response_schema=Agent4Output,
        system_instruction=system_instruction
    )

    # 5. Delete existing action drafts for this cluster to avoid duplicates
    existing_drafts = session.exec(
        select(ActionDraft).where(ActionDraft.cluster_id == cluster_id)
    ).all()
    for draft in existing_drafts:
        session.delete(draft)
    session.commit()

    # 6. Save new action drafts
    drafts = [
        ActionDraft(
            cluster_id=cluster_id,
            draft_type="complaint",
            content=result.complaint_draft,
            status="pending_review",
            created_at=datetime.utcnow().isoformat() + "Z"
        ),
        ActionDraft(
            cluster_id=cluster_id,
            draft_type="rti",
            content=result.rti_draft,
            status="pending_review",
            created_at=datetime.utcnow().isoformat() + "Z"
        ),
        ActionDraft(
            cluster_id=cluster_id,
            draft_type="community_summary",
            content=result.community_summary,
            status="pending_review",
            created_at=datetime.utcnow().isoformat() + "Z"
        )
    ]

    for draft in drafts:
        session.add(draft)
    
    session.commit()
    
    for draft in drafts:
        session.refresh(draft)

    logger.info(f"agent_4_drafts_created | cluster_id={cluster_id}")
    return drafts
