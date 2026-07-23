---
id: AOD-RULE-009
name: Dual Cognitive Resonance
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Medium
owner: UX Designer
purpose: "Addresses both intuitive and analytical cognitive routes of users."
statement: "Provide high cognitive fluency for System 1 (speed, familiar layouts) and verified fact sheets and trust certificates for System 2 (rational checking)."
rationale: "Friction triggers System 2 suspicion; lack of facts prevents System 2 confirmation."
scope: Frontend and copywriting
validation: "Human behavior validation logs."
violations: "Conversion drop warning."
dependencies: ["AOD-RULE-008"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-009-Trust-Architecture"]
associated_standards: ["STD-009-Trust-Badges"]
associated_policies: ["POL-009-UX-Friction-Limits"]
---

# AOD-RULE-009: Dual Cognitive Resonance

Ensure loading speeds are sub-millisecond to appease System 1, and present GISA data tables and workflow descriptions to reassure System 2.
