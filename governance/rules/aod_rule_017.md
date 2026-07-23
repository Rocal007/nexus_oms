---
id: AOD-RULE-017
name: Secure Remote SSH Sync
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: High
owner: DevOps Engineer
purpose: "Guarantees safe and rapid delivery of static builds to deployment servers."
statement: "Deployment syncs must use rsync via secure SSH tunnels. Only delta differences are sent, and commands must execute under cryptographic signatures."
rationale: "Minimizes security breach risks, prevents bandwidth waste, and locks down execution privileges."
scope: Deployment, Infrastructure
validation: "SSH handshake audits and public key verification."
violations: "Immediate deployment abort."
dependencies: ["AOD-RULE-001", "AOD-RULE-014"]
references: ["E:/Nexus-app/nexus/NEXUS-MANIFEST.md"]
associated_adrs: ["ADR-017-SSH-Tunnels"]
associated_standards: ["STD-017-Rsync-Arguments"]
associated_policies: ["POL-017-Server-Access-Control"]
---

# AOD-RULE-017: Secure Remote SSH Sync

Strictly whitelists destination IP ranges and forces SSH key auth. All automated tasks must pass verification checks before sync starts.
