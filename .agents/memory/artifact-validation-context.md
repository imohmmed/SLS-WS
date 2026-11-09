---
name: Artifact validation context
description: Difference between managed workflow configuration and standalone shell validation.
---

Standalone build commands do not automatically inherit the routing and port context supplied to managed artifact workflows.

**Why:** A working preview can coexist with a failed manual build when the shell command omits that context; this is not necessarily an application defect.

**How to apply:** When validating an artifact directly from the shell, supply its non-secret base path and a valid port to that command. Derive the base path from the artifact configuration rather than guessing or changing the application's required-variable checks.
