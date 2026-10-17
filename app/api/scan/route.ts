import { NextRequest, NextResponse } from 'next/server';
import { getTrustGraph, getMemoryGraph } from '@/lib/falkordb';
import { CYPHER_QUERIES } from '@/lib/queries';
import { computeVerdict, generateExplanationText } from '@/lib/score';
import { CypherExecutionLog, MCPToolLog, ScanResult, TaintPath } from '@/lib/types';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { address, sessionId = 'session_dave_live' } = await req.json();

    if (!address || typeof address !== 'string') {
      return NextResponse.json({ error: 'Valid wallet address is required.' }, { status: 400 });
    }

    const targetAddress = address.trim();
    const trust = await getTrustGraph();
    const memory = await getMemoryGraph();

    const cypherLogs: CypherExecutionLog[] = [];
    const mcpLogs: MCPToolLog[] = [];

    // STAGE 1: Triage - Deterministic Multi-Hop Traversal
    const t0 = Date.now();
    const metricsRes = await trust.query(CYPHER_QUERIES.WALLET_INFLOW_METRICS, {
      params: { targetAddress }
    });
    cypherLogs.push({
      query: CYPHER_QUERIES.WALLET_INFLOW_METRICS.trim(),
      params: { targetAddress },
      executionTimeMs: Date.now() - t0,
      rowsCount: metricsRes.data ? metricsRes.data.length : 0
    });

    const targetRow = metricsRes.data && metricsRes.data[0];
    const targetExists = !!(targetRow && targetRow.address);
    const totalInflow = targetRow ? Number(targetRow.total_inflow || 0) : 0;
    const txCount = targetRow ? Number(targetRow.tx_count || 0) : 0;
    const firstSeenTimestamp = targetRow ? Number(targetRow.first_seen || 0) : undefined;

    // Run Multi-Hop Taint
    const t1 = Date.now();
    const taintRes = await trust.query(CYPHER_QUERIES.MULTI_HOP_TAINT, {
      params: { targetAddress }
    });
    cypherLogs.push({
      query: CYPHER_QUERIES.MULTI_HOP_TAINT.trim(),
      params: { targetAddress },
      executionTimeMs: Date.now() - t1,
      rowsCount: taintRes.data ? taintRes.data.length : 0
    });

    const taintPaths: TaintPath[] = (taintRes.data || []).map((row: any) => {
      const hopCount = Number(row.hop_count || 1);
      const steps = row.steps || [];
      const firstAmount = steps.length > 0 ? Number(steps[0].amount || 0) : 0;
      // Exponential decay: 0.6^(hopCount - 1)
      const decay = Math.pow(0.6, Math.max(0, hopCount - 1));
      const weightedTaint = firstAmount * decay;

      return {
        dirtySource: row.source_address,
        sourceType: row.source_type,
        hopCount,
        pathSteps: steps,
        weightedTaint
      };
    });

    mcpLogs.push({
      name: 'trace_taint_weighted',
      stage: 1,
      input: { targetAddress, maxHops: 4, decayFactor: 0.6 },
      resultSummary: `Traversed ${taintPaths.length} illicit path(s). Total weighted taint: $${taintPaths.reduce((a, b) => a + b.weightedTaint, 0).toFixed(2)}.`
    });

    // Check Attestations
    const t2 = Date.now();
    const attestationRes = await trust.query(CYPHER_QUERIES.WALLET_ATTESTATIONS, {
      params: { targetAddress }
    });
    cypherLogs.push({
      query: CYPHER_QUERIES.WALLET_ATTESTATIONS.trim(),
      params: { targetAddress },
      executionTimeMs: Date.now() - t2,
      rowsCount: attestationRes.data ? attestationRes.data.length : 0
    });

    const attestations = (attestationRes.data || []).map((row: any) => ({
      issuer: row.issuer,
      weight: Number(row.weight || 1.0),
      context: row.context || 'Verified Counterparty'
    }));

    if (attestations.length > 0) {
      mcpLogs.push({
        name: 'attestation_check',
        stage: 1,
        input: { targetAddress },
        resultSummary: `Found ${attestations.length} verifiable on-chain attestation(s).`
      });
    }

    // STAGE 2: Secondary Tool Selection & Memory Recall (Track 2)
    const t3 = Date.now();
    let memoryRecallEpisodes: any[] = [];
    try {
      const memRes = await memory.query(CYPHER_QUERIES.MEMORY_RECALL_EPISODES, {
        params: { targetAddress }
      });
      memoryRecallEpisodes = memRes.data || [];
      cypherLogs.push({
        query: CYPHER_QUERIES.MEMORY_RECALL_EPISODES.trim(),
        params: { targetAddress },
        executionTimeMs: Date.now() - t3,
        rowsCount: memoryRecallEpisodes.length
      });
    } catch (e) {
      console.warn('Memory query notice:', e);
    }

    let priorScanTimestamp: number | undefined;
    let priorVerdict: any;
    if (memoryRecallEpisodes.length > 0) {
      priorScanTimestamp = Number(memoryRecallEpisodes[0].prior_timestamp);
      priorVerdict = memoryRecallEpisodes[0].prior_verdict;
      mcpLogs.push({
        name: 'memory_recall',
        stage: 2,
        input: { targetAddress, limit: 3 },
        resultSummary: `Recalled episode ${memoryRecallEpisodes[0].episode_id}: Prior verdict was ${priorVerdict}.`
      });
    }

    // Temporal Delta Check if prior session exists
    let memoryDelta: any = undefined;
    if (priorScanTimestamp) {
      const t4 = Date.now();
      const deltaRes = await trust.query(CYPHER_QUERIES.TEMPORAL_DELTA, {
        params: { targetAddress, lastSessionTimestamp: priorScanTimestamp }
      });
      cypherLogs.push({
        query: CYPHER_QUERIES.TEMPORAL_DELTA.trim(),
        params: { targetAddress, lastSessionTimestamp: priorScanTimestamp },
        executionTimeMs: Date.now() - t4,
        rowsCount: deltaRes.data ? deltaRes.data.length : 0
      });

      const deltaRow = deltaRes.data && deltaRes.data[0];
      const newInflows = Number(deltaRow?.new_inflows || 0);
      const newVolume = Number(deltaRow?.new_volume || 0);

      memoryDelta = {
        priorScanTimestamp,
        priorVerdict,
        newInflowsSinceLastSession: newInflows,
        newVolumeSinceLastSession: newVolume,
        alertMessage: newInflows > 0 
          ? `Notice: ${newInflows} new transaction(s) ($${newVolume.toLocaleString()}) detected since last scan.`
          : 'Zero topological changes since your previous screening.'
      };
    }

    // Degree Centrality (Secondary Agentic Tool)
    const t5 = Date.now();
    const centralityRes = await trust.query(CYPHER_QUERIES.DEGREE_CENTRALITY, {
      params: { targetAddress }
    });
    cypherLogs.push({
      query: CYPHER_QUERIES.DEGREE_CENTRALITY.trim(),
      params: { targetAddress },
      executionTimeMs: Date.now() - t5,
      rowsCount: centralityRes.data ? centralityRes.data.length : 0
    });

    const centrality = centralityRes.data && centralityRes.data[0];
    mcpLogs.push({
      name: 'risk_centrality',
      stage: 2,
      input: { targetAddress },
      resultSummary: `In-degree fan-in: ${centrality?.fan_in || 0}, Out-degree fan-out: ${centrality?.fan_out || 0}.`
    });

    // Compute Deterministic Score
    const scoreOutput = computeVerdict({
      targetExists,
      totalInflow,
      txCount,
      firstSeenTimestamp,
      taintPaths,
      attestationsCount: attestations.length,
      attestationWeightSum: attestations.reduce((a: number, b: { weight: number }) => a + b.weight, 0)
    });

    // Human-Readable Explanation
    const explanation = generateExplanationText(
      scoreOutput.tier,
      scoreOutput.exposureRatio,
      taintPaths,
      scoreOutput.accountAgeDays
    );

    // Save this scan episode to Dave's Memory Graph
    try {
      const episodeId = `ep_${Date.now()}`;
      await memory.query(CYPHER_QUERIES.WRITE_EPISODE, {
        params: {
          episodeId,
          targetAddress,
          verdict: scoreOutput.tier,
          exposureRatio: scoreOutput.exposureRatio,
          sessionId,
          timestamp: Date.now(),
          notes: scoreOutput.summaryReason
        }
      });
      mcpLogs.push({
        name: 'case_writeback',
        stage: 2,
        input: { episodeId, targetAddress, verdict: scoreOutput.tier },
        resultSummary: `Persisted scan episode to clearpath_mem_dave successfully.`
      });
    } catch (e) {
      console.warn('Episode write notice:', e);
    }

    const responsePayload: ScanResult = {
      targetAddress,
      tier: scoreOutput.tier,
      exposureRatio: scoreOutput.exposureRatio,
      totalInflow,
      txCount,
      accountAgeDays: scoreOutput.accountAgeDays,
      confidence: scoreOutput.confidence,
      paths: taintPaths,
      explanation,
      cypherQueries: cypherLogs,
      mcpToolsCited: mcpLogs,
      memoryDelta,
      attestations
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: error.message || 'Screening pipeline failed.' }, { status: 500 });
  }
}
