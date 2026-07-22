# Case Lifecycle & Verification Engine

## Overview
Municipal case resolution requires field officer repair logging and community verification before formal closure.

## Repair & Verification Workflow
1. **Field Repair Logging**: `POST /api/cases/{id}/repair-complete` records before & after photo URLs, repair cost, contractor metadata, and officer notes.
2. **Community Verification**: `POST /api/cases/{id}/request-verification` initiates resident verification.
3. **Consensus Engine**: Citizens vote (`POST /api/cases/{id}/verify`). When 2 positive votes are logged, the case transitions to `verified_passed` and `verified` state automatically.
4. **Resolution**: `POST /api/cases/{id}/resolve` creates an official `ResolutionRecord`.
