# CLEARPATH — OPENCODE MASTER BUILD PROMPT
**Model Target:** GLM 5.3 Flash (or equivalent high-capability coding model)  
**Project:** ClearPath ("Dave's Screen")  
**Hackathon:** WeMakeDevs × FalkorDB Graph Hacks (Tracks 1 & 2)

---

## 1. PROJECT OVERVIEW & THE USER
You are building **ClearPath**, a 3-second counterparty risk assessment terminal for crypto Over-The-Counter (OTC) operators and desk traders.

### The Persona & Scenario
- **User:** Dave, an OTC crypto desk operator.
- **Situation:** Phone in hand, Telegram deal chat open, $15,000 deal expiring in 2 minutes. The counterparty pastes a wallet address (`0x...`).
- **Core Loop:** Dave pastes the counterparty address into ClearPath -> In under 3 seconds, the terminal runs deterministic Cypher graph algorithms on FalkorDB -> Memory recalls prior investigations and flags temporal changes -> Agent triages and selects a secondary graph tool -> A crisp, injection-proof 4-state verdict is rendered with an interactive money-trail graph, raw Cypher queries, and MCP tool citations -> Dave can click an approval-gated button to escalate/flag the address into the shared knowledge graph.

### The Moat & Rule Compliance
- **FalkorDB Removal Test (Rule 3):** If FalkorDB is removed, the product literally cannot function. Multi-hop fund flow decay and cross-session episodic memory are computed on FalkorDB via OpenCypher queries.
- **Language & Verdict Rules:**
  - 4 states only: `BLOCK` (high taint), `CAUTION` (medium taint / thin history), `NO-KNOWN-RISK` (no taint path within 4 hops over known labels — NEVER call it "proof of safety"), and `UNKNOWN` (empty graph / unseen address — empty NEVER maps to clear).
  - The verdict is **backend-composed** using deterministic Cypher math. The LLM only writes the human-readable explanation slot.

---

## 2. TECH STACK & ARCHITECTURE
- **Framework:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React icons.
- **Graph Database:** FalkorDB Cloud (via official `falkordb` npm package v6.8+).
- **Protocol:** Standard REST API routes (`/api/scan`, `/api/escalate`, `/api/theater-flip`, `/api/seed`) wrapping the 6 agent tools.
- **LLM Integration:** OpenAI / Gemini / Groq compatible API route for the explanation slot only (with a deterministic template fallback so the app never crashes if the LLM key is missing or times out).

---

## 3. ENVIRONMENT CONFIGURATION (`.env.local`)
Create `.env.local` with the following variables:
```env
FALKORDB_HOST=r-6jissuruar.instance-smwhvhjy3.hc-srom4rolb.eu-west-1.aws.f2e0a955bb84.cloud
FALKORDB_PORT=52752
FALKORDB_USERNAME=falkordb
FALKORDB_PASSWORD=20182008Kk.
FALKORDB_GRAPH_TRUST=clearpath_trust
FALKORDB_GRAPH_MEMORY=clearpath_mem_dave
FALKORDB_GRAPH_SHARED=clearpath_shared_cases

# LLM for the explanation slot (OpenAI or Gemini format)
LLM_API_KEY=
LLM_PROVIDER=openai # or 'gemini' or 'groq'
```

---

## 4. GRAPH SCHEMA & DATA MODEL

### Graphs Used (Multigraph Isolation)
1. `clearpath_trust`: Authoritative financial graph (wallets, transactions, entities, attestations).
2. `clearpath_mem_dave`: Private episodic and procedural memory for Dave (`:Episode`, `:Fact`, `:Playbook`).
3. `clearpath_shared_cases`: Shared intelligence board for escalated fraud cases across compliance operators.

### Node Labels & Properties
- `(:Wallet { address: STRING, label: STRING, entity_type: STRING, first_seen: INTEGER, balance_usd: FLOAT, is_sanctioned: BOOLEAN, synthetic: BOOLEAN })`
  - `entity_type` can be: `'mixer'`, `'mule'`, `'consolidator'`, `'exchange_hot_wallet'`, `'otc_desk'`, `'clean_user'`, `'merchant'`.
- `(:Attestation { id: STRING, issuer: STRING, schema: STRING, weight: FLOAT, timestamp: INTEGER })`
- `(:Episode { id: STRING, target_address: STRING, verdict: STRING, exposure_ratio: FLOAT, session_id: STRING, timestamp: INTEGER, notes: STRING })`
- `(:Fact { id: STRING, pattern_name: STRING, description: STRING, created_at: INTEGER })`
- `(:Playbook { id: STRING, rule_name: STRING, threshold: FLOAT, action: STRING, version: STRING })`

### Relationship Types & Properties
- `(w1:Wallet)-[:TRANSFERRED { tx_hash: STRING, amount_usd: FLOAT, timestamp: INTEGER, token: STRING }]->(w2:Wallet)`
- `(w1:Wallet)-[:ATTESTS_TO { context: STRING, confidence: FLOAT }]->(w2:Wallet)`
- `(w:Wallet)-[:DOCUMENTED_IN]->(e:Episode)`
- `(e:Episode)-[:SHARED_AS { escalated_by: STRING, timestamp: INTEGER }]->(c:Case)`

---

## 5. SEED DATASET (~55 Nodes, ~150 Edges)
Build a robust seed script (`scripts/seed.ts` or executable via API `/api/seed`) with realistic synthetic addresses (`0xDEMO...`):

1. **Exhibit A — The Dirty Mixer Fan-out (Target: `0xDEMO_DIRTY_TARGET_01`):**
   - `0xDEMO_TORNADO_MIXER` (Mixer) -> 3 Mule wallets (`0xDEMO_MULE_A`, `0xDEMO_MULE_B`, `0xDEMO_MULE_C`) with amounts ~$5,000 each within a 45-minute window.
   - Mule wallets -> `0xDEMO_CONSOLIDATOR_X` (peeled fees, rapid transfer).
   - Consolidator -> `0xDEMO_DIRTY_TARGET_01` ($14,500 inflow).
   - **Expected Verdict:** `BLOCK` (Exposure ratio > 0.40, 2-hop mixer path clearly displayed).

2. **Exhibit B — The Ambiguous Caution Bridge (Target: `0xDEMO_CAUTION_TARGET_02`):**
   - High volume pass-through wallet with 1 indirect hop to a grey OTC desk and an unverified attestation.
   - **Expected Verdict:** `CAUTION` (Exposure ratio 0.15–0.30, thin account history <30 days).

3. **Exhibit C — The Aged Clean Merchant (Target: `0xDEMO_CLEAN_TARGET_03`):**
   - 180-day history, inflows purely from `0xDEMO_BINANCE_HOT_WALLET` and `0xDEMO_KRAKEN_HOT_WALLET`, positive attestations from verified merchants.
   - **Expected Verdict:** `NO-KNOWN-RISK` (0 hops to any illicit label within 4 hops).

4. **Exhibit D — The Unknown Address (`0xDEMO_UNKNOWN_TARGET_04` or any random hex):**
   - Does not exist in the graph.
   - **Expected Verdict:** `UNKNOWN` (Queries return 0 rows. Explicitly state: "Unseen address. Empty graph does NOT imply safety").

5. **Holdout Exhibit — The Theater Test:**
   - Dedicated interactive action in the UI:
   - Clicking *"Simulate Dirty Taint"* merges a `TRANSFERRED` edge from `0xDEMO_MULE_A` ($8,000) directly to `0xDEMO_CLEAN_TARGET_03`.
   - Re-running the scan immediately flips Exhibit C from `NO-KNOWN-RISK` to `CAUTION` / `BLOCK`, displaying the before/after Cypher path side-by-side.
   - Clicking *"Rollback Taint"* deletes this temporary edge, flipping the verdict back to `NO-KNOWN-RISK`. (Proves live database reaction to judges!).

---

## 6. DETERMINISTIC ALGORITHMS & CYPHER QUERIES

### Query 1: Weighted Multi-Hop Exposure Traversal
Traverses backwards from target up to 4 hops looking for dirty entities (`mixer`, `mule`, `sanctioned`), decaying weight by `0.6^hop`, discounting dust transactions (<$10), and stopping traversal if hitting an `exchange_hot_wallet`:
```cypher
MATCH path = (source:Wallet)-[r:TRANSFERRED*1..4]->(target:Wallet {address: $targetAddress})
WHERE source.entity_type IN ['mixer', 'sanctioned', 'mule']
  AND ALL(rel IN relationships(path) WHERE rel.amount_usd >= 10.0)
  AND NONE(node IN nodes(path)[1..-1] WHERE node.entity_type = 'exchange_hot_wallet')
WITH path, source, relationships(path) AS rels, length(path) AS hopCount
RETURN 
  source.address AS dirty_source,
  source.entity_type AS source_type,
  hopCount,
  [x IN rels | {from: startNode(x).address, to: endNode(x).address, amount: x.amount_usd, tx: x.tx_hash}] AS path_steps,
  (rels[0].amount_usd * reduce(weight = 1.0, x IN range(1, hopCount) | weight * 0.6)) AS weighted_taint
```

### Query 2: Total Inflow Calculation
```cypher
MATCH (inflow:Wallet)-[r:TRANSFERRED]->(target:Wallet {address: $targetAddress})
RETURN coalesce(sum(r.amount_usd), 0.0) AS total_inflow, count(r) AS tx_count
```
*Exposure Formula:*  
`exposure_ratio = total_inflow > 0 ? (sum(weighted_taint) / total_inflow) : 0.0`
- `exposure_ratio >= 0.35` -> **`BLOCK`**
- `0.10 <= exposure_ratio < 0.35` or `(account_age_days < 30 AND exposure_ratio > 0.05)` -> **`CAUTION`**
- `exposure_ratio == 0` AND target exists -> **`NO-KNOWN-RISK`**
- Target does not exist in graph -> **`UNKNOWN`**

### Query 3: Episodic Memory Recall (Track 2)
```cypher
MATCH (e:Episode {target_address: $targetAddress})
RETURN e.id AS episode_id, e.verdict AS prior_verdict, e.timestamp AS prior_timestamp, e.notes AS prior_notes
ORDER BY e.timestamp DESC LIMIT 3
```

### Query 4: Temporal Delta Query (Track 2 - "What Changed Since Last Session?")
```cypher
MATCH (inflow:Wallet)-[r:TRANSFERRED]->(target:Wallet {address: $targetAddress})
WHERE r.timestamp > $lastSessionTimestamp
RETURN count(r) AS new_inflows, sum(r.amount_usd) AS new_volume, collect(r.tx_hash) AS new_txs
```

### Query 5: Case Escalation Write-Back (Governance Gate)
```cypher
MERGE (c:Case {target_address: $targetAddress})
ON CREATE SET c.status = 'ESCALATED', c.created_at = timestamp(), c.escalated_by = 'Dave_OTC'
WITH c
MATCH (target:Wallet {address: $targetAddress})
MERGE (target)-[:FLAGGED_AS_SUSPICIOUS {timestamp: timestamp(), reason: $reason}]->(c)
RETURN c.status AS status
```

---

## 7. USER INTERFACE (DAVE'S SCREEN)
Build a sleek, high-density dark-mode terminal (styling: Obsidian/Vercel Dark with violet accents reflecting FalkorDB):

1. **Header Bar:**
   - App title: **ClearPath** with sub-badge `"Powered by FalkorDB"`.
   - OTC Deal Countdown pill: `⏳ DEAL EXPIRATION: 01:42` (live pulsing timer).
   - Session Pill: `👤 Dave (OTC Desk #4) | Memory Graph: clearpath_mem_dave Connected`.

2. **Quick Preset Case Buttons (Zero-Typing for Demo):**
   - `[🚨 Exhibit A: Mixer Fan-Out]`
   - `[⚠️ Exhibit B: Ambiguous Bridge]`
   - `[✅ Exhibit C: Clean Merchant]`
   - `[❓ Exhibit D: Unknown Hex]`
   - `[🎭 Theater Test: Live Taint & Rollback]`

3. **Input Bar:**
   - Large hex address input field with instant paste button and "Run 3s Screen" button.

4. **Verdict Card (The Focal Point):**
   - High-contrast Badge: **`[ BLOCK ]`** in Red / **`[ CAUTION ]`** in Amber / **`[ NO-KNOWN-RISK ]`** in Emerald / **`[ UNKNOWN ]`** in Slate.
   - Exposure Gauge: e.g. `43.8% Tainted Inflow (2-Hop Decay)` with dust threshold filter indicator.
   - AI Explanation Box: Clean, concise 2-sentence summary generated by LLM (or fallback template) citing the exact path.
   - **Memory Delta Banner (Track 2):** If scanned previously, display: *"Prior scan 14:05 WAT: NO-KNOWN-RISK. Alert: 1 new hop detected (+ $8,000 from Mule A) since last session."*

5. **Interactive Money Trail Visualizer:**
   - Clean SVG / Canvas node-link diagram rendering the traversed path (e.g., `Tornado Mixer` -> `Mule A` -> `Consolidator` -> `Target`). Nodes color-coded by entity type with clickable edges revealing tx amount and hash.

6. **Inspection Drawers:**
   - **Tab 1: Raw Cypher:** Shows the exact parameterized Cypher queries that ran on FalkorDB and execution time (e.g. `4.2ms`).
   - **Tab 2: MCP Tool Trace:** Displays the 2-stage execution log: `trace_taint_weighted() -> risk_centrality() -> case_writeback()`.

7. **The Governance Escalate Gate (Climax):**
   - An **"Escalate to Compliance / Blacklist"** button.
   - Clicking it does NOT silently write; it opens an interactive modal:
     - *"Confirm Accusatory Action: Write FLAGGED_AS_SUSPICIOUS edge to shared compliance graph?"*
     - Dave clicks *"Confirm Sign-off"*, writing the episode to FalkorDB and updating the state.

---

## 8. CODEBASE STRUCTURE TO GENERATE
```
clearpath/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Dave's Screen (Terminal UI)
│   ├── globals.css
│   └── api/
│       ├── scan/route.ts           # Core screening loop (Cypher + LLM)
│       ├── escalate/route.ts       # Governance write-back
│       ├── theater/route.ts        # Live taint simulation & rollback
│       └── seed/route.ts           # Populates ~55 nodes and ~150 edges
├── lib/
│   ├── falkordb.ts                 # FalkorDB singleton connection client
│   ├── queries.ts                  # All hand-rolled Cypher queries
│   ├── score.ts                    # Deterministic exposure formula
│   └── types.ts                    # Node, Edge, Verdict, and Scan types
├── scripts/
│   └── seed-data.ts                # Standalone CLI seeder
├── .env.example
├── README.md
└── package.json
```

---

## 9. STEP-BY-STEP EXECUTION INSTRUCTIONS FOR OPENCODE
1. Run `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --eslint --import-alias "@/*"` (or set up standard Next.js 15).
2. Install dependencies: `npm install falkordb lucide-react clsx tailwind-merge canvas-confetti @types/canvas-confetti`.
3. Create `lib/falkordb.ts` with connection pooling using the credentials from `.env.local`.
4. Create `lib/queries.ts` containing the 5 signature Cypher queries.
5. Create `app/api/seed/route.ts` and populate the 55-node graph into FalkorDB Cloud.
6. Create `app/api/scan/route.ts` executing the multi-hop exposure query + memory delta query + LLM explanation.
7. Build `app/page.tsx` with the high-tech terminal layout, preloaded buttons, verdict badges, graph visualization, and escalation modal.
8. Verify everything builds cleanly with `npm run build`.
