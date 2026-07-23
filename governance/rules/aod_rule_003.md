---
id: AOD-RULE-003
name: Knowledge First
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Critical
owner: Knowledge Engineer
purpose: "Eliminates AI hallucinations and ensures high-fidelity data input."
statement: "No company metadata, addresses, license keys, or tax IDs may be hardcoded or fabricated by AI. All data must come from authenticated databases."
rationale: "Fabricating legal entities or contact information violates Austrian law and breaks customer trust."
scope: Content generation, databases
validation: "Axiomatic validation checks (AOD-CL-005)."
violations: "Immediate build termination."
dependencies: ["AOD-RULE-001"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-003-Decentralized-Manifest"]
associated_standards: ["STD-003-Database-Schemas"]
associated_policies: ["POL-003-Data-Integrity"]
---

# AOD-RULE-003: Knowledge First

All content generation must use validated data from SQLite files (`gisa.db`, `laws.db`, `pool.db`) and verified municipal registries.
