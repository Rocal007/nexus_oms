---
id: AOD-WF-003
name: Context Building
version: 3.0.0
status: Approved
inputs:
  - "Loaded Fact Context"
  - "Regional Metrics"
outputs:
  - "Enriched Context Payload"
rules_used:
  - "AOD-RULE-003"
  - "AOD-RULE-006"
steps:
  - "Compute geographical distances using the Haversine formula."
  - "Fetch and parse Wikipedia summaries for target locations."
  - "Extract population numbers and coat of arms details via Gemini."
---

# AOD-WF-003: Context Building

This workflow guides the Context Building process. Follow the defined steps and adhere to the associated rules.
