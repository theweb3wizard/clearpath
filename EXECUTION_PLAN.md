# CLEARPATH — Execution Plan (Oct 15 → Oct 18, IST; WAT ≈ IST−4:30)

Rule: each day ends with a verifiable artifact. Scope cuts from NON-goals in PROJECT_BRIEF.md, never from win conditions 1–8.

## Day 0 — NOW → Oct 14 (legal pre-work ONLY: ideas, notes, sketches, research)
- [ ] Register on WeMakeDevs + join FalkorDB Discord (Khalid).
- [ ] Ask in Discord: hardware shipping to Nigeria? (fallback: email contact@wemakedevs.org). Log answer in STATUS.md.
- [ ] Learn Cypher together (15-min walkthrough, 5 queries — no product code, R8 safe).
- [ ] FalkorDB Cloud account created (signup only — INSTANCE created Oct 15, not before).
- [ ] Finalize seed spec + exposure thresholds on paper (IDEA.md). Prepare diagrams.
- [ ] Recheck prize/rule pages for changes (they changed once already).
- [ ] Write AI-DISCLOSURE.md skeleton (tools used — fill during event).
- Done when: registered, Discord answer logged, Cypher familiar, spec frozen.

## Day 1 — Oct 15: GRAPH (the removal-test core)
- Do: repo init (FIRST code commit — tag it), Cloud instance up (same region as Vercel), 60s seed.sh (55 nodes/150 edges typed + timestamped), exposure-ratio query + vouch/attestation queries + temporal-delta query all running in Browser with screenshots. Set up 6h pinger.
- Done when: seed → Browser shows mixer→mule→consolidator path + dusted-innocent scoring LOW + holdout set hidden.

## Day 2 — Oct 16: AGENT (loop + memory + tools)
- Do: TS agent loop (recall → deterministic checks → 2-stage tool selection with LOGGED trace → verdict → write-back), Episode/Fact/Playbook memory + dual graphs + leak test, TS MCP server (6 tools), verdict UI (Dave's screen: chat + badges + animated path + session pill + query inspector).
- Done when: typed address → verdict card with ratio + path + citations + the Cypher, end to end, no mocks.

## Day 3 — Oct 17: GOVERNANCE + DEPLOY (demo-proofing)
- Do: approval gate that REALLY intercepts (denied-before-click shown), theater test (judge-address → flip → flip-back), second-session delta rehearsal, live deployment (Vercel + warmed Cloud), README (setup + data model + all Cypher + removal-test section), AI-DISCLOSURE.md finished, demo script rehearsal x3.
- Done when: public URL returns verdicts on all 3 canned cases + theater test passes live; README complete.

## Day 4 — Oct 18: VIDEO + PACKAGE (submit early, WAT evening)
- Do: record 90-second demo-first video (director's script), write + submit Dev.to blog post (AirPods side prize), final README pass, name tracks (T1+T2), disclose AI-tool use, SUBMIT by ~3 PM WAT (deadline ~7:30 PM WAT — never cut it close).
- Done when: submission 100% + blog posted + confirmation screenshot in STATUS.md.

## Stretch (only if ahead)
Live EVM lookup, PageRank over vouch web, T3 case-board depth, second demo vertical.

## Daily ritual
Update STATUS.md nightly: done / blocked / tomorrow.
