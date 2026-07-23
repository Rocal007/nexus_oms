---
id: AOD-RULE-007
name: Structural Siloing & Geocentric Linking
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: High
owner: SEO Architect
purpose: "Controls the PageRank flow and internal link budget."
statement: "Automated link generation must group pages into tight local silos (e.g., matching municipalities under a certain geographical distance theta)."
rationale: "Prevents link diluting and channels crawler budget into relevant localized regional pages."
scope: Build compiler, routing
validation: "Link-siloing graph formula evaluation (AOD-PRN-001)."
violations: "Dangling links warning, build abort on cross-silo bleed."
dependencies: ["AOD-RULE-001"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-007-Silo-Link-Graph"]
associated_standards: ["STD-007-Anchor-Text"]
associated_policies: ["POL-007-Crawl-Efficiency"]
---

# AOD-RULE-007: Structural Siloing & Geocentric Linking

Links are restricted to a defined radius (e.g. 100km via Haversine Distance). Reflexive self-links are programmatically blocked.
