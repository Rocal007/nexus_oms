# Visibility Vector & Search Supremacy
**ID:** AOD-PRN-003  
**Version:** 3.0.0  
**Status:** Active  
**Author:** DECORUM-NEXUS System Architecture  

This document details the search visibility equations and page quality scoring models (Q_NEXUS V2).

---

## 1. Search Supremacy Equation
The total search visibility (\( V_{\text{NEXUS}} \)) under the constraint of Radical Objectivity (RO) is calculated as:
\[ V_{\text{NEXUS}} = \left[ \sum_{i} (Sind_i \cdot Walg_i) \right] \cdot \lim_{\Delta_{\text{CoP}} \to 0} \left( \frac{\Omega_{\text{RO}}(L, J)}{\Delta_{\text{CoP}}(J) + \epsilon} \right) \]

Where:
*   \( V_{\text{NEXUS}} \): Total search engine ranking visibility.
*   \( Sind_i \): Syntactic SEO elements (e.g., HTML5 semantics, JSON-LD schemas, Core Web Vitals).
*   \( Walg_i \): Search engine algorithmic weight factor for syntactic element \( i \).
*   \( \Omega_{\text{RO}} \): Radical Objectivity truth kernel, defined by the tensor product of Legislative and Judicative compliance:
    \[ \Omega_{\text{RO}}(L, J) = \Phi(L) \otimes \Psi(J) \]
*   \( \Delta_{\text{CoP}} \): Chain-of-Proof thermodynamic friction (hallucination or manipulation rate). The Judicative validation forces this friction to zero:
    \[ \lim_{J \to \infty} \Delta_{\text{CoP}} = 0 \]
*   \( \epsilon \): Algorithmic jitter and search engine fluctuation noise.

---

## 2. Q_NEXUS V2 Quality Score
The build compiler (FACTORIUM) must calculate and store a normalized quality score for every page:
\[ Q_{NEXUS} = w_1 \cdot S + w_2 \cdot V + w_3 \cdot L + w_4 \cdot (S \cdot V \cdot L) \]
With the weight constraint:
\[ \sum w_i = 1 \]

### Component Variables:
*   **S (Syntax Score)**: Normalized technical score (HTML5 semantic hierarchy, JSON-LD correctness) in range \([0, 1]\).
*   **V (Verification Score)**: Verification correctness against the database and legal rules (Judicative checks) in range \([0, 1]\).
*   **L (Lupos Score)**: Neurodidactic readability and user interaction metric (e.g., Flesch Reading Ease, click telemetry) in range \([0, 1]\).
*   **\( S \cdot V \cdot L \)**: Synergistic interaction term rewarding harmonious optimization across technology, truth, and psychology.
