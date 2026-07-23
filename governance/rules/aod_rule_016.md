---
id: AOD-RULE-016
name: Anti-Rate-Limiting Jitter
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Medium
owner: Automation Engineer
purpose: "Avoids IP blocking and API access throttling."
statement: "Automated API requests (e.g., Vertex AI, geocoding) must inject random human-mimicking delay intervals (250ms - 800ms) and cool-downs."
rationale: "Prevents remote servers from identifying and blocking automated crawlers or compilers."
scope: API client layers
validation: "Time logging and rate audits."
violations: "Build delay warning."
dependencies: ["AOD-RULE-015"]
references: ["E:/Nexus-app/nexus/NEXUS-MANIFEST.md"]
associated_adrs: ["ADR-016-Jitter-Queue"]
associated_standards: ["STD-016-Jitter-Variables"]
associated_policies: ["POL-016-API-Safety"]
---

# AOD-RULE-016: Anti-Rate-Limiting Jitter

Implements token buckets and stochastic cooldown times (e.g. 1.5s - 3.5s cooldown after every 15 operations) in `human-behavior.ts`.
