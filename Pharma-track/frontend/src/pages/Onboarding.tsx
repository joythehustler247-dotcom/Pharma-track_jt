import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect, useSignMessage } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { authApi } from '../lib/api'
import { useAppStore } from '../store/useAppStore'
import toast from 'react-hot-toast'
import {
  Factory, Truck, Building2, ShieldCheck,
  Wallet, ChevronRight, Loader2, CheckCircle2, Globe, Lock
} from 'lucide-react'

type Role = 'MANUFACTURER' | 'DISTRIBUTOR' | 'PHARMACY'

interface RoleOption {
  id:          Role
  label:       string
  description: string
  icon:        JSX.Element
  gradient:    string
  border:      string
  iconBg:      string
}

const ROLES: RoleOption[] = [
  {
    id:          'MANUFACTURER',
    label:       'Manufacturer',
    description: 'Register & track medicine batches from production line to distribution',
    icon:        <Factory size={28} />,
    gradient:    'from-cyan-500/10 to-blue-500/10',
    border:      'border-cyan-500/40',
    iconBg:      'bg-cyan-500/10 text-cyan-400',
  },
  {
    id:          'DISTRIBUTOR',
    label:       'Distributor',
    description: 'Manage incoming shipments, verify authenticity, and forward to pharmacies',
    icon:        <Truck size={28} />,
    gradient:    'from-purple-500/10 to-violet-500/10',
    border:      'border-purple-500/40',
    iconBg:      'bg-purple-500/10 text-purple-400',
  },
  {
    id:          'PHARMACY',
    label:       'Pharmacy',
    description: 'Sell verified medicines, generate patient QR tokens, and track inventory',
    icon:        <Building2 size={28} />,
    gradient:    'from-emerald-500/10 to-teal-500/10',
    border:      'border-emerald-500/40',
    iconBg:      'bg-emerald-500/10 text-emerald-400',
  },
]

const SIGN_MESSAGE_PREFIX = 'Sign in to Veri-Med\nNonce: '
const ADMIN_SECRET = 'veri-med-admin-secret-change-me'

export default function Onboarding() {
  const navigate  = useNavigate()
  const { address, isConnected } = useAccount()
  const { connect }    = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const { setActor } = useAppStore()

  const [step, setStep]         = useState<1 | 2 | 3>(1)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState({
    name:          '',
    licenseNumber: '',
    city:          '',
  })

  const handleConnect = () => {
    connect({ connector: injected() })
  }

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setStep(2)
  }

  const handleFormNext = () => {
    if (!form.name.trim()) {
      toast.error('Please enter your organisation name')
      return
    }
    setStep(3)
  }

  const handleRegisterAndSignIn = async () => {
    if (!address || !selectedRole) return
    setIsLoading(true)

    try {
      // Step 1: Register actor via admin endpoint
      const registerRes = await fetch(`${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000'}/api/admin/register-actor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          role:          selectedRole,
          name:          form.name,
          licenseNumber: form.licenseNumber || undefined,
          city:          form.city || undefined,
          adminSecret:   ADMIN_SECRET,
        }),
      })

      const registerData = await registerRes.json() as { success: boolean; message: string }

      // 409 = already registered (wallet already exists), that's fine — proceed to sign-in
      if (!registerRes.ok && registerRes.status !== 409) {
        throw new Error(registerData.message || 'Registration failed')
      }

      // Step 2: Get nonce
      const { nonce } = await authApi.getNonce(address)

      // Step 3: Sign with MetaMask
      const message   = `${SIGN_MESSAGE_PREFIX}${nonce}`
      const signature = await signMessageAsync({ account: address, message })

      // Step 4: Verify & get JWT
      const { actor, token } = await authApi.verifySignature(address, signature)
      setActor(actor, token)

      toast.success(`Welcome to Veri-Med, ${actor.name}!`)

      // Redirect to role dashboard
      switch (actor.role) {
        case 'MANUFACTURER': navigate('/manufacturer'); break
        case 'DISTRIBUTOR':  navigate('/distributor');  break
        case 'PHARMACY':     navigate('/pharmacy');      break
        default:             navigate('/')
      }
    } catch (err) {
      const msg = (err as Error).message || 'Something went wrong'
      if (msg.toLowerCase().includes('user rejected')) {
        toast.error('Signature rejected in wallet')
      } else {
        toast.error(msg)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const selectedRoleData = ROLES.find(r => r.id === selectedRole)

  return (
    <div className="min-h-screen bg-[#060a0f] text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
            <ShieldCheck size={16} className="text-[#060a0f]" />
          </div>
          <span className="font-bold text-white tracking-tight">Veri-Med</span>
        </div>

        {isConnected && address ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-gray-300 font-mono">
                {address.slice(0, 6)}...{address.slice(-4)}
              </span>
            </div>
            <button
              onClick={() => disconnect()}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : null}
      </header>

      {/* Progress bar */}
      <div className="w-full h-[2px] bg-white/5">
        <div
          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
          style={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
        />
      </div>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">

          {/* ── STEP 1: Connect Wallet ─────────────────────────────────────── */}
          {!isConnected && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-6">
                <Globe size={12} />
                Polygon Amoy Testnet
              </div>
              <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">
                Connect your wallet
              </h1>
              <p className="text-gray-400 mb-10 max-w-md mx-auto">
                Veri-Med uses your wallet address as your immutable identity on the blockchain supply chain.
              </p>
              <button
                onClick={handleConnect}
                className="group flex items-center gap-3 mx-auto px-8 py-4 bg-white text-[#060a0f] rounded-2xl font-bold text-[15px] hover:bg-gray-100 transition-all shadow-xl shadow-white/10"
              >
                <Wallet size={20} />
                Connect MetaMask
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="mt-6 text-xs text-gray-600">
                <Lock size={11} className="inline mr-1" />
                Your private key never leaves your device. We only use your public address.
              </p>
            </div>
          )}

          {/* ── STEP 1: Select Role ────────────────────────────────────────── */}
          {isConnected && step === 1 && (
            <div>
              <div className="mb-10">
                <p className="text-cyan-400 text-sm font-medium mb-2">Step 1 of 3</p>
                <h1 className="text-3xl font-bold text-white tracking-tight">
                  What is your role in the supply chain?
                </h1>
                <p className="text-gray-400 mt-2">
                  Your role determines your dashboard, permissions, and on-chain capabilities.
                </p>
              </div>

              <div className="space-y-3">
                {ROLES.map(role => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full p-5 rounded-2xl border bg-gradient-to-r ${role.gradient} ${role.border} hover:border-opacity-100 transition-all group text-left flex items-center gap-5`}
                  >
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${role.iconBg}`}>
                      {role.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-[17px] mb-0.5">{role.label}</h3>
                      <p className="text-gray-400 text-sm">{role.description}</p>
                    </div>
                    <ChevronRight size={20} className="text-gray-600 group-hover:text-gray-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── STEP 2: Organisation Details ──────────────────────────────── */}
          {isConnected && step === 2 && selectedRoleData && (
            <div>
              <button
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-300 text-sm mb-8 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>

              <p className="text-cyan-400 text-sm font-medium mb-2">Step 2 of 3</p>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
                Organisation details
              </h1>
              <p className="text-gray-400 mb-8">
                This information will be recorded on-chain and visible to your supply chain partners.
              </p>

              <div className={`p-4 rounded-xl border bg-gradient-to-r ${selectedRoleData.gradient} ${selectedRoleData.border} flex items-center gap-3 mb-8`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedRoleData.iconBg}`}>
                  {selectedRoleData.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-400">Selected role</p>
                  <p className="text-white font-semibold">{selectedRoleData.label}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    Organisation Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={
                      selectedRole === 'MANUFACTURER' ? 'e.g. Cipla Ltd' :
                      selectedRole === 'DISTRIBUTOR'  ? 'e.g. MedStock India' :
                      'e.g. Kumar Medicals'
                    }
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    License Number <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    value={form.licenseNumber}
                    onChange={e => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
                    placeholder="e.g. MFR-PUN-2024-001"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    City <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    placeholder="e.g. Mumbai"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
                  />
                </div>

                <button
                  onClick={handleFormNext}
                  className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-[#060a0f] font-bold rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
                >
                  Continue
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Confirm & Sign ─────────────────────────────────────── */}
          {isConnected && step === 3 && selectedRoleData && (
            <div>
              <button
                onClick={() => setStep(2)}
                className="text-gray-500 hover:text-gray-300 text-sm mb-8 flex items-center gap-1 transition-colors"
              >
                ← Back
              </button>

              <p className="text-cyan-400 text-sm font-medium mb-2">Step 3 of 3</p>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-1">
                Confirm & sign in
              </h1>
              <p className="text-gray-400 mb-8">
                Review your details, then sign the message in MetaMask to authenticate.
              </p>

              {/* Summary card */}
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Wallet</span>
                  <span className="font-mono text-sm text-white">{address?.slice(0, 8)}...{address?.slice(-6)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Role</span>
                  <span className="text-white font-medium">{selectedRoleData.label}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Organisation</span>
                  <span className="text-white font-medium">{form.name}</span>
                </div>
                {form.city && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">City</span>
                    <span className="text-white">{form.city}</span>
                  </div>
                )}
                {form.licenseNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">License</span>
                    <span className="text-white font-mono text-sm">{form.licenseNumber}</span>
                  </div>
                )}
              </div>

              {/* Info box */}
              <div className="flex items-start gap-3 bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4 mb-6">
                <ShieldCheck size={18} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                <p className="text-cyan-300/80 text-sm">
                  MetaMask will ask you to sign a message. This is a free, gasless operation — it only proves ownership of your wallet.
                </p>
              </div>

              <button
                onClick={handleRegisterAndSignIn}
                disabled={isLoading}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 disabled:cursor-not-allowed text-[#060a0f] font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Registering & signing in...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Sign in with MetaMask
                  </>
                )}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}
