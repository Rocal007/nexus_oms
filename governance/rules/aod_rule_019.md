---
id: AOD-RULE-019
name: Context Window Efficiency
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Medium
owner: AI Coordinator
purpose: "Minimizes API usage token costs and increases prompt execution speed."
statement: "Agents must practice delta-prompting (only sending changes or delta contexts) rather than copying full files or complete setups repeatedly."
rationale: "Reduces LLM context inflation, avoids token limit bottlenecks, and keeps inference pricing under budget."
scope: Developer prompts, agent tasks
validation: "Prompt size audit."
violations: "System warning and prompt refactoring request."
dependencies: ["AOD-RULE-001"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-019-Delta-Context-Storage"]
associated_standards: ["STD-019-Prompting-Structure"]
associated_policies: ["POL-019-Token-Economy"]
---

# AOD-RULE-019: Context Window Efficiency

Prompts must separate instructions from dynamic variable payloads. Utilize schemas to enforce structured JSON responses directly.
