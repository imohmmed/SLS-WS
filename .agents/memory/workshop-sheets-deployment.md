---
name: Workshop Sheets deployment
description: The user's hosting and integration constraint for workshop registrations.
---

For the workshop registration flow, keep the production API on the user's VPS and do not depend on Replit-hosted connectors.

**Why:** The user explicitly asked to connect Google Sheets to the site without Replit.

**How to apply:** Keep Google credentials and any Apps Script shared secret on the VPS or in Google Apps Script properties, never in browser code or chat. The user selected Apps Script as the connection method.
