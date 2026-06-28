# UX Review Suggestions

## Client Onboarding Suggestions

- Replace the current email-entry gate with a real passwordless magic link or one-time code so clients can enter the portal in one step.
- Turn onboarding into a single guided checklist instead of splitting it across intake, credentials, and later tracker actions.
- Add a visible progress checklist with items like `Complete intake`, `Upload assets`, `Share credentials`, and `Review scope`.
- Convert the intake form into a guided multi-step form with sections, estimated completion time, and clear autosave feedback.
- Expand field support in intake forms to include file upload, URL, phone, and date fields.
- Let clients update onboarding details from one place instead of bouncing between different screens.
- Add a short “what happens next” panel after intake submission so clients know the next action and expected response time.

## Client Offboarding Suggestions

- Save offboarding checklist items as real project data instead of showing a visual checklist that is not persisted.
- Use a proper handoff checklist for final invoice paid, credentials documented, assets delivered, training delivered, and support decision confirmed.
- Avoid marking the whole project as fully paid based on a single invoice payment.
- Turn the handoff area into a structured launch dashboard with `Assets`, `Training`, `Live Site`, `Support`, and `Next Steps`.
- Add a final confirmation state for offboarding so both you and the client know handoff is fully complete.
- Include a simple feedback or satisfaction step before archiving a project.

## Client Portal Suggestions

- Merge the duplicate credential vault sections into one clear secure upload area.
- Make the portal feel task-based instead of page-based by showing current required actions first.
- Add stronger labels and reassurance around secure credential submission so clients understand what to upload and why.
- Show a simple timeline or status summary at the top: `Waiting on client`, `In progress`, `Ready for review`, `Launched`.
- Keep revision requests and comments in a clearer approval flow rather than mixing them into each stage without stronger structure.

## Admin Workflow Suggestions

- Combine `create client`, `create project`, `assign intake`, and `generate portal link` into one setup workflow.
- Add a “copy portal link” and “send portal invite” action directly in the admin project setup flow.
- Make onboarding status easier to scan from the admin side with labels like `Not started`, `In progress`, and `Completed`.
- Store offboarding checklist completion in the database so admin status reflects real delivery progress.
- Tighten the credentials dashboard flow so admin sees only the correct decrypted, project-related secret data.

## Website Suggestions

- Rewrite the hero heading to focus on the client outcome instead of only the role title.
- Use one stronger primary CTA across the homepage instead of several competing actions.
- Add a short `How it works` section near the top with a simple flow such as `Discovery -> Build -> Launch`.
- Add trust signals earlier on the homepage, such as testimonials, notable client outcomes, or delivery speed.
- Simplify the pricing section so it is easier to scan quickly, with one recommended package and clearer “starting at” language.
- Improve the contact form by adding `project type`, `budget`, and `timeline` fields to pre-qualify leads.
- Reduce navigation fragmentation between homepage anchors and separate pages so the user journey feels more direct.
- Make the website messaging more specific to the clients you want most, such as founders, service businesses, or growing brands.

## Fastest Wins (✅ ALL IMPLEMENTED)

- [x] Add passwordless client portal access.
- [x] Merge the duplicate credential vaults into one section.
- [x] Turn onboarding into one checklist-driven flow (forced intake form).
- [x] Rewrite the hero message around outcome, speed, and target client.
- [x] Add budget and timeline fields to the contact form.
- [x] Simplify the pricing presentation.
