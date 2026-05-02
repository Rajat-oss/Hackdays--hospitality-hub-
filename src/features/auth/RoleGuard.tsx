import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import type { UserRole } from '../../types'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
}

export function RoleGuard({ children, allowedRoles, redirectTo = '/login' }: RoleGuardProps) {
  const { isAuthenticated, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-lg" />
        <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    // Redirect to correct dashboard based on role
    const roleRoutes: Record<UserRole, string> = {
      hotel_admin: '/hotel',
      restaurant_admin: '/restaurant',
      hybrid_admin: '/hybrid',
    }
    return <Navigate to={roleRoutes[profile.role]} replace />
  }

  return <>{children}</>
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  if (isAuthenticated && profile) {
    const roleRoutes: Record<UserRole, string> = {
      hotel_admin: '/hotel',
      restaurant_admin: '/restaurant',
      hybrid_admin: '/hybrid',
    }
    return <Navigate to={roleRoutes[profile.role]} replace />
  }

  return <>{children}</>
}
