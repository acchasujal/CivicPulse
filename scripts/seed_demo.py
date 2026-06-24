import os
import sys
import argparse
from sqlmodel import Session, SQLModel, select
from sqlalchemy import text

# Adjust sys.path to import app modules correctly from the backend directory
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.db import engine, init_db
from app.models import Cluster, Issue, ImpactSummary, ActionDraft, Escalation

def wipe_database(session: Session):
    # Delete in reverse order of foreign key dependencies
    session.execute(text("DELETE FROM escalations"))
    session.execute(text("DELETE FROM action_drafts"))
    session.execute(text("DELETE FROM impact_summaries"))
    session.execute(text("DELETE FROM issues"))
    session.execute(text("DELETE FROM clusters"))
    session.commit()

def seed_data(session: Session):
    # Cluster 1
    cluster_1 = Cluster(
        id="demo-cluster-001",
        area_label="Andheri East Junction, near Marol Naka",
        center_lat=19.1197,
        center_lng=72.8792,
        report_count=3,
        first_reported_at="2026-06-20T09:15:00Z",
        last_reported_at="2026-06-23T14:30:00Z"
    )
    
    # Issues in Cluster 1
    issues_c1 = [
        Issue(
            id="demo-issue-001",
            photo_url="demo_assets/pothole_01.jpg",
            latitude=19.1196,
            longitude=72.8791,
            user_note="Large pothole near the bus stop, cars swerving into oncoming traffic",
            issue_type="road_damage",
            severity=4,
            description="Deep pothole approximately 60cm wide at Andheri East junction. Road surface degraded, vehicles swerving.",
            credibility_score=0.88,
            cluster_id="demo-cluster-001",
            status="drafted",
            created_at="2026-06-20T09:15:00Z"
        ),
        Issue(
            id="demo-issue-002",
            photo_url="demo_assets/pothole_02.jpg",
            latitude=19.1198,
            longitude=72.8793,
            user_note=None,
            issue_type="road_damage",
            severity=4,
            description="Multiple potholes in 20m stretch on main road. Surface deterioration visible.",
            credibility_score=0.82,
            cluster_id="demo-cluster-001",
            status="drafted",
            created_at="2026-06-21T11:00:00Z"
        ),
        Issue(
            id="demo-issue-003",
            photo_url="demo_assets/pothole_03.jpg",
            latitude=19.1195,
            longitude=72.8790,
            user_note="Getting worse after the rain",
            issue_type="road_damage",
            severity=5,
            description="Severe road damage at junction. Pothole depth has increased after recent rainfall.",
            credibility_score=0.91,
            cluster_id="demo-cluster-001",
            status="drafted",
            created_at="2026-06-23T14:30:00Z"
        )
    ]
    
    # Impact Summary for Cluster 1
    impact_c1 = ImpactSummary(
        id="demo-impact-001",
        cluster_id="demo-cluster-001",
        affected_area_description="Approximately 20-metre stretch of road surface at Andheri East Junction near Marol Naka, a high-traffic area used by buses, auto-rickshaws, and private vehicles.",
        potential_consequences="Risk of vehicle damage, tyre blowouts, and rider accidents. Pedestrians crossing the junction face uneven surfaces. Road deterioration may accelerate during monsoon season.",
        risk_level="high",
        evidence_count=3,
        generated_at="2026-06-23T14:31:00Z"
    )
    
    # Action Drafts for Cluster 1
    drafts_c1 = [
        ActionDraft(
            id="demo-draft-001",
            cluster_id="demo-cluster-001",
            draft_type="complaint",
            content=(
                "AI-generated draft. Review before submission.\n\n"
                "To: Ward Officer, Andheri East Ward\n"
                "Subject: Complaint Regarding Road Damage at Andheri East Junction\n\n"
                "This complaint is submitted on behalf of residents regarding a road damage issue at Andheri East Junction, "
                "near Marol Naka, reported across 3 community submissions between June 20 and June 23, 2026.\n\n"
                "Evidence Summary:\n"
                "- Reports submitted: 3\n"
                "- Issue type: Road damage (potholes)\n"
                "- Severity assessed: High (average 4.3 out of 5 across reports)\n"
                "- Affected area: Approximately 20-metre stretch at junction\n"
                "- Risk level: High — vehicles swerving, pedestrian hazard\n\n"
                "We request urgent inspection and repair of the road surface at the above location.\n\n"
                "[Names and contact information to be added by submitter before sending]"
            ),
            status="pending_review",
            created_at="2026-06-23T14:31:00Z"
        ),
        ActionDraft(
            id="demo-draft-002",
            cluster_id="demo-cluster-001",
            draft_type="rti",
            content=(
                "AI-generated draft. Review before submission.\n\n"
                "Application Under the Right to Information Act, 2005\n"
                "To: Public Information Officer, Municipal Corporation\n\n"
                "1. Information Requested:\n"
                "   a. Status of road repair work at Andheri East Junction, near Marol Naka, as of the date of this application.\n"
                "   b. Date on which the road damage at this location was last inspected by municipal authorities.\n"
                "   c. Budget allocated for road repair in this ward for the current financial year.\n"
                "   d. Timeline for repair of the above location, if any repair order has been issued.\n\n"
                "2. Background:\n"
                "   Three separate citizens reported road damage at this location between June 20 and June 23, 2026, "
                "with severity rated 4–5 out of 5 in each report.\n\n"
                "Note: This draft was generated by AI software. The applicant must review, verify, and sign this application "
                "before submission. This is not a legal document and does not constitute legal advice."
            ),
            status="pending_review",
            created_at="2026-06-23T14:31:00Z"
        ),
        ActionDraft(
            id="demo-draft-003",
            cluster_id="demo-cluster-001",
            draft_type="community_summary",
            content=(
                "Community Issue Report: Road Damage at Andheri East Junction\n\n"
                "Location: Andheri East Junction, near Marol Naka, Mumbai\n"
                "Reports filed: 3 (June 20–23, 2026)\n"
                "Risk level: High\n\n"
                "Three community members have independently reported significant road damage at this location. "
                "Reports describe multiple potholes over a 20-metre stretch, with road surface deterioration "
                "noted to be worsening after rainfall. The area is high-traffic and used by pedestrians and public transport.\n\n"
                "This summary is based entirely on community-submitted reports and photos. No government performance data "
                "is included. All information is self-reported by residents."
            ),
            status="pending_review",
            created_at="2026-06-23T14:31:00Z"
        )
    ]

    # Cluster 2
    cluster_2 = Cluster(
        id="demo-cluster-002",
        area_label="Linking Road, Bandra West, near Turner Road junction",
        center_lat=19.0607,
        center_lng=72.8362,
        report_count=3,
        first_reported_at="2026-06-19T20:45:00Z",
        last_reported_at="2026-06-22T21:10:00Z"
    )
    
    # Issues in Cluster 2
    issues_c2 = [
        Issue(
            id="demo-issue-004",
            photo_url="demo_assets/streetlight_01.jpg",
            latitude=19.0606,
            longitude=72.8361,
            user_note="Streetlight has been out for two weeks",
            issue_type="lighting",
            severity=3,
            description="Non-functional streetlight on Linking Road. Area dark at night. First observed approximately 2 weeks ago.",
            credibility_score=0.79,
            cluster_id="demo-cluster-002",
            status="drafted",
            created_at="2026-06-19T20:45:00Z"
        ),
        Issue(
            id="demo-issue-005",
            photo_url="demo_assets/streetlight_02.jpg",
            latitude=19.0608,
            longitude=72.8363,
            user_note="Two lights out near the junction, feels unsafe at night",
            issue_type="lighting",
            severity=3,
            description="Two adjacent streetlights non-functional near Turner Road junction. Safety concern for evening pedestrians.",
            credibility_score=0.84,
            cluster_id="demo-cluster-002",
            status="drafted",
            created_at="2026-06-21T19:30:00Z"
        ),
        Issue(
            id="demo-issue-006",
            photo_url="demo_assets/streetlight_03.jpg",
            latitude=19.0605,
            longitude=72.8360,
            user_note=None,
            issue_type="lighting",
            severity=3,
            description="Streetlight outage persists on Linking Road. Dark section approximately 30m in length.",
            credibility_score=0.76,
            cluster_id="demo-cluster-002",
            status="drafted",
            created_at="2026-06-22T21:10:00Z"
        )
    ]
    
    # Impact Summary for Cluster 2
    impact_c2 = ImpactSummary(
        id="demo-impact-002",
        cluster_id="demo-cluster-002",
        affected_area_description="Approximately 30-metre section of Linking Road, Bandra West, near Turner Road junction, a busy commercial and pedestrian area.",
        potential_consequences="Reduced visibility at night increases pedestrian and cyclist safety risk. Commercial area with evening foot traffic. Extended outage may attract opportunistic incidents.",
        risk_level="moderate",
        evidence_count=3,
        generated_at="2026-06-22T21:11:00Z"
    )
    
    # Action Drafts for Cluster 2
    drafts_c2 = [
        ActionDraft(
            id="demo-draft-004",
            cluster_id="demo-cluster-002",
            draft_type="complaint",
            content=(
                "AI-generated draft. Review before submission.\n\n"
                "To: Ward Officer, Bandra West Ward\n"
                "Subject: Complaint Regarding Streetlight Outage on Linking Road\n\n"
                "This complaint is submitted on behalf of residents regarding non-functional streetlights on Linking Road, "
                "near Turner Road junction, reported across 3 community submissions between June 19 and June 22, 2026.\n\n"
                "Evidence Summary:\n"
                "- Reports submitted: 3\n"
                "- Issue type: Lighting (streetlights)\n"
                "- Severity assessed: Moderate (average 3.0 out of 5 across reports)\n"
                "- Affected area: Approximately 30-metre section\n"
                "- Risk level: Moderate — dark area safety concern\n\n"
                "We request urgent repair of the streetlights at the above location.\n\n"
                "[Names and contact information to be added by submitter before sending]"
            ),
            status="pending_review",
            created_at="2026-06-22T21:11:00Z"
        ),
        ActionDraft(
            id="demo-draft-005",
            cluster_id="demo-cluster-002",
            draft_type="rti",
            content=(
                "AI-generated draft. Review before submission.\n\n"
                "Application Under the Right to Information Act, 2005\n"
                "To: Public Information Officer, Municipal Corporation\n\n"
                "1. Information Requested:\n"
                "   a. Status of streetlight maintenance and repair contracts for Linking Road, Bandra West, as of the date of this application.\n"
                "   b. Record of inspections conducted on Linking Road street lighting in the last 30 days.\n"
                "   c. Details of complaints logged regarding streetlight outages at or near Turner Road junction during June 2026.\n\n"
                "2. Background:\n"
                "   Three separate citizens reported dark streetlights at this location between June 19 and June 22, 2026.\n\n"
                "Note: This draft was generated by AI software. The applicant must review, verify, and sign this application "
                "before submission. This is not a legal document and does not constitute legal advice."
            ),
            status="pending_review",
            created_at="2026-06-22T21:11:00Z"
        ),
        ActionDraft(
            id="demo-draft-006",
            cluster_id="demo-cluster-002",
            draft_type="community_summary",
            content=(
                "Community Issue Report: Streetlight Outage on Linking Road\n\n"
                "Location: Linking Road, Bandra West, near Turner Road junction, Mumbai\n"
                "Reports filed: 3 (June 19–22, 2026)\n"
                "Risk level: Moderate\n\n"
                "Three community members have independently reported non-functional streetlights on Linking Road. "
                "Reports describe outages extending over a 30-metre section, creating dark areas near the junction. "
                "This is a busy commercial and pedestrian zone, and residents note safety concerns at night.\n\n"
                "This summary is based entirely on community-submitted reports and photos. No government performance data "
                "is included. All information is self-reported by residents."
            ),
            status="pending_review",
            created_at="2026-06-22T21:11:00Z"
        )
    ]

    # Save to DB
    session.add(cluster_1)
    session.add(cluster_2)
    for issue in issues_c1 + issues_c2:
        session.add(issue)
    session.add(impact_c1)
    session.add(impact_c2)
    for draft in drafts_c1 + drafts_c2:
        session.add(draft)
    session.commit()

def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass  # sys.stdout might not support reconfigure in some test environments

    parser = argparse.ArgumentParser(description="Seed CivicPulse SQLite database with demo data.")
    parser.add_argument("--wipe", action="store_true", help="Delete all rows from all tables before seeding.")
    args = parser.parse_args()

    # Ensure tables exist
    init_db()

    with Session(engine) as session:
        if args.wipe:
            wipe_database(session)
        
        # Check if already seeded to ensure idempotency if --wipe is not specified
        existing_clusters = session.exec(select(Cluster)).all()
        if existing_clusters and not args.wipe:
            print("Database already contains data. Use --wipe to reseed.")
            return

        seed_data(session)

    # Confirmations output format from DEMO_DATA_SPEC.md
    print("✓ 2 clusters created")
    print("✓ 6 issues created")
    print("✓ 2 impact summaries created")
    print("✓ 6 action drafts created (status=pending_review)")
    print("✓ Demo state ready")

if __name__ == "__main__":
    main()
