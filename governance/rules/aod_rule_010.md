---
id: AOD-RULE-010
name: Harmonious Visual Composition (Visium 60-30-10)
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: High
owner: UI Designer
purpose: "Ensures visual beauty, branding structure, and high contrast."
statement: "UIs must apply 60% dominant background (contrast compliant), 30% brand color, and 10% action color reserved strictly for CTAs."
rationale: "Maintains clear hierarchy, satisfies accessibility (WCAG 2.2), and drives conversion via isolation effects."
scope: CSS and UI generation
validation: "Lighthouse accessibility audit and automated CSS verification."
violations: "Styling corrections and build warning."
dependencies: ["AOD-RULE-001", "AOD-RULE-002"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-010-Theme-Variables"]
associated_standards: ["STD-010-WCAG-Contrast"]
associated_policies: ["POL-010-Visual-Identity"]
---

# AOD-RULE-010: Harmonious Visual Composition (Visium 60-30-10)

Action colors (e.g. #D4AF37) must ONLY be used for interactive elements (buttons, links). Plain backgrounds must utilize soft, dark glassmorphic variables.
