---
id: AOD-RULE-011
name: Agnostic Gamification Routing (LUDUS Protocol)
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Medium
owner: UX Architect
purpose: "Matches interface gamification elements with the user's emotional state."
statement: "Route industries into LUDUS classes: High-Anxiety gets Control widgets; Goal-Oriented gets Calculators; Desire-Driven gets Reward animations."
rationale: "Aligns interface feedback with user psychology, preventing inappropriate playfulness in high-stress situations."
scope: Frontend UI and copywriting
validation: "LUDUS routing evaluation and telemetry (AOD-PRN-002)."
violations: "Layout adjustments."
dependencies: ["AOD-RULE-002", "AOD-RULE-008"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-011-LUDUS-Component-Library"]
associated_standards: ["STD-011-Interactive-Widgets"]
associated_policies: ["POL-011-Ethical-Gamification"]
---

# AOD-RULE-011: Agnostic Gamification Routing (LUDUS Protocol)

Provides a clear matrix mapping specific services (e.g. legal help vs. shopping) to their respective UI component architectures.
