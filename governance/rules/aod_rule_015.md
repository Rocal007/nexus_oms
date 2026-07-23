---
id: AOD-RULE-015
name: Offline-Capable Local Bunker
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Medium
owner: System Architect
purpose: "Ensures operational durability and data security."
statement: "All build operations, database read/writes, and template evaluations must run locally (localhost) without relying on live external APIs."
rationale: "Ensures the system functions during connectivity outages and keeps private business data from leaking online."
scope: System Architecture
validation: "Offline mock test executions."
violations: "Security warning and deployment review."
dependencies: ["AOD-RULE-001", "AOD-RULE-003"]
references: ["E:/Nexus-app/nexus/NEXUS-MANIFEST.md"]
associated_adrs: ["ADR-015-Local-First-State"]
associated_standards: ["STD-015-Local-Database-Pathing"]
associated_policies: ["POL-015-Isolation-Standards"]
---

# AOD-RULE-015: Offline-Capable Local Bunker

Google fonts must be downloaded and served locally rather than referenced from external Google CDN servers to ensure 100% GDPR conformity and offline functionality.
