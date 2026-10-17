# CLEARPATH — Agent Handoff (written Oct 6, 2026)

## Mission
Win Graph Hacks: Context for AI Agents (FalkorDB × WeMakeDevs). Build window Oct 15, 12:01 AM IST → Oct 18, 11:59 PM IST (≈ Oct 14 ~8:30 PM WAT → Oct 18 ~7:30 PM WAT). Solo builder (Khalid). No exceptions on scope.

## What ClearPath is (one line)
3-second counterparty screen for crypto operators: paste a wallet address mid-deal, get LOW/MEDIUM/HIGH with the money trail that proves it. "Don't trust the agent. Trace it."

## Read order (mandatory — in this order, before touching anything)
1. PROJECT_BRIEF.md (frozen: loop, tracks, stack, non-goals, win conditions)
2. GRILL.md (all 15 specialist verdicts + final rulings — every conflict already adjudicated)
3. IDEA.md (v2 final spec: math, schema, seeds, theater test, demo script)
4. RULES.md (verified rules + Nigeria-shipping flag)
5. EXECUTION_PLAN.md (day plan) → 6. STATUS.md (live tracker — update it when done)

## Hard laws (violating any of these loses the hackathon)
- **R8 freeze:** NO code or Cypher commits before Oct 15. Markdown only until then. First code commit tagged.
- **NO Python, NO Docker, NO Graphiti** (verified: no TS Graphiti exists). TS + Vercel + FalkorDB Cloud only.
- **Tracks T1 + T2 ONLY.** T3 is dropped. Never claim it.
- **Language bans:** never write "proof of safety" (say "no taint path within N hops over known labels"). VOUCH is banned — ATTESTATION only. CLEAR as a word is banned — use NO-KNOWN-RISK. Empty graph NEVER maps to clear → UNKNOWN.
- **Verdicts are backend-composed** (deterministic Cypher); the LLM writes the explanation slot only.
- **Data:** synthetic seeds + public no-key sources ONLY. Nothing login-walled, nothing scraped with someone else's key.
- **AI disclosure:** tools used must be disclosed (keep AI-DISCLOSURE.md current); builder must be able to whiteboard every query.

## Builder profile (build WITH him, not around him)
Khalid: strong TypeScript/Node + Vercel (shipped a Tempo testnet billing project end-to-end), Cypher/graph beginner, no Docker, learns by building together. Teach each query line-by-line. Never solo-run a setup marathon — pair everything.

## Stack (locked)
Vercel (TS frontend + API routes) + FalkorDB Cloud free tier (instance created OCT 15, not before — idle-delete) + `falkordb` npm + TS MCP SDK + 1 LLM key + backup. Hedges mandatory: 6h keep-alive pinger, 60s seed.sh, nightly graph dump, recorded video as primary exhibit, local-setup docs.

## Key links
- Event: https://www.wemakedevs.org/hackathons/falkordb
- Rules: https://www.wemakedevs.org/hackathons/falkordb/rules
- Schedule: https://www.wemakedevs.org/hackathons/falkordb/schedule
- Resources: https://www.wemakedevs.org/hackathons/falkordb/resources
- FalkorDB docs: https://docs.falkordb.com
- Discord (FalkorDB, event channel): https://discord.com/invite/Y2mMT9VdMy
- Registration: event page → "Register now" (sign-in required; open now, closes with submissions)

## Pre-event todos (Khalid's, before Oct 15)
1. Register + join Discord. 2. Ask Nigeria hardware-shipping question (fallback: contact@wemakedevs.org), log answer in STATUS.md. 3. Cypher walkthrough together. 4. Cloud account signup (NO instance yet).

## Watch items / open threads
- Prize pages changed once ($10K → $20K) — recheck before submitting.
- No rubric, judges, or results date published — monitor Discord; build to track bullets as proxy rubric.
- LLM key: confirm which key + backup before Oct 15 (never commit keys).
- Colosseum Copilot skill is installed but IRRELEVANT here (Colosseum-Solana corpus; wrong battlefield). Do not query it for this event.
