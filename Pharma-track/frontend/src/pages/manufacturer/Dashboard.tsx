import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import BarChart from '../../components/ui/BarChart';
import { FileText, Zap, AlertTriangle, ShieldCheck, Download, History, Filter, ArrowUpDown, ExternalLink } from 'lucide-react';

const CHART_DATA = [
  { label: 'MON', values: [65, 45], colors: ['#0e7490', '#06b6d4'] },
  { label: 'TUE', values: [80, 55], colors: ['#0e7490', '#06b6d4'] },
  { label: 'WED', values: [95, 72], colors: ['#0e7490', '#06b6d4'] },
  { label: 'THU', values: [70, 50], colors: ['#0e7490', '#06b6d4'] },
  { label: 'FRI', values: [88, 60], colors: ['#0e7490', '#06b6d4'] },
  { label: 'SAT', values: [55, 40], colors: ['#0e7490', '#06b6d4'] },
  { label: 'SUN', values: [40, 30], colors: ['#0e7490', '#06b6d4'] },
];

const BATCHES = [
  { id: 'MFG-88291-LX', hash: '0x88d2...a4c1', expiry: 'Oct 12, 2025', status: 'ACTIVE', statusColor: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'MFG-77120-TY', hash: '0x4c31...8b32', expiry: 'Nov 24, 2025', status: 'IN-TRANSIT', statusColor: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'MFG-29931-RE', hash: '0xf1e9...22c9', expiry: 'Jan 02, 2024', status: 'EXPIRED', statusColor: 'bg-red-500/20 text-red-400' },
  { id: 'MFG-44510-PQ', hash: '0x9b7...77d1', expiry: 'Dec 15, 2026', status: 'ACTIVE', statusColor: 'bg-emerald-500/20 text-emerald-400' },
];

export default function ManufacturerDashboard() {
  return (
    <DashboardLayout role="manufacturer" searchPlaceholder="Search hash, batch, or destination...">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Manufacturer Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time cryptographic audit of pharmaceutical supply chain.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[13px] text-gray-300 hover:bg-white/10 transition-colors">
            <Download size={14} />
            Export Report
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[13px] text-cyan-400 hover:bg-cyan-500/20 transition-colors">
            <History size={14} />
            Chain History
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<FileText size={20} className="text-cyan-400" />}
          label="TOTAL BATCHES"
          value="1,284"
          badge="+12.4%"
          badgeColor="text-emerald-400"
          iconBg="bg-cyan-500/10"
        />
        <StatCard
          icon={<Zap size={20} className="text-yellow-400" />}
          label="ACTIVE BATCHES"
          value="842"
          badge="●"
          badgeColor="text-emerald-400"
          iconBg="bg-yellow-500/10"
        />
        <StatCard
          icon={<AlertTriangle size={20} className="text-red-400" />}
          label="EXPIRED"
          value="14"
          badge="-2.1%"
          badgeColor="text-red-400"
          iconBg="bg-red-500/10"
        />
        <StatCard
          icon={<ShieldCheck size={20} className="text-emerald-400" />}
          label="AUTHENTICITY SCORE"
          value="Node 04"
          badge="98.9%"
          badgeColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Distribution Efficiency */}
        <div className="col-span-2 bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Distribution Efficiency</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Global logistics performance index</p>
            </div>
            <div className="flex gap-1 bg-white/5 rounded-lg p-0.5">
              <button className="px-3 py-1.5 text-[11px] font-medium text-white bg-white/10 rounded-md">Weekly</button>
              <button className="px-3 py-1.5 text-[11px] font-medium text-gray-500 hover:text-gray-300 rounded-md">Monthly</button>
            </div>
          </div>
          <BarChart data={CHART_DATA} height={220} />
        </div>

        {/* Node Verification */}
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 flex flex-col">
          <h3 className="text-base font-bold text-white mb-1">Node Verification</h3>
          <p className="text-[11px] text-gray-500 mb-5">Real-time hash validation across network.</p>

          <div className="flex-1 flex flex-col justify-end">
            {/* Mainnet Consensus */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-semibold text-white tracking-wider">Mainnet Consensus</span>
                <span className="text-[11px] font-semibold text-emerald-400">Active</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: '92%' }} />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              <div>
                <p className="text-xl font-bold text-white">1.2ms</p>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider">LATENCY</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">256b</p>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider">BLOCK SIZE</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">14k</p>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider">TPS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Drug Batches */}
      <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-white">Recent Drug Batches</h3>
          <div className="flex gap-4">
            <button className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-300 transition-colors">
              <Filter size={13} /> Filter
            </button>
            <button className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-gray-300 transition-colors">
              <ArrowUpDown size={13} /> Sort
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">MANUFACTURER ID</th>
              <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">VERIFICATION HASH</th>
              <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">EXPIRY DATE</th>
              <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">STATUS</th>
              <th className="text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium pb-3">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {BATCHES.map((batch) => (
              <tr key={batch.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                <td className="py-4 text-[13px] text-white font-medium">{batch.id}</td>
                <td className="py-4 text-[13px] text-cyan-400 font-mono">{batch.hash}</td>
                <td className="py-4 text-[13px] text-gray-400">{batch.expiry}</td>
                <td className="py-4">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider ${batch.statusColor}`}>
                    {batch.status}
                  </span>
                </td>
                <td className="py-4">
                  <button className="text-gray-500 hover:text-gray-300 transition-colors">
                    <ExternalLink size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <span className="text-[12px] text-gray-500">Showing 4 of 1,284 entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-[12px] text-gray-500 hover:text-white bg-white/5 rounded-lg transition-colors">Previous</button>
            <button className="px-3 py-1.5 text-[12px] text-gray-500 hover:text-white bg-white/5 rounded-lg transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-emerald-500 hover:bg-emerald-400 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 text-2xl transition-colors z-50">
        +
      </button>
    </DashboardLayout>
  );
}