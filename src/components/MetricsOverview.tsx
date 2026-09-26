import React from 'react';
import { PHCNode } from '../types/health';
import { ShieldCheck, AlertCircle, Thermometer, Users, BedDouble, Globe } from 'lucide-react';

interface MetricsOverviewProps {
  nodes: PHCNode[];
  federatedRound: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ nodes, federatedRound }) => {
  // Aggregate calculations
  const totalBeds = nodes.reduce((acc, n) => acc + n.beds.total, 0);
  const occupiedBeds = nodes.reduce((acc, n) => acc + n.beds.occupied, 0);
  const bedOccupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : '0';

  const totalDoctorsSanctioned = nodes.reduce((acc, n) => acc + n.personnel.doctors.sanctioned, 0);
  const doctorsOnDuty = nodes.reduce((acc, n) => acc + n.personnel.doctors.onDuty, 0);
  const doctorAttendanceRate = totalDoctorsSanctioned > 0
    ? ((doctorsOnDuty / totalDoctorsSanctioned) * 100).toFixed(1)
    : '0';

  const criticalStockoutCount = nodes.filter((n) =>
    n.stocks.some((s) => s.status === 'CRITICAL_DEPLETION')
  ).length;

  const coldChainOptimalCount = nodes.filter((n) => n.coldChain.status === 'OPTIMAL').length;
  const coldChainIntegrityPct = ((coldChainOptimalCount / nodes.length) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Network Nodes */}
      <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">PHC Network</span>
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
            {nodes.length}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            <span>3 districts</span>
            <span aria-hidden="true" className="mx-1">·</span>
            <span className="text-teal-400 font-medium">100% active</span>
          </div>
        </div>
      </div>

      {/* 2. Bed Occupancy */}
      <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Bed Occupancy</span>
          <BedDouble className="w-3.5 h-3.5 text-sky-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
            {bedOccupancyRate}%
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            <span className="font-mono tabular-nums">{occupiedBeds}/{totalBeds} occupied</span>
          </div>
        </div>
      </div>

      {/* 3. Medical Attendance */}
      <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Staff Attendance</span>
          <Users className="w-3.5 h-3.5 text-emerald-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
            {doctorAttendanceRate}%
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            <span className="font-mono tabular-nums">{doctorsOnDuty}/{totalDoctorsSanctioned} doctors</span>
            <span aria-hidden="true" className="mx-1">·</span>
            <span className="text-slate-300">Biometric</span>
          </div>
        </div>
      </div>

      {/* 4. Critical Stockouts */}
      <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Impending Stockout</span>
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-400 tracking-tight">
            {criticalStockoutCount}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            <span>&lt; 48h reserve</span>
            <span aria-hidden="true" className="mx-1">·</span>
            <span className="text-rose-400 font-medium">Triage action</span>
          </div>
        </div>
      </div>

      {/* 5. Cold Chain */}
      <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">Cold Chain (2-8°C)</span>
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-white tracking-tight">
            {coldChainIntegrityPct}%
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            <span className="font-mono tabular-nums">{coldChainOptimalCount}/{nodes.length} in range</span>
          </div>
        </div>
      </div>

      {/* 6. BRICS Federated Node */}
      <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium">BRICS Sync</span>
          <Globe className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <div>
          <div className="text-2xl font-bold font-mono tabular-nums text-indigo-300 tracking-tight">
            Round #{federatedRound}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            <span>8 nations</span>
            <span aria-hidden="true" className="mx-1">·</span>
            <span className="text-indigo-400 font-mono">ε=1.2 DP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
