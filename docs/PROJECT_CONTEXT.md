# PROJECT_CONTEXT.md
**This file is the source of truth. Every other document and every AI coding agent must defer to this file in case of conflict.**

## Project Mission
Convert citizen-submitted evidence about local infrastructure issues into real, sendable action artifacts (complaint, RTI draft, community summary), instead of building another passive issue-reporting dashboard.

## Product Vision
A platform where reporting an issue produces a tangible next step — a drafted, reviewable, sendable document — within minutes, grounded entirely in evidence the user actually submitted.

## Core Principles
1. **Accountability over reporting.** The differentiator is what happens after a report, not how easy the report form is.
2. **Evidence over invention.** Every number, claim, or ranking shown to a user or judge must trace back to actual submitted reports. No metric may imply a fact about a real official, department, or government performance unless it is independently verifiable.
3. **Action over analytics.** At least one agent in the pipeline must produce a real-world artifact or perform a real action (send, export, create) — not just classify and display.
4. **Draft, not authority.** AI-generated legal/official-facing documents (RTI, complaint) are always labeled as drafts for human review, never as final, approved, or legally binding.
5. **Ship the core loop before adding features.** A working 3-agent loop beats a broken 5-agent loop.

## What We Will Build
- Photo-based issue intake with Gemini Vision classification.
- Duplicate/cluster detection across nearby reports.
- Evidence-based Impact Intelligence (affected area, report frequency, risk level, consequence narrative).
- Action Generator producing: Complaint Draft, RTI Draft, Community Issue Summary.
- Escalation Agent that performs one real external action: send email and/or generate PDF export.
- A public tracker showing issues, evidence counts, and escalation status — all explicitly labeled as self-reported/crowdsourced.

## What We Will NOT Build
- Fake or simulated "ward health scores," "officer resolution rates," or any metric presented as a measurement of real government/official performance.
- Any claim of legal authority, court-readiness, or guaranteed validity for generated documents.
- Surveillance-style or political-profiling features (e.g., ranking named real officials by invented performance numbers).
- Feature sprawl beyond the 5-agent core before the core loop is fully working end-to-end.
- Gamification, voice input, or real-time animation — only if Tier 1 and Tier 2 scope is complete with time remaining (see `TASK_TRACKER.md`).

## User Personas
| Persona | Goal | Pain Point |
|---|---|---|
| Reporting Citizen | Document a local issue with minimal effort | No tool turns a photo into something actionable |
| Concerned Resident / Community Group | See evidence of a recurring problem in their area | No compiled, presentable evidence trail exists today |
| Judge / Evaluator | Assess real agentic AI and real-world credibility | Most submissions are read→display dashboards with invented numbers |

## Success Metrics (Hackathon Scope)
- End-to-end pipeline (photo → classification → cluster → impact summary → action draft → real send/export) works live, on demand.
- Zero fabricated claims about real entities anywhere in the demo, UI copy, or documentation.
- At least one genuinely external action (email sent or PDF generated) demonstrable live.
- Deployed, publicly accessible link stable through the evaluation window.

## Constraints
- Solo developer, ~6 build days remaining.
- Must use Google AI Studio as the core build/deploy tool (hard submission requirement).
- No access to real municipal performance datasets — therefore no performance metrics about real entities may be fabricated to fill that gap (see Truth 2 below).

## Known Tradeoffs
- Using SQLite instead of Firebase: faster to build solo, slightly less "Google ecosystem" surface area on the database layer; offset by depth of Gemini Vision/function-calling usage.
- Impact Intelligence reports frequency/evidence-based risk instead of a single fabricated score: less flashy in a screenshot, but survives judge cross-examination — explicitly the lesson from the destruction-test review.
- RTI Draft Generator retained (not cut) per final product decision, but repositioned as "AI-generated draft — review before submission," removing the legal-authority claim while keeping the memorable artifact.

---

## Critical Rules For AI Agents

Any AI coding agent (Claude, Cursor, Windsurf, GPT, Gemini, Antigravity, etc.) working on this codebase must follow these rules without exception:

1. **Never invent APIs, database fields, or routes.** If a needed field/endpoint doesn't exist, propose it in `DECISION_LOG.md` and add it to `API_CONTRACTS.md` / `DATABASE_SCHEMA.md` before implementing.
2. **Never rename existing interfaces or break backward compatibility** without updating `DECISION_LOG.md` and all dependent docs in the same change.
3. **Never introduce a fabricated metric, score, or ranking about a real official, department, or government entity.** This is the single highest-priority constraint in the project (see `ARCHITECTURAL_TRUTHS.md` Truth 2). If a feature requires such data and none is verifiably available, the feature must be evidence-based instead (counts, frequency, affected area) — never invented.
4. **Never claim legal authority for generated documents.** RTI drafts, complaint drafts, and escalation drafts must always carry a "AI-generated draft — review before submission" disclaimer in both UI copy and document content.
5. **Never build a fifth analytics-only agent and call it "agentic."** At least one agent in the pipeline must perform a real action (send, export, create an artifact) outside the analytics/display layer.
6. **Ask for clarification if context is missing** rather than assuming or inventing project facts.
7. **Defer to this file** if any other document appears to conflict with these rules.
