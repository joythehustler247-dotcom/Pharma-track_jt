import { type ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAppStore, useIsAuthenticated } from '../store/useAppStore'
import type { ActorRole } from '../lib/api'

interface RoleGuardProps {
  requiredRole: ActorRole | ActorRole[]
  children: ReactNode
}

export default function RoleGuard({ requiredRole, children }: RoleGuardProps) {
  const location      = useLocation()
  const isAuthenticated = useIsAuthenticated()
  const role          = useAppStore((s) => s.role)

  // Not authenticated → send to onboarding, preserve attempted path
  if (!isAuthenticated) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />
  }

  // Wrong role → send back to home
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
