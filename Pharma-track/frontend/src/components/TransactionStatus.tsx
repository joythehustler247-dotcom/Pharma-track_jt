import { Loader2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'
import { getExplorerTxUrl } from '../lib/contract'

interface TransactionStatusProps {
  isPending:    boolean
  isConfirming: boolean
  isConfirmed:  boolean
  error:        Error | null
  hash?:        string
  onReset?:     () => void
}

export default function TransactionStatus({
  isPending,
  isConfirming,
  isConfirmed,
  error,
  hash,
  onReset,
}: TransactionStatusProps) {
  if (!isPending && !isConfirming && !isConfirmed && !error) return null

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-5 mt-4">
      <div className="space-y-3">
        {/* Step 1: Waiting for MetaMask */}
        <Step
          active={isPending}
          complete={isConfirming || isConfirmed}
          label="Waiting for wallet approval..."
          icon={<Loader2 className="h-5 w-5 animate-spin text-emerald-400" />}
          completeIcon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        />

        {/* Step 2: Confirming on-chain */}
        <Step
          active={isConfirming}
          complete={isConfirmed}
          label={
            hash ? (
              <span className="flex items-center gap-2">
                Transaction submitted, waiting for confirmation...
                <a
                  href={getExplorerTxUrl(hash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1"
                >
                  View <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </span>
            ) : (
              'Transaction submitted...'
            )
          }
          icon={<Loader2 className="h-5 w-5 animate-spin text-yellow-400" />}
          completeIcon={<CheckCircle2 className="h-5 w-5 text-emerald-400" />}
        />

        {/* Step 3: Confirmed */}
        {isConfirmed && (
          <div className="flex items-center gap-3 text-emerald-400 font-medium">
            <CheckCircle2 className="h-5 w-5" />
            <span>Transaction confirmed!</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 text-red-400">
            <XCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Transaction failed</p>
              <p className="text-sm text-red-400/70 mt-1">
                {error.message?.includes('User rejected')
                  ? 'Transaction was rejected in wallet'
                  : error.message || 'Unknown error'}
              </p>
            </div>
          </div>
        )}

        {/* Reset button */}
        {(isConfirmed || error) && onReset && (
          <button
            onClick={onReset}
            className="mt-2 text-sm text-white/50 hover:text-white/80 transition"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Step sub-component ───────────────────────────────────────────────────────

function Step({
  active,
  complete,
  label,
  icon,
  completeIcon,
}: {
  active:       boolean
  complete:     boolean
  label:        React.ReactNode
  icon:         React.ReactNode
  completeIcon: React.ReactNode
}) {
  if (!active && !complete) {
    return (
      <div className="flex items-center gap-3 text-white/30">
        <div className="h-5 w-5 rounded-full border border-white/20" />
        <span className="text-sm">{typeof label === 'string' ? label : 'Waiting...'}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-3 ${complete ? 'text-emerald-400' : 'text-white'}`}>
      {complete ? completeIcon : icon}
      <span className="text-sm">{label}</span>
    </div>
  )
}
