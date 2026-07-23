---
id: AOD-WF-006
name: Decisions
version: 3.0.0
status: Approved
inputs:
  - "Enriched Context Payload"
  - "Niche Classification"
outputs:
  - "Selected Template Mode"
  - "UI Component Configuration"
rules_used:
  - "AOD-RULE-010"
  - "AOD-RULE-011"
steps:
  - "Evaluate population counts against the 10,000 threshold."
  - "Allocate Template C (heavy interactive) or Template D (lean visual)."
  - "Resolve the LUDUS emotional category and visual colors."
---

# AOD-WF-006: Decisions

This workflow guides the Decisions process. Follow the defined steps and adhere to the associated rules.
