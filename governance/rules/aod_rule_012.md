---
id: AOD-RULE-012
name: Disjoint Mock-ID Isolation (Legal Shield)
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: High
owner: Data Compliance Officer
purpose: "Avoids legal liability by preventing intersection of synthetic and real IDs."
statement: "All fictions (mock licenses, plates, addresses) generated for demo or placeholder UI must be strictly disjoint from real registrated entities."
rationale: "Prevents accidental copy of active real companies, avoiding trademark infringements."
scope: Mock generator, content pipelines
validation: "Mathematical intersection checks (AOD-PRN-002) and registry searches."
violations: "Immediate file generation blocking."
dependencies: ["AOD-RULE-003", "AOD-RULE-005"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-012-Mock-Data-Validation"]
associated_standards: ["STD-012-Mock-Formulas"]
associated_policies: ["POL-012-Data-Privacy"]
---

# AOD-RULE-012: Disjoint Mock-ID Isolation (Legal Shield)

Enforces schemas that differ from standard layouts or filters mock IDs against existing database registries to ensure absolute separation.
