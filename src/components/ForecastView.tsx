import React, { useState } from 'react';
import { PHCNode, ForecastResult } from '../types/health';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  ShieldCheck,
  Calendar,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  ThermometerSnowflake,
} from 'lucide-react';

interface ForecastViewProps {
  nodes: PHCNode[];
  onNavigateToRebalance: () => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  nodes,
  onNavigateToRebalance,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('Monsoon Vector Surge & Flood Inundation');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Koppal District & Ballari Basin');
  const [isForecasting, setIsForecasting] = useState(false);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>({
    summary: 'Heavy monsoon runoff and river flooding have elevated stagnant vector proliferation, triggering a 2.8x spike in acute febrile admissions across rural riverine PHCs. Critical antivenom and antimalarial consumption is accelerating past standard baseline refill cycles.',
    peakSurgeDay: 9,
    expectedFootfallMultiplier: 2.8,
    criticalStockoutsProjected: [
      {
        medicine: 'Anti-Snake Venom (Polyvalent Lyophilized)',
        daysUntilDepletion: 2.1,
        riskLevel: 'CRITICAL',
        deficitUnits: 420,
        reason: 'Agricultural flood displacement driving reptile-human contact near riverbanks.',
      },
      {
        medicine: 'Oxytocin Inj (10 IU/ml)',
        daysUntilDepletion: 2.3,
        riskLevel: 'CRITICAL',
        deficitUnits: 650,
        reason: 'Obstetric referral delays causing sub-centres to deliver high-risk cases locally.',
      },
      {
        medicine: 'Artemether-Lumefantrine (20/120mg)',
        daysUntilDepletion: 3.5,
        riskLevel: 'HIGH',
        deficitUnits: 3800,
        reason: 'Plasmodium vivax/falciparum post-rain transmission surge across lowland hamlets.',
      },
      {
        medicine: 'Normal Saline 0.9% (500ml IV)',
        daysUntilDepletion: 5.2,
        riskLevel: 'MEDIUM',
        deficitUnits: 2100,
        reason: 'Waterborne acute gastroenteritis and dehydration cases climbing.',
      },
    ],
    clinicalDirectives: [
      'Activate fast-track buffer redistribution from Central Medical Store before Day 3 road closures.',
      'Deploy medical drone corridors to PHC Narsapur and PHC Belur for zero-delay antivenom delivery.',
      'Establish oral rehydration therapy corners at all flood-relief community shelters.',
      'Enforce cold-chain datalogger battery checks across all sub-centre vaccine refrigerators.',
    ],
    confidenceInterval: '94.6% (Based on 840k BRICS historical surge records)',
    bricsStrainAlignment: 'Aligned with BRICS-FL Vector Signature #BR-IN-2026-D3 (78% covariance with Pará State riverine monsoon peak)',
  });

  const handleRunAiForecast = async () => {
    setIsForecasting(true);
    try {
      const response = await fetch('/api/gemini/forecast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: selectedDistrict,
          scenario: selectedScenario,
          phcData: {
            totalPHCs: nodes.length,
            criticalDepletedCount: nodes.filter((n) =>
              n.stocks.some((s) => s.status === 'CRITICAL_DEPLETION')
            ).length,
            averageOccupancy: '84%',
            doctorAttendance: '88%',
          },
          criticalMedicines: [
            'Anti-Snake Venom (Polyvalent)',
            'Oxytocin Inj',
            'Artemether-Lumefantrine',
            'Normal Saline 0.9%',
            'Amoxicillin + Clavulanic',
            'Insulin Regular',
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setForecastResult(data);
      }
    } catch (err) {
      console.error('Forecast failed:', err);
    } finally {
      setIsForecasting(false);
    }
  };

  // Mock 14-day projection data points for trajectory visualizer
  const days = Array.from({ length: 14 }, (_, i) => i + 1);
  const baselineConsumption = [45, 47, 48, 50, 52, 51, 49, 53, 54, 52, 50, 51, 49, 50];
  const surgeMultiplier = forecastResult?.expectedFootfallMultiplier || 2.8;
  const projectedSurge = baselineConsumption.map((v, i) => {
    const peakEffect = Math.sin((i / 13) * Math.PI) * (surgeMultiplier - 1) * 40;
    return Math.round(v * 1.2 + peakEffect);
  });
  const maxVal = Math.max(...projectedSurge, 150);

  return (
    <div className="space-y-6">
      {/* Configuration Header & Trigger */}
      <div className="p-5 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <span>AI Epidemiological Demand &amp; Stockout Forecasting Engine</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Gemini 3.8 Flash multi-variate modeling integrating clinical telemetry, weather vectors, and shared BRICS epidemiological strains.
            </p>
          </div>

          <button
            onClick={handleRunAiForecast}
            disabled={isForecasting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors shadow-md shrink-0"
          >
            <Sparkles className={`w-4 h-4 text-teal-200 ${isForecasting ? 'animate-spin' : ''}`} />
            <span>{isForecasting ? 'Computing Epidemiological Tensors...' : 'Run Gemini Surge Forecast'}</span>
          </button>
        </div>

        {/* Control Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-slate-800 text-xs">
          <div>
            <label className="block text-slate-400 font-medium mb-1">Outbreak Scenario / Vector Shock</label>
            <select
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="Monsoon Vector Surge & Flood Inundation">Monsoon Vector Surge &amp; Flood Inundation</option>
              <option value="Waterborne Cholera / Gastroenteritis Epidemic">Waterborne Cholera / Gastroenteritis Epidemic</option>
              <option value="Severe Pediatric Respiratory Wave (RSV/Flu)">Severe Pediatric Respiratory Wave (RSV/Flu)</option>
              <option value="Extreme Agricultural Heatwave & Dehydration Trauma">Extreme Agricultural Heatwave &amp; Dehydration</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">Target Healthcare District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-teal-500"
            >
              <option value="Koppal District & Ballari Basin">Koppal District &amp; Ballari Basin (High Vulnerability)</option>
              <option value="Vijayanagara Mining Belt">Vijayanagara Mining Belt (Industrial Trauma Focus)</option>
              <option value="Entire Tri-District Unified Network">Entire Tri-District Unified Network (Full Network)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-medium mb-1">BRICS Federated Strain Grounding</label>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-[11px] text-teal-400 flex items-center justify-between">
              <span>Model Synced: BRICS-FL #42</span>
              <span className="text-slate-400">ε=1.2 DP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Output Diagnostic Cards */}
      {forecastResult && (
        <div className="space-y-6">
          {/* Executive Surge Assessment */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider font-mono">
                  Executive Intelligence Forecast
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-xs text-slate-400 font-mono">
                  Confidence: {forecastResult.confidenceInterval}
                </span>
              </div>
              <div className="text-xs font-mono text-indigo-300">
                {forecastResult.bricsStrainAlignment}
              </div>
            </div>

            <p className="text-sm text-slate-200 mt-3 leading-relaxed">
              {forecastResult.summary}
            </p>

            {/* Quick KPI stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-800/80">
              <div>
                <span className="text-xs text-slate-400">Footfall Peak Multiplier</span>
                <div className="text-xl font-bold font-mono tabular-nums text-rose-400">
                  +{((forecastResult.expectedFootfallMultiplier - 1) * 100).toFixed(0)}%
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Anticipated Peak Surge Day</span>
                <div className="text-xl font-bold font-mono tabular-nums text-amber-400">
                  Day {forecastResult.peakSurgeDay}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Imminent Zero-Stock Medicines</span>
                <div className="text-xl font-bold font-mono tabular-nums text-rose-400">
                  {forecastResult.criticalStockoutsProjected.filter((m) => m.riskLevel === 'CRITICAL').length} items
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Recommended Action Window</span>
                <div className="text-xl font-bold font-mono tabular-nums text-teal-400">
                  &lt; 36 Hours
                </div>
              </div>
            </div>
          </div>

          {/* 14-Day Demand & Consumption Trajectory Chart */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">14-Day Demand Velocity &amp; Stock Depletion Trajectory</h3>
                <p className="text-xs text-slate-400">Simulated daily consumption velocity vs baseline replenishment</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-slate-500 rounded" />
                  <span className="text-slate-400">Historical Baseline</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-rose-500 rounded" />
                  <span className="text-rose-300 font-semibold">AI Projected Surge</span>
                </div>
              </div>
            </div>

            {/* Bar Chart Visualization */}
            <div className="h-44 flex items-end gap-2 pt-6 pb-2 px-2 bg-slate-950 rounded-lg border border-slate-800/80">
              {days.map((day, idx) => {
                const surgeHeight = (projectedSurge[idx] / maxVal) * 100;
                const baseHeight = (baselineConsumption[idx] / maxVal) * 100;
                const isPeak = day === forecastResult.peakSurgeDay;

                return (
                  <div key={day} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-800 text-slate-100 text-[10px] py-1 px-1.5 rounded shadow pointer-events-none whitespace-nowrap z-10 font-mono">
                      Day {day}: {projectedSurge[idx]} units/day {isPeak ? '(PEAK)' : ''}
                    </div>

                    {/* Peak badge indicator */}
                    {isPeak && (
                      <div className="text-[10px] text-rose-400 font-bold mb-1 font-mono">
                        PEAK
                      </div>
                    )}

                    {/* Surge bar */}
                    <div
                      className={`w-full rounded-t transition-all ${
                        isPeak ? 'bg-rose-500 shadow-lg shadow-rose-500/20' : 'bg-rose-500/70 group-hover:bg-rose-400'
                      }`}
                      style={{ height: `${surgeHeight}%` }}
                    />

                    {/* Day index label */}
                    <div className="text-[10px] font-mono text-slate-400 mt-2">
                      D{day}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Critical Stockout Warnings Table */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-sm font-semibold text-slate-100 mb-3">Projected Medicine Stock-Out Early Warnings</h3>
            <div className="rounded-lg border border-slate-800 overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-medium">Critical Medicine</th>
                    <th className="py-2.5 px-3 font-medium">Risk Level</th>
                    <th className="py-2.5 px-3 font-medium text-right">Hours / Days to Zero</th>
                    <th className="py-2.5 px-3 font-medium text-right">Projected Deficit</th>
                    <th className="py-2.5 px-3 font-medium">Epidemiological Vector Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {forecastResult.criticalStockoutsProjected.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold text-slate-100">{item.medicine}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-semibold ${
                            item.riskLevel === 'CRITICAL'
                              ? 'text-rose-400'
                              : item.riskLevel === 'HIGH'
                              ? 'text-amber-400'
                              : 'text-slate-300'
                          }`}
                        >
                          {item.riskLevel}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-rose-400">
                        {item.daysUntilDepletion.toFixed(1)} days ({(item.daysUntilDepletion * 24).toFixed(0)}h)
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                        -{item.deficitUnits.toLocaleString()} units
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Clinical Operational Directives & Rebalance Trigger */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100 mb-2">Automated Clinical Operational Directives</h3>
              <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                {forecastResult.clinicalDirectives.map((directive, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {directive}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={onNavigateToRebalance}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs transition-colors shadow-lg shrink-0 whitespace-nowrap"
            >
              <span>Launch Automated Cross-District Rebalance</span>
              <ArrowRight className="w-4 h-4 text-teal-200" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
