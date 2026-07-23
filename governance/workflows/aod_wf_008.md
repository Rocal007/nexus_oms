---
id: AOD-WF-008
name: Quality Assurance
version: 3.0.0
status: Approved
inputs:
  - "Generated Zero-JS Static Files"
  - "Legal Requirements"
outputs:
  - "Pre-Flight Validation Report"
rules_used:
  - "AOD-RULE-005"
  - "AOD-RULE-018"
steps:
  - "Validate output files against the Axiomatic Hallucination Shield."
  - "Check for active legal disclosures, spellings, and 404 links."
  - "Run Lighthouse audit checks for performance metrics."
---

# AOD-WF-008: Quality Assurance

This workflow guides the Quality Assurance process. Follow the defined steps and adhere to the associated rules.
