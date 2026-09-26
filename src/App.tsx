/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { MetricsOverview } from './components/MetricsOverview';
import { NetworkMap } from './components/NetworkMap';
import { PHCDetailModal } from './components/PHCDetailModal';
import { ForecastView } from './components/ForecastView';
import { RedistributionView } from './components/RedistributionView';
import { FederatedHubView } from './components/FederatedHubView';
import { DispatchManifestModal } from './components/DispatchManifestModal';
import { EmergencyProtocolModal } from './components/EmergencyProtocolModal';
import { ToastContainer, ToastNotification } from './components/ToastContainer';
import { AegisChatDrawer } from './components/AegisChatDrawer';

import {
  INITIAL_PHC_NODES,
  INITIAL_REDISTRIBUTION_TRANSFERS,
  BRICS_NATION_NODES,
} from './data/mockHealthData';
import { PHCNode, RedistributionTransfer } from './types/health';

export default function App() {
  const [activeTab, setActiveTab] = useState<'network' | 'forecast' | 'redistribution' | 'federated'>('network');
  const [nodes, setNodes] = useState<PHCNode[]>(INITIAL_PHC_NODES);
  const [transfers, setTransfers] = useState<RedistributionTransfer[]>(INITIAL_REDISTRIBUTION_TRANSFERS);
  const [nations, setNations] = useState(BRICS_NATION_NODES);
  const [federatedRound, setFederatedRound] = useState(42);

  // Modals & Chat state
  const [selectedNode, setSelectedNode] = useState<PHCNode | null>(null);
  const [selectedManifest, setSelectedManifest] = useState<RedistributionTransfer | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Auto-dismiss toasts after 7s
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleInspectNodeById = (phcId: string) => {
    const node = nodes.find((n) => n.id === phcId);
    if (node) {
      setSelectedNode(node);
      setActiveTab('network');
    }
  };

  // Telemetry sync action with <15% stock alert checker
  const handleTriggerSync = () => {
    setIsSimulating(true);
    setTimeout(() => {
      const newToasts: ToastNotification[] = [];

      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          // Temperature and footfall live tick
          const tempDelta = (Math.random() - 0.5) * 0.2;
          const newTemp = Math.round((node.coldChain.currentTempC + tempDelta) * 10) / 10;
          
          // Simulate live medicine consumption tick during sync
          const updatedStocks = node.stocks.map((stock) => {
            // Random stock burn between 1 and 3 units
            const burn = Math.floor(Math.random() * 2) + 1;
            const updatedUnits = Math.max(2, stock.currentUnits - burn);
            const ratio = updatedUnits / (stock.safeBufferUnits || 1);
            const percentage = Math.round(ratio * 100);

            // Check if stock ratio drops below 15% threshold during this sync
            if (ratio < 0.15) {
              const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              newToasts.push({
                id: `toast-${node.id}-${stock.id}-${Date.now()}`,
                phcId: node.id,
                phcName: node.name,
                phcCode: node.code,
                medicineName: stock.name,
                currentUnits: updatedUnits,
                safeBufferUnits: stock.safeBufferUnits,
                percentageRemaining: percentage,
                timestamp: now,
              });
            }

            return {
              ...stock,
              currentUnits: updatedUnits,
              daysRemaining: Math.max(0.2, Math.round((updatedUnits / stock.dailyConsumption) * 10) / 10),
              status: ratio < 0.2 ? ('CRITICAL_DEPLETION' as const) : ratio < 0.5 ? ('WARNING' as const) : ('SAFE' as const),
            };
          });

          return {
            ...node,
            coldChain: {
              ...node.coldChain,
              currentTempC: Math.max(2.1, Math.min(7.9, newTemp)),
              lastSync: 'Just now',
            },
            footfall: {
              ...node.footfall,
              currentQueue: Math.max(5, node.footfall.currentQueue + Math.floor((Math.random() - 0.4) * 6)),
            },
            stocks: updatedStocks,
          };
        })
      );

      // Add unique new toasts (limit max 3 simultaneous)
      if (newToasts.length > 0) {
        setToasts((prev) => [...prev, ...newToasts].slice(-3));
      }

      setIsSimulating(false);
    }, 800);
  };

  const handleRequestRebalanceFromPHC = (node: PHCNode) => {
    setSelectedNode(null);
    setActiveTab('redistribution');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/20 selection:text-teal-200">
      {/* 3-Zone Top Navigation Bar */}
      <TopNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        isSimulating={isSimulating}
        onTriggerSync={handleTriggerSync}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* Nationwide Resilience Metric Banners */}
        <MetricsOverview nodes={nodes} federatedRound={federatedRound} />

        {/* Tab 1: Real-time PHC Network Telemetry & Geospatial Map */}
        {activeTab === 'network' && (
          <NetworkMap
            nodes={nodes}
            onSelectNode={(node) => setSelectedNode(node)}
            selectedNodeId={selectedNode?.id}
          />
        )}

        {/* Tab 2: AI Epidemiological Demand & Stockout Forecasting */}
        {activeTab === 'forecast' && (
          <ForecastView
            nodes={nodes}
            onNavigateToRebalance={() => setActiveTab('redistribution')}
          />
        )}

        {/* Tab 3: Automated Cross-District Resource Redistribution Engine */}
        {activeTab === 'redistribution' && (
          <RedistributionView
            nodes={nodes}
            transfers={transfers}
            onUpdateTransfers={(newTransfers) => setTransfers(newTransfers)}
            onOpenManifest={(transfer) => setSelectedManifest(transfer)}
          />
        )}

        {/* Tab 4: BRICS Federated Learning Intelligence Hub */}
        {activeTab === 'federated' && (
          <FederatedHubView
            nations={nations}
            federatedRound={federatedRound}
            onIncrementRound={() => setFederatedRound((r) => r + 1)}
          />
        )}
      </main>

      {/* Modals */}
      <PHCDetailModal
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
        onRequestRebalance={handleRequestRebalanceFromPHC}
      />

      <DispatchManifestModal
        transfer={selectedManifest}
        onClose={() => setSelectedManifest(null)}
      />

      <EmergencyProtocolModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        nodes={nodes}
      />

      {/* Multi-Turn Aegis AI Health Logistics Assistant Chat Drawer */}
      <AegisChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        nodes={nodes}
        federatedRound={federatedRound}
      />

      {/* Floating Critical Stockout Toast Notifications (<15% Threshold) */}
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        onInspectNode={handleInspectNodeById}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 px-4 lg:px-8 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AegisHealth BRICS</span>
            <span aria-hidden="true">·</span>
            <span>National Health Resource &amp; Federated Resilience Grid</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400">
            <span>Differential Privacy ε=1.2</span>
            <span aria-hidden="true">·</span>
            <span>Zero-Patient-Data Egress</span>
            <span aria-hidden="true">·</span>
            <span>2026 BRICS Resilience Initiative</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
