import { VerdictTier, TaintPath } from './types';

export interface ScoringInput {
  targetExists: boolean;
  totalInflow: number;
  txCount: number;
  firstSeenTimestamp?: number;
  taintPaths: TaintPath[];
  attestationsCount: number;
  attestationWeightSum: number;
}

export interface ScoreOutput {
  tier: VerdictTier;
  exposureRatio: number;
  accountAgeDays: number;
  confidence: number;
  summaryReason: string;
}

export function computeVerdict(input: ScoringInput): ScoreOutput {
  if (!input.targetExists) {
    return {
      tier: 'UNKNOWN',
      exposureRatio: 0,
      accountAgeDays: 0,
      confidence: 0.95,
      summaryReason: 'Unseen address. No history in graph. Empty graph does NOT imply safety.'
    };
  }

  const now = Date.now();
  const firstSeen = input.firstSeenTimestamp || now;
  const accountAgeDays = Math.max(0, Math.floor((now - firstSeen) / (1000 * 60 * 60 * 24)));

  // Calculate weighted taint from paths
  // Taint decay factor: 0.6 per hop
  let totalWeightedTaint = 0;
  for (const p of input.taintPaths) {
    totalWeightedTaint += p.weightedTaint;
  }

  // Exposure ratio relative to total documented inflow
  const exposureRatio = input.totalInflow > 0 
    ? Math.min(1.0, totalWeightedTaint / input.totalInflow)
    : (input.taintPaths.length > 0 ? 0.75 : 0.0);

  let tier: VerdictTier;
  let summaryReason = '';

  if (exposureRatio >= 0.35 || input.taintPaths.some(p => p.hopCount === 1 && p.sourceType === 'mixer')) {
    tier = 'BLOCK';
    const primary = input.taintPaths[0];
    summaryReason = `High illicit taint: ${(exposureRatio * 100).toFixed(1)}% exposure via ${primary ? primary.hopCount + '-hop traversal from ' + primary.sourceType : 'illicit clusters'}.`;
  } else if (
    exposureRatio >= 0.10 || 
    (accountAgeDays < 30 && exposureRatio > 0.03) ||
    input.taintPaths.some(p => p.sourceType === 'mule')
  ) {
    tier = 'CAUTION';
    summaryReason = `Medium taint exposure: ${(exposureRatio * 100).toFixed(1)}% exposure detected with ${accountAgeDays < 30 ? 'thin account history (<30d)' : 'indirect intermediary links'}.`;
  } else if (input.totalInflow > 0 && input.taintPaths.length === 0) {
    tier = 'NO-KNOWN-RISK';
    summaryReason = `No taint path identified within 4 hops across known sanctioned, mixer, or mule labels ($${input.totalInflow.toLocaleString()} total clean inflow).`;
  } else {
    tier = 'UNKNOWN';
    summaryReason = 'Thin or unverified transaction graph with insufficient historical volume.';
  }

  // Confidence calculation
  let confidence = 0.85;
  if (input.txCount > 5) confidence += 0.05;
  if (accountAgeDays > 60) confidence += 0.05;
  if (input.attestationsCount > 0) confidence += 0.03;
  confidence = Math.min(0.99, confidence);

  return {
    tier,
    exposureRatio: Number(exposureRatio.toFixed(4)),
    accountAgeDays,
    confidence: Number(confidence.toFixed(2)),
    summaryReason
  };
}

export function generateExplanationText(
  tier: VerdictTier, 
  exposureRatio: number, 
  paths: TaintPath[], 
  accountAgeDays: number
): string {
  if (tier === 'BLOCK') {
    const p = paths[0];
    const pathDesc = p ? `${p.hopCount}-hop path from ${p.sourceType.toUpperCase()} (${p.dirtySource.slice(0, 8)}...)` : 'multi-hop illicit fan-out';
    return `Counterparty exhibits ${(exposureRatio * 100).toFixed(1)}% weighted taint exposure traced directly through a ${pathDesc}. Recommend immediate trade rejection and blacklisting.`;
  }
  if (tier === 'CAUTION') {
    return `Counterparty carries ${(exposureRatio * 100).toFixed(1)}% tainted volume across intermediary mule nodes. Account age is ${accountAgeDays} days. Recommend manual compliance review or requiring additional verified attestations before settling.`;
  }
  if (tier === 'NO-KNOWN-RISK') {
    return `No connection to known mixers, sanctioned entities, or money mules detected within 4 hops. Primary inflows derive from legitimate exchange hot wallets and verified merchant attestations.`;
  }
  return `Target address has zero historical records in the authoritative graph. Under Dave's screening protocol, an empty graph does not clear an address—treat as unverified unknown counterparty.`;
}
