# Security Report

## Improvements in this pass

- Internal evaluation is no longer in the citizen shell and is disabled unless explicitly feature-flagged.
- API errors use a typed error object rather than a plain rejected object.
- Demo image inference and missing-file image hash fabrication were removed.
- The client token key is consistent across auth and API request interception.

## Findings requiring deployment action

- Backend auth and refresh endpoints are not implemented; role checks in the SPA are not an authorization boundary.
- Production secrets must be supplied through the hosting secret manager. Ignored local `.env` files must never be committed or copied into build artifacts.
- Validate CORS origins, CSP, upload MIME/size limits, EXIF stripping, rate limits, audit logging, and database TLS in the deployment environment.
- Confirm public case responses do not reveal restricted coordinates or contributor identity.

## Acceptance condition

Security sign-off requires an authenticated API test, public/private data-access test, upload abuse test, secret scan, and deployment configuration review.
