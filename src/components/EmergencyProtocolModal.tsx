import React, { useState } from 'react';
import { PHCNode } from '../types/health';
import {
  X,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  Printer,
  FileText,
} from 'lucide-react';

interface EmergencyProtocolModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: PHCNode[];
}

export const EmergencyProtocolModal: React.FC<EmergencyProtocolModalProps> = ({
  isOpen,
  onClose,
  nodes,
}) => {
  const [emergencyType, setEmergencyType] = useState('Monsoon Vector Surge & Flash Flood Isolation');
  const [isGenerating, setIsGenerating] = useState(false);
  const [protocol, setProtocol] = useState<any>({
    authorizationCode: 'EMERG-EXEC-2026-BRICS-09',
    issuedAt: new Date().toISOString(),
    classificationLevel: 'CRITICAL_LOGISTICS_TIER_1',
    executiveSummary:
      'National Disaster Health Logistics Directive activated. Monsoon flooding has cut off road corridors to PHC Narsapur and PHC Belur, placing 4,800 units of life-saving snake venom and maternal oxytocin at catastrophic zero-stock risk.',
    priorityDirectives: [
      'Immediate bypass of routine procurement delays: Authorize autonomous Medical Drone UAV corridors across Tungabhadra river basin.',
      'Fast-track buffer reallocation: Release 35% reserve holding from District Central Medical Store without awaiting monthly indented requisition.',
      'Mandatory 24/7 cold-chain telemetry escalation: Any excursion outside 2.0°C - 8.0°C will trigger automated regional engineer dispatch.',
      'Biometric duty rotation enforcement: 12-hour shifts activated for all sanctioned medical officers and emergency triage nurses.',
    ],
    signOffAuthority: 'National Disaster Health Logistics Directorate & BRICS Health Working Group',
  });

  if (!isOpen) return null;

  const handleGenerateAIProtocol = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/gemini/emergency-protocol', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emergencyType,
          affectedPHCs: nodes
            .filter((n) => n.stocks.some((s) => s.status === 'CRITICAL_DEPLETION'))
            .map((n) => n.name),
          stockLevels: {
            criticalCount: nodes.filter((n) =>
              n.stocks.some((s) => s.status === 'CRITICAL_DEPLETION')
            ).length,
            severeColdChainBreaches: nodes.filter((n) => n.coldChain.status !== 'OPTIMAL').length,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProtocol(data);
      }
    } catch (err) {
      console.error('Failed to generate protocol:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl bg-slate-900 border border-rose-800/80 shadow-2xl p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-rose-950 border border-rose-700 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                National Health Logistics Emergency Directive
              </h2>
              <span className="font-mono text-xs text-rose-400">
                CRITICAL DISASTER MOBILIZATION
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Configuration Controls */}
        <div className="my-4 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-3 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">
              Trigger Emergency Classification
            </label>
            <select
              value={emergencyType}
              onChange={(e) => setEmergencyType(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none"
            >
              <option value="Monsoon Vector Surge & Flash Flood Isolation">
                Monsoon Vector Surge &amp; Flash Flood Isolation (Riverine Bypass)
              </option>
              <option value="Waterborne Cholera Outbreak Cluster">
                Waterborne Cholera Outbreak Cluster (Rapid Rehydration Mobilization)
              </option>
              <option value="Cold-Chain Regional Power Grid Collapse">
                Cold-Chain Regional Power Grid Collapse (Vaccine Rescue Dispatch)
              </option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGenerateAIProtocol}
              disabled={isGenerating}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-rose-700 hover:bg-rose-600 disabled:bg-slate-800 text-white font-semibold rounded text-xs transition-colors"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>{isGenerating ? 'Drafting Legal Directive...' : 'Generate Legal Mobilization Order'}</span>
            </button>
          </div>
        </div>

        {/* Protocol Document Card */}
        {protocol && (
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-4 font-sans">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-mono text-[11px] text-teal-400">
                AUTH CODE: {protocol.authorizationCode}
              </span>
              <span className="font-mono text-[11px] text-rose-400 font-bold">
                {protocol.classificationLevel}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Executive Rationale &amp; Scope:
              </span>
              <p className="text-slate-200 mt-1 leading-relaxed">
                {protocol.executiveSummary}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Binding Operational Directives:
              </span>
              <ul className="mt-1.5 space-y-1.5 list-disc list-inside text-slate-300">
                {protocol.priorityDirectives.map((d: string, i: number) => (
                  <li key={i} className="leading-relaxed">
                    {d}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Authority: {protocol.signOffAuthority}</span>
              <span className="text-emerald-400">VERIFIED VALID</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 text-xs">
          <span className="text-slate-400">
            Emergency orders automatically bypass bureaucratic district procurement caps.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => {
                window.print();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
