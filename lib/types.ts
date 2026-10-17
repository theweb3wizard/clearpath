export type EntityType = 
  | 'mixer' 
  | 'sanctioned' 
  | 'mule' 
  | 'consolidator' 
  | 'exchange_hot_wallet' 
  | 'otc_desk' 
  | 'clean_user' 
  | 'merchant'
  | 'unknown';

export type VerdictTier = 'BLOCK' | 'CAUTION' | 'NO-KNOWN-RISK' | 'UNKNOWN';

export interface PathStep {
  from: string;
  to: string;
  amount: number;
  tx: string;
  token?: string;
}

export interface TaintPath {
  dirtySource: string;
  sourceType: string;
  hopCount: number;
  pathSteps: PathStep[];
  weightedTaint: number;
}

export interface CypherExecutionLog {
  query: string;
  params: Record<string, any>;
  executionTimeMs: number;
  rowsCount: number;
}

export interface MCPToolLog {
  name: string;
  stage: number;
  input: Record<string, any>;
  resultSummary: string;
}

export interface MemoryDelta {
  priorScanTimestamp?: number;
  priorVerdict?: VerdictTier;
  newInflowsSinceLastSession: number;
  newVolumeSinceLastSession: number;
  alertMessage?: string;
}

export interface ScanResult {
  targetAddress: string;
  tier: VerdictTier;
  exposureRatio: number;
  totalInflow: number;
  txCount: number;
  accountAgeDays: number;
  confidence: number;
  paths: TaintPath[];
  explanation: string;
  cypherQueries: CypherExecutionLog[];
  mcpToolsCited: MCPToolLog[];
  memoryDelta?: MemoryDelta;
  attestations: {
    issuer: string;
    weight: number;
    context: string;
  }[];
}
