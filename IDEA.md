# CLEARPATH v2 — "Dave's Screen" (FINAL, post-trial 2026-10-06)

## One-liner
3-second counterparty screen for crypto operators: paste an address mid-deal, get LOW/MEDIUM/HIGH with the money trail that proves it. "Don't trust the agent. Trace it."

## The user (locked)
**Dave, OTC operator.** Phone in one hand, Telegram in the other, $15k deal expiring in 2 minutes. He pastes the counterparty address. Timer pressure. This is the demo movie — not a curious newbie.

## The verdict (4 states, never binary, never "safe")
- **BLOCK** (HIGH exposure) · **CAUTION** (MEDIUM / thin history) · **NO-KNOWN-RISK** (no taint path within N hops over known labels — never "proof of safety") · **UNKNOWN** (empty graph / unseen address — empty NEVER maps to clear).
- Every verdict = `{tier, exposure_ratio, confidence, rule_ids, paths, amounts, timestamps, cypher}`. LLM writes the explanation slot ONLY; backend composes the verdict (injection-proof).

## The math (forensically credible, per Web3 expert)
`exposure = SUM(tainted_inflow × 0.6^hop) / total_inflow`, max 4 hops, traversal TERMINATES at `ExchangeHotWallet` (trace-until-service, Chainalysis-style). Direction split: RECEIVES_FROM = exposure, SENDS_TO = intent — never undirected. Dust floor (<$10 or <0.5% inflow) discounted; fresh wallet (<30d) + pass-through can never clear above LOW. Corroboration required: no single-factor HIGH. ATTESTATION edges (EAS-style, EigenTrust-weighted, capped 2-hop decay) contextualize only — never exonerate.

## The agent (2-stage, logged trace)
- Stage 1 `triage`: weighted taint + memory recall. Stage 2: LLM picks ONE of `risk_centrality` (mule-hub fan-in/out) / `ring_expand` (shared-counterparty overlap) / `attestation_check` based on Stage-1 conflict. Trace `tool→result→reasoning→tool` shown on screen.
- 6 tools, one shared `scoreWallet()` for seeds AND live: `trace_taint_weighted, risk_centrality, ring_expand, attestation_check, memory_recall, case_writeback`.
- Exposed via lightweight TS MCP server (track bullet + per-verdict citations). NO Python MCP server.

## Memory (hand Cypher, NO Graphiti — verified no TS Graphiti exists)
- 3 labels: `(:Episode)` (what happened) / `(:Fact)` (semantic generalities: typologies, entity resolutions) / `(:Playbook {version})` (procedures the agent LOADS from graph).
- Dual graphs: `mem_<user>` private + `shared_cases` public via `(:Episode)-[:SHARED_AS {redacted}]->(:Case)`. Cross-user leak test rehearsed.
- Temporal delta: session 2 asks "what's new?" → Cypher returns hops with `first_seen > last_session_ts`. Handoff: `(:Case {status,owner})-[:HANDOFF]->` Scout→Analyst claim/lease.
- No embedding infra: full-text index for recall candidates, graph for decisions. Memory budget: seeds ≤60 episodes, capped, TTL'd.

## Seeds (typed, timestamped, fee-realistic — data realist spec)
~55 nodes / ~150 edges: dirty mixer fan-out (0.485–0.515 ETH, 47-min window, per-hop fee loss), clean CEX cluster (0.23–3.7 ETH over 19 days, aged 60–300d), vouch web (avg degree 2.4, NOT a clique), grey CAUTION bridge, background noise. Every SENT carries `tx_hash + amount + ts`. Plus: dusted-innocent exhibit, exchange-hub exhibit, 5-address holdout set. Obviously-fake `0xDEMO…` addresses, `synthetic:true` labels.

## Theater test (the judge-killer beat)
Judge gives any hex → New-wallet node → UNKNOWN (queries returned 0 rows, shown) → Simulate payment from BLOCK mule → re-run → flips to CAUTION with before/after query results side by side → delete edge → flips back. "Hardcoded can't run backwards."

## Demo (director's 90s + theater test for Q&A)
Pre-loaded buttons `[Scam Wallet] [My Wallet]`, warmed Cloud, LLM temp 0/max 80 tokens, badge-first rendering. 0:00 hook → 0:05 BLOCK with animated 3-node path → 0:30 contrast (honest "no link in this data") → 0:45 session-pill rotation memory → 1:05 escalation shield slams the Approve button → 1:20 closer freeze. Zero typing. Failure protocol: cached snapshot banner, template explanations, backup video.

## Tracks
ENTER T1 + T2. T3 DROPPED (re-add only if Day 3 ahead with the 2-query slice).

## Stack (locked, no Python, no Docker)
Vercel TS + FalkorDB Cloud (instance created Oct 15, same region as Vercel) + `falkordb` npm + TS MCP SDK + one LLM key (+backup). Hedges: 6h pinger, 60s seed.sh, nightly dump, recorded video primary, local-setup docs.

## Moat lines
"Don't trust the agent. Trace it." / "Vector search guesses. Graphs prove." / "Remove FalkorDB and verdicts become impossible — the queries are published."
