import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  QrCode, Search, ShieldCheck, ArrowRight,
  ScanLine, AlertTriangle, Globe, Lock, Loader2,
  CheckCircle2, XCircle, Info
} from 'lucide-react'

const RECENT_SCANS = [
  { id: 'VM-8A2F9C1D3B7E', time: '2 min ago', status: 'GENUINE' },
  { id: 'VM-3C1E8A7D5B2F', time: '1 hr ago',  status: 'GENUINE' },
  { id: 'VM-7F4B2D9A1C3E', time: '3 hrs ago', status: 'FLAGGED' },
]

export default function Scanner() {
  const navigate = useNavigate()
  const [tokenId, setTokenId]  = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]      = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleVerify = async (id?: string) => {
    const targetId = (id ?? tokenId).trim()
    if (!targetId) {
      inputRef.current?.focus()
      return
    }
    setIsLoading(true)
    setError(null)
    // Simulate brief network delay for UX polish
    await new Promise(r => setTimeout(r, 600))
    setIsLoading(false)
    navigate(`/verify/${encodeURIComponent(targetId)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleVerify()
  }

  return (
    <div className="min-h-screen bg-[#060a0f] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[900px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[300px] bg-emerald-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
            <ShieldCheck size={16} className="text-[#060a0f]" />
          </div>
          <span className="font-bold text-white tracking-tight">Veri-Med</span>
        </button>

        <div className="flex items-center gap-5 text-sm text-gray-500">
          <div className="flex items-center gap-1.5">
            <Globe size={13} />
            <span>Polygon Amoy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Lock size={13} />
            <span>On-chain verified</span>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-16 pb-20">

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Live Blockchain Verification
          </div>

          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent">
            Verify Medicine
          </h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
            Enter the sale token ID from your QR code to instantly verify authenticity on-chain.
          </p>
        </div>

        {/* Search box */}
        <div className="mb-4">
          <div className={`relative flex items-center rounded-2xl border transition-all duration-200 ${
            error
              ? 'border-red-500/50 bg-red-500/5'
              : 'border-white/10 bg-white/[0.04] focus-within:border-cyan-500/40 focus-within:bg-white/[0.06]'
          }`}>
            <div className="absolute left-5 text-gray-500 flex-shrink-0">
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-cyan-400" />
              ) : (
                <QrCode size={18} />
              )}
            </div>
            <input
              ref={inputRef}
              value={tokenId}
              onChange={e => { setTokenId(e.target.value); setError(null) }}
              onKeyDown={handleKeyDown}
              placeholder="Enter Token ID — e.g. VM-8A2F9C1D3B7E"
              className="flex-1 bg-transparent pl-12 pr-4 py-4 text-white placeholder-gray-500 text-[15px] focus:outline-none"
              autoFocus
            />
            <button
              onClick={() => handleVerify()}
              disabled={isLoading}
              className="flex items-center gap-2 mr-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-500/50 text-[#060a0f] font-bold text-sm rounded-xl transition-colors flex-shrink-0"
            >
              Verify
              <ArrowRight size={15} />
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 mt-2 px-1 text-red-400 text-sm">
              <XCircle size={14} />
              {error}
            </div>
          )}
        </div>

        {/* OR divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-gray-600 font-medium">OR</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Search by text input */}
        <div className="relative flex items-center rounded-xl border border-white/5 bg-white/[0.02] mb-12">
          <Search size={15} className="absolute left-4 text-gray-600" />
          <input
            placeholder="Search by batch number or medicine name..."
            className="flex-1 bg-transparent pl-11 pr-4 py-3.5 text-white placeholder-gray-600 text-sm focus:outline-none"
          />
        </div>

        {/* How it works */}
        <div className="mb-12">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">How verification works</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                icon: <QrCode size={20} className="text-cyan-400" />,
                bg:   'bg-cyan-500/10',
                step: '01',
                title: 'Scan QR Code',
                desc:  'Each medicine pack or blister tablet strip has a unique QR code',
              },
              {
                icon: <Search size={20} className="text-purple-400" />,
                bg:   'bg-purple-500/10',
                step: '02',
                title: 'On-chain Lookup',
                desc:  'Token ID is queried against the Polygon blockchain in real time',
              },
              {
                icon: <CheckCircle2 size={20} className="text-emerald-400" />,
                bg:   'bg-emerald-500/10',
                step: '03',
                title: 'Instant Result',
                desc:  'Full supply chain history — manufacturer to pharmacy — is displayed',
              },
            ].map(item => (
              <div key={item.step} className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <p className="text-[10px] font-bold text-gray-600 tracking-widest mb-1">STEP {item.step}</p>
                <h3 className="text-sm font-bold text-white mb-1.5">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent scans */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Recent Verifications</p>
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
              <Info size={11} />
              Stored locally only
            </div>
          </div>
          <div className="space-y-2">
            {RECENT_SCANS.map(scan => (
              <button
                key={scan.id}
                onClick={() => handleVerify(scan.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.05] hover:border-white/10 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <ScanLine size={14} className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                  <span className="font-mono text-sm text-white">{scan.id}</span>
                  <span className="text-xs text-gray-600">{scan.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    scan.status === 'GENUINE'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-red-500/10 text-red-400'
                  }`}>
                    {scan.status}
                  </span>
                  <ArrowRight size={14} className="text-gray-600 group-hover:text-gray-300 group-hover:translate-x-0.5 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Report counterfeit */}
        <div className="mt-12 flex items-center gap-3 p-4 bg-red-500/[0.04] border border-red-500/15 rounded-xl">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-gray-400">
            Suspect counterfeit medicine?{' '}
            <button className="text-red-400 hover:text-red-300 font-medium transition-colors">
              Report it here →
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
