# AI Tool Disclosure (Graph Hacks Hackathon Rules 11–13)

### 1. AI Coding Assistants Used
- **Google Antigravity (Gemini Flash & Claude 3.5 Sonnet):** Architecture planning, OpenCypher dialect query design, test scripting, and documentation review.

### 2. Participant Contribution & Technical Understanding
- **Architecture & System Design:** Designed by the builder (Khalid). Conceptualized the OTC operator user persona (Dave), the multi-hop exposure math formula ($\sum \text{taint} \times 0.6^{\text{hop}} / \text{total}$), dust-filtering thresholds, and the governance approval gate.
- **Query Verification:** Every single OpenCypher query was manually tested and validated against a live FalkorDB Cloud instance on AWS `eu-west-1`. The builder understands and can explain the GraphBLAS matrix multiplication fundamentals, the path traversal filters, and the multi-graph isolation mechanism.
- **Rule 13 Compliance:** The product is fully verified, end-to-end functional, load-tested against FalkorDB Cloud, and passes FalkorDB's strict "Removal Test".
