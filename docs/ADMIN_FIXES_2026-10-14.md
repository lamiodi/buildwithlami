# Admin audit fixes — 14 October 2026

The admin audit findings have been addressed in the local codebase. The existing React/Express/PostgreSQL architecture and existing UI dependencies are retained. These changes have not been pushed or deployed as part of this work.

## What changed

| Area | Result |
| --- | --- |
| Sign-in | Bounded OTP email delivery, clearer retryable service failures, and a recoverable session-check screen. Authentication, 2FA, account lockout and API rate limits remain enforced. |
| Currency | Project invoices require an explicit currency. Client totals are grouped by currency, invoice rows use their original currency, and the chart uses payment dates and year/month buckets. Existing converted business-wide figures remain labelled. |
| Handover | The legacy checklist was removed from the general project editor. The dedicated checklist is authoritative. Required items and outstanding invoices are checked before completion; repeated completion preserves the original completion timestamp. |
| Project lifecycle | Ordinary editing cannot silently launch, complete handover or change payment reconciliation. Launch uses its automation endpoint. Archive and reopen require reasons and create audit history. Legacy active project statuses remain editable. |
| Client records | Projects and onboarding records are fetched for the selected client. Briefs are no longer lost behind the global 200-record limit. Failed sections show Retry, and stale responses cannot overwrite a newly selected record. |
| Progress and urgency | Stage edits update progress and the legacy portal representation together. Overdue filtering uses unpaid invoices past their due date. |
| Navigation | Related screens are grouped, optional tools are secondary, duplicate dashboard panels and a redundant command interface are removed, and workspace selection is shared across applicable views. |
| Accessibility | Mobile navigation uses the existing dialog component for focus containment, Escape and focus restoration. Account controls work, login fields have associated labels, helper text is larger, and detail breadcrumbs show names. |
| Maintenance | Unused admin code was removed, optional panels have error recovery, and an isolated PostgreSQL journey-test job was added to CI. No new application framework was introduced. |

## Verification completed

- **33/33 backend tests passed**, with no skipped tests: onboarding, contracts, deposit/final payments, payment proof review, client approvals and messages, access isolation, rate limiting, progress, currency, scoped briefs, launch/handover/archive/reopen, and OTP failure/timeout handling.
- **29/29 frontend tests passed**, including admin calculations and the existing portfolio, routing and SEO tests.
- **Production frontend build passed**, including initial metadata and sitemap generation for 15 public routes.
- **54 admin page/component files: 0 lint errors and 0 warnings.** Full frontend lint has 0 errors and 108 remaining warnings elsewhere in the repository. The changed backend controllers/services and test files passed the targeted lint check with 0 errors and 0 warnings.
- A fresh disposable local PostgreSQL database was initialized and migrated through **v56**. Tests used local fixture accounts and mocked email/payment calls. Production client records were not used.
- Browser checks on the local fixture environment verified sign-in, the dashboard, immediate workspace filtering and recovery from a temporary load failure. At 390 px width, the page had no horizontal overflow; the mobile drawer contained focus, closed with Escape and restored focus to its trigger.
- `git diff --check` passed.

## Deployment requirement and remaining live checks

Apply `backend/migrations/v56_project_status_consistency.sql` through the existing migration process before deploying the updated backend. It makes the database status constraint agree with the work stages supported by the admin while retaining the legacy `IN_PROGRESS` value. Deploy the backend and frontend together.

The original production sign-in timeout's root cause has **not** been confirmed from production logs. The implemented safeguards and local tests prove that the tested failure paths recover without granting access; they do not prove that production SMTP, hosting or database connectivity is healthy. After deployment, verify the real owner sign-in and OTP delivery, then inspect any remaining request/proxy/SMTP errors. Do not run the mutating fixture suite against production.

Existing historical handover data was not bulk rewritten. Legacy state is normalized when read, and explicit reopening preserves the previous checklist in audit history.

## Running the isolated tests

In `backend`, set `BWL_ISOLATED_TEST=1` and `TEST_DATABASE_URL` to an existing disposable local database whose name matches `bwl_*test`, then run `npm run test:isolated`. The runner initializes/migrates the database, seeds a fixture owner, starts the test API, runs the suites and stops its API process. Windows has a longer test-only startup allowance for cold dependency loading.

In `frontend`, run `node --test scripts/*.test.mjs`, `npm run lint` and `npm run build`.
