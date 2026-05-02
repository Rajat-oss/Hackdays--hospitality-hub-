import React, { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { useAuth } from '../../features/auth/AuthContext'
import { useHotelStore, useRestaurantStore } from '../../store'
import styles from './DashboardLayout.module.css'

export function DashboardLayout() {
  const { profile } = useAuth()
  const { fetchHotelData } = useHotelStore()
  const { fetchRestaurantData } = useRestaurantStore()
  
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('hh_sidebar_collapsed') === 'true'
  })
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  useEffect(() => {
    localStorage.setItem('hh_sidebar_collapsed', String(collapsed))
  }, [collapsed])

  // Initial Data Sync
  useEffect(() => {
    if (profile?.business_id) {
      if (profile.role === 'hotel_admin' || profile.role === 'hybrid_admin') {
        fetchHotelData(profile.business_id)
      }
      if (profile.role === 'restaurant_admin' || profile.role === 'hybrid_admin') {
        fetchRestaurantData(profile.business_id)
      }
    }
  }, [profile?.business_id, profile?.role, fetchHotelData, fetchRestaurantData])

  return (
    <div className={styles.layout}>
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div className={`${styles.sidebarWrapper} ${mobileSidebarOpen ? styles.sidebarWrapperOpen : ''}`}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </div>

      <div
        className={styles.main}
        style={{ marginLeft: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
      >
        <Topbar
          sidebarCollapsed={collapsed}
          onMobileMenuToggle={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
