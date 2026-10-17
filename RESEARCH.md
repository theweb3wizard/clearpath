# FalkorDB Technical Brief (verified Oct 6, 2026 — full report from research agent)

## Engine
- In-memory property graph, Redis-module (Rust/C), spoken to over RESP (`GRAPH.QUERY`), NOT Bolt. Successor to RedisGraph (EOL Jan 2025 — not the same product).
- Sparse adjacency matrices + GraphBLAS → fast multi-hop traversals on every agent-loop step.
- Cypher = OpenCypher v9 SUBSET + extensions (vector/full-text indexes, `vecf32()`, PageRank/BFS/shortest-path). NO `EXISTS{}`, NO regex `=~`, NO label expressions, NO APOC/UDFs. Keep every query dialect-safe.
- License: server SSPLv1 (fine for hackathons); clients permissive (MIT etc).

## Run it (Docker primary)
```bash
docker volume create falkordb_data
docker run -d --name falkordb -p 6379:6379 -p 3000:3000 \
  -v falkordb_data:/var/lib/falkordb/data falkordb/falkordb:latest
```
- Browser UI at :3000, RESP at :6379. Pin the image version; always mount the volume (`--rm` eats the graph).
- Free cloud exists (100 MB, no card) but STOPS after 1 idle day, DELETED after 7. Demo/backup only, never primary.

## Clients (official only)
- Node: `npm install falkordb` (v6.6.2) — `FalkorDB.connect({url:'falkor://localhost:6379'})`, `db.selectGraph('cases')`, `graph.query(cypher, {params})`.
- Python alt: `pip install FalkorDB`. Never use Neo4j/Bolt drivers (experimental).

## Agent-memory stack (docs-verified)
- **Graphiti** (`graphiti-core[falkordb]`) — episodes + temporal + per-user graphs. Our T2 engine.
- LangChain (`langchain-falkordb`: graph, vector store, QA chain, chat history, LangGraph checkpointer), LlamaIndex graph store, Cognee, Mem0, GraphRAG-SDK.
- Vector index is native HNSW — but note: vector search "doesn't combine well with property filters" (filter after retrieval), and our killer demo moment is deterministic traversal where vectors CAN'T compete.

## Architecture (locked for ClearPath)
One instance, two graphs: `trust` (people/wallets/labels/reputation — authoritative) + `mem_<user>` (episodic memory per user, vendor-recommended isolation).
Loop: embed observation → vector recall on memory → DETERMINISTIC Cypher policy checks on `trust` (LLM cannot skip) → LLM verdict → write back edges + episode.

## Signature queries (must all run in Browser on Day 1)
1. 2-hop taint: `(me)-[TRUSTS*1..2]->(counterparty)` with weight filter — the removal-test proof.
2. Wallet risk expansion: `(person)-[:OWNS]->(w:Wallet)` + exposure scan.
3. Vouch-weighted reputation: count/avg over incoming TRUSTS.
4. Memory recall → expand: `db.idx.vector.queryNodes` then `-[:ABOUT]->(person)`.
5. Shortest path to any `:Scam`/`:Mixer` label (negative proof when empty).

## Gotchas banked
- Params via client dict, never string interpolation. `MERGE` on ids for idempotent writes. `LIMIT` doesn't stop eager writes. Counting quirk: reference rel aliases.
- Inside sibling containers use `host.docker.internal`, not localhost. Auth via `REDIS_ARGS="--requirepass X"` if needed.
- Full sources: https://docs.falkordb.com, clients page, cypher-support + known-limitations pages.
