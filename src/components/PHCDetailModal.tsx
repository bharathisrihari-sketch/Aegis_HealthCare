import React from 'react';
import { PHCNode } from '../types/health';
import { HistoricalPerformanceChart } from './HistoricalPerformanceChart';
import {
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bed,
  Users,
  Thermometer,
  Truck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface PHCDetailModalProps {
  node: PHCNode | null;
  onClose: () => void;
  onRequestRebalance: (node: PHCNode) => void;
}

export const PHCDetailModal: React.FC<PHCDetailModalProps> = ({
  node,
  onClose,
  onRequestRebalance,
}) => {
  if (!node) return null;

  const hasCritical = node.stocks.some((s) => s.status === 'CRITICAL_DEPLETION');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-700/80 shadow-2xl p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{node.name}</h2>
              <span className="font-mono text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                {node.code}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
              <span>{node.type}</span>
              <span aria-hidden="true">·</span>
              <span>{node.district}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{node.populationCovered.toLocaleString()} Catchment Pop</span>
              <span aria-hidden="true">·</span>
              <span className={node.roadAccessibility === 'MONSOON_FLOOD_RESTRICTED' ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>
                {node.roadAccessibility === 'MONSOON_FLOOD_RESTRICTED' ? 'Flooded / Isolated' : 'Road Open'}
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

        {/* Critical Alert Warning Banner if needed */}
        {hasCritical && (
          <div className="mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 flex items-center justify-between text-xs text-rose-200">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Impending Stock-Out Alert:</strong> Essential antivenom / maternal oxytocin stocks will be completely exhausted within &lt; 48 hours at current patient consumption velocity.
              </span>
            </div>
            <button
              onClick={() => onRequestRebalance(node)}
              className="ml-3 shrink-0 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded transition-colors text-xs"
            >
              Dispatch Rebalance
            </button>
          </div>
        )}

        {/* 3-Column Diagnostic Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
          {/* Bed Occupancy */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Bed Availability</span>
              <Bed className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-white">
              {node.beds.occupied} / {node.beds.total}{' '}
              <span className="text-xs font-normal text-slate-400">
                ({node.beds.available} free)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 space-y-0.5">
              <div className="flex justify-between">
                <span>Maternity:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {node.beds.maternity.occupied}/{node.beds.maternity.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Emergency/ICU:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {node.beds.emergencyIcu.occupied}/{node.beds.emergencyIcu.total}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Isolation:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {node.beds.isolation.occupied}/{node.beds.isolation.total}
                </span>
              </div>
            </div>
          </div>

          {/* Personnel Attendance */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Staff Attendance</span>
              <Users className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-emerald-400">
              {node.personnel.attendanceRate}%
              <span className="text-xs font-normal text-slate-400 ml-1">Biometric verified</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 space-y-0.5">
              <div className="flex justify-between">
                <span>Medical Officers:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {node.personnel.doctors.onDuty}/{node.personnel.doctors.sanctioned} on duty
                </span>
              </div>
              <div className="flex justify-between">
                <span>Staff Nurses:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {node.personnel.nurses.onDuty}/{node.personnel.nurses.sanctioned} on duty
                </span>
              </div>
              <div className="flex justify-between">
                <span>Field ASHAs:</span>
                <span className="font-mono tabular-nums text-slate-200">
                  {node.personnel.communityHealthWorkers.activeField} active in sector
                </span>
              </div>
            </div>
          </div>

          {/* Cold Chain & Footfall */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xs font-medium">Cold Chain Sensor</span>
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-white">
              {node.coldChain.currentTempC}°C
              <span className="text-xs font-normal text-emerald-400 ml-1.5 font-sans">
                {node.coldChain.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 space-y-0.5">
              <div className="flex justify-between">
                <span>Target Range:</span>
                <span className="font-mono tabular-nums text-slate-200">{node.coldChain.targetRange}</span>
              </div>
              <div className="flex justify-between">
                <span>Battery Reserve:</span>
                <span className="font-mono tabular-nums text-slate-200">{node.coldChain.batteryReserveHours}h backup</span>
              </div>
              <div className="flex justify-between">
                <span>Current Queue:</span>
                <span className="font-mono tabular-nums text-amber-300 font-semibold">{node.footfall.currentQueue} patients</span>
              </div>
            </div>
          </div>
        </div>

        {/* 30-Day Historical Performance Recharts Component */}
        <HistoricalPerformanceChart node={node} />

        {/* Real-time Medicine Stocks Table */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-slate-100">Live Medicine &amp; Vaccine Stock Telemetry</h3>
            <span className="text-xs text-slate-400 font-mono">Real-time e-Aushadhi Sync</span>
          </div>

          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3 font-medium">Medicine / Item</th>
                  <th className="py-2 px-3 font-medium">Category</th>
                  <th className="py-2 px-3 font-medium text-right">Current Stock</th>
                  <th className="py-2 px-3 font-medium text-right">Daily Burn</th>
                  <th className="py-2 px-3 font-medium text-right">Days Left</th>
                  <th className="py-2 px-3 font-medium">Risk Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {node.stocks.map((stock) => (
                  <tr key={stock.id} className="hover:bg-slate-800/30">
                    <td className="py-2 px-3">
                      <div className="font-semibold text-slate-100">{stock.name}</div>
                      {stock.coldChainRequired && (
                        <div className="text-[10px] text-amber-400 font-mono">Cold-Chain (2-8°C Required)</div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-slate-400">{stock.category}</td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums font-semibold text-slate-100">
                      {stock.currentUnits.toLocaleString()} {stock.unit}
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-300">
                      {stock.dailyConsumption} / day
                    </td>
                    <td className="py-2 px-3 text-right font-mono tabular-nums font-bold">
                      <span
                        className={
                          stock.status === 'CRITICAL_DEPLETION'
                            ? 'text-rose-400'
                            : stock.status === 'WARNING'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {stock.daysRemaining.toFixed(1)} days
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {stock.status === 'CRITICAL_DEPLETION' ? (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-rose-400" />
                          <span>Critical Stockout</span>
                        </span>
                      ) : stock.status === 'WARNING' ? (
                        <span className="text-amber-400 font-medium">Buffer Depletion</span>
                      ) : (
                        <span className="text-emerald-400">Adequate</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800 text-xs">
          <div className="text-slate-400">
            Last inventory cycle verified via biometric barcode scan
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onRequestRebalance(node)}
              className="px-4 py-1.5 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Automate Cross-District Rebalance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
