---
id: AOD-RULE-018
name: Axiomatic Hallucination Shield
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Critical
owner: QA Engineer
purpose: "Ensures no incorrect, mock, or placeholder data is pushed to live servers."
statement: "Every static build output must run through pre-flight validation rules (checking GISA presence, spelling errors, 404 links, and structure alignment)."
rationale: "Automated checks serve as the last guardrail to catch AI errors before they reach search spiders or users."
scope: Build pipeline, QA
validation: "Integrity validation suite run."
violations: "Immediate deployment abort."
dependencies: ["AOD-RULE-003", "AOD-RULE-013"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-018-Integrity-Checks"]
associated_standards: ["STD-018-Validation-Rules"]
associated_policies: ["POL-018-Zero-Error-Tolerance"]
---

# AOD-RULE-018: Axiomatic Hallucination Shield

Build logs are parsed and analyzed. Discrepancies between source databases and output HTML results in automated rollbacks.
