import React from 'react';
import { Activity, ShieldCheck, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react';

interface TopNavProps {
  activeTab: 'network' | 'forecast' | 'redistribution' | 'federated';
  setActiveTab: (tab: 'network' | 'forecast' | 'redistribution' | 'federated') => void;
  onOpenEmergencyModal: () => void;
  onOpenChat: () => void;
  isSimulating: boolean;
  onTriggerSync: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenEmergencyModal,
  onOpenChat,
  isSimulating,
  onTriggerSync,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('network');
            }}
            className="text-lg font-bold tracking-tight text-white hover:text-teal-300 transition-colors whitespace-nowrap"
          >
            AegisHealth BRICS
          </a>
        </div>

        {/* Zone 2: 4 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          <button
            onClick={() => setActiveTab('network')}
            className={`transition-colors pb-1 border-b-2 whitespace-nowrap ${
              activeTab === 'network'
                ? 'text-teal-300 border-teal-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            PHC Telemetry &amp; Network
          </button>
          <button
            onClick={() => setActiveTab('forecast')}
            className={`transition-colors pb-1 border-b-2 whitespace-nowrap ${
              activeTab === 'forecast'
                ? 'text-teal-300 border-teal-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            AI Stockout Forecasting
          </button>
          <button
            onClick={() => setActiveTab('redistribution')}
            className={`transition-colors pb-1 border-b-2 whitespace-nowrap ${
              activeTab === 'redistribution'
                ? 'text-teal-300 border-teal-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            Cross-District Rebalance
          </button>
          <button
            onClick={() => setActiveTab('federated')}
            className={`transition-colors pb-1 border-b-2 whitespace-nowrap ${
              activeTab === 'federated'
                ? 'text-teal-300 border-teal-400'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            BRICS Federated Learning
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-teal-300 bg-teal-950/70 border border-teal-800/80 rounded-md hover:bg-teal-900/80 hover:text-teal-200 transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
            <span>AI Assistant</span>
          </button>

          <button
            onClick={onTriggerSync}
            disabled={isSimulating}
            title="Poll live PHC biometric attendance, cold chain sensors & telemetry"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-700/80 rounded-md hover:bg-slate-800 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>Telemetry Sync</span>
          </button>

          <button
            onClick={onOpenEmergencyModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-600 rounded-md shadow-sm transition-colors whitespace-nowrap"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
            <span>Emergency Protocol</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-between border-t border-slate-800/60 mt-2.5 pt-2 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('network')}
          className={`px-2 py-1 whitespace-nowrap ${
            activeTab === 'network' ? 'text-teal-300 font-bold' : 'text-slate-400'
          }`}
        >
          PHC Network
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`px-2 py-1 whitespace-nowrap ${
            activeTab === 'forecast' ? 'text-teal-300 font-bold' : 'text-slate-400'
          }`}
        >
          AI Forecast
        </button>
        <button
          onClick={() => setActiveTab('redistribution')}
          className={`px-2 py-1 whitespace-nowrap ${
            activeTab === 'redistribution' ? 'text-teal-300 font-bold' : 'text-slate-400'
          }`}
        >
          Rebalance
        </button>
        <button
          onClick={() => setActiveTab('federated')}
          className={`px-2 py-1 whitespace-nowrap ${
            activeTab === 'federated' ? 'text-teal-300 font-bold' : 'text-slate-400'
          }`}
        >
          BRICS Hub
        </button>
      </div>
    </header>
  );
};
