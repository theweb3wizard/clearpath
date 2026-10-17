# ClearPath — The Trust Agent That Shows Its Work
> **3-Second Counterparty Screen for Crypto Operators with Multi-Hop GraphBLAS Proof**  
> Built for **Graph Hacks: Context for AI Agents** (WeMakeDevs × FalkorDB)  
> **Tracks Entered:** Track 1 (*Agents That Act on Connected Data*) & Track 2 (*Agent Memory and Coordination*)

---

## 1. Executive Summary & Problem
In crypto OTC trades and P2P settlement, operators face a ruthless dilemma:
- **Enterprise surveillance suites (Chainalysis, TRM Labs):** Cost \$50k–\$100k/year, require slow manual investigation, and are walled off from independent desk traders.
- **Generic LLM / Vector RAG Agents:** Vector databases compute text embeddings; **vector search cannot calculate graph hops, follow fund flows, or trace peeling chains.** When an LLM guesses counterparty risk using vector search, it produces hallucinations and vibes.

**ClearPath ("Dave's Screen")** solves this in under 3 seconds:
Dave (an OTC desk trader with a \$15k deal expiring in 2 minutes) pastes a counterparty address. ClearPath executes deterministic multi-hop OpenCypher traversals on **FalkorDB**, recalls past investigations from Dave's private episodic memory graph, checks temporal deltas, and delivers an injection-proof 4-state verdict card with an interactive money-trail graph, raw Cypher queries, and an approval gate for blacklisting.

> *"Vector search guesses. Graphs prove. Don't trust the agent — trace it."*

---

## 2. FalkorDB Removal Test (Rule 3 Compliance)
> *"If the product still works once FalkorDB is taken out, the graph is decoration."*

ClearPath is structurally incapable of operating without FalkorDB:
1. **Multi-Hop Fund Flow Decay:** Determining whether an address received tainted funds requires traversing up to 4 hops backwards, applying an exponential decay factor ($0.6^{\text{hop}}$), filtering dust transfers ($< \$10$), and terminating at exchange hot wallets. Relational DBs choke on recursive self-joins under sub-second latency constraints; vector databases cannot express topological paths. FalkorDB’s GraphBLAS linear algebra engine computes this in $<5\text{ms}$.
2. **Dual-Graph Memory Isolation:** Dave’s private investigations are isolated in `clearpath_mem_dave` (`:Episode`, `:Fact`, `:Playbook`), while confirmed fraud patterns are shared globally in `clearpath_shared_cases`.
3. **If you remove FalkorDB, ClearPath cannot compute a single exposure ratio, cannot trace a fund flow, and cannot recall prior sessions.**

---

## 3. Graph Schema & Data Model

### Multigraph Topology
- `clearpath_trust`: Authoritative financial graph (wallets, transactions, entities, EAS attestations).
- `clearpath_mem_dave`: Private episodic and procedural memory per operator.
- `clearpath_shared_cases`: Collaborative intelligence board for escalated fraud cases.

### Visual Model
```
[Tornado Mixer / Sanctioned]
         │ (TRANSFERRED)
         ▼
     [Mule A] ───────────────┐ (TRANSFERRED)
         │ (TRANSFERRED)     │
         ▼                   ▼
  [Consolidator X]      [Grey OTC Desk] (CAUTION Bridge)
         │ (TRANSFERRED)
         ▼
  [Target Wallet] ◄──── [Binance / Kraken Hot Wallets]
         ▲
         │ (ATTESTS_TO)
  [EAS Identity Oracle]

  [Target Wallet] ─── (DOCUMENTED_IN) ───► [Episode (mem_dave)]
                                                  │
                                                  ▼ (SHARED_AS)
                                            [Case (shared_cases)]
```

---

## 4. Published Cypher Queries & Algorithms (Rule 10)

### Query 1: Directional Multi-Hop Taint Traversal (Up to 4 Hops)
```cypher
MATCH path = (source:Wallet)-[:TRANSFERRED*1..4]->(target:Wallet {address: $targetAddress})
WHERE source.entity_type IN ['mixer', 'sanctioned', 'mule']
  AND ALL(rel IN relationships(path) WHERE rel.amount_usd >= 10.0)
  AND NONE(node IN nodes(path)[1..-1] WHERE node.entity_type = 'exchange_hot_wallet')
RETURN 
  source.address AS source_address,
  source.entity_type AS source_type,
  length(path) AS hop_count,
  [x IN nodes(path) | x.address] AS node_addresses,
  [r IN relationships(path) | {
    from: startNode(r).address,
    to: endNode(r).address,
    amount: r.amount_usd,
    tx: r.tx_hash
  }] AS steps
```

### Query 2: Inflow Volume & Target Metadata
```cypher
MATCH (w:Wallet {address: $targetAddress})
OPTIONAL MATCH (inflow:Wallet)-[r:TRANSFERRED]->(w)
RETURN 
  w.address AS address,
  w.label AS label,
  w.entity_type AS entity_type,
  w.first_seen AS first_seen,
  w.balance_usd AS balance_usd,
  coalesce(sum(r.amount_usd), 0.0) AS total_inflow,
  count(r) AS tx_count
```

### Query 3: Episodic Memory Recall (Track 2)
```cypher
MATCH (e:Episode {target_address: $targetAddress})
RETURN 
  e.id AS episode_id,
  e.verdict AS prior_verdict,
  e.exposure_ratio AS prior_exposure_ratio,
  e.timestamp AS prior_timestamp,
  e.notes AS prior_notes
ORDER BY e.timestamp DESC
LIMIT 3
```

### Query 4: Temporal Delta ("What Changed Since Last Session?")
```cypher
MATCH (inflow:Wallet)-[r:TRANSFERRED]->(target:Wallet {address: $targetAddress})
WHERE r.timestamp > $lastSessionTimestamp
RETURN 
  count(r) AS new_inflows,
  coalesce(sum(r.amount_usd), 0.0) AS new_volume,
  collect(r.tx_hash) AS new_txs
```

### Query 5: Governance Gate Escalation Write-Back
```cypher
MERGE (c:Case {target_address: $targetAddress})
ON CREATE SET 
  c.status = 'ESCALATED',
  c.created_at = $timestamp,
  c.escalated_by = $operator,
  c.initial_reason = $reason,
  c.exposure_ratio = $exposureRatio
MERGE (op:Operator {name: $operator})
MERGE (op)-[:FILED_CASE {timestamp: $timestamp}]->(c)
RETURN c.status AS status
```

---

## 5. The 4-State Verdict System
ClearPath enforces strict terminology bans:
- **`BLOCK`**: Exposure ratio $\ge 35\%$ or direct 1-hop mixer inflow.
- **`CAUTION`**: Exposure ratio $10\%-35\%$, or thin account history ($<30\text{ days}$) with indirect mule ties.
- **`NO-KNOWN-RISK`**: No taint path within 4 hops over known labels, backed by verified CEX liquidity. *(We never claim "proof of safety")*.
- **`UNKNOWN`**: Address unseen in graph. Under ClearPath protocol, an empty graph **never** maps to clear.

---

## 6. Live Interactive Theater Test
To prove to judges that verdicts are genuinely computed from FalkorDB in real time:
1. Select **Exhibit C (`0xDEMO_CLEAN_TARGET_03`)** -> Verdict is `NO-KNOWN-RISK`.
2. Click **"Simulate Dirty Taint"** -> Injects a live transfer edge from `Mule A` ($8,500) into Exhibit C in FalkorDB Cloud.
3. Re-run Screen -> The verdict immediately flips to **`CAUTION`**, showing the newly traversed mule path and temporal alert.
4. Click **"Rollback Dirty Taint"** -> Deletes the simulated edge; verdict flips back to `NO-KNOWN-RISK`.

---

## 7. Setup & Run Locally

### Prerequisites
- Node.js v18+ (tested on Node v24)
- FalkorDB Cloud instance (or local Docker container `falkordb/falkordb:latest`)

### 1. Clone & Install
```bash
git clone https://github.com/your-username/clearpath.git
cd clearpath
npm install
```

### 2. Environment Variables (`.env.local`)
Create `.env.local`:
```env
FALKORDB_HOST=r-6jissuruar.instance-smwhvhjy3.hc-srom4rolb.eu-west-1.aws.f2e0a955bb84.cloud
FALKORDB_PORT=52752
FALKORDB_USERNAME=falkordb
FALKORDB_PASSWORD=your_password
FALKORDB_GRAPH_TRUST=clearpath_trust
FALKORDB_GRAPH_MEMORY=clearpath_mem_dave
FALKORDB_GRAPH_SHARED=clearpath_shared_cases
```

### 3. Seed FalkorDB
```bash
node scripts/seed-cli.mjs
```
*(Or click "Reset Graph" directly in the web UI).*

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access Dave's terminal.
