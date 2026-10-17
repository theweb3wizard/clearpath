# CLEARPATH — Project Brief (frozen v1.0, 2026-10-06)

## One-liner
The trust agent that shows its work: 3-second counterparty screen for crypto operators, with the money trail that proves it. Verdicts with paths, not vibes.

## Event
Graph Hacks: Context for AI Agents (FalkorDB × WeMakeDevs). Oct 15, 12:01 AM IST → Oct 18, 11:59 PM IST, online. Solo. See RULES.md.

## Tracks (entering T1 + T2 ONLY — T3 dropped per trial)
1. **Agents That Act on Connected Data** (primary) — weighted exposure verdicts, 2-stage tool selection, approval-gated actions.
2. **Agent Memory and Coordination** (primary) — Episode/Fact/Playbook memory, per-user graphs + shared cases, temporal deltas, handoffs.
3. **Company Brain DROPPED.** Re-add only if Day 3 ahead AND the 2-query slice is done. Provenance edges stay (strengthen T1).

## Core loop (must work live on demo day)
Dave pastes a counterparty address mid-deal → deterministic exposure math runs FIRST (directional, decayed, dust-filtered, hub-terminated) → memory recall (prior episodes + "new hops since last session") → 2-stage tool selection with logged trace → verdict card (BLOCK/CAUTION/NO-KNOWN-RISK/UNKNOWN + ratio + path + sources + confidence + the Cypher) → ESCALATE waits for his click → everything written back to the graph.

## Demo story (90 seconds)
1. Dirty wallet → BLOCK with 2-hop mixer path on screen ("vector search guesses — graphs prove").
2. Clean wallet → CLEAR via negative proof ("no path = proof of safety").
3. New session, same user → agent remembers the case + flags new hops (memory track, live).
4. Approval gate click → escalated (governance, live).

## Stack (locked — NO Python, NO Docker, NO Graphiti)
- FalkorDB Cloud free tier (instance created Oct 15, NOT before — idle-delete risk), official `falkordb` npm client, TypeScript (Bursar muscle).
- Hand-rolled Cypher via one shared `scoreWallet()`; one LLM key + backup (6s timeout, template fallback); full-text index, zero embedding infra.
- Lightweight TS MCP server wrapping the 6 tools (track bullet + per-verdict citations). Vercel frontend + API routes only.
- Data: typed synthetic seeds (spec in IDEA.md) + Blockscout garnish ONLY if Day 3 ahead (8s timeout + fallback banner). NEVER private/login-walled data (Rule 6).

## Explicit NON-goals (4-day rule)
- No live mainnet fund-tracing as the core (seeded data carries the demo; Blockscout garnish is stretch only).
- No token, no DAO, no marketplace, no mobile app, no multi-chain indexing.
- No Python anywhere (no Graphiti, no Python MCP server — verified no TS path exists).
- No Docker (Cloud free tier + hedges: 6h pinger, 60s seed.sh, nightly dump).
- No Track-3 features, period (dropped per trial — re-add only with the 2-query slice on Day 3).
- No code or Cypher commits before Oct 15 (R8) — markdown only until then.
- Nothing that violates the removal test: if FalkorDB comes out and it still works, it ships without that part.

## Win conditions (mapped to what wins)
1. One graph-shaped question, end-to-end (T1 focus bullets).
2. Removal-test proof in README + demo ("why vector-only fails" section).
3. README with setup + data-model diagram + every Cypher query published (Rule 10).
4. Memory proven across two live sessions (T2 focus bullets).
5. MCP tool calls cited on every verdict (Blockscout/Brexo lesson).
6. Approval gate on every accusatory action (FalkorDB-editor tiebreaker pattern).
7. Live deployment + 90-second demo-first video (no stalls, pre-filled cases).
8. Complete package: repo, video, tracks named, AI-tool use disclosed (Rule 10–13).
9. Blog post submitted (AirPods side prize — free +EV).
10. Top-50 floor: even without a track win, the package quality clears the T-shirt bar.

## Key URLs
- Rules: https://www.wemakedevs.org/hackathons/falkordb/rules
- Overview/tracks: https://www.wemakedevs.org/hackathons/falkordb
- Schedule: https://www.wemakedevs.org/hackathons/falkordb/schedule
- Resources: https://www.wemakedevs.org/hackathons/falkordb/resources
- FalkorDB docs: https://docs.falkordb.com
- Discord (FalkorDB, open for event): https://discord.com/invite/Y2mMT9VdMy
