---
id: AOD-WF-002
name: Knowledge Loading
version: 3.0.0
status: Approved
inputs:
  - "Entity Config"
  - "Location Database"
outputs:
  - "Loaded Fact Context"
rules_used:
  - "AOD-RULE-003"
  - "AOD-RULE-005"
steps:
  - "Query SQLite pool.db and laws.db for active entities."
  - "Load target locations and verify coordinates."
  - "Inject legal frameworks and GISA parameters into local context."
---

# AOD-WF-002: Knowledge Loading

This workflow guides the Knowledge Loading process. Follow the defined steps and adhere to the associated rules.
