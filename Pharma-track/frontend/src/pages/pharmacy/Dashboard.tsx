import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Link2, ShieldAlert, AlertTriangle, Pill, Bell,
  Syringe, Wind, Plus, ExternalLink, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const THRESHOLD_ALERTS = [
  {
    name: 'Amoxicillin 500mg',
    icon: <Pill size={18} className="text-gray-400" />,
    current: 120,
    threshold: 500,
    status: 'LOW STOCK',
    statusColor: 'text-yellow-400',
    barColor: 'bg-red-500',
    barWidth: '24%',
  },
  {
    name: 'Insulin Aspart',
    icon: <Syringe size={18} className="text-gray-400" />,
    current: 45,
    threshold: 100,
    status: 'REFILL REQ',
    statusColor: 'text-orange-400',
    barColor: 'bg-orange-500',
    barWidth: '45%',
  },
  {
    name: 'Albuterol Inhaler',
    icon: <Wind size={18} className="text-gray-400" />,
    current: 12,
    threshold: 40,
    status: 'CRITICAL CHAIN',
    statusColor: 'text-red-400',
    barColor: 'bg-red-600',
    barWidth: '30%',
  },
];

const ALL_LEDGER_ACTIVITY = [
  {
    time: '14:22:05',
    type: 'BLOCK #942,012',
    title: 'Amoxicillin Batch Verified',
    detail: '0x71c94038c59c2127b608b8...',
    color: 'bg-emerald-500',
  },
  {
    time: '13:45:10',
    type: 'LOGISTICS',
    title: 'Cold Chain Confirmed',
    detail: 'Insulin Node 03 → Node 12',
    color: 'bg-cyan-500',
  },
  {
    time: '12:10:33',
    type: 'SMART CONTRACT',
    title: 'Automatic Reorder Triggered',
    detail: 'Albuterol Stock below 15%',
    color: 'bg-purple-500',
  },
  {
    time: '11:05:12',
    type: 'SECURITY',
    title: 'Suspicious Access Attempt',
    detail: 'Blocked by firewall rule #47',
    color: 'bg-red-500',
  },
  {
    time: '10:32:44',
    type: 'BLOCK #942,008',
    title: 'Insulin Batch Received',
    detail: '0x3a8f10bc47d2e91a0542...',
    color: 'bg-emerald-500',
  },
  {
    time: '09:18:27',
    type: 'VERIFICATION',
    title: 'QR Scan — Amoxicillin 500mg',
    detail: 'Batch MFG-88291-LX verified',
    color: 'bg-cyan-500',
  },
  {
    time: '08:45:03',
    type: 'LOGISTICS',
    title: 'Temperature Alert Resolved',
    detail: 'Insulin cold chain restored at Node 07',
    color: 'bg-yellow-500',
  },
  {
    time: '07:22:19',
    type: 'SMART CONTRACT',
    title: 'Payment Settlement Completed',
    detail: 'Invoice #INV-2026-0412 settled',
    color: 'bg-purple-500',
  },
];

export default function PharmacyDashboard() {
  const [showAll, setShowAll] = useState(false);
  const visibleActivity = showAll ? ALL_LEDGER_ACTIVITY : ALL_LEDGER_ACTIVITY.slice(0, 4);

  return (
    <DashboardLayout role="pharmacy" searchPlaceholder="Search batch, drug, or node...">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Pharmacy Node 03</h1>
          <p className="text-sm text-gray-500 mt-1">Operational Hub & Real-time Ledger Overview</p>
        </div>
        <div className="flex items-center gap-3 bg-[#111827]/80 border border-white/5 rounded-xl px-4 py-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[12px] font-semibold text-emerald-400">IN-SYNC</span>
          <span className="text-[12px] text-gray-500">14ms latency</span>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Large card */}
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-2">TOTAL ACTIVE LEDGER ENTRIES</p>
          <p className="text-4xl font-bold text-white mb-4">12,482</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-emerald-400">↗ +2.4% from last week</span>
          </div>
          {/* Decorative chain icon */}
          <div className="absolute top-4 right-4 opacity-10">
            <Link2 size={80} className="text-cyan-400" />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-3">
            <ShieldAlert size={24} className="text-yellow-400" />
          </div>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">PENDING VERIFICATION</p>
          <p className="text-3xl font-bold text-white mb-1">48</p>
          <button className="text-[11px] text-cyan-400 hover:underline font-medium">REVIEW QUEUE ›</button>
        </div>

        {/* Expiring Soon */}
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-3">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <p className="text-[10px] text-red-400 uppercase tracking-wider font-semibold mb-1">EXPIRING SOON</p>
          <p className="text-3xl font-bold text-white mb-1">14 <span className="text-base font-normal text-gray-500">Critical</span></p>
          <button className="text-[11px] text-red-400 hover:underline font-medium">VIEW ALERTS ›</button>
        </div>
      </div>

      {/* Inventory + Ledger */}
      <div className="grid grid-cols-5 gap-4">
        {/* Inventory Threshold Alerts */}
        <div className="col-span-3">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-base font-bold text-white">Inventory Threshold Alerts</h3>
            <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-[10px] text-red-400 font-semibold">REAL-TIME</span>
            <div className="flex-1" />
            <button className="text-[12px] text-cyan-400 hover:underline font-medium">MANAGE RULES</button>
          </div>

          <div className="space-y-3">
            {THRESHOLD_ALERTS.map((alert) => (
              <div key={alert.name} className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 hover:bg-[#111827] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                    {alert.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[14px] font-bold text-white">{alert.name}</h4>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider ${alert.statusColor}`}>{alert.status}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[12px] text-gray-400 mb-2">
                      Current: <span className="text-white font-semibold">{alert.current} units</span>
                      <span className="text-gray-600">·</span>
                      Threshold: {alert.threshold} units
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full ${alert.barColor} rounded-full transition-all`} style={{ width: alert.barWidth }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ledger Activity */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Ledger Activity</h3>
          </div>

          {/* Scrollable activity list */}
          <div className="space-y-1 relative overflow-y-auto max-h-[360px] pr-1 scrollbar-thin" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
            {/* Timeline line */}
            <div className="absolute left-[7px] top-3 bottom-3 w-px bg-white/5" />

            {visibleActivity.map((item, i) => (
              <div key={i} className="flex gap-4 py-3 relative group hover:bg-white/[0.02] rounded-lg px-1 transition-colors">
                {/* Dot */}
                <div className={`w-[15px] h-[15px] rounded-full ${item.color} flex-shrink-0 mt-0.5 relative z-10 ring-4 ring-[#0a0f0a]`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-[11px] text-gray-500 font-mono">{item.time}</span>
                    <span className="text-[10px] text-gray-600">— {item.type}</span>
                  </div>
                  <p className="text-[13px] font-bold text-white truncate">{item.title}</p>
                  <p className="text-[11px] text-gray-500 truncate font-mono">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Load more / Show less */}
          {!showAll && ALL_LEDGER_ACTIVITY.length > 4 && (
            <button
              onClick={() => setShowAll(true)}
              className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-[12px] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <ChevronDown size={14} />
              Show {ALL_LEDGER_ACTIVITY.length - 4} more entries
            </button>
          )}
          {showAll && (
            <button
              onClick={() => setShowAll(false)}
              className="w-full flex items-center justify-center gap-2 mt-3 py-2.5 bg-white/[0.03] border border-white/5 rounded-xl text-[12px] text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Show less
            </button>
          )}

          {/* View Full Explorer */}
          <button className="w-full flex items-center justify-center gap-2 mt-3 py-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[13px] text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-colors">
            <ExternalLink size={14} />
            View Full Explorer
          </button>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 transition-colors z-50">
        <Plus size={24} />
      </button>
    </DashboardLayout>
  );
}
