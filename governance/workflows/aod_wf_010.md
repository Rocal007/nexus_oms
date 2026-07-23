---
id: AOD-WF-010
name: Delivery
version: 3.0.0
status: Approved
inputs:
  - "Updated Build Cache Database"
  - "SSH Target Config"
outputs:
  - "Synchronized Production Environment"
rules_used:
  - "AOD-RULE-015"
  - "AOD-RULE-017"
steps:
  - "Establish secure SSH tunnel connections to remote VPS hosts."
  - "Execute rsync differential copy of static build exports."
  - "Trigger post-sync actions like Nginx server reloads."
---

# AOD-WF-010: Delivery

This workflow guides the Delivery process. Follow the defined steps and adhere to the associated rules.
