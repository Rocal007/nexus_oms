---
id: AOD-RULE-020
name: Adaptive Worker Allocation
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: Medium
owner: DevOps Engineer
purpose: "Ensures optimal resource utilization during mass page compilations."
statement: "Task allocation to parallel compiler workers must evaluate current machine capacity and worker queue length before dispatching build tasks."
rationale: "Prevents process starvation, resource congestion, and excessive CPU throttling on static builds."
scope: Build compiler, Worker Pool
validation: "Check system load metrics and task dispatch queue logs."
violations: "Build delay warning and queue throttling."
dependencies: ["AOD-RULE-013"]
references: ["E:/Nexus-app/nexus/AGENTS.md"]
associated_adrs: ["ADR-020-Worker-Pool-Capacity"]
associated_standards: ["STD-020-Worker-Settings"]
associated_policies: ["POL-020-Resource-Management"]
---

# AOD-RULE-020: Adaptive Worker Allocation

Worker allocation uses a priority score based on system load, current active tasks, and historical task durations to dynamically distribute the build payload.
