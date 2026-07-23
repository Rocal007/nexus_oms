---
id: AOD-RULE-001
name: Architecture First
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Critical
owner: System Architect
purpose: "Enforces strict architectural boundaries to avoid spaghetti code and technical debt."
statement: "All code modules must follow the defined system folder hierarchy (Axiom, Nexus, Visium, Factorium, Command) and maintain strict isolation."
rationale: "Ensures the application remains clean, modular, and easy to maintain over thousands of generated pages."
scope: Codebase-wide
validation: "Verified via eslint import rules and automated architecture reviews (AOD-CL-001)."
violations: "Build block and pull request rejection."
dependencies: []
references: ["E:/Nexus-app/nexus/README.md"]
associated_adrs: ["ADR-001-MVC-Separation"]
associated_standards: ["STD-001-Nextjs-Layout"]
associated_policies: ["POL-001-Code-Quality"]
---

# AOD-RULE-001: Architecture First

All developers and AI agents must adhere to the modular structure. No business logic should bleed into presentation layers, and database calls must be restricted to data layers.
