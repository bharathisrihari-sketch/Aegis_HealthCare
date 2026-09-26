import React, { useState, useMemo } from 'react';
import { PHCNode } from '../types/health';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Activity, Calendar, TrendingUp, TrendingDown, Layers, Filter } from 'lucide-react';

interface HistoricalPerformanceChartProps {
  node: PHCNode;
}

export const HistoricalPerformanceChart: React.FC<HistoricalPerformanceChartProps> = ({ node }) => {
  const [timeRange, setTimeRange] = useState<'30d' | '14d' | '7d'>('30d');
  const [selectedStockMetric, setSelectedStockMetric] = useState<string>('all');

  // Generate 30-day realistic historical telemetry for this specific PHC
  const chartData = useMemo(() => {
    const data = [];
    const today = new Date();
    
    // Seed variance based on node id
    const seed = node.id.charCodeAt(node.id.length - 1);
    const isHighSurge = node.footfall.triageSurgeIndex === 'SURGE_EMERGENCY';
    const baseQueue = node.footfall.dailyAverage || 60;
    
    // Primary critical stock for this node
    const primaryMed = node.stocks.find(s => s.status === 'CRITICAL_DEPLETION') || node.stocks[0];
    let runningStock = primaryMed ? primaryMed.currentUnits + (primaryMed.dailyConsumption * 18) : 100;
    const safeBuffer = primaryMed ? primaryMed.safeBufferUnits : 50;

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Simulate footfall wave with weekday/weekend fluctuations & outbreak spikes
      const dayIndex = 29 - i;
      const spikeFactor = isHighSurge && dayIndex > 20 ? 1.8 + Math.sin(dayIndex) * 0.4 : 1.0 + Math.sin(dayIndex / 3) * 0.25;
      const footfall = Math.max(15, Math.round(baseQueue * spikeFactor + (Math.sin(dayIndex + seed) * 12)));

      // Simulate stock depletion with periodic rebalance refills
      const dailyBurn = Math.round(footfall * 0.18 + (seed % 3));
      
      // Periodic refill event around day 12 and day 25 if rebalanced
      let refillAmount = 0;
      if (dayIndex === 10) refillAmount = Math.round(safeBuffer * 1.2);
      if (dayIndex === 24 && isHighSurge) refillAmount = Math.round(safeBuffer * 0.8);

      runningStock = Math.max(8, runningStock - dailyBurn + refillAmount);

      // Bed occupancy percentage
      const bedOccupancyPct = Math.min(100, Math.max(30, Math.round((footfall / (baseQueue * 1.5)) * 80)));

      data.push({
        day: dateStr,
        dayNum: dayIndex + 1,
        footfall,
        stockUnits: runningStock,
        safeBuffer,
        dailyBurn,
        bedOccupancyPct,
        refillAmount,
        event: refillAmount > 0 ? 'Buffer Refill Received' : isHighSurge && dayIndex > 22 ? 'Flood Vector Surge' : undefined,
      });
    }

    return data;
  }, [node]);

  const filteredData = useMemo(() => {
    const daysCount = timeRange === '30d' ? 30 : timeRange === '14d' ? 14 : 7;
    return chartData.slice(chartData.length - daysCount);
  }, [chartData, timeRange]);

  // Primary medicine name display
  const criticalMed = node.stocks.find(s => s.status === 'CRITICAL_DEPLETION') || node.stocks[0];

  return (
    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5 my-4">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>30-Day Historical Footfall &amp; Stock Telemetry</span>
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-300">
              {node.code}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Correlating patient footfall velocity with <span className="text-slate-200 font-medium">{criticalMed?.name}</span> buffer depletion
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-md border border-slate-800 text-xs">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-2.5 py-1 rounded transition-colors font-medium ${
              timeRange === '7d' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Days
          </button>
          <button
            onClick={() => setTimeRange('14d')}
            className={`px-2.5 py-1 rounded transition-colors font-medium ${
              timeRange === '14d' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-2.5 py-1 rounded transition-colors font-medium ${
              timeRange === '30d' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Main Recharts Dual-Axis Visualization */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={filteredData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {/* Footfall Area Gradient */}
              <linearGradient id="footfallGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0.0} />
              </linearGradient>

              {/* Stock Level Area Gradient */}
              <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />

            <XAxis
              dataKey="day"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />

            {/* Y-Axis Left: Patient Footfall */}
            <YAxis
              yAxisId="left"
              stroke="#2dd4bf"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              label={{ value: 'Footfall / Day', angle: -90, position: 'insideLeft', fill: '#2dd4bf', fontSize: 10 }}
            />

            {/* Y-Axis Right: Stock Units */}
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#f43f5e"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              label={{ value: 'Stock Units', angle: 90, position: 'insideRight', fill: '#f43f5e', fontSize: 10 }}
            />

            {/* Custom Interactive Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const dataPoint = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1.5 font-sans">
                      <div className="font-bold text-slate-100 flex items-center justify-between border-b border-slate-800 pb-1 gap-4">
                        <span>{label} (Day #{dataPoint.dayNum})</span>
                        {dataPoint.event && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800">
                            {dataPoint.event}
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between gap-4 text-teal-300 font-mono">
                        <span>Patient Footfall:</span>
                        <span className="font-bold">{dataPoint.footfall} patients</span>
                      </div>
                      <div className="flex justify-between gap-4 text-rose-400 font-mono">
                        <span>{criticalMed?.name.split(' ')[0]} Stock:</span>
                        <span className="font-bold">{dataPoint.stockUnits} units</span>
                      </div>
                      <div className="flex justify-between gap-4 text-slate-400 font-mono text-[11px]">
                        <span>Safe Buffer Threshold:</span>
                        <span>{dataPoint.safeBuffer} units</span>
                      </div>
                      <div className="flex justify-between gap-4 text-amber-300 font-mono text-[11px]">
                        <span>Bed Occupancy:</span>
                        <span>{dataPoint.bedOccupancyPct}%</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Legend
              verticalAlign="top"
              height={32}
              formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
            />

            {/* Footfall Area Chart */}
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="footfall"
              name="Patient Footfall (Outpatient Queue)"
              stroke="#2dd4bf"
              strokeWidth={2}
              fill="url(#footfallGradient)"
            />

            {/* Stock Levels Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="stockUnits"
              name={`${criticalMed?.name.split(' ')[0] || 'Essential Stock'} Reserve`}
              stroke="#f43f5e"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: '#f43f5e' }}
            />

            {/* Safe Buffer Reference Line */}
            <Line
              yAxisId="right"
              type="step"
              dataKey="safeBuffer"
              name="Minimum Safe Buffer Threshold"
              stroke="#f59e0b"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Analytics Summary Bar below chart */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
        <div className="p-2 rounded bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400">Peak Footfall (30d)</span>
          <div className="text-sm font-bold font-mono text-teal-300">
            {Math.max(...filteredData.map(d => d.footfall))} patients/day
          </div>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400">Avg Daily Stock Depletion</span>
          <div className="text-sm font-bold font-mono text-rose-400">
            ~{Math.round(filteredData.reduce((acc, d) => acc + d.dailyBurn, 0) / filteredData.length)} units/day
          </div>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400">Rebalance Refill Events</span>
          <div className="text-sm font-bold font-mono text-emerald-400">
            {filteredData.filter(d => d.refillAmount > 0).length} Cycle Executed
          </div>
        </div>
        <div className="p-2 rounded bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400">30-Day Burn/Demand Correlation</span>
          <div className="text-sm font-bold font-mono text-amber-300">
            +0.89 High Covariance
          </div>
        </div>
      </div>
    </div>
  );
};
