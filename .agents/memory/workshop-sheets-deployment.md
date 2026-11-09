---
name: Workshop Sheets deployment
description: The user's hosting and integration constraint for workshop registrations.
---

For the workshop registration flow, keep the production API on the user's VPS and do not depend on Replit-hosted connectors.

**Why:** The user explicitly asked to connect Google Sheets to the site without Replit.

**How to apply:** Keep Google credentials and any Apps Script shared secret on the VPS or in Google Apps Script properties, never in browser code or chat. The user selected Apps Script as the connection method.

Keep new registration fields compatible with the user's deployed Apps Script schema. For now, place added form selections in the existing notes cell unless the user approves a separate sheet column and an Apps Script redeployment.

**Why:** The Apps Script deployment is user-managed; changing its payload or column layout would otherwise require a separate manual redeploy.

**How to apply:** When extending the registration form, validate the new field on the VPS, then map it into the current notes value. If a dedicated column is requested, update the Apps Script code and coordinate a new deployment with the user.
