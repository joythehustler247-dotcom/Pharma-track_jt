import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import BarChart from '../../components/ui/BarChart';
import {
  Truck, Wifi, CheckCircle2, Thermometer,
  ShieldCheck, Route, AlertTriangle,
  ZoomIn, ZoomOut, Layers, Package, CheckCircle
} from 'lucide-react';

const ROUTE_CHART = [
  { label: 'W1', values: [55], colors: ['#0e7490'] },
  { label: 'W2', values: [70], colors: ['#0e7490'] },
  { label: 'W3', values: [60], colors: ['#06b6d4'] },
  { label: 'W4', values: [85], colors: ['#06b6d4'] },
  { label: 'W5', values: [75], colors: ['#06b6d4'] },
];

const INCOMING_BATCHES = [
  {
    id: 'B-99821-INS',
    drug: 'INSULIN ANALOG-7',
    status: 'IN TRANSIT',
    statusColor: 'bg-cyan-500/20 text-cyan-400',
    eta: 'Today, 18:45',
    avatars: 4,
  },
  {
    id: 'V-4420-COV',
    drug: 'MRNA SPKE V2',
    status: 'AT CUSTOMS',
    statusColor: 'bg-purple-500/20 text-purple-400',
    eta: 'Tomorrow, 06:12',
    avatars: 0,
  },
  {
    id: 'M-1102-ABX',
    drug: 'BROAD SPECTRUM ANTIBIOTIC',
    status: 'IN TRANSIT',
    statusColor: 'bg-cyan-500/20 text-cyan-400',
    eta: '24 Oct, 09:00',
    verified: true,
  },
  {
    id: 'E-772-BLD',
    drug: 'PLASMA UNIT - RH NEG',
    status: 'CRITICAL DELAY',
    statusColor: 'bg-red-500/20 text-red-400',
    eta: 'CALCULATING...',
    critical: true,
  },
];

export default function DistributorDashboard() {
  return (
    <DashboardLayout role="distributor" searchPlaceholder="Search ledger or tracking ID...">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Logistics Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Global node distribution and network health status.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-[13px] text-cyan-400 hover:bg-cyan-500/20 transition-colors">
            <ShieldCheck size={14} />
            Verify Shipment
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[13px] text-gray-300 hover:bg-white/10 transition-colors">
            <Route size={14} />
            Update Route
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-[13px] text-red-400 hover:bg-red-500/20 transition-colors">
            <AlertTriangle size={14} />
            Alert Node
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<Truck size={20} className="text-cyan-400" />}
          label="Active Shipments"
          value="1,284"
          badge="+12% vs LY"
          badgeColor="text-emerald-400"
          iconBg="bg-cyan-500/10"
        />
        <StatCard
          icon={<Wifi size={20} className="text-cyan-400" />}
          label="Batches In Transit"
          value="412"
          badge="Stable"
          badgeColor="text-gray-400"
          iconBg="bg-cyan-500/10"
        />
        <StatCard
          icon={<CheckCircle2 size={20} className="text-emerald-400" />}
          label="Completed (24h)"
          value="89"
          badge="Peak High"
          badgeColor="text-emerald-400"
          iconBg="bg-emerald-500/10"
        />
        <StatCard
          icon={<Thermometer size={20} className="text-red-400" />}
          label="Temp Anomalies"
          value="03"
          badge="CRITICAL"
          badgeColor="text-red-400"
          iconBg="bg-red-500/10"
        />
      </div>

      {/* Map + Incoming */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Network Map */}
        <div className="col-span-2 bg-[#111827]/80 border border-white/5 rounded-2xl p-5 relative overflow-hidden" style={{ minHeight: 320 }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">NETWORK VIEW</p>
              <h3 className="text-base font-bold text-white">Active Network Paths</h3>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <ZoomIn size={14} />
              </button>
              <button className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <ZoomOut size={14} />
              </button>
              <button className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                <Layers size={14} />
              </button>
            </div>
          </div>

          {/* Stylized Map */}
          <div className="relative h-[220px] flex items-center justify-center">
            <svg viewBox="0 0 800 300" className="w-full h-full opacity-30">
              {/* World map outline approximation */}
              <ellipse cx="400" cy="150" rx="370" ry="130" fill="none" stroke="#1e3a5f" strokeWidth="0.5" />
              <ellipse cx="400" cy="150" rx="300" ry="100" fill="none" stroke="#1e3a5f" strokeWidth="0.5" />
              <ellipse cx="400" cy="150" rx="200" ry="70" fill="none" stroke="#1e3a5f" strokeWidth="0.5" />
              {/* Grid lines */}
              <line x1="50" y1="150" x2="750" y2="150" stroke="#1e3a5f" strokeWidth="0.5" />
              <line x1="400" y1="30" x2="400" y2="270" stroke="#1e3a5f" strokeWidth="0.5" />
            </svg>
            {/* Animated route dots */}
            <svg viewBox="0 0 800 300" className="absolute inset-0 w-full h-full">
              <path d="M150,180 Q300,80 500,120 T700,100" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6" />
              <path d="M100,200 Q250,150 400,180 T650,140" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.4" />
              <circle cx="150" cy="180" r="4" fill="#06b6d4" />
              <circle cx="500" cy="120" r="4" fill="#06b6d4" />
              <circle cx="700" cy="100" r="4" fill="#06b6d4" />
              <circle cx="400" cy="180" r="3" fill="#10b981" />
            </svg>

            {/* Path labels */}
            <div className="absolute bottom-4 left-4">
              <div className="bg-[#0d1b2a] border border-white/10 rounded-lg px-3 py-2">
                <div className="flex items-center gap-8 mb-1">
                  <span className="text-[10px] text-gray-500">PATH A-20</span>
                  <span className="text-[10px] font-semibold text-emerald-400">ACTIVE</span>
                </div>
                <p className="text-[13px] font-bold text-white">SEA-LON Express</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex-1">
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '65%' }} />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-gray-500">3,200km Traversed</span>
                  <span className="text-[10px] text-gray-500">ETA: 14:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Incoming Batches */}
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5 overflow-y-auto" style={{ maxHeight: 420 }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Incoming Batches</h3>
            <button className="text-[12px] text-cyan-400 hover:underline">View All</button>
          </div>

          <div className="space-y-3">
            {INCOMING_BATCHES.map((batch) => (
              <div key={batch.id} className="bg-white/[0.03] border border-white/5 rounded-xl p-3.5 hover:bg-white/[0.05] transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <Package size={14} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-white">{batch.id}</p>
                      <p className="text-[10px] text-gray-500">{batch.drug}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider ${batch.statusColor}`}>
                    {batch.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-500 uppercase">ETA</p>
                    <p className={`text-[12px] font-medium ${batch.critical ? 'text-purple-400' : 'text-white'}`}>{batch.eta}</p>
                  </div>
                  {batch.verified && (
                    <div className="flex items-center gap-1 text-[10px] text-gray-500">
                      <CheckCircle size={12} className="text-cyan-400" />
                      Ledger Verified
                    </div>
                  )}
                  {batch.critical && (
                    <AlertTriangle size={16} className="text-yellow-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Route Efficiency */}
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Route Efficiency</h3>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Route size={14} className="text-cyan-400" />
            </div>
          </div>
          <BarChart data={ROUTE_CHART} height={140} />
          <p className="text-[11px] text-gray-500 mt-4">Global distribution speed increased by 14.2% since network node expansion.</p>
        </div>

        {/* Smart Contract Protocol */}
        <div className="bg-[#111827]/80 border border-white/5 rounded-2xl p-5">
          <h3 className="text-base font-bold text-white mb-1">Smart Contract Protocol</h3>
          <p className="text-[12px] text-gray-500 mb-4">Automation of customs clearance for verified pharmaceutical pathways in the Euro-Zone.</p>
          <div className="flex gap-6 mb-4">
            <div>
              <p className="text-2xl font-bold text-cyan-400">482</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">CONTRACTS EXECUTED</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">0.02s</p>
              <p className="text-[9px] text-gray-500 uppercase tracking-wider">AVG. LATENCY</p>
            </div>
          </div>

          {/* Animated checkmark */}
          <div className="flex justify-end">
            <div className="w-20 h-20 rounded-full border-2 border-emerald-500/30 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-500 animate-spin" style={{ animationDuration: '3s' }} />
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
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
