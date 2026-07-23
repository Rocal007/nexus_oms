---
id: AOD-RULE-013
name: Deterministic Factorium Execution
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: High
owner: DevOps Engineer
purpose: "Minimizes compilation waste and prevents accidental mass-rebuilds."
statement: "Building pages must be isolated to targeted entities by default (using environment variable BUILD_ENTITY) rather than building all sites simultaneously."
rationale: "Prevents API quota limits, saves CPU cycles, and keeps deployment pipelines fast."
scope: DevOps, build pipeline
validation: "Check environment parameters before compile execution."
violations: "Immediate build termination."
dependencies: ["AOD-RULE-001"]
references: ["E:/Nexus-app/.agents/AGENTS.md"]
associated_adrs: ["ADR-013-Entity-Isolated-Builds"]
associated_standards: ["STD-013-Build-Commands"]
associated_policies: ["POL-013-Resource-Management"]
---

# AOD-RULE-013: Deterministic Factorium Execution

Commands like `npm run build` must be targeted (e.g. `npx cross-env BUILD_ENTITY=graz npm run build`) unless the administrator explicitly requests a clean complete rebuild.
