---
id: AOD-RULE-002
name: Business First
version: 3.0.0
status: Approved
normative_level: Mandatory
priority: High
owner: Product Manager
purpose: "Focuses development and text generation efforts on generating conversions and business value."
statement: "All user interfaces and copy must optimize the conversion funnel, providing clear actions (CTAs) and eliminating distraction."
rationale: "The primary business goal of the platform is lead generation and user conversion."
scope: Frontend and content generation
validation: "AIDA stage checks and conversion sync analysis (AOD-DM-005)."
violations: "Revision of generated texts and layout adjustments."
dependencies: ["AOD-RULE-001"]
references: ["E:/nexus-oms/package.json"]
associated_adrs: ["ADR-002-Conversion-Optimized-UI"]
associated_standards: ["STD-002-CTA-Formatting"]
associated_policies: ["POL-002-Business-Alignment"]
---

# AOD-RULE-002: Business First

Maximizes conversion potential by aligning design psychology with user search intent. Zero placeholder policy applies to all business components.
