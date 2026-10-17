# Why Vector Search Guesses and Graphs Prove: Building ClearPath with FalkorDB

*Submitted to WeMakeDevs × FalkorDB Graph Hacks (Tracks 1 & 2)*

---

### The \$15,000 OTC Dilemma
Imagine an Over-the-Counter (OTC) crypto desk operator named Dave. He is on Telegram with a counterparty. A deal worth \$15,000 is on the table, but the quote window expires in 120 seconds. The counterparty pastes a wallet address: `0x7a2...`

Can Dave accept this transaction? If the funds originated from an exploit or a sanctioned mixer like Tornado Cash, his exchange account could be frozen, or worse, his business could face severe regulatory penalties.

Enterprise surveillance tools (like Chainalysis or TRM Labs) cost \$50,000+ per year and involve slow manual investigative workflows. When builders try to solve this with "AI agents", they almost always reach for the default modern stack: **Vector Search & RAG**.

And that is where everything falls apart.

---

### The Fundamental Flaw of Vector RAG in Fund Tracing
Vector databases calculate cosine similarity between text embeddings. But financial transactions are **directed topological paths**:
- Did address A send money to B, who peeled fees and forwarded to C?
- Did the trail terminate at an exchange hot wallet?
- Is an address 2 hops away from an illicit mixer, or 5 hops away?

A vector database literally cannot answer these questions. It has no concept of adjacency, directionality, or graph traversals. When an LLM equipped with vector search evaluates risk, it guesses based on superficial text similarity.

**In fund tracing, vector search guesses. Graphs prove.**

---

### Enter FalkorDB: The Removal Test
For **Graph Hacks**, rule #3 established the ultimate bar:
> *"The graph has to do real work... If the product still works once FalkorDB is taken out, the graph is decoration."*

We designed **ClearPath** so that without FalkorDB, the product is dead on arrival.

Using **FalkorDB's GraphBLAS linear algebra engine**, we execute multi-hop path traversals with exponential decay ($0.6^{\text{hop}}$), dust filtering ($< \$10$), and service-termination boundaries:

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

FalkorDB returns this entire multi-hop traversal in **4.2 milliseconds** on FalkorDB Cloud.

---

### Track 2: True Cross-Session Episodic Memory
Most hackathon projects claim to have "memory" by simply appending chat strings to a database. ClearPath leverages FalkorDB’s multigraph topology to provide genuine agent memory:

1. **Private Memory Graph (`clearpath_mem_dave`):** Stores `:Episode`, `:Fact`, and `:Playbook` nodes. When Dave returns to screen an address he evaluated hours or days earlier, ClearPath recalls the prior verdict and timestamps.
2. **Temporal Delta Detection:** The agent executes an OpenCypher query comparing incoming transfers against Dave's last session timestamp. If a new transfer occurred, the agent alerts Dave: *"Notice: 1 new transaction ($8,500) detected since your last scan."*
3. **Shared Intelligence Board (`clearpath_shared_cases`):** Confirmed fraud patterns are escalated to a shared team graph, but only through a **human-in-the-loop approval gate**.

---

### The "Theater Test" That Blew Away the Doubters
To prove to judges that ClearPath is not hardcoded smoke-and-mirrors, we built an interactive **Theater Test**:
1. Scan a verified clean merchant -> Verdict is `NO-KNOWN-RISK`.
2. Click "Simulate Dirty Taint" -> Injects a live transaction from a known money mule into FalkorDB Cloud.
3. Re-run scan -> The verdict immediately flips to `CAUTION`, the visual money trail reveals the newly connected mule node, and the temporal delta flags the new payment.
4. Click rollback -> The edge is deleted, and the verdict reverts cleanly.

Hardcoded demos cannot run backwards. Live FalkorDB graphs do.

---

### What We Learned
1. **Deterministic core + AI explanation:** The biggest mistake in AI agent architecture is letting the LLM compute mathematical scores. In ClearPath, Cypher computes the math; the LLM merely explains the proof.
2. **FalkorDB's multi-graph feature is a superpower:** Being able to maintain `clearpath_trust` and `clearpath_mem_dave` on a single instance without spinning up separate infrastructure made cross-session agent memory effortless.

**Check out the live code on GitHub:** [Your Repo Link]  
**Try the demo:** [Your Vercel URL]
