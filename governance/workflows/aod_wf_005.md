---
id: AOD-WF-005
name: Architecture Review
version: 3.0.0
status: Approved
inputs:
  - "Source Directory"
  - "Code Structure"
outputs:
  - "Architecture Conformance Status"
rules_used:
  - "AOD-RULE-001"
  - "AOD-RULE-014"
steps:
  - "Scan import statements for layer isolation breaches."
  - "Verify that no presentation components make database calls."
  - "Ensure target directory structures match defined standard folders."
---

# AOD-WF-005: Architecture Review

This workflow guides the Architecture Review process. Follow the defined steps and adhere to the associated rules.
