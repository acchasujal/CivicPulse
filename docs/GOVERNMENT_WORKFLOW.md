# Government Workflow Architecture

## Overview
CivicPulse powers a multi-stage government case resolution lifecycle with strict Finite State Machine (FSM) validation, department assignments, and immutable audit logs.

## Finite State Machine
Valid transitions are enforced across all 17 system states:
- `classified` -> `clustered` / `pending_review` / `drafted`
- `drafted` -> `approved` / `escalated`
- `approved` / `escalated` -> `acknowledged` / `assigned`
- `assigned` -> `work_in_progress` / `inspection`
- `work_in_progress` -> `repair_completed`
- `repair_completed` -> `verification_requested` / `verified`
- `verified` -> `resolved` -> `closed`
- `closed` -> `reopened`

## Immutable Audit Trail
Every transition logs an immutable entry in table `case_transitions` with timestamp, actor ID, role, department, previous state, new state, and rationale.
