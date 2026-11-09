---
name: Workshop Sheets deployment
description: The user's hosting and integration constraint for workshop registrations.
---

For the workshop registration flow, keep the production API on the user's VPS and do not depend on Replit-hosted connectors.

**Why:** The user explicitly asked to connect Google Sheets to the site without Replit.

**How to apply:** Keep Google credentials and any Apps Script shared secret on the VPS or in Google Apps Script properties, never in browser code or chat. The user selected Apps Script as the connection method.

Keep the existing registration columns A:H in order and store subscription type in column I. The current VPS payload temporarily carries the selected plan in a labeled notes prefix so the user-managed Apps Script can split it into columns H and I after its next deployment.

**Why:** The user requested a dedicated subscription column, while the production Apps Script deployment is managed from the user's Google account.

**How to apply:** Keep the Apps Script parser aligned with the VPS notes prefix or direct `subscriptionPlan` field. For future form fields, coordinate sheet-column and Apps Script changes with the user instead of silently packing them into notes.
