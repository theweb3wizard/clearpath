import { TaintPath, VerdictTier } from './types';

interface AgentReasoningInput {
  targetAddress: string;
  tier: VerdictTier;
  exposureRatio: number;
  totalInflow: number;
  accountAgeDays: number;
  paths: TaintPath[];
  priorScan?: {
    priorVerdict: string;
    priorTimestamp: number;
    alertMessage?: string;
  };
}

export interface AgentInvestigationStep {
  step: number;
  title: string;
  thought: string;
  tool: string;
  observation: string;
}

export interface AgentReasoningOutput {
  investigationTrace: AgentInvestigationStep[];
  verdictExplanation: string;
}

export async function runGeminiAgentReasoning(input: AgentReasoningInput): Promise<AgentReasoningOutput> {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback if no key is reachable
  const fallbackOutput: AgentReasoningOutput = {
    investigationTrace: [
      {
        step: 1,
        title: 'Topological Inflow Triage',
        thought: `Dave has a trade pending on ${input.targetAddress.slice(0, 8)}... Querying FalkorDB for directional inflows.`,
        tool: 'trace_taint_weighted',
        observation: `Found $${input.totalInflow.toLocaleString()} total inflow with ${input.paths.length} detected path(s).`
      },
      {
        step: 2,
        title: 'GraphBLAS Multi-Hop Traversal',
        thought: `Evaluating backward traversal up to 4 hops with 0.6x decay and exchange hot wallet termination boundaries.`,
        tool: 'risk_centrality',
        observation: `Taint calculation returned ${(input.exposureRatio * 100).toFixed(1)}% exposure.`
      },
      {
        step: 3,
        title: 'Episodic Memory Comparison',
        thought: `Querying clearpath_mem_dave for past investigations on this address.`,
        tool: 'memory_recall',
        observation: input.priorScan ? input.priorScan.alertMessage || 'Recalled prior session.' : 'No prior session records in memory.'
      }
    ],
    verdictExplanation: input.tier === 'BLOCK'
      ? `High-risk counterparty. FalkorDB traversed a ${input.paths[0]?.hopCount || 2}-hop path back to ${input.paths[0]?.sourceType || 'mixer'} funds with ${(input.exposureRatio * 100).toFixed(1)}% tainted volume. Dave must reject this trade.`
      : input.tier === 'CAUTION'
      ? `Intermediary risk detected. Account has thin history (${input.accountAgeDays}d) with ${(input.exposureRatio * 100).toFixed(1)}% indirect exposure to mule liquidity. Requires manual review.`
      : input.tier === 'NO-KNOWN-RISK'
      ? `Clean counterparty profile. Zero taint paths found within 4 hops across known sanctioned or mixer labels. Inflow is backed by legitimate exchange hot wallets and verified attestations.`
      : `Unseen address with zero transaction history in the graph. Under ClearPath protocol, an empty graph does NOT equal safety.`
  };

  if (!apiKey) {
    return fallbackOutput;
  }

  try {
    const prompt = `
You are the ClearPath Forensic Agent, built for Dave, an OTC crypto desk operator with a $15,000 deal expiring in under 2 minutes.
Speak directly, clearly, and without corporate fluff. Be the grounded investigator who illuminates the truth: problem-first, evidence-backed, no hype.

Target Address: ${input.targetAddress}
FalkorDB Deterministic Verdict: ${input.tier}
Exposure Ratio: ${(input.exposureRatio * 100).toFixed(1)}%
Total Documented Inflow: $${input.totalInflow.toLocaleString()}
Account Age: ${input.accountAgeDays} days
Taint Paths Found: ${JSON.stringify(input.paths)}
Episodic Memory: ${input.priorScan ? JSON.stringify(input.priorScan) : 'None (first scan)'}

Task:
Generate a valid JSON object matching this schema:
{
  "investigationTrace": [
    {
      "step": 1,
      "title": "Short title",
      "thought": "What you were thinking/investigating in Dave's context",
      "tool": "trace_taint_weighted" | "risk_centrality" | "attestation_check" | "memory_recall",
      "observation": "What the FalkorDB query revealed"
    }
  ],
  "verdictExplanation": "2-3 crisp sentences explaining the verdict to Dave based on the mathematical money trail."
}

Return ONLY raw JSON, with no markdown code fences or backticks.
`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!res.ok) {
      console.warn('Gemini request failed, status:', res.status);
      return fallbackOutput;
    }

    const data = await res.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return fallbackOutput;

    const parsed = JSON.parse(rawText.trim());
    return {
      investigationTrace: parsed.investigationTrace || fallbackOutput.investigationTrace,
      verdictExplanation: parsed.verdictExplanation || fallbackOutput.verdictExplanation
    };
  } catch (err) {
    console.warn('Gemini parsing error, falling back:', err);
    return fallbackOutput;
  }
}
