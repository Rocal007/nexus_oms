---
id: AOD-WF-001
name: AI Boot
version: 3.0.0
status: Approved
inputs:
  - "User Intent"
  - "Config Manifest"
outputs:
  - "Active Session Context"
  - "Role Binding"
rules_used:
  - "AOD-RULE-001"
  - "AOD-RULE-003"
steps:
  - "Extract operational directives from the global settings."
  - "Bind specific agent persona based on task intent."
  - "Initialize the secure local session environment."
---

# AOD-WF-001: AI Boot

This workflow guides the AI Boot process. Follow the defined steps and adhere to the associated rules.
