'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  Terminal, 
  Database, 
  Zap, 
  ChevronRight, 
  Activity, 
  Lock, 
  FileText, 
  Share2, 
  RefreshCw,
  GitBranch,
  Search,
  CheckCircle2,
  ExternalLink,
  Layers,
  ArrowRight,
  Info,
  Server
} from 'lucide-react';
import { ScanResult, VerdictTier, TaintPath } from '@/lib/types';

const EXHIBITS = [
  {
    id: 'A',
    badge: 'EXHIBIT A',
    title: 'Mixer Fan-Out',
    address: '0xDEMO_DIRTY_TARGET_01',
    expected: 'BLOCK',
    desc: 'Tornado Cash -> 2 Mules -> Consolidator -> Target (2-hop decay)'
  },
  {
    id: 'B',
    badge: 'EXHIBIT B',
    title: 'Ambiguous Bridge',
    address: '0xDEMO_CAUTION_TARGET_02',
    expected: 'CAUTION',
    desc: 'Thin account history (<30d) + indirect pass-through mule link'
  },
  {
    id: 'C',
    badge: 'EXHIBIT C',
    title: 'Clean Merchant',
    address: '0xDEMO_CLEAN_TARGET_03',
    expected: 'NO-KNOWN-RISK',
    desc: '180d aged account, pure CEX hot wallet liquidity + EAS Tier-1 attestation'
  },
  {
    id: 'D',
    badge: 'EXHIBIT D',
    title: 'Unknown Address',
    address: '0xDEMO_UNKNOWN_TARGET_04',
    expected: 'UNKNOWN',
    desc: 'Unseen address. Empty graph does NOT imply safety'
  }
];

export default function ClearPathTerminal() {
  const [address, setAddress] = useState<string>('0xDEMO_DIRTY_TARGET_01');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeTab, setActiveTab] = useState<'network' | 'trace' | 'cypher' | 'attestations'>('network');
  const [timerSeconds, setTimerSeconds] = useState<number>(118);
  const [simActive, setSimActive] = useState<boolean>(false);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [seedLoading, setSeedLoading] = useState<boolean>(false);
  const [seedSuccess, setSeedSuccess] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  
  // Governance modal state
  const [showEscalateModal, setShowEscalateModal] = useState<boolean>(false);
  const [escalating, setEscalating] = useState<boolean>(false);
  const [escalateSuccess, setEscalateSuccess] = useState<boolean>(false);

  // Ticking countdown timer for Dave's OTC deal pressure
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds(prev => (prev > 0 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Run screen
  const handleScan = async (targetAddr?: string) => {
    const addr = targetAddr || address;
    if (!addr.trim()) return;
    setLoading(true);
    setEscalateSuccess(false);
    setSelectedNode(null);
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: addr.trim(), sessionId: 'session_dave_desk_04' })
      });
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        alert(data.error || 'Scan failed.');
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleScan('0xDEMO_DIRTY_TARGET_01');
    checkSimStatus();
  }, []);

  const checkSimStatus = async () => {
    try {
      const res = await fetch('/api/theater', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'status' })
      });
      const data = await res.json();
      if (data.success) {
        setSimActive(data.isSimActive);
      }
    } catch (_) {}
  };

  // Theater test toggle
  const handleTheaterToggle = async () => {
    setSimLoading(true);
    try {
      const nextAction = simActive ? 'rollback' : 'simulate';
      const res = await fetch('/api/theater', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: nextAction, targetAddress: '0xDEMO_CLEAN_TARGET_03' })
      });
      const data = await res.json();
      if (data.success) {
        setSimActive(nextAction === 'simulate');
        setAddress('0xDEMO_CLEAN_TARGET_03');
        await handleScan('0xDEMO_CLEAN_TARGET_03');
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSimLoading(false);
    }
  };

  // Reseed DB
  const handleReseed = async () => {
    setSeedLoading(true);
    setSeedSuccess(false);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 3000);
        handleScan(address);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSeedLoading(false);
    }
  };

  // Governance escalation signoff
  const handleEscalateConfirm = async () => {
    if (!result) return;
    setEscalating(true);
    try {
      const res = await fetch('/api/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetAddress: result.targetAddress,
          exposureRatio: result.exposureRatio,
          reason: `Flagged via ClearPath Terminal (${result.tier}): ${result.explanation}`,
          operator: 'Dave_OTC'
        })
      });
      if (res.ok) {
        setEscalateSuccess(true);
        setShowEscalateModal(false);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEscalating(false);
    }
  };

  const getTierBadge = (tier: VerdictTier) => {
    switch (tier) {
      case 'BLOCK':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-950/80 border border-red-500/80 text-red-400 font-mono text-xs font-semibold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>BLOCK // HIGH_TAINT</span>
          </div>
        );
      case 'CAUTION':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-950/80 border border-amber-500/80 text-amber-400 font-mono text-xs font-semibold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>CAUTION // REVIEW_REQUIRED</span>
          </div>
        );
      case 'NO-KNOWN-RISK':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-950/80 border border-emerald-500/80 text-emerald-400 font-mono text-xs font-semibold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>NO-KNOWN-RISK // NEGATIVE_PROOF</span>
          </div>
        );
      case 'UNKNOWN':
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 font-mono text-xs font-semibold tracking-wider">
            <span className="w-2 h-2 rounded-full bg-zinc-500"></span>
            <span>UNKNOWN // UNSEEN_ADDRESS</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-[#e2e8f0] font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Top Professional Navigation Bar */}
      <header className="border-b border-[#1b1e2a] bg-[#0c0e15] px-5 py-2.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#151924] border border-cyan-500/40 rounded flex items-center justify-center font-mono font-bold text-xs text-cyan-400">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2 font-mono text-xs font-bold text-white tracking-wider">
                <span>CLEARPATH</span>
                <span className="text-[10px] text-zinc-500 font-normal">v2.4-forensic</span>
              </div>
              <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1.5">
                <span>Primary Context: FalkorDB GraphBLAS</span>
                <span className="text-zinc-700">|</span>
                <span className="text-emerald-400">AWS eu-west-1 (Active)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Urgency Deal Timer */}
          <div className="flex items-center gap-2 px-2.5 py-1 bg-red-950/30 border border-red-500/30 text-red-300 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-red-400" />
            <span className="text-[10px] uppercase text-zinc-400">DEAL EXPIRY:</span>
            <span className="font-bold tabular-nums text-red-200">{formatTime(timerSeconds)}</span>
          </div>

          {/* Operator Identifier */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#141722] border border-[#232838] font-mono text-xs text-zinc-400">
            <span className="text-zinc-500">OPERATOR:</span>
            <span className="text-zinc-200 font-medium">Dave (OTC #04)</span>
          </div>

          {/* Database Reset Action */}
          <button
            onClick={handleReseed}
            disabled={seedLoading}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-[#141722] hover:bg-[#1a1f2e] border border-[#232838] font-mono text-xs text-zinc-300 transition-colors disabled:opacity-50"
            title="Wipe and re-seed all 3 FalkorDB graphs"
          >
            <RefreshCw className={`w-3 h-3 text-cyan-400 ${seedLoading ? 'animate-spin' : ''}`} />
            <span>{seedSuccess ? 'Seeded' : 'Reset Graph'}</span>
          </button>
        </div>
      </header>

      {/* Main Terminal Grid */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-5 flex flex-col gap-4">
        
        {/* Quick Target Selectors & Theater Mode */}
        <section className="bg-[#0e1017] border border-[#1b1e2a] p-3 rounded">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2.5">
            <div className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Counterparty Profiles (Zero-Typing Verification)</span>
            </div>
            
            {/* Interactive Theater Test Controller */}
            <div className="flex items-center gap-2">
              <div className="text-[11px] font-mono text-zinc-400 hidden sm:block">
                Theater Verification:
              </div>
              <button
                onClick={handleTheaterToggle}
                disabled={simLoading}
                className={`px-2.5 py-1 text-xs font-mono font-medium border flex items-center gap-1.5 transition-all ${
                  simActive
                    ? 'bg-amber-950/80 border-amber-500 text-amber-200 shadow-sm'
                    : 'bg-[#151924] hover:bg-[#1c2232] border-[#293044] text-zinc-300'
                }`}
              >
                <RefreshCw className={`w-3 h-3 ${simLoading ? 'animate-spin' : 'text-amber-400'}`} />
                <span>{simActive ? 'Active: Taint Injected (Click to Rollback)' : 'Inject Mule Transfer (Flip to Caution)'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {EXHIBITS.map(ex => {
              const isSelected = address === ex.address;
              return (
                <button
                  key={ex.id}
                  onClick={() => {
                    setAddress(ex.address);
                    handleScan(ex.address);
                  }}
                  className={`text-left p-2.5 border transition-all flex flex-col justify-between font-mono ${
                    isSelected
                      ? 'bg-[#151926] border-cyan-500/70 text-white'
                      : 'bg-[#10121a] hover:bg-[#141722] border-[#1b1e2a] text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span className={isSelected ? 'text-cyan-300' : 'text-zinc-300'}>{ex.title}</span>
                    <span className="text-[10px] px-1 py-0.5 bg-[#090a0f] border border-[#202534] text-zinc-500">
                      {ex.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 truncate mb-1">{ex.address}</div>
                  <div className="text-[10px] text-zinc-600 line-clamp-1">{ex.desc}</div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Live Address Input Bar */}
        <section className="bg-[#0e1017] border border-[#1b1e2a] p-3 rounded">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-zinc-600" />
              </div>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter EVM address (e.g. 0xDEMO_DIRTY_TARGET_01)..."
                className="w-full pl-9 pr-3 py-2 bg-[#08090e] border border-[#202534] text-xs font-mono text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-cyan-500/60"
              />
            </div>

            <button
              onClick={() => handleScan()}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              <Zap className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Traversing Graph...' : 'Evaluate Counterparty (3s)'}</span>
            </button>
          </div>
        </section>

        {/* Screening Output Dashboard */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Column: Verdict, Metrics, and Agent Reasoner (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Primary Verdict Card */}
              <div className="bg-[#0e1017] border border-[#1b1e2a] p-4 rounded flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#1b1e2a] pb-3">
                  <div>
                    <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">
                      Deterministic Verdict
                    </div>
                    {getTierBadge(result.tier)}
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-[10px] text-zinc-500 uppercase">Confidence</div>
                    <div className="text-sm font-bold text-white">{(result.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>

                {/* Metric Strip */}
                <div className="grid grid-cols-3 gap-2 py-1 font-mono text-xs">
                  <div className="bg-[#12141e] border border-[#1e2230] p-2.5 rounded">
                    <div className="text-[10px] text-zinc-500 uppercase">Exposure</div>
                    <div className={`text-base font-bold mt-0.5 ${
                      result.exposureRatio >= 0.35 ? 'text-red-400' : result.exposureRatio > 0.05 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {(result.exposureRatio * 100).toFixed(1)}%
                    </div>
                    <div className="text-[9px] text-zinc-600">0.6^hop decay</div>
                  </div>

                  <div className="bg-[#12141e] border border-[#1e2230] p-2.5 rounded">
                    <div className="text-[10px] text-zinc-500 uppercase">Total Inflow</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      ${result.totalInflow > 1000 ? `${(result.totalInflow / 1000).toFixed(1)}k` : result.totalInflow}
                    </div>
                    <div className="text-[9px] text-zinc-600">{result.txCount} tx(s)</div>
                  </div>

                  <div className="bg-[#12141e] border border-[#1e2230] p-2.5 rounded">
                    <div className="text-[10px] text-zinc-500 uppercase">Account Age</div>
                    <div className="text-base font-bold text-white mt-0.5">
                      {result.accountAgeDays}d
                    </div>
                    <div className="text-[9px] text-zinc-600">
                      {result.accountAgeDays < 30 ? 'Thin history' : 'Established'}
                    </div>
                  </div>
                </div>

                {/* Track 2: Cross-Session Episodic Memory Alert */}
                {result.memoryDelta && (
                  <div className="p-2.5 bg-[#141824] border-l-2 border-cyan-400 text-xs font-mono text-zinc-300">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] mb-0.5">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>Track 2 Memory: Episodic Temporal Delta</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {result.memoryDelta.alertMessage}
                      {result.memoryDelta.priorVerdict && (
                        <span className="text-zinc-500"> (Prior screening recorded as {result.memoryDelta.priorVerdict}).</span>
                      )}
                    </p>
                  </div>
                )}

                {/* Agent Forensic Explanation Slot */}
                <div className="bg-[#12141e] border border-[#1e2230] p-3 rounded text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-400 font-semibold mb-1.5 text-[11px]">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Gemini 2.5 Flash Agent Analysis:</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed text-[11px]">
                    {result.explanation}
                  </p>
                </div>

                {/* Governance Escalation Action */}
                <div className="pt-2 border-t border-[#1b1e2a]">
                  {escalateSuccess ? (
                    <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Case Escalated & Flagged in Shared Graph</span>
                      </div>
                      <span className="text-[10px] text-emerald-400/80">clearpath_shared_cases</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="w-full py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-mono font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Escalate to Compliance (Human-in-the-Loop Signoff)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Visual Network & Detailed Inspection Tabs (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="bg-[#0e1017] border border-[#1b1e2a] rounded flex flex-col h-full overflow-hidden">
                
                {/* Tab Navigation */}
                <div className="flex items-center border-b border-[#1b1e2a] bg-[#0c0e15] px-3 font-mono text-xs">
                  <button
                    onClick={() => setActiveTab('network')}
                    className={`px-3 py-2.5 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'network'
                        ? 'border-cyan-400 text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Topological Network ({result.paths.length} Hops)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('trace')}
                    className={`px-3 py-2.5 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'trace'
                        ? 'border-cyan-400 text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Agent Trace & MCP</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('cypher')}
                    className={`px-3 py-2.5 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'cypher'
                        ? 'border-cyan-400 text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Disclosed Cypher ({result.cypherQueries.length})</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('attestations')}
                    className={`px-3 py-2.5 border-b-2 font-medium flex items-center gap-1.5 transition-colors ${
                      activeTab === 'attestations'
                        ? 'border-cyan-400 text-white'
                        : 'border-transparent text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Attestations ({result.attestations.length})</span>
                  </button>
                </div>

                <div className="p-4 flex-1">
                  
                  {/* TAB 1: Real Visual Topological Network Canvas */}
                  {activeTab === 'network' && (
                    <div className="flex flex-col gap-3 h-full">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <span>FalkorDB Adjacency Subgraph: Directional Inflow Paths</span>
                        <span>Click nodes to inspect metadata</span>
                      </div>

                      {result.paths.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center font-mono text-xs text-zinc-500">
                          {result.tier === 'UNKNOWN' ? (
                            <div className="flex flex-col items-center gap-2">
                              <HelpCircle className="w-8 h-8 text-zinc-600" />
                              <span className="text-zinc-400">Zero entries for this address in the database.</span>
                              <span className="text-[11px] text-zinc-600">Under Dave's rule: Unseen addresses map to UNKNOWN, never clear.</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <ShieldCheck className="w-8 h-8 text-emerald-500/80" />
                              <span className="text-emerald-400 font-bold">Negative Proof Verified</span>
                              <span className="text-[11px] text-zinc-400 max-w-md">
                                Multi-hop traversal returned 0 paths to known mixers or money mules within 4 hops.
                                All inflows originate from whitelisted exchange settlement wallets.
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {result.paths.map((path, idx) => (
                            <div key={idx} className="bg-[#12141e] border border-[#1e2230] p-3 rounded">
                              <div className="flex items-center justify-between text-xs font-mono mb-2">
                                <span className="text-red-400 font-bold flex items-center gap-1.5">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                  <span>Path #{idx + 1}: {path.hopCount}-Hop Traversal from {path.sourceType.toUpperCase()}</span>
                                </span>
                                <span className="text-zinc-400 text-[11px]">
                                  Taint Weight: ${path.weightedTaint.toFixed(2)}
                                </span>
                              </div>

                              {/* Node Path Steps Flow */}
                              <div className="flex flex-wrap items-center gap-2 font-mono text-xs overflow-x-auto py-1">
                                <div 
                                  onClick={() => setSelectedNode({ address: path.dirtySource, role: path.sourceType, type: 'Illicit Root' })}
                                  className="px-2.5 py-1 bg-red-950/60 border border-red-500/50 text-red-300 text-[11px] font-bold cursor-pointer hover:border-red-400"
                                >
                                  {path.sourceType.toUpperCase()}: {path.dirtySource.slice(0, 10)}...
                                </div>

                                {path.pathSteps.map((step, sIdx) => (
                                  <React.Fragment key={sIdx}>
                                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                                      <span className="text-cyan-400 font-medium">${step.amount.toLocaleString()}</span>
                                      <ArrowRight className="w-3 h-3 text-zinc-600" />
                                    </div>
                                    <div 
                                      onClick={() => setSelectedNode({ address: step.to, role: sIdx === path.pathSteps.length - 1 ? 'Target' : 'Intermediary', type: 'Wallet' })}
                                      className={`px-2.5 py-1 text-[11px] cursor-pointer border ${
                                        sIdx === path.pathSteps.length - 1
                                          ? 'bg-zinc-800 border-zinc-500 text-white font-bold'
                                          : 'bg-[#181b26] border-[#252a3b] text-zinc-300 hover:border-zinc-500'
                                      }`}
                                    >
                                      {sIdx === path.pathSteps.length - 1 ? 'TARGET: ' : 'MULE: '}
                                      {step.to.slice(0, 10)}...
                                    </div>
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Node Inspector Drawer */}
                      {selectedNode && (
                        <div className="mt-3 p-3 bg-[#151926] border border-cyan-500/40 rounded text-xs font-mono text-zinc-300 flex items-center justify-between">
                          <div>
                            <span className="text-cyan-400 font-bold">Inspecting Node: </span>
                            <span className="text-white">{selectedNode.address}</span>
                            <span className="text-zinc-500 ml-2">({selectedNode.role})</span>
                          </div>
                          <button 
                            onClick={() => setSelectedNode(null)}
                            className="text-zinc-500 hover:text-white text-[11px]"
                          >
                            Close
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Agent Investigation Trace & MCP Logs */}
                  {activeTab === 'trace' && (
                    <div className="flex flex-col gap-4 font-mono text-xs">
                      {/* Gemini Steps */}
                      <div>
                        <div className="text-[11px] uppercase text-zinc-400 font-bold mb-2">
                          Gemini 2.5 Flash Autonomous Investigation Steps:
                        </div>
                        <div className="flex flex-col gap-2">
                          {result.investigationTrace?.map((step, idx) => (
                            <div key={idx} className="bg-[#12141e] border border-[#1e2230] p-3 rounded">
                              <div className="flex items-center justify-between font-bold text-cyan-300 mb-1">
                                <span>Step {step.step}: {step.title}</span>
                                <span className="text-[10px] text-zinc-500">Tool: {step.tool}()</span>
                              </div>
                              <p className="text-zinc-400 text-[11px] mb-1.5">{step.thought}</p>
                              <div className="text-[11px] text-emerald-400/90 bg-[#0a0c12] p-2 rounded border border-[#181c28]">
                                Observation: {step.observation}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* MCP Citations */}
                      <div className="pt-2 border-t border-[#1b1e2a]">
                        <div className="text-[11px] uppercase text-zinc-400 font-bold mb-2">
                          Model Context Protocol (MCP) Executions:
                        </div>
                        <div className="flex flex-col gap-2">
                          {result.mcpToolsCited.map((tool, idx) => (
                            <div key={idx} className="bg-[#12141e] border border-[#1e2230] p-2.5 rounded flex items-center justify-between">
                              <div>
                                <span className="text-zinc-200 font-bold">{tool.name}()</span>
                                <p className="text-[11px] text-zinc-400 mt-0.5">{tool.resultSummary}</p>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 bg-[#0c0e15] border border-[#1b1e2a] text-zinc-400">
                                Stage {tool.stage}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Published Cypher Queries */}
                  {activeTab === 'cypher' && (
                    <div className="flex flex-col gap-3 font-mono text-xs">
                      <div className="text-[11px] text-zinc-400 leading-relaxed mb-1">
                        In accordance with Hackathon Rule 10, all Cypher queries executed directly against FalkorDB Cloud during this screening are disclosed below:
                      </div>

                      {result.cypherQueries.map((log, idx) => (
                        <div key={idx} className="bg-[#090a0f] border border-[#1e2230] p-3 rounded">
                          <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2 border-b border-[#181c28] pb-1.5">
                            <span className="text-cyan-400 font-bold">Query #{idx + 1}</span>
                            <div className="flex items-center gap-3">
                              <span>Rows: <strong className="text-zinc-200">{log.rowsCount}</strong></span>
                              <span>Execution: <strong className="text-emerald-400">{log.executionTimeMs}ms</strong></span>
                            </div>
                          </div>
                          <pre className="text-zinc-300 overflow-x-auto text-[11px] leading-relaxed">
                            {log.query}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TAB 4: Attestations */}
                  {activeTab === 'attestations' && (
                    <div className="flex flex-col gap-3 font-mono text-xs">
                      {result.attestations.length === 0 ? (
                        <div className="py-10 text-center text-zinc-500">
                          No EAS or EigenTrust attestations recorded for this address.
                        </div>
                      ) : (
                        result.attestations.map((att, idx) => (
                          <div key={idx} className="bg-[#12141e] border border-[#1e2230] p-3 rounded">
                            <div className="flex items-center justify-between font-bold text-emerald-400 mb-1">
                              <span>{att.context}</span>
                              <span>Confidence Weight: {(att.weight * 100).toFixed(0)}%</span>
                            </div>
                            <div className="text-[11px] text-zinc-400">
                              Issuer Address: {att.issuer}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* Governance Confirmation Modal */}
      {showEscalateModal && result && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1118] border border-red-500/60 rounded max-w-md w-full p-5 font-mono text-xs shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm border-b border-[#1f2434] pb-3 mb-3">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <span>Confirm Governance Signoff</span>
            </div>

            <p className="text-zinc-300 mb-3 leading-relaxed">
              Operator Dave: signing off will write an accusatory edge (<code className="text-red-300">:FLAGGED_AS_SUSPICIOUS</code>) to the shared FalkorDB intelligence graph (<code className="text-cyan-300">clearpath_shared_cases</code>).
            </p>

            <div className="bg-[#090a0f] p-3 border border-[#1f2434] mb-4 flex flex-col gap-1 text-zinc-300">
              <div>Target: <strong className="text-white">{result.targetAddress}</strong></div>
              <div>Exposure Ratio: <strong className="text-red-400">{(result.exposureRatio * 100).toFixed(1)}%</strong></div>
              <div>Action: <strong className="text-amber-300">Halt Trade & Escalate Counterparty</strong></div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="px-3 py-1.5 bg-[#171a26] hover:bg-[#202434] border border-[#2b3144] text-zinc-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEscalateConfirm}
                disabled={escalating}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50"
              >
                {escalating ? 'Writing to Graph...' : 'Confirm Signoff'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
