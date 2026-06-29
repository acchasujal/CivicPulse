def build_rti_document(
    pio_designation: str,
    authority: str,
    subject: str,
    questions: list[str],
    declaration: str = "Declaration: I am a citizen of India and the requested information falls within the purview of the RTI Act 2005.",
    signature: str = "Respectfully submitted,\nApplicant"
) -> str:
    questions_str = "\n".join(f"{i+1}. {q}" for i, q in enumerate(questions))
    
    policy_rti_note = (
        "\n\n---\n"
        "RTI Act 2005 Policy Note:\n"
        "Under Section 7(1) of the Right to Information (RTI) Act, 2005, public authorities are statutorily required to respond to "
        "information requests concerning public infrastructure and maintenance records within 30 days of receipt."
    )
    
    body = f"""AI-generated draft. Review before submission.
To,
The Public Information Officer (PIO)
{pio_designation}
{authority}

Application under Section 6(1) of the Right to Information Act, 2005

Subject: {subject}

Information Requested:
{questions_str}

{declaration}

{signature}"""

    return body + policy_rti_note
