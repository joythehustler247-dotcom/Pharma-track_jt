import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ShieldCheck, ShieldAlert, ArrowLeft, ExternalLink,
  Factory, Truck, Building2, CheckCircle2,
  Clock, Package, AlertTriangle, Loader2,
  Copy, QrCode, Globe
} from 'lucide-react'
import { useVerify } from '../../hooks/useVerify'
import type { VerifyResult } from '../../lib/api'

export default function Result() {
  const { tokenId } = useParams<{ tokenId: string }>()
  const navigate    = useNavigate()
  const { verify, isLoading, error, result } = useVerify()
  const [copied, setCopied]    = useState(false)
  const [activeTab, setActiveTab] = useState<'journey' | 'details'>('journey')

  useEffect(() => {
    if (tokenId) verify(tokenId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId])

  const handleCopy = () => {
    if (tokenId) {
      navigator.clipboard.writeText(tokenId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="min-h-screen bg-[#060a0f] text-white">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {result && (
          <div className={`absolute top-0 left-0 right-0 h-[400px] blur-[120px] opacity-20 ${
            result.isGenuine
              ? 'bg-gradient-to-b from-emerald-500/40'
              : 'bg-gradient-to-b from-red-500/40'
          }`} />
        )}
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/5">
        <button
          onClick={() => navigate('/verify')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} />
          <span className="text-sm">Back to Verify</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
            <ShieldCheck size={16} className="text-[#060a0f]" />
          </div>
          <span className="font-bold text-white tracking-tight">Veri-Med</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Globe size={12} />
          <span>Polygon Amoy</span>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-10 pb-20">

        {/* ── LOADING ─────────────────────────────────────────────────────── */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Loader2 size={32} className="text-cyan-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Querying blockchain...</h2>
            <p className="text-gray-500 text-sm max-w-xs">
              Fetching the full supply chain record from Polygon Amoy
            </p>
            {/* Animated dots */}
            <div className="flex gap-1.5 mt-6">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-cyan-500/40 animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── ERROR ───────────────────────────────────────────────────────── */}
        {!isLoading && error && !result && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Token not found</h2>
            <p className="text-gray-400 mb-2">
              No record found for token ID:
            </p>
            <code className="text-sm text-gray-300 bg-white/5 px-3 py-1 rounded-lg font-mono break-all">
              {tokenId}
            </code>
            <p className="text-gray-500 text-sm mt-6 mb-8">
              This could mean the token hasn't been registered on-chain yet,
              or the ID was entered incorrectly.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/verify')}
                className="px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-colors"
              >
                Try again
              </button>
              <button className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-sm text-red-400 hover:bg-red-500/20 transition-colors flex items-center gap-2">
                <AlertTriangle size={14} />
                Report counterfeit
              </button>
            </div>
          </div>
        )}

        {/* ── RESULT ──────────────────────────────────────────────────────── */}
        {!isLoading && result && (
          <>
            {/* Status banner */}
            <div className={`relative overflow-hidden rounded-2xl border p-6 mb-8 ${
              result.isGenuine
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-red-500/30 bg-red-500/5'
            }`}>
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  result.isGenuine ? 'bg-emerald-500/15' : 'bg-red-500/15'
                }`}>
                  {result.isGenuine
                    ? <ShieldCheck size={30} className="text-emerald-400" />
                    : <ShieldAlert  size={30} className="text-red-400" />
                  }
                </div>
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                    result.isGenuine ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {result.isGenuine ? '✓ Verified Genuine' : '⚠ Authenticity Alert'}
                  </p>
                  <h2 className="text-2xl font-bold text-white">
                    {result.batch?.medicineName ?? 'Unknown Medicine'}
                  </h2>
                  <p className="text-gray-400 text-sm mt-0.5">
                    Batch #{result.batch?.batchNumber} · {result.tabletsSold ?? '—'} tablets
                  </p>
                </div>
              </div>

              {/* Decorative shimmer */}
              <div className={`absolute inset-0 opacity-10 bg-gradient-to-r ${
                result.isGenuine
                  ? 'from-emerald-400/0 via-emerald-400/20 to-emerald-400/0'
                  : 'from-red-400/0 via-red-400/20 to-red-400/0'
              } animate-pulse`} />
            </div>

            {/* Token ID */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border border-white/5 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <QrCode size={16} className="text-gray-500" />
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Sale Token ID</p>
                  <code className="text-sm text-white font-mono">{tokenId}</code>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1.5 transition-colors"
              >
                <Copy size={13} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl border border-white/5 mb-6">
              {(['journey', 'details'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    activeTab === tab
                      ? 'bg-white/10 text-white'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {tab === 'journey' ? 'Supply Chain Journey' : 'Batch Details'}
                </button>
              ))}
            </div>

            {/* ── Journey Tab ──────────────────────────────────────────── */}
            {activeTab === 'journey' && (
              <div className="space-y-3">
                {result.events && result.events.length > 0 ? (
                  result.events.map((event, i) => {
                    const isLast = i === result.events!.length - 1
                    const icon = event.eventType === 'MANUFACTURED'
                      ? <Factory size={18} />
                      : event.eventType === 'DISTRIBUTOR_RECEIVED'
                      ? <Truck size={18} />
                      : event.eventType === 'PHARMACY_RECEIVED'
                      ? <Building2 size={18} />
                      : <CheckCircle2 size={18} />

                    const colors = {
                      MANUFACTURED:        { dot: 'bg-cyan-500',    text: 'text-cyan-400',    border: 'border-cyan-500/20'    },
                      DISTRIBUTOR_RECEIVED: { dot: 'bg-purple-500', text: 'text-purple-400',  border: 'border-purple-500/20'  },
                      PHARMACY_RECEIVED:   { dot: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20' },
                      SOLD:                { dot: 'bg-yellow-500',  text: 'text-yellow-400',  border: 'border-yellow-500/20'  },
                    }[event.eventType] ?? { dot: 'bg-gray-500', text: 'text-gray-400', border: 'border-white/10' }

                    return (
                      <div key={i} className={`flex gap-4 p-4 rounded-2xl border bg-white/[0.02] ${colors.border}`}>
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-xl ${colors.dot} bg-opacity-20 flex items-center justify-center flex-shrink-0 ${colors.text}`}>
                            {icon}
                          </div>
                          {!isLast && <div className="w-px flex-1 bg-white/5 mt-2" />}
                        </div>
                        <div className="flex-1 pb-2">
                          <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${colors.text}`}>
                            {event.eventType.replace(/_/g, ' ')}
                          </p>
                          <p className="text-white font-semibold">{event.actorName}</p>
                          {event.actorCity && (
                            <p className="text-gray-500 text-sm">{event.actorCity}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Clock size={11} />
                              {new Date(event.timestamp).toLocaleString('en-IN', {
                                day: '2-digit', month: 'short', year: 'numeric',
                                hour: '2-digit', minute: '2-digit',
                              })}
                            </div>
                            {event.txHash && (
                              <a
                                href={`https://amoy.polygonscan.com/tx/${event.txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                              >
                                <ExternalLink size={11} />
                                View tx
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <ResultPlaceholderJourney />
                )}
              </div>
            )}

            {/* ── Details Tab ──────────────────────────────────────────── */}
            {activeTab === 'details' && result.batch && (
              <div className="space-y-3">
                <DetailRow label="Medicine Name"    value={result.batch.medicineName} />
                <DetailRow label="Batch Number"     value={result.batch.batchNumber} mono />
                <DetailRow
                  label="Manufacture Date"
                  value={new Date(result.batch.manufactureDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                />
                <DetailRow
                  label="Expiry Date"
                  value={new Date(result.batch.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                  highlight={new Date(result.batch.expiryDate) < new Date() ? 'danger' : undefined}
                />
                <DetailRow label="Total Strips"    value={String(result.batch.totalStrips)} />
                <DetailRow label="Your Tablets"    value={String(result.tabletsSold ?? '—')} />
                <DetailRow label="Status"          value={result.batch.status?.replace(/_/g, ' ')} />
                {result.batch.txHash && (
                  <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
                    <span className="text-sm text-gray-400">On-chain Tx</span>
                    <a
                      href={`https://amoy.polygonscan.com/tx/${result.batch.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
                    >
                      {result.batch.txHash.slice(0, 10)}...{result.batch.txHash.slice(-6)}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Report */}
            <div className="mt-10 flex items-center gap-3 p-4 bg-red-500/[0.04] border border-red-500/15 rounded-xl">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-sm text-gray-400">
                Does this look wrong?{' '}
                <button className="text-red-400 hover:text-red-300 font-medium transition-colors">
                  Report as counterfeit →
                </button>
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DetailRow({
  label, value, mono = false, highlight
}: {
  label: string
  value: string
  mono?: boolean
  highlight?: 'danger'
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-white/5 rounded-xl">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${
        highlight === 'danger' ? 'text-red-400' : 'text-white'
      } ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  )
}

function ResultPlaceholderJourney() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
        <Package size={28} className="text-gray-600" />
      </div>
      <p className="text-gray-400 font-medium mb-1">No supply chain events found</p>
      <p className="text-gray-600 text-sm">
        The batch may have been registered on-chain but events haven't synced yet.
      </p>
    </div>
  )
}
