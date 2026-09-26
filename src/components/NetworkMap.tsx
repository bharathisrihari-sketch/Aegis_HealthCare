import React, { useState } from 'react';
import { PHCNode } from '../types/health';
import {
  Search,
  Filter,
  AlertTriangle,
  Building2,
  Thermometer,
  Bed,
  Users,
  Navigation,
  Eye,
  CheckCircle2,
  Flame,
  Layers,
  Activity,
  Sparkles,
} from 'lucide-react';

interface NetworkMapProps {
  nodes: PHCNode[];
  onSelectNode: (node: PHCNode) => void;
  selectedNodeId?: string;
}

export const NetworkMap: React.FC<NetworkMapProps> = ({
  nodes,
  onSelectNode,
  selectedNodeId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'SAFE'>('ALL');
  const [viewMode, setViewMode] = useState<'map' | 'table'>('map');

  // Heatmap state
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatmapMetric, setHeatmapMetric] = useState<'SHORTAGE' | 'QUEUE' | 'COMBINED'>('SHORTAGE');

  // Filter nodes
  const filteredNodes = nodes.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistrict = districtFilter === 'ALL' || node.district.includes(districtFilter);

    const hasCritical = node.stocks.some((s) => s.status === 'CRITICAL_DEPLETION');
    const hasWarning = node.stocks.some((s) => s.status === 'WARNING');

    let matchesRisk = true;
    if (riskFilter === 'CRITICAL') matchesRisk = hasCritical;
    else if (riskFilter === 'WARNING') matchesRisk = hasWarning && !hasCritical;
    else if (riskFilter === 'SAFE') matchesRisk = !hasCritical && !hasWarning;

    return matchesSearch && matchesDistrict && matchesRisk;
  });

  // Calculate heatmap intensity values
  const getHeatmapNodeMetric = (node: PHCNode) => {
    const criticalCount = node.stocks.filter((s) => s.status === 'CRITICAL_DEPLETION').length;
    const warningCount = node.stocks.filter((s) => s.status === 'WARNING').length;
    const shortageScore = Math.min(100, node.stockoutRiskScore || (criticalCount * 35 + warningCount * 15));
    const queueScore = Math.min(100, Math.round((node.footfall.currentQueue / 240) * 100));

    if (heatmapMetric === 'SHORTAGE') {
      return {
        score: shortageScore,
        radius: 40 + (shortageScore / 100) * 75,
        opacity: 0.25 + (shortageScore / 100) * 0.55,
        colorClass: shortageScore > 75 ? 'shortageCritical' : shortageScore > 40 ? 'shortageWarning' : 'shortageSafe',
      };
    } else if (heatmapMetric === 'QUEUE') {
      return {
        score: queueScore,
        radius: 35 + (queueScore / 100) * 80,
        opacity: 0.25 + (queueScore / 100) * 0.55,
        colorClass: queueScore > 65 ? 'queueHigh' : queueScore > 35 ? 'queueMedium' : 'queueLow',
      };
    } else {
      const combinedScore = Math.round(shortageScore * 0.6 + queueScore * 0.4);
      return {
        score: combinedScore,
        radius: 40 + (combinedScore / 100) * 80,
        opacity: 0.25 + (combinedScore / 100) * 0.55,
        colorClass: combinedScore > 70 ? 'combinedHigh' : combinedScore > 40 ? 'combinedMed' : 'combinedLow',
      };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800">
        <div className="flex flex-1 items-center gap-2 max-w-md bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search PHC name, code, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Heatmap Layer Toggle */}
          <div className="flex items-center gap-1.5 p-0.5 bg-slate-950 rounded border border-slate-800 text-xs">
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all font-medium ${
                showHeatmap
                  ? 'bg-rose-900/60 text-rose-200 border border-rose-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${showHeatmap ? 'text-rose-400 fill-rose-400/30 animate-pulse' : ''}`} />
              <span>Heatmap Layer</span>
            </button>

            {showHeatmap && (
              <div className="flex items-center gap-1 border-l border-slate-800 pl-1">
                <button
                  onClick={() => setHeatmapMetric('SHORTAGE')}
                  title="Shortage Risk Intensity"
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    heatmapMetric === 'SHORTAGE' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Medicine Shortage
                </button>
                <button
                  onClick={() => setHeatmapMetric('QUEUE')}
                  title="Patient Queue & Footfall Density"
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    heatmapMetric === 'QUEUE' ? 'bg-amber-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Patient Queues
                </button>
                <button
                  onClick={() => setHeatmapMetric('COMBINED')}
                  title="Blended Stockout & Patient Surge Index"
                  className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                    heatmapMetric === 'COMBINED' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Combined
                </button>
              </div>
            )}
          </div>

          {/* District Selector */}
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Districts</option>
              <option value="Koppal">Koppal District</option>
              <option value="Ballari">Ballari Frontier Zone</option>
              <option value="Vijayanagara">Vijayanagara District</option>
            </select>
          </div>

          {/* Risk Level Segmented Control */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded border border-slate-800 text-xs">
            <button
              onClick={() => setRiskFilter('ALL')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                riskFilter === 'ALL' ? 'bg-slate-800 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Risks
            </button>
            <button
              onClick={() => setRiskFilter('CRITICAL')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                riskFilter === 'CRITICAL' ? 'bg-rose-950 text-rose-300 font-medium' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              Critical
            </button>
            <button
              onClick={() => setRiskFilter('WARNING')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                riskFilter === 'WARNING' ? 'bg-amber-950 text-amber-300 font-medium' : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              Warning
            </button>
            <button
              onClick={() => setRiskFilter('SAFE')}
              className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                riskFilter === 'SAFE' ? 'bg-emerald-950 text-emerald-300 font-medium' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Stable
            </button>
          </div>

          {/* Map vs Table view toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-950 rounded border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'map' ? 'bg-teal-900/60 text-teal-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Geospatial Map
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 rounded transition-colors ${
                viewMode === 'table' ? 'bg-teal-900/60 text-teal-300 font-medium' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tabular Grid
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        /* Geospatial & Logistics Network Map View */
        <div className="relative w-full h-[520px] rounded-lg bg-slate-950 border border-slate-800 overflow-hidden shadow-2xl">
          {/* Subtle background satellite imagery mesh */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none bg-cover bg-center"
            style={{
              backgroundImage: `url(/src/assets/images/hero_health_command_network_1790404948819.jpg)`,
            }}
          />

          {/* SVG Map Canvas */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 550">
            <defs>
              {/* Subtle grid pattern */}
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.25)" strokeWidth="0.8" />
              </pattern>

              {/* Glowing gradients */}
              <linearGradient id="dronePath" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.3" />
              </linearGradient>

              <linearGradient id="roadRoute" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.2" />
              </linearGradient>

              {/* Heatmap Radial Gradients */}
              <radialGradient id="shortageCritical" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                <stop offset="40%" stopColor="#e11d48" stopOpacity="0.5" />
                <stop offset="75%" stopColor="#9f1239" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="shortageWarning" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.75" />
                <stop offset="50%" stopColor="#d97706" stopOpacity="0.4" />
                <stop offset="80%" stopColor="#b45309" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="shortageSafe" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="60%" stopColor="#059669" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="queueHigh" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#d946ef" stopOpacity="0.8" />
                <stop offset="45%" stopColor="#c026d3" stopOpacity="0.5" />
                <stop offset="80%" stopColor="#701a75" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#d946ef" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="queueMedium" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#0284c7" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="queueLow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="combinedHigh" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
                <stop offset="40%" stopColor="#a855f7" stopOpacity="0.55" />
                <stop offset="75%" stopColor="#6366f1" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="combinedMed" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
                <stop offset="50%" stopColor="#818cf8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="combinedLow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </radialGradient>

              {/* Blur filter for realistic continuous heat field */}
              <filter id="heatBlur" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" />
              </filter>
            </defs>

            {/* Background Grid */}
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* HEATMAP VISUALIZATION LAYER */}
            {showHeatmap && (
              <g className="heatmap-layer pointer-events-none transition-opacity duration-300">
                {/* District boundary ambient heat field blobs */}
                <ellipse
                  cx="280"
                  cy="360"
                  rx="160"
                  ry="120"
                  fill="url(#shortageCritical)"
                  opacity={heatmapMetric === 'SHORTAGE' ? 0.35 : heatmapMetric === 'COMBINED' ? 0.3 : 0.15}
                  filter="url(#heatBlur)"
                />
                <ellipse
                  cx="510"
                  cy="310"
                  rx="140"
                  ry="110"
                  fill={heatmapMetric === 'QUEUE' ? 'url(#queueHigh)' : 'url(#shortageWarning)'}
                  opacity="0.25"
                  filter="url(#heatBlur)"
                />

                {/* Per-node Heat Intensity Blobs */}
                {filteredNodes.map((node) => {
                  const metric = getHeatmapNodeMetric(node);
                  return (
                    <circle
                      key={`heat-${node.id}`}
                      cx={node.coordinates.x}
                      cy={node.coordinates.y}
                      r={metric.radius}
                      fill={`url(#${metric.colorClass})`}
                      opacity={metric.opacity}
                      filter="url(#heatBlur)"
                    />
                  );
                })}
              </g>
            )}

            {/* River & Monsoon Flood Boundary (Stylized geography) */}
            <path
              d="M 120 180 Q 240 260 360 290 T 520 380 T 740 460"
              fill="none"
              stroke="#0284c7"
              strokeWidth="5"
              strokeOpacity="0.35"
              strokeDasharray="6 4"
            />
            <text x="210" y="275" fill="#38bdf8" fontSize="10" opacity="0.6" fontFamily="sans-serif">
              Tungabhadra River Basin (Monsoon Inundation Warning)
            </text>

            {/* Logistics Transit Routes */}
            {/* CMS Hub (440, 190) -> PHC Narsapur (260, 310) Drone Corridor */}
            <path
              d="M 440 190 Q 340 220 260 310"
              fill="none"
              stroke="url(#dronePath)"
              strokeWidth="2.5"
              strokeDasharray="5 4"
              className="animate-pulse"
            />
            <text x="320" y="235" fill="#2dd4bf" fontSize="9" fontWeight="600">
              Drone Corridor TX-901 (42 km · 42m)
            </text>

            {/* Hospet SDH (570, 260) -> PHC Kadur (380, 270) Reefer Van Route */}
            <path
              d="M 570 260 L 380 270"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.8"
              strokeOpacity="0.6"
            />

            {/* CMS Hub (440, 190) -> PHC Belur (190, 440) UAV Aerial Pass */}
            <path
              d="M 440 190 Q 300 320 190 440"
              fill="none"
              stroke="url(#roadRoute)"
              strokeWidth="1.8"
              strokeDasharray="4 4"
            />

            {/* Nodes Render */}
            {filteredNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const hasCritical = node.stocks.some((s) => s.status === 'CRITICAL_DEPLETION');
              const hasWarning = node.stocks.some((s) => s.status === 'WARNING');
              const isHub = node.type === 'Central Medical Store';

              let fillColor = '#10b981'; // Green
              if (hasCritical) fillColor = '#f43f5e'; // Rose
              else if (hasWarning) fillColor = '#f59e0b'; // Amber
              if (isHub) fillColor = '#38bdf8'; // Sky blue for Central Hub

              return (
                <g
                  key={node.id}
                  onClick={() => onSelectNode(node)}
                  className="cursor-pointer group"
                >
                  {/* Pulse ring for critical nodes */}
                  {hasCritical && (
                    <circle
                      cx={node.coordinates.x}
                      cy={node.coordinates.y}
                      r="22"
                      fill="none"
                      stroke="#f43f5e"
                      strokeWidth="1.5"
                      strokeOpacity="0.7"
                      className="animate-ping"
                    />
                  )}

                  {/* Active selection highlight halo */}
                  {isSelected && (
                    <circle
                      cx={node.coordinates.x}
                      cy={node.coordinates.y}
                      r="18"
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="2"
                    />
                  )}

                  {/* Outer circle */}
                  <circle
                    cx={node.coordinates.x}
                    cy={node.coordinates.y}
                    r={isHub ? 14 : 10}
                    fill="#0f172a"
                    stroke={fillColor}
                    strokeWidth={isSelected ? 3 : 2}
                    className="transition-transform group-hover:scale-125"
                  />

                  {/* Core icon dot */}
                  <circle
                    cx={node.coordinates.x}
                    cy={node.coordinates.y}
                    r={isHub ? 6 : 4}
                    fill={fillColor}
                  />

                  {/* Node label */}
                  <text
                    x={node.coordinates.x}
                    y={node.coordinates.y + (isHub ? 26 : 22)}
                    textAnchor="middle"
                    fill="#e2e8f0"
                    fontSize="11"
                    fontWeight="600"
                    className="drop-shadow-md select-none group-hover:fill-teal-300"
                  >
                    {node.name}
                  </text>

                  {/* Subtle Sub-label */}
                  <text
                    x={node.coordinates.x}
                    y={node.coordinates.y + (isHub ? 37 : 33)}
                    textAnchor="middle"
                    fill={hasCritical ? '#fda4af' : '#94a3b8'}
                    fontSize="9"
                    fontFamily="monospace"
                    className="select-none"
                  >
                    {hasCritical ? '⚠ STOCKOUT < 48h' : `${node.beds.occupied}/${node.beds.total} Beds`}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Map Overlay Legend & Heatmap Intensity Bar */}
          <div className="absolute bottom-4 left-4 p-3 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs text-slate-300 space-y-2 shadow-lg max-w-xs pointer-events-auto">
            <div className="font-semibold text-slate-100 flex items-center justify-between pb-1 border-b border-slate-800">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Map Heatmap &amp; Topology</span>
              </span>
              <span className="font-mono text-[10px] text-teal-400">
                {showHeatmap ? `${heatmapMetric} HEAT` : 'NODES'}
              </span>
            </div>

            {/* Heatmap Gradient Bar Legend */}
            {showHeatmap && (
              <div className="space-y-1.5 pt-0.5 pb-1 border-b border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>
                    {heatmapMetric === 'SHORTAGE'
                      ? 'Stock Adequate'
                      : heatmapMetric === 'QUEUE'
                      ? 'Low Queue'
                      : 'Low Risk'}
                  </span>
                  <span className="text-rose-400 font-bold">
                    {heatmapMetric === 'SHORTAGE'
                      ? 'Critical Stockout'
                      : heatmapMetric === 'QUEUE'
                      ? 'Surge (>120 Queue)'
                      : 'Severe Risk'}
                  </span>
                </div>

                {/* Color Spectrum Gradient */}
                <div
                  className={`h-2.5 w-full rounded-full shadow-inner ${
                    heatmapMetric === 'SHORTAGE'
                      ? 'bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-600'
                      : heatmapMetric === 'QUEUE'
                      ? 'bg-gradient-to-r from-teal-400 via-sky-500 to-fuchsia-600'
                      : 'bg-gradient-to-r from-emerald-500 via-indigo-500 to-rose-600'
                  }`}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0" />
              <span>Central Medical Store (Surplus Hub)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
              <span>Critical Depletion (&lt;48h reserve)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
              <span>Low Buffer Warning (&lt;5 days)</span>
            </div>
            <div className="pt-1 border-t border-slate-800/80 text-[11px] text-slate-400">
              Click any node to inspect real-time medicine inventory, doctor attendance, and cold-chain logs.
            </div>
          </div>
        </div>
      ) : (
        /* High-Density Tabular Operations Grid */
        <div className="rounded-lg bg-slate-900 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 font-medium">Facility / Code</th>
                <th className="py-2.5 px-3 font-medium">Tier &amp; District</th>
                <th className="py-2.5 px-3 font-medium">Beds (Occ/Tot)</th>
                <th className="py-2.5 px-3 font-medium">Duty Staff</th>
                <th className="py-2.5 px-3 font-medium">Cold Chain</th>
                <th className="py-2.5 px-3 font-medium">Road Status</th>
                <th className="py-2.5 px-3 font-medium">Vulnerable Stocks</th>
                <th className="py-2.5 px-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredNodes.map((node) => {
                const hasCritical = node.stocks.some((s) => s.status === 'CRITICAL_DEPLETION');
                const criticalMeds = node.stocks.filter((s) => s.status === 'CRITICAL_DEPLETION');

                return (
                  <tr
                    key={node.id}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => onSelectNode(node)}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-100">{node.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{node.code}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="text-slate-200">{node.type}</div>
                      <div className="text-[11px] text-slate-400">{node.district}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums">
                      <span className={node.beds.occupied / node.beds.total > 0.85 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                        {node.beds.occupied}/{node.beds.total}
                      </span>
                      <span className="text-[10px] text-slate-400 ml-1">
                        ({Math.round((node.beds.occupied / (node.beds.total || 1)) * 100)}%)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-slate-200">
                      <span>{node.personnel.doctors.onDuty} doc · {node.personnel.nurses.onDuty} nurse</span>
                      <div className="text-[10px] text-emerald-400 font-medium">{node.personnel.attendanceRate}% logged in</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums">
                      <span className={node.coldChain.status === 'OPTIMAL' ? 'text-emerald-400' : 'text-amber-400'}>
                        {node.coldChain.currentTempC}°C
                      </span>
                      <div className="text-[10px] text-slate-400">{node.coldChain.status}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      {node.roadAccessibility === 'MONSOON_FLOOD_RESTRICTED' ? (
                        <span className="text-rose-400 font-medium">Flooded (Air/UAV)</span>
                      ) : node.roadAccessibility === 'ROUGH_TERRAIN' ? (
                        <span className="text-amber-400">Rough pass</span>
                      ) : (
                        <span className="text-emerald-400">Accessible</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {hasCritical ? (
                        <div className="text-rose-400 font-medium">
                          {criticalMeds.map((m) => m.name.split(' ')[0]).join(', ')} ({criticalMeds[0]?.daysRemaining}d)
                        </div>
                      ) : (
                        <span className="text-emerald-400">Adequate buffers</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectNode(node);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded bg-slate-800 text-teal-300 hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
