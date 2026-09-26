import React from 'react';
import { RedistributionTransfer } from '../types/health';
import {
  X,
  Printer,
  QrCode,
  ShieldCheck,
  Truck,
  Plane,
  Thermometer,
  Calendar,
  CheckCircle,
} from 'lucide-react';

interface DispatchManifestModalProps {
  transfer: RedistributionTransfer | null;
  onClose: () => void;
}

export const DispatchManifestModal: React.FC<DispatchManifestModalProps> = ({
  transfer,
  onClose,
}) => {
  if (!transfer) return null;

  const handlePrint = () => {
    window.print();
  };

  const isDrone = transfer.transportMode.includes('Drone');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-teal-400 bg-slate-800 px-2 py-0.5 rounded">
              OFFICIAL DISPATCH MANIFEST
            </span>
            <span className="text-xs text-slate-400 font-mono">
              {transfer.transferId}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Manifest</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Manifest Document Sheet */}
        <div className="mt-4 p-5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-5 print:bg-transparent print:border-none print:p-0">
          {/* Header Lockup */}
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                National Health Logistics Command
              </h1>
              <p className="text-slate-400 text-[11px]">
                Emergency Cross-District Medical Redistribution Dispatch Order
              </p>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Issued under National Health Mission Emergency Reallocation Framework
              </div>
            </div>

            {/* QR Code representation */}
            <div className="flex flex-col items-center p-2 rounded bg-slate-900 border border-slate-800">
              <QrCode className="w-12 h-12 text-teal-400" />
              <span className="font-mono text-[9px] text-slate-400 mt-1">
                {transfer.qrCode}
              </span>
            </div>
          </div>

          {/* Transfer Details Matrix */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                Origin Facility (Surplus Hub)
              </span>
              <div className="font-bold text-slate-100 text-sm mt-0.5">
                {transfer.fromFacilityName}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Custodian: Central Logistics Officer
              </div>
            </div>

            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
                Destination Facility (Deficit PHC)
              </span>
              <div className="font-bold text-white text-sm mt-0.5">
                {transfer.toFacilityName}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Receiving: Medical Officer on Duty
              </div>
            </div>
          </div>

          {/* Consignment Table */}
          <div className="border border-slate-800 rounded overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] uppercase tracking-wider">
                <tr>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-3 text-right">Quantity</th>
                  <th className="py-2 px-3">Transport Mode</th>
                  <th className="py-2 px-3 text-right">Distance &amp; ETA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-sans">
                <tr>
                  <td className="py-2.5 px-3">
                    <div className="font-bold text-white">{transfer.medicineName}</div>
                    <div className="text-[10px] text-amber-400 font-mono">
                      {transfer.coldChainCompliance}
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-teal-300">
                    {transfer.quantity.toLocaleString()} {transfer.unit}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-300">
                    {transfer.transportMode}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-200">
                    {transfer.distanceKm} km · {transfer.eta}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Logistics & Cold-Chain Telemetry Guarantee */}
          <div className="p-3 rounded bg-slate-900 border border-slate-800 space-y-1 text-[11px]">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cold-Chain Datalogger Verification Standard:</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Consignment is hermetically sealed within calibrated phase-change vacuum insulation units. Active NFC datalogger continuous telemetry streams temperature pings every 60 seconds to the AegisHealth national mesh.
            </p>
          </div>

          {/* Chain-of-Custody Signatures */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                1. Dispatching Officer
              </div>
              <div className="mt-4 pt-1 border-t border-slate-700 font-mono text-[10px] text-slate-300">
                Dr. R. K. Sharma (MD)
                <div className="text-slate-500">Sign &amp; Biometric Auth</div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                2. Carrier Pilot / Driver
              </div>
              <div className="mt-4 pt-1 border-t border-slate-700 font-mono text-[10px] text-slate-300">
                {isDrone ? 'Autonomous UAV Flight #FL-88' : 'K. Veerappa (Reefer #KA-37-88)'}
                <div className="text-slate-500">Transit Verified</div>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">
                3. Receiving Medical Officer
              </div>
              <div className="mt-4 pt-1 border-t border-slate-700 font-mono text-[10px] text-slate-300">
                Pending Handover at PHC
                <div className="text-slate-500">Cold Chain Intake Stamp</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Close */}
        <div className="flex justify-end pt-4 mt-2 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium transition-colors"
          >
            Close Manifest
          </button>
        </div>
      </div>
    </div>
  );
};
