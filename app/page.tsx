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
  Flame
} from 'lucide-react';
import { ScanResult, VerdictTier } from '@/lib/types';

const EXHIBITS = [
  {
    id: 'A',
    label: '🚨 Exhibit A: Dirty Mixer Fan-Out',
    address: '0xDEMO_DIRTY_TARGET_01',
    expected: 'BLOCK',
    desc: '2-hop Tornado Cash fan-out through mules & consolidator'
  },
  {
    id: 'B',
    label: '⚠️ Exhibit B: Ambiguous Bridge',
    address: '0xDEMO_CAUTION_TARGET_02',
    expected: 'CAUTION',
    desc: 'Thin history (<30d) + indirect pass-through mule link'
  },
  {
    id: 'C',
    label: '✅ Exhibit C: Clean Merchant',
    address: '0xDEMO_CLEAN_TARGET_03',
    expected: 'NO-KNOWN-RISK',
    desc: 'Aged merchant, pure CEX hot wallet liquidity + EAS attestation'
  },
  {
    id: 'D',
    label: '❓ Exhibit D: Unknown Address',
    address: '0xDEMO_UNKNOWN_TARGET_04',
    expected: 'UNKNOWN',
    desc: 'Unseen address. Empty graph does NOT imply safety'
  }
];

export default function Home() {
  const [address, setAddress] = useState<string>('0xDEMO_DIRTY_TARGET_01');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'cypher' | 'mcp' | 'attestations'>('graph');
  const [timerSeconds, setTimerSeconds] = useState<number>(118);
  const [simActive, setSimActive] = useState<boolean>(false);
  const [simLoading, setSimLoading] = useState<boolean>(false);
  const [seedLoading, setSeedLoading] = useState<boolean>(false);
  const [seedSuccess, setSeedSuccess] = useState<boolean>(false);
  
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

  // Format seconds to mm:ss
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

  // Initial load
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
        // Automatically switch to Exhibit C to show the flip!
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
          <div className="flex items-center gap-2 px-4 py-2 bg-red-950/80 border border-red-500/80 rounded-md text-red-400 font-bold tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <span>[ BLOCK ]</span>
          </div>
        );
      case 'CAUTION':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-950/80 border border-amber-500/80 rounded-md text-amber-400 font-bold tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>[ CAUTION ]</span>
          </div>
        );
      case 'NO-KNOWN-RISK':
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-500/80 rounded-md text-emerald-400 font-bold tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>[ NO-KNOWN-RISK ]</span>
          </div>
        );
      case 'UNKNOWN':
      default:
        return (
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-600 rounded-md text-slate-300 font-bold tracking-wider">
            <HelpCircle className="w-5 h-5 text-slate-400" />
            <span>[ UNKNOWN ]</span>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#090a0f] text-[#f3f4f6]">
      {/* Top Header */}
      <header className="border-b border-[#23283a] bg-[#0d0f17] px-6 py-3 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center font-bold text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]">
            CP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">CLEARPATH</h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/40">
                v2 "Dave's Screen"
              </span>
            </div>
            <p className="text-xs text-[#9ca3af] font-mono flex items-center gap-1.5">
              <span>Powered by FalkorDB GraphBLAS</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="text-emerald-400 text-[11px]">Cloud Live (eu-west-1)</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Deal Timer */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-xs">
            <Clock className="w-4 h-4 text-red-400 animate-spin-slow" />
            <span>DEAL EXPIRATION:</span>
            <span className="font-bold text-red-200">{formatTime(timerSeconds)}</span>
          </div>

          {/* Operator Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded bg-[#181b26] border border-[#2a2f42] text-xs font-mono text-gray-300">
            <Terminal className="w-3.5 h-3.5 text-purple-400" />
            <span>Operator: <strong className="text-purple-300">Dave (OTC Desk #4)</strong></span>
          </div>

          {/* Database Reset */}
          <button
            onClick={handleReseed}
            disabled={seedLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1f2434] hover:bg-[#282f45] border border-[#313750] text-xs font-mono text-gray-300 transition-colors disabled:opacity-50"
            title="Reset and reseed FalkorDB Cloud graphs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-purple-400 ${seedLoading ? 'animate-spin' : ''}`} />
            <span>{seedSuccess ? 'Reseeded!' : 'Reset Graph'}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        
        {/* Preset Exhibit Buttons */}
        <section className="bg-[#11131c] border border-[#23283a] rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Fast Demo Presets (Zero Typing)
            </span>
            <span className="text-xs text-gray-500 font-mono">Click to evaluate 3-second verdict</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {EXHIBITS.map(ex => (
              <button
                key={ex.id}
                onClick={() => {
                  setAddress(ex.address);
                  handleScan(ex.address);
                }}
                className={`text-left p-3 rounded border transition-all text-xs font-mono flex flex-col justify-between ${
                  address === ex.address
                    ? 'border-purple-500 bg-purple-950/20 text-white shadow-[0_0_10px_rgba(139,92,246,0.2)]'
                    : 'border-[#23283a] bg-[#161925] hover:bg-[#1c2030] text-gray-300'
                }`}
              >
                <div className="font-bold flex items-center justify-between mb-1">
                  <span>{ex.label}</span>
                </div>
                <div className="text-[11px] text-gray-400 truncate mb-1">{ex.address}</div>
                <div className="text-[10px] text-gray-500">{ex.desc}</div>
              </button>
            ))}
          </div>

          {/* Theater Test Banner */}
          <div className="mt-3 pt-3 border-t border-[#23283a] flex flex-wrap items-center justify-between gap-3 bg-[#141724]/60 p-3 rounded">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-bold text-gray-200">Interactive Theater Test (Judge Proof): </span>
                <span className="text-xs text-gray-400">
                  {simActive 
                    ? 'Simulated dirty transfer active from Mule A to Exhibit C. Verdict is flipped!' 
                    : 'Inject a simulated $8,500 dirty payment to clean Exhibit C and watch the verdict flip live.'}
                </span>
              </div>
            </div>

            <button
              onClick={handleTheaterToggle}
              disabled={simLoading}
              className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                simActive
                  ? 'bg-amber-600 hover:bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simLoading ? 'animate-spin' : ''}`} />
              {simActive ? 'Rollback Dirty Taint (Revert to Clean)' : 'Simulate Dirty Taint (Flip to Caution)'}
            </button>
          </div>
        </section>

        {/* Address Input & Screen Trigger */}
        <section className="bg-[#11131c] border border-[#23283a] rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-500" />
              </div>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter counterparty EVM address (e.g. 0xDEMO_DIRTY_TARGET_01)..."
                className="w-full pl-9 pr-4 py-2.5 bg-[#0a0c13] border border-[#262c3f] rounded text-sm font-mono text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>

            <button
              onClick={() => handleScan()}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded font-mono font-bold text-sm text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0"
            >
              <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Screening Graph (GraphBLAS)...' : 'Run 3s Screen'}</span>
            </button>
          </div>
        </section>

        {/* Results Screen */}
        {result && (
          <div className="flex flex-col gap-6">
            
            {/* The Main Verdict Card */}
            <section className="bg-[#11131c] border border-[#23283a] rounded-lg p-5 relative overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#23283a] pb-4">
                <div>
                  <div className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-1">
                    Screening Verdict · Target: {result.targetAddress}
                  </div>
                  <div className="flex items-center gap-3">
                    {getTierBadge(result.tier)}
                    <span className="text-sm font-mono text-gray-300">
                      Confidence: <strong className="text-white">{(result.confidence * 100).toFixed(0)}%</strong>
                    </span>
                  </div>
                </div>

                {/* Governance Action Gate */}
                <div className="flex items-center gap-2">
                  {escalateSuccess ? (
                    <div className="px-3 py-1.5 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Case Escalated & Blacklisted</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowEscalateModal(true)}
                      className="px-4 py-2 rounded bg-red-950/70 hover:bg-red-900 border border-red-500/60 text-red-300 text-xs font-mono font-bold flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Escalate & Blacklist (Approval Gate)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                <div className="bg-[#161925] border border-[#23283a] p-3 rounded">
                  <div className="text-[11px] font-mono text-gray-500 uppercase">Exposure Ratio</div>
                  <div className={`text-xl font-bold font-mono mt-0.5 ${
                    result.exposureRatio > 0.35 ? 'text-red-400' : result.exposureRatio > 0.1 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {(result.exposureRatio * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">4-hop decay (0.6x)</div>
                </div>

                <div className="bg-[#161925] border border-[#23283a] p-3 rounded">
                  <div className="text-[11px] font-mono text-gray-500 uppercase">Documented Inflow</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    ${result.totalInflow.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">{result.txCount} transaction(s)</div>
                </div>

                <div className="bg-[#161925] border border-[#23283a] p-3 rounded">
                  <div className="text-[11px] font-mono text-gray-500 uppercase">Account Age</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {result.accountAgeDays} Days
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">
                    {result.accountAgeDays < 30 ? 'Thin history flagged' : 'Aged counterparty'}
                  </div>
                </div>

                <div className="bg-[#161925] border border-[#23283a] p-3 rounded">
                  <div className="text-[11px] font-mono text-gray-500 uppercase">Attestation Status</div>
                  <div className="text-xl font-bold font-mono text-white mt-0.5">
                    {result.attestations.length} Active
                  </div>
                  <div className="text-[10px] text-gray-500 mt-0.5">EAS / EigenTrust</div>
                </div>
              </div>

              {/* Cross-Session Memory Delta (Track 2 Focus) */}
              {result.memoryDelta && (
                <div className="mb-4 p-3 rounded bg-purple-950/30 border border-purple-500/40 text-xs font-mono text-purple-200 flex items-start gap-2.5">
                  <GitBranch className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-purple-300">
                      Agent Memory (Track 2: FalkorDB Episodic Recall):
                    </div>
                    <div>
                      {result.memoryDelta.alertMessage}
                      {result.memoryDelta.priorVerdict && (
                        <span className="ml-1 text-gray-400">
                          (Prior scan logged as <strong className="text-gray-200">{result.memoryDelta.priorVerdict}</strong>).
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Explanation Slot */}
              <div className="bg-[#141724] border border-[#262c3f] p-4 rounded text-xs font-mono">
                <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
                  <Terminal className="w-4 h-4" />
                  <span>Agent Reasoner Explanation (Verifiable Trail):</span>
                </div>
                <p className="text-gray-300 leading-relaxed">
                  {result.explanation}
                </p>
                <div className="mt-2 text-[10px] text-gray-500 italic">
                  * "Don't trust the agent. Trace it." Verdict math is computed deterministically via FalkorDB GraphBLAS; the agent explains the path.
                </div>
              </div>
            </section>

            {/* Visualizer & Inspector Tabs */}
            <section className="bg-[#11131c] border border-[#23283a] rounded-lg overflow-hidden">
              <div className="flex items-center border-b border-[#23283a] bg-[#0e1018] px-4">
                <button
                  onClick={() => setActiveTab('graph')}
                  className={`px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'graph'
                      ? 'border-purple-500 text-purple-400 bg-purple-950/10'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Visual Money Trail ({result.paths.length} Hops)</span>
                </button>

                <button
                  onClick={() => setActiveTab('cypher')}
                  className={`px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'cypher'
                      ? 'border-purple-500 text-purple-400 bg-purple-950/10'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  <span>Raw Cypher Queries ({result.cypherQueries.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('mcp')}
                  className={`px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'mcp'
                      ? 'border-purple-500 text-purple-400 bg-purple-950/10'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>MCP Tools Cited ({result.mcpToolsCited.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('attestations')}
                  className={`px-4 py-3 text-xs font-mono font-bold flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === 'attestations'
                      ? 'border-purple-500 text-purple-400 bg-purple-950/10'
                      : 'border-transparent text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Attestations ({result.attestations.length})</span>
                </button>
              </div>

              <div className="p-4 sm:p-5">
                {/* Visual Money Trail Canvas */}
                {activeTab === 'graph' && (
                  <div>
                    {result.paths.length === 0 ? (
                      <div className="text-center py-10 font-mono text-xs text-gray-500">
                        {result.tier === 'UNKNOWN' ? (
                          <span>Address has no transactions recorded in graph.</span>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <ShieldCheck className="w-8 h-8 text-emerald-500/60" />
                            <span className="text-emerald-400 font-bold">Zero taint paths identified within 4 hops.</span>
                            <span className="text-gray-500 text-[11px]">Primary funds originate directly from verified exchange hot wallets.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="text-xs font-mono text-gray-400 mb-2">
                          Interactive Traversal Graph (Decay factor 0.6x per hop):
                        </div>

                        {result.paths.map((p, idx) => (
                          <div key={idx} className="bg-[#141724] border border-[#23283a] p-4 rounded">
                            <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-3">
                              <span className="text-red-400 font-bold">
                                Traversal #{idx + 1}: {p.hopCount}-Hop Money Trail from {p.sourceType.toUpperCase()}
                              </span>
                              <span className="text-purple-300">
                                Weighted Contribution: ${p.weightedTaint.toFixed(2)}
                              </span>
                            </div>

                            {/* Node Chain Display */}
                            <div className="flex flex-wrap items-center gap-2 font-mono text-xs overflow-x-auto py-2">
                              {/* Source */}
                              <div className="px-3 py-1.5 rounded bg-red-950 border border-red-500 text-red-300 font-bold">
                                {p.sourceType.toUpperCase()}: {p.dirtySource.slice(0, 10)}...
                              </div>

                              {p.pathSteps.map((step, sIdx) => (
                                <React.Fragment key={sIdx}>
                                  <div className="flex flex-col items-center px-1 text-[10px] text-gray-400">
                                    <span className="text-purple-400 font-bold">${step.amount.toLocaleString()}</span>
                                    <ChevronRight className="w-4 h-4 text-purple-500" />
                                  </div>
                                  <div className={`px-3 py-1.5 rounded border text-xs ${
                                    sIdx === p.pathSteps.length - 1
                                      ? 'bg-purple-950/80 border-purple-500 text-purple-200 font-bold'
                                      : 'bg-[#1e2335] border-[#2e3652] text-gray-300'
                                  }`}>
                                    {sIdx === p.pathSteps.length - 1 ? 'TARGET: ' : 'HOP: '}
                                    {step.to.slice(0, 10)}...
                                  </div>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Cypher Queries Tab */}
                {activeTab === 'cypher' && (
                  <div className="flex flex-col gap-4 font-mono text-xs">
                    <p className="text-gray-400 text-[11px]">
                      Under FalkorDB Rule 10, all published Cypher queries running on the primary database are disclosed below with live execution metrics:
                    </p>
                    {result.cypherQueries.map((log, idx) => (
                      <div key={idx} className="bg-[#0b0c12] border border-[#23283a] rounded p-3">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 pb-2 mb-2 border-b border-[#1c2030]">
                          <span className="text-purple-400 font-bold">Query #{idx + 1}</span>
                          <div className="flex items-center gap-3">
                            <span>Returned: <strong className="text-gray-300">{log.rowsCount} row(s)</strong></span>
                            <span>Latency: <strong className="text-emerald-400">{log.executionTimeMs}ms</strong></span>
                          </div>
                        </div>
                        <pre className="text-gray-300 overflow-x-auto text-[11px] leading-relaxed">
                          {log.query}
                        </pre>
                        {log.params && Object.keys(log.params).length > 0 && (
                          <div className="mt-2 text-[10px] text-gray-500">
                            Params: {JSON.stringify(log.params)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* MCP Tools Tab */}
                {activeTab === 'mcp' && (
                  <div className="flex flex-col gap-3 font-mono text-xs">
                    <p className="text-gray-400 text-[11px]">
                      Model Context Protocol (MCP) tool executions invoked during Dave's 2-stage triage loop:
                    </p>
                    {result.mcpToolsCited.map((tool, idx) => (
                      <div key={idx} className="bg-[#141724] border border-[#23283a] p-3 rounded flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300">
                            Stage {tool.stage}: {tool.name}()
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-500/30">
                            MCP Verified
                          </span>
                        </div>
                        <p className="text-gray-300 text-[11px] mt-1">{tool.resultSummary}</p>
                        <div className="text-[10px] text-gray-500">
                          Payload: {JSON.stringify(tool.input)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Attestations Tab */}
                {activeTab === 'attestations' && (
                  <div className="flex flex-col gap-3 font-mono text-xs">
                    {result.attestations.length === 0 ? (
                      <div className="text-gray-500 py-6 text-center">
                        No EAS or EigenTrust attestations issued to this address.
                      </div>
                    ) : (
                      result.attestations.map((att, idx) => (
                        <div key={idx} className="bg-[#141724] border border-[#23283a] p-3 rounded">
                          <div className="flex items-center justify-between font-bold text-emerald-400">
                            <span>{att.context}</span>
                            <span>Weight: {(att.weight * 100).toFixed(0)}%</span>
                          </div>
                          <div className="text-gray-400 text-[11px] mt-1">
                            Issuer: {att.issuer}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* Governance Confirmation Modal */}
      {showEscalateModal && result && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11131c] border border-red-500/50 rounded-lg max-w-lg w-full p-6 shadow-[0_0_30px_rgba(239,68,68,0.3)] font-mono text-xs">
            <div className="flex items-center gap-2.5 text-red-400 text-sm font-bold border-b border-[#23283a] pb-3 mb-4">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <span>CONFIRM ACCUSATORY ACTION (GOVERNANCE GATE)</span>
            </div>

            <p className="text-gray-300 mb-4 leading-relaxed">
              You are about to sign off on an accusatory governance action as <strong className="text-white">Dave (OTC Desk #4)</strong>. 
              This will write a permanent <code className="text-red-300">:FLAGGED_AS_SUSPICIOUS</code> relationship to the shared compliance graph (<code className="text-purple-300">clearpath_shared_cases</code>).
            </p>

            <div className="bg-[#0b0c12] p-3 rounded border border-[#23283a] mb-5 flex flex-col gap-1.5 text-gray-300">
              <div>Target: <strong className="text-white">{result.targetAddress}</strong></div>
              <div>Exposure Ratio: <strong className="text-red-400">{(result.exposureRatio * 100).toFixed(1)}%</strong></div>
              <div>Action: <strong className="text-amber-300">Halt Trade & Blacklist Counterparty</strong></div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="px-4 py-2 rounded bg-[#181b26] hover:bg-[#202534] border border-[#2c3248] text-gray-300 transition-colors"
              >
                Cancel / Decline
              </button>
              <button
                onClick={handleEscalateConfirm}
                disabled={escalating}
                className="px-5 py-2 rounded bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(239,68,68,0.4)] disabled:opacity-50"
              >
                {escalating ? 'Writing to FalkorDB...' : 'Confirm Sign-Off'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
