# ClearPath
### The trust agent that shows its work.
> Built for the **Graph Hacks Hackathon** by WeMakeDevs & FalkorDB  
> **Tracks Entered:** Track 1 (*Agents That Act on Connected Data*) & Track 2 (*Agent Memory and Coordination*)  
> **Builder:** Khalid ([The Web3 Wizard](https://github.com/khalid))

---

## What Problem Are We Actually Solving?

Let’s cut through the noise for a second.

Imagine you are Dave. You run an OTC crypto desk or a high-volume P2P settlement shop. 

You’re sitting with Telegram open on one screen. A \$15,000 deal is on the table. The trade window has a timer: **2 minutes left before the quote expires.**

The counterparty drops a wallet address into the chat:
`0x7a250d5630b4cf539739df2c5dacb4c659f2488d`

Now you have a real problem:
- If those funds came out of an exploit, a sanctioned entity, or a mixer like Tornado Cash 2 hops ago, your exchange accounts can get frozen, your desk gets flagged, and you're out of business.
- But enterprise surveillance suites like Chainalysis or TRM Labs cost \$50,000 to \$100,000 a year. They require sales calls, enterprise onboarding, and slow manual investigations. Independent operators can’t use them mid-deal.
- And if you try using modern "AI agents" backed by Vector Search (RAG), you are gambling.

Why? Because **vector search cannot calculate graph hops.**

A vector database computes text similarity between embeddings. It has no idea whether Address A transferred ETH to Mule B, who peeled 1% fees and forwarded to Consolidator C, who funded your counterparty. It cannot follow money trails. When people hook an LLM to a vector database for fund tracing, the agent just hallucinates and guesses.

That is why I built **ClearPath**.

> **"Vector search guesses. Graphs prove. Don't trust the agent — trace it."**

In 3 seconds, Dave pastes the address, and ClearPath runs deterministic graph algorithms on **FalkorDB**, recalls past investigations from his private memory graph, and hands him a 4-state verdict with the exact money trail that proves it.

---

## The FalkorDB "Removal Test" (Rule 3)

FalkorDB’s hackathon rules state:
> *"The graph has to do real work. If the product still works once FalkorDB is taken out, the graph is decoration."*

ClearPath cannot exist without FalkorDB. Here is why:

1. **Directional, Decayed Multi-Hop Traversal:**  
   To evaluate taint, ClearPath traverses backwards up to 4 hops, calculates exponential taint decay ($0.6^{\text{hop}}$), filters out dust transactions ($< \$10$), and stops traversal the instant it hits a verified exchange hot wallet (Binance, Kraken). Relational databases choke on recursive multi-hop joins with sub-second latency constraints. FalkorDB’s GraphBLAS linear algebra engine computes this in **4 milliseconds** on live cloud instances.
2. **Dual-Graph Memory Isolation:**  
   Dave’s private session notes and investigated episodes live in `clearpath_mem_dave`. When Dave re-evaluates an address, FalkorDB runs a temporal delta query to see what new transactions touched that wallet since his last session. Confirmed fraud cases are escalated to `clearpath_shared_cases` through an explicit human sign-off gate.
3. **Take FalkorDB out, and ClearPath cannot compute an exposure ratio, cannot trace an illicit path, and cannot remember prior sessions.**

---

## The System Architecture & Graph Schema

```
[Mixer / Sanctioned Cluster]
           │ (TRANSFERRED)
           ▼
       [Mule A] ──────────────┐ (TRANSFERRED)
           │ (TRANSFERRED)    │
           ▼                  ▼
    [Consolidator X]     [Grey OTC Desk] (CAUTION Bridge)
           │ (TRANSFERRED)
           ▼
    [Target Wallet] ◄──── [Binance / Kraken Hot Wallets]
           ▲
           │ (ATTESTS_TO)
    [EAS Identity Verifier]

    [Target Wallet] ── (DOCUMENTED_IN) ──► [Episode (mem_dave)]
                                                  │
                                                  ▼ (SHARED_AS)
                                            [Case (shared_cases)]
```

### Multigraph Setup
- `clearpath_trust`: Authoritative financial graph (wallets, transactions, entities, EAS identity attestations).
- `clearpath_mem_dave`: Private episodic memory graph isolating Dave's investigations (`:Episode`, `:Fact`, `:Playbook`).
- `clearpath_shared_cases`: Collaborative intelligence graph where Dave escalates confirmed threats.

---

## The 4-State Verdict Discipline

I refuse to build systems that tell users *"This wallet is 100% safe"*. In crypto forensics, you can never prove safety—you can only prove the presence or absence of links to known illicit clusters within your dataset.

ClearPath enforces four explicit states:
- **`BLOCK`**: Exposure ratio $\ge 35\%$ or direct 1-hop link to an active mixer router.
- **`CAUTION`**: Exposure ratio $10\%-35\%$, or thin account history ($<30\text{ days}$) with indirect intermediary links.
- **`NO-KNOWN-RISK`**: Zero paths to known mixers or mules within 4 hops, supported by exchange hot wallet liquidity. *(Negative proof, never false safety)*.
- **`UNKNOWN`**: Address unseen in the graph. Under Dave’s screening protocol, an empty graph **never** maps to clear.

---

## Published OpenCypher Queries (Rule 10)

Every query running on FalkorDB Cloud is open, parameterized, and disclosed below:

### 1. Multi-Hop Taint Traversal (Up to 4 Hops)
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

### 2. Target Wallet Inflow & Activity Metrics
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

### 3. Episodic Memory Recall (Track 2)
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

### 4. Temporal Delta ("What Changed Since Dave's Last Scan?")
```cypher
MATCH (inflow:Wallet)-[r:TRANSFERRED]->(target:Wallet {address: $targetAddress})
WHERE r.timestamp > $lastSessionTimestamp
RETURN 
  count(r) AS new_inflows,
  coalesce(sum(r.amount_usd), 0.0) AS new_volume,
  collect(r.tx_hash) AS new_txs
```

### 5. Governance Sign-off & Escalation Write-Back
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

## The Interactive "Theater Test"

A lot of hackathon demos are hardcoded mockups where clicking a button just shows a canned screen.

To prove to the judges that ClearPath is querying a live database:
1. Click **Exhibit C (`0xDEMO_CLEAN_TARGET_03`)** -> The screen evaluates to `NO-KNOWN-RISK`.
2. Click **"Inject Mule Transfer (Flip to Caution)"** -> This executes an actual Cypher `CREATE` query injecting an \$8,500 payment from Mule A into Exhibit C on FalkorDB Cloud.
3. Re-scan Exhibit C -> The verdict flips live to **`CAUTION`**, the visual money trail reveals the new mule hop, and Dave's temporal memory flags: *"Notice: 1 new transaction ($8,500) detected since last scan."*
4. Click **"Rollback Taint"** -> Deletes the edge from FalkorDB; the verdict flips back to `NO-KNOWN-RISK`.

Hardcoded demos cannot run backwards. Live graphs do.

---

## How to Run It Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/khalid/clearpath.git
cd clearpath
npm install
```

### 2. Environment Setup (`.env.local`)
Create `.env.local`:
```env
FALKORDB_HOST=r-6jissuruar.instance-smwhvhjy3.hc-srom4rolb.eu-west-1.aws.f2e0a955bb84.cloud
FALKORDB_PORT=52752
FALKORDB_USERNAME=falkordb
FALKORDB_PASSWORD=your_password
FALKORDB_GRAPH_TRUST=clearpath_trust
FALKORDB_GRAPH_MEMORY=clearpath_mem_dave
FALKORDB_GRAPH_SHARED=clearpath_shared_cases

GEMINI_API_KEY=your_gemini_api_key
```

### 3. Seed the Graph (55 Nodes, 150 Edges)
```bash
node scripts/seed-cli.mjs
```
*(Or click "Reset Graph" in the top bar of the web app).*

### 4. Start the Terminal
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access Dave's terminal.
