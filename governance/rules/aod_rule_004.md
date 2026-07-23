---
id: AOD-RULE-004
name: Radical Objectivity (DECORUM)
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: High
owner: Editor in Chief
purpose: "Maintains formal, objective, and information-dense copywriting style."
statement: "All marketing fluff, emotional adjectives, and hyperbolic language (e.g., 'innovativ', 'zuverlässig') must be stripped from generated pages."
rationale: "Factual, information-dense pages score higher with both search crawlers and analytical decision-makers."
scope: Text generation
validation: "DECORUM projection filtering during build runtime."
violations: "Text filter failures and regeneration requirements."
dependencies: ["AOD-RULE-003"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-004-Factual-Copywriting"]
associated_standards: ["STD-004-Text-Formatting"]
associated_policies: ["POL-004-Brand-Tone"]
---

# AOD-RULE-004: Radical Objectivity (DECORUM)

Requires formal Austrian German, clear descriptions of service workflows, and complete factual transparency. Banned adjectives are filtered out prior to publication.
