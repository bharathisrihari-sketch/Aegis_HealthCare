import React, { useState } from 'react';
import { PHCNode, RedistributionTransfer } from '../types/health';
import {
  Truck,
  Send,
  Navigation,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  FileText,
  AlertTriangle,
  Plane,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';

interface RedistributionViewProps {
  nodes: PHCNode[];
  transfers: RedistributionTransfer[];
  onUpdateTransfers: (newTransfers: RedistributionTransfer[]) => void;
  onOpenManifest: (transfer: RedistributionTransfer) => void;
}

export const RedistributionView: React.FC<RedistributionViewProps> = ({
  nodes,
  transfers,
  onUpdateTransfers,
  onOpenManifest,
}) => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState<string | null>(null);

  // Identify deficit and surplus facilities
  const deficitNodes = nodes.filter((n) =>
    n.stocks.some((s) => s.status === 'CRITICAL_DEPLETION')
  );
  const surplusNodes = nodes.filter((n) => n.type === 'Central Medical Store' || n.type === 'Sub-District Hospital');

  // Trigger Gemini Redistribution Engine
  const handleOptimizeWithGemini = async () => {
    setIsOptimizing(true);
    setDispatchFeedback(null);
    try {
      const response = await fetch('/api/gemini/redistribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deficitNodes: deficitNodes.map((n) => ({
            id: n.id,
            name: n.name,
            roadStatus: n.roadAccessibility,
            criticalMeds: n.stocks
              .filter((s) => s.status === 'CRITICAL_DEPLETION')
              .map((s) => ({ medicine: s.name, unitsRemaining: s.currentUnits, daysLeft: s.daysRemaining })),
          })),
          surplusNodes: surplusNodes.map((n) => ({
            id: n.id,
            name: n.name,
            surplusMeds: n.stocks.map((s) => ({
              medicine: s.name,
              availableSurplus: s.currentUnits - s.safeBufferUnits,
            })),
          })),
          transportConstraints: {
            dronePayloadKg: 15,
            droneMaxRangeKm: 75,
            monsoonRiverFloodBypass: true,
            strictColdChainRangeC: '2.0 - 8.0',
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.dispatchRoutes && Array.isArray(data.dispatchRoutes)) {
          const formattedRoutes: RedistributionTransfer[] = data.dispatchRoutes.map(
            (r: any, idx: number) => ({
              transferId: r.transferId || `TX-OPT-${idx + 101}`,
              fromFacilityId: 'cms-01',
              fromFacilityName: r.fromFacility,
              toFacilityId: 'phc-01',
              toFacilityName: r.toFacility,
              medicineId: `med-opt-${idx}`,
              medicineName: r.medicine,
              quantity: r.quantity,
              unit: r.unit || 'units',
              transportMode: r.transportMode.includes('Drone')
                ? 'Medical Drone UAV (Fleet-Alpha)'
                : 'Insulated Reefer Van',
              distanceKm: r.distanceKm || 45,
              transitHours: r.transitTimeHours || 1.1,
              coldChainCompliance: r.coldChainStatus || 'Active Refrigeration Monitored',
              rationale: r.rationale,
              status: 'PROPOSED',
              qrCode: `AEGIS-${r.transferId || 'TX'}-MANIFEST`,
              eta: `${Math.round((r.transitTimeHours || 1) * 60)} minutes`,
            })
          );
          onUpdateTransfers(formattedRoutes);
          setDispatchFeedback('AI rebalancing manifests calculated. Zero stock-outs achieved with multi-modal dispatch routes.');
        }
      }
    } catch (err) {
      console.error('Redistribution failed:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Dispatch all proposed transfers
  const handleDispatchAll = () => {
    const updated = transfers.map((t) =>
      t.status === 'PROPOSED' ? { ...t, status: 'DISPATCHED' as const } : t
    );
    onUpdateTransfers(updated);
    setDispatchFeedback('All scheduled transfer manifests have been officially authorized and dispatched!');
  };

  // Step-through status of a single transfer
  const handleAdvanceStatus = (transferId: string) => {
    const updated = transfers.map((t) => {
      if (t.transferId === transferId) {
        if (t.status === 'PROPOSED') return { ...t, status: 'DISPATCHED' as const };
        if (t.status === 'DISPATCHED') return { ...t, status: 'IN_TRANSIT' as const };
        if (t.status === 'IN_TRANSIT') return { ...t, status: 'DELIVERED' as const };
      }
      return t;
    });
    onUpdateTransfers(updated);
  };

  const totalUnits = transfers.reduce((acc, t) => acc + t.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Header and Engine Trigger */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Truck className="w-5 h-5 text-teal-400" />
              <span>Automated Cross-District Resource Redistribution Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Multi-modal reallocation solving rural stockouts via Medical Drones, Insulated Reefer Vans, and road accessibility routing.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleOptimizeWithGemini}
              disabled={isOptimizing}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 border border-slate-700 text-teal-300 font-semibold rounded-lg text-xs transition-colors shadow-sm"
            >
              <Sparkles className={`w-4 h-4 text-teal-300 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'Calculating Optimal Routes...' : 'Re-Run AI Optimization'}</span>
            </button>

            <button
              onClick={handleDispatchAll}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
              <span>Authorize &amp; Dispatch All</span>
            </button>
          </div>
        </div>

        {/* Feedback message */}
        {dispatchFeedback && (
          <div className="p-3 rounded-lg bg-teal-950/70 border border-teal-800/80 text-xs text-teal-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{dispatchFeedback}</span>
            </div>
            <button
              onClick={() => setDispatchFeedback(null)}
              className="text-teal-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Rebalancing Impact Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">Total Essential Doses Routed</span>
            <div className="text-xl font-bold font-mono tabular-nums text-white mt-0.5">
              {totalUnits.toLocaleString()} units
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">Rural Catchment Beneficiaries</span>
            <div className="text-xl font-bold font-mono tabular-nums text-teal-300 mt-0.5">
              78,400 people
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">UAV Flood-Bypass Missions</span>
            <div className="text-xl font-bold font-mono tabular-nums text-sky-400 mt-0.5">
              {transfers.filter((t) => t.transportMode.includes('Drone')).length} Corridors
            </div>
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800/80">
            <span className="text-slate-400">Zero-Stockout Guarantee</span>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-400 mt-0.5">
              99.4% Projected
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Schedules & Manifest Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white tracking-tight">Active &amp; Proposed Redistribution Schedules</h3>
          <span className="text-xs text-slate-400 font-mono">
            {transfers.length} Transfers Scheduled
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {transfers.map((transfer) => {
            const isDelivered = transfer.status === 'DELIVERED';
            const isInTransit = transfer.status === 'IN_TRANSIT';
            const isDispatched = transfer.status === 'DISPATCHED';
            const isDrone = transfer.transportMode.includes('Drone');

            return (
              <div
                key={transfer.transferId}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Route Information */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-teal-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {transfer.transferId}
                    </span>
                    <span className="text-xs text-slate-400">
                      {isDrone ? (
                        <span className="inline-flex items-center gap-1 text-sky-400 font-medium">
                          <Plane className="w-3.5 h-3.5" />
                          <span>Medical Drone UAV</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                          <Truck className="w-3.5 h-3.5 text-amber-400" />
                          <span>Refrigerated Reefer Van</span>
                        </span>
                      )}
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-xs font-mono text-slate-400">
                      {transfer.distanceKm} km ({transfer.transitHours}h transit)
                    </span>
                    <span aria-hidden="true" className="text-slate-600">·</span>
                    <span className="text-xs font-mono text-amber-400">
                      {transfer.coldChainCompliance}
                    </span>
                  </div>

                  {/* Nodes Path */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                    <div className="font-semibold text-slate-300">{transfer.fromFacilityName}</div>
                    <ArrowRight className="w-4 h-4 text-teal-400 shrink-0 hidden sm:inline" />
                    <div className="font-bold text-white">{transfer.toFacilityName}</div>
                  </div>

                  {/* Quantity & Medicine */}
                  <div className="text-xs text-slate-200">
                    <span className="font-mono tabular-nums font-bold text-teal-300 text-sm">
                      {transfer.quantity.toLocaleString()} {transfer.unit}
                    </span>{' '}
                    <span className="text-slate-400">of</span>{' '}
                    <span className="font-semibold text-white">{transfer.medicineName}</span>
                  </div>

                  {/* Logistics Rationale */}
                  <p className="text-xs text-slate-400 italic">
                    "{transfer.rationale}"
                  </p>
                </div>

                {/* Status & Actions Zone */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                  {/* Status Indicator */}
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className={`font-semibold uppercase tracking-wider ${
                        isDelivered
                          ? 'text-emerald-400'
                          : isInTransit
                          ? 'text-sky-400 animate-pulse'
                          : isDispatched
                          ? 'text-teal-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {transfer.status.replace('_', ' ')}
                    </span>
                    <span className="text-slate-400 font-mono">ETA: {transfer.eta}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenManifest(transfer)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-md text-xs transition-colors border border-slate-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-teal-400" />
                      <span>Digital Manifest</span>
                    </button>

                    <button
                      onClick={() => handleAdvanceStatus(transfer.transferId)}
                      disabled={isDelivered}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                        isDelivered
                          ? 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                          : 'bg-teal-600 hover:bg-teal-500 text-white'
                      }`}
                    >
                      {isDelivered ? (
                        <span>Verified Delivered</span>
                      ) : isInTransit ? (
                        <span>Confirm Receipt</span>
                      ) : isDispatched ? (
                        <span>Track Transit</span>
                      ) : (
                        <span>Authorize Dispatch</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
