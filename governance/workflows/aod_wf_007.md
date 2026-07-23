---
id: AOD-WF-007
name: Implementation
version: 3.0.0
status: Approved
inputs:
  - "UI Component Configuration"
  - "Clean Fact Data"
outputs:
  - "Generated Zero-JS Static Files"
rules_used:
  - "AOD-RULE-013"
  - "AOD-RULE-014"
steps:
  - "Trigger entity-scoped Next.js compilation."
  - "Inject human-mimicking delay jitter to prevent quota errors."
  - "Write compiled script-free HTML and vanilla CSS to the output folder."
---

# AOD-WF-007: Implementation

This workflow guides the Implementation process. Follow the defined steps and adhere to the associated rules.
