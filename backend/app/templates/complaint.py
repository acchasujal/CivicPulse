def build_complaint_document(
    municipal_header: str,
    ref_id: str,
    recipient: str,
    subject: str,
    formal_body: str,
    attachments: list[str],
    ledger_url: str,
    signature: str = "Sincerely,\nConcerned Citizens of CivicPulse"
) -> str:
    attachments_str = "\n".join(f"- {a}" for a in attachments)
    
    policy_complaint_note = (
        "\n\n---\n"
        "Public Grievance Redressal Reference:\n"
        "In accordance with standard government grievance guidelines (Department of Administrative Reforms and Public Grievances - DARPG / CPGRAMS), "
        "public infrastructure failures must be addressed in a time-bound manner by the responsible municipal authority."
    )
    
    body = f"""{municipal_header.upper()}
Reference ID: {ref_id}

To,
{recipient}

Subject: {subject}

Respected Sir/Madam,

{formal_body}

Attachments:
{attachments_str}

Public Evidence Ledger:
{ledger_url}

{signature}"""

    return body + policy_complaint_note
