---
id: AOD-RULE-005
name: Legal Compliance
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Critical
owner: Legal Counsel
purpose: "Ensures absolute legal compliance under Austrian law."
statement: "Generated texts must comply with local trade laws (GewO 1994) and waste management acts (AWG 2002). For example, unauthorized firms cannot promise 'Entsorgung' in Austria."
rationale: "Non-compliant text leads to heavy regulatory fines and commercial lawsuits."
scope: Content generation, marketing
validation: "Judicative check against restricted vocabulary databases and GISA records."
violations: "Immediate build abort."
dependencies: ["AOD-RULE-003", "AOD-RULE-004"]
references: ["GewO 1994", "AWG 2002"]
associated_adrs: ["ADR-005-Legal-Vocabulary-Mapping"]
associated_standards: ["STD-005-Imprint-Verification"]
associated_policies: ["POL-005-Regulatory-Conformity"]
---

# AOD-RULE-005: Legal Compliance

Verifies that only licensed services are promoted in each region. Austrian impresse must display validated GISA license numbers.
