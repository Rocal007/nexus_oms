---
id: AOD-RULE-014
name: Script-Free SSG Purity
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Critical
owner: Front-End Lead
purpose: "Delivers top-tier page performance (Lighthouse 100) and indexing capabilities."
statement: "Generated static pages must contain zero runtime Javascript scripts, relying purely on HTML5 semantic tags and vanilla CSS layouts."
rationale: "Zero-JS pages load instantly on all client devices, bypass script execution blockers, and are fully indexable by search bots."
scope: Frontend output
validation: "Automated scan of build outputs check for tag '<script>' (excluding analytical trackers if white-listed)."
violations: "Build block and deployment halt."
dependencies: ["AOD-RULE-001", "AOD-RULE-013"]
references: ["E:/Nexus-app/nexus/NEXUS-MANIFEST.md"]
associated_adrs: ["ADR-014-Zero-JS-HTML"]
associated_standards: ["STD-014-Semantic-Elements"]
associated_policies: ["POL-014-SEO-Sovereignty"]
---

# AOD-RULE-014: Script-Free SSG Purity

All client-side animations must rely on CSS keyframes and transitions. Interactive inputs must utilize standard HTML5 elements (forms, details).
