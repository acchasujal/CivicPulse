# ARCHITECTURAL_TRUTHS.md
**Hard-won constraints from adversarial review. Not suggestions. Override all other design preferences.**

## TRUTH 1 — The Core Problem Is Accountability, Not Reporting
Citizens already report issues. The bottleneck is that reports produce no consequence. Every architectural decision should increase accountability and real action, not just improve the reporting workflow.

## TRUTH 2 — Evidence Must Be Real
Never rely on fake officer rankings, fake ward/health scores, fake municipal performance metrics, fake resolution statistics, fabricated historical datasets, or invented government records. If a judge asks "where did this number come from?", the answer must always be: user reports, uploaded images, publicly available information, or other observable evidence — never an invented dataset. No metric may imply a factual claim about a real person, officer, department, or government performance without verifiable evidence.

## TRUTH 3 — Agentic AI Requires Action
`Read → Analyze → Score → Display` is analytics, not agentic AI. Target shape: `Observe → Reason → Create → Act`. At least one agent must produce a real-world artifact or perform a meaningful action (generate complaint/RTI/escalation draft, export PDF, prepare/send email, trigger notification).

## TRUTH 4 — RTI Is an Artifact, Not a Legal Authority
Never claim "court-ready," "legally approved," "official legal advice," or "guaranteed valid filing." Always label as: **"AI-generated draft. Review before submission."** Purpose is assistance, not legal authority.

## TRUTH 5 — Community Summaries, Not Political Intelligence
Avoid language implying surveillance, political profiling, official performance ratings, or government intelligence systems. Use: Community Issue Summary, Community Evidence Report, Issue Impact Summary, Escalation Package, Public Issue Tracking.

## TRUTH 6 — Impact Must Be Evidence-Based
Instead of fabricated scores, use: affected area, issue clusters, report frequency, evidence count, community impact, potential consequences, escalation status, verification status. All outputs traceable to evidence.

## TRUTH 7 — Judges Will Attack Credibility
Assume every feature will be challenged with: "Where did this data come from? Is this real? Can this be verified? Why should I trust this?" Every feature must have a defensible answer. Prioritize credibility over visual impressiveness.

## TRUTH 8 — Execution Matters More Than Additional Features
A working `Photo → Gemini Vision → Structured Output → Evidence Aggregation → Action Draft` loop beats 10 partially-completed features. Aggressively resist scope creep.

## Target Architecture (Locked)

| Agent | Function | Output |
|---|---|---|
| Agent 1 | Issue Understanding | Issue type, severity, description, evidence metadata |
| Agent 2 | Issue Verification | Duplicate detection, clustering, confidence assessment |
| Agent 3 | Impact Intelligence | Community impact, potential consequences, affected area, evidence summary — **no fabricated performance scores** |
| Agent 4 | Action Generator | Complaint draft, RTI draft, escalation draft, Community Issue Summary — all marked AI-assisted drafts |
| Agent 5 | Escalation Agent | Export, email draft/send, PDF generation, submission preparation — **must perform a real action outside the analytics layer** |

## Forbidden Patterns (any future agent must refuse to reintroduce these)
- Fake rankings of real officials/departments
- Fake governance/performance metrics
- Fabricated statistics presented as real
- Dashboard-only (non-agentic) workflows
- Legal-authority claims on generated documents
