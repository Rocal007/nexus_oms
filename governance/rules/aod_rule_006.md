---
id: AOD-RULE-006
name: Regional-Linguistic Adaptation (LINGUA-LOCA)
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: High
owner: Localization Lead
purpose: "Ensures generated text feels native to the targeted location."
statement: "Replace generic high-German terms with regional Austrian words (e.g., 'Räumung/Entrümpelung', 'Spedition' instead of 'Haushaltsauflösung', 'Umzugsunternehmen')."
rationale: "Improves conversion by building regional trust and matches local search engine queries."
scope: Text generation
validation: "LINGUA-LOCAL adaptation operator (AOD-PRN-001)."
violations: "Revision of generated keywords."
dependencies: ["AOD-RULE-004", "AOD-RULE-005"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-006-Geocentric-Vocabulary"]
associated_standards: ["STD-006-Local-Spellings"]
associated_policies: ["POL-006-Localization-Rules"]
---

# AOD-RULE-006: Regional-Linguistic Adaptation (LINGUA-LOCA)

Enforces local terminology based on geocentric databases, avoiding terms like 'lecker' or 'gucken' for Austrian target audiences.
