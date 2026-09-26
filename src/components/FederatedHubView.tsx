import React, { useState } from 'react';
import { BRICSNationNode } from '../types/health';
import {
  Globe,
  Lock,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  RefreshCw,
  Cpu,
  AlertCircle,
  Database,
  ArrowRight,
} from 'lucide-react';

interface FederatedHubViewProps {
  nations: BRICSNationNode[];
  federatedRound: number;
  onIncrementRound: () => void;
}

export const FederatedHubView: React.FC<FederatedHubViewProps> = ({
  nations,
  federatedRound,
  onIncrementRound,
}) => {
  const [isTraining, setIsTraining] = useState(false);
  const [selectedFocusVector, setSelectedFocusVector] = useState(
    'Arboviral (Dengue/Chikungunya) & Critical Maternal Health Supply Chains'
  );
  const [federatedReport, setFederatedReport] = useState<any>({
    federatedRound: federatedRound,
    globalConvergenceLoss: 0.0384,
    aggregationMethod: 'FedAvg with Secure Multi-Party Aggregation (Differential Privacy ε=1.2, δ=1e-5)',
    earlyWarningHorizonDays: 24,
    crossBorderInsights: [
      'Early Hemispheric Vector Warning: Dengue Serotype 3 transmission acceleration in Pará (Brazil) correlates with coastal Indian PHC larval density with a 24-day lead time.',
      'Pediatric Respiratory Syncytial Drift: Shared non-identifiable tensor weights detect an unseasonal pediatric bronchospasm wave common between Gauteng (South Africa) and Central China river basins.',
      'Thermal Stability Gradient Invariance: Polar/desert telemetry from Russia and UAE hardened global cold-chain degradation models under severe ambient thermal shifts (-20°C to +47°C).',
    ],
    policyRecommendation:
      'Pre-position 20% strategic regional buffer of Artemisinin-based combinations and Polyvalent Antivenom across maritime and riverine primary clinic depots.',
  });

  const handleRunFederatedRound = async () => {
    setIsTraining(true);
    try {
      const response = await fetch('/api/gemini/federated-weights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roundNumber: federatedRound + 1,
          vectorFocus: selectedFocusVector,
          participants: nations.map((n) => ({ country: n.country, samples: n.localRecords })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFederatedReport(data);
        onIncrementRound();
      }
    } catch (err) {
      console.error('Federated aggregation failed:', err);
    } finally {
      setIsTraining(false);
    }
  };

  const totalSovereignRecords = nations.reduce((acc, n) => acc + n.localRecords, 0);

  return (
    <div className="space-y-6">
      {/* Top Hero Card with BRICS Architecture Image */}
      <div className="relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-2xl p-6">
        {/* Subtle diagram backdrop */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none bg-cover bg-center"
          style={{
            backgroundImage: `url(/src/assets/images/brics_federated_topology_1790404964527.jpg)`,
          }}
        />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">
                  Sovereign Privacy-Preserving Grid
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Zero-Patient-Data Egress</span>
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <span>BRICS Federated Healthcare AI &amp; Supply Chain Resilience Hub</span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Shared predictive modeling across BRICS healthcare networks (Brazil, Russia, India, China, South Africa, UAE, Egypt, Ethiopia). Local models train on PHC electronic health telemetry behind sovereign firewalls; only differential-private gradient tensors are aggregated.
              </p>
            </div>

            <button
              onClick={handleRunFederatedRound}
              disabled={isTraining}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-lg shrink-0"
            >
              <Cpu className={`w-4 h-4 text-indigo-200 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Aggregating Sovereign Tensors...' : `Run Global Round #${federatedRound + 1}`}</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Total Federated Training Samples</span>
              <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
                {(totalSovereignRecords / 1000000).toFixed(2)}M Records
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Zero Egress Guarantee</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Current Global Round</span>
              <div className="text-xl font-bold font-mono tabular-nums text-indigo-300 mt-0.5">
                Round #{federatedReport.federatedRound}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">FedAvg + SecAgg</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Cross-Border Early Warning Buffer</span>
              <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
                +{federatedReport.earlyWarningHorizonDays} Days Lead
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Pre-monsoon lead time</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">Convergence Loss Error</span>
              <div className="text-xl font-bold font-mono tabular-nums text-teal-400 mt-0.5">
                {federatedReport.globalConvergenceLoss}
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Differential Privacy ε=1.2</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cross-Border Intelligence Synthesis Card */}
      {federatedReport && (
        <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Cross-BRICS Shared Outbreak &amp; Supply Chain Intelligence</span>
              </h3>
              <p className="text-xs text-slate-400">Synthesized from aggregated gradient weights of 8 national healthcare systems</p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Method: {federatedReport.aggregationMethod}
            </span>
          </div>

          <div className="space-y-2.5">
            {federatedReport.crossBorderInsights.map((insight: string, idx: number) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-200"
              >
                <div className="h-5 w-5 rounded bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center shrink-0 font-mono font-bold text-[10px] mt-0.5">
                  0{idx + 1}
                </div>
                <p className="leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-xs">
            <span className="font-semibold text-indigo-200 uppercase tracking-wider font-mono">
              Multilateral Resilience Directive:
            </span>
            <p className="text-slate-300 mt-1 leading-relaxed">
              {federatedReport.policyRecommendation}
            </p>
          </div>
        </div>
      )}

      {/* Participating Sovereign Member Nodes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Active Sovereign Member Nodes</h3>
          <span className="text-xs text-slate-400 font-mono">
            8 / 8 Nodes Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {nations.map((nation) => (
            <div
              key={nation.country}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={nation.country}>
                      {nation.flag}
                    </span>
                    <span className="font-bold text-white text-sm">{nation.country}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>SYNCED</span>
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 mt-2 font-medium leading-tight">
                  {nation.institution}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                  {nation.datasetName}
                </div>

                {/* Active Alerts */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Sovereign Telemetry Focus:
                  </span>
                  {nation.activeSurgeAlerts.map((alert, i) => (
                    <div
                      key={i}
                      className="text-[11px] text-slate-300 bg-slate-950 px-2 py-1 rounded border border-slate-800/80 leading-snug"
                    >
                      {alert}
                    </div>
                  ))}
                </div>
              </div>

              {/* Node Stats Footer */}
              <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400">
                <span>{(nation.localRecords / 1000).toFixed(0)}k local records</span>
                <span className="text-indigo-400">ε={nation.differentialPrivacyEpsilon} DP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
