import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/AuthContext'
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, DollarSign,
  UtensilsCrossed, Table2, ClipboardList, ChefHat, Receipt,
  BarChart3, Settings, Bell, LogOut, ChevronLeft, ChevronRight,
  Building2, Package, Menu, Globe
} from 'lucide-react'
import type { UserRole } from '../../types'
import styles from './Sidebar.module.css'

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
  roles: UserRole[]
  section?: string
}

const NAV_ITEMS: NavItem[] = [
  // Overview
  { label: 'Command Center', to: '/hybrid', icon: Building2, roles: ['hybrid_admin'], section: 'Overview' },
  // Hotel
  { label: 'Hotel Admin', to: '/hotel', icon: LayoutDashboard, roles: ['hotel_admin', 'hybrid_admin'], section: 'Hotel Operations' },
  { label: 'Rooms', to: '/hotel/rooms', icon: BedDouble, roles: ['hotel_admin', 'hybrid_admin'] },
  { label: 'Bookings', to: '/hotel/bookings', icon: CalendarCheck, roles: ['hotel_admin', 'hybrid_admin'] },
  { label: 'Guests', to: '/hotel/guests', icon: Users, roles: ['hotel_admin', 'hybrid_admin'] },
  { label: 'Finance', to: '/hotel/finance', icon: DollarSign, roles: ['hotel_admin', 'hybrid_admin'] },
  // Restaurant
  { label: 'Restaurant Admin', to: '/restaurant', icon: LayoutDashboard, roles: ['restaurant_admin', 'hybrid_admin'], section: 'Restaurant Dining' },
  { label: 'Tables', to: '/restaurant/tables', icon: Table2, roles: ['restaurant_admin', 'hybrid_admin'] },
  { label: 'Orders', to: '/restaurant/orders', icon: ClipboardList, roles: ['restaurant_admin', 'hybrid_admin'] },
  { label: 'Kitchen View', to: '/restaurant/kitchen', icon: ChefHat, roles: ['restaurant_admin', 'hybrid_admin'] },
  { label: 'Menu', to: '/restaurant/menu', icon: UtensilsCrossed, roles: ['restaurant_admin', 'hybrid_admin'] },
  { label: 'Billing', to: '/restaurant/billing', icon: Receipt, roles: ['restaurant_admin', 'hybrid_admin'] },
  // Shared
  { label: 'Public View', to: '/storefront', icon: Globe, roles: ['hotel_admin', 'restaurant_admin', 'hybrid_admin'], section: 'Public Presence' },
  { label: 'Analytics', to: '/analytics', icon: BarChart3, roles: ['hotel_admin', 'restaurant_admin', 'hybrid_admin'], section: 'Reports & Settings' },
  { label: 'Settings', to: '/settings', icon: Settings, roles: ['hotel_admin', 'restaurant_admin', 'hybrid_admin'] },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  const role = profile?.role ?? 'hotel_admin'
  const visibleItems = NAV_ITEMS.filter(item => item.roles.includes(role))

  let lastSection = ''

  async function handleSignOut() {
    await signOut()
    navigate('/login')
  }

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Logo */}
      <div className={styles.sidebarLogo}>
        {!collapsed && (
          <div className={styles.logoText}>
            <div className={styles.logoIcon}>H</div>
            <div>
              <div className={styles.logoName} style={{ fontSize: '14px', lineHeight: '1.2' }}>
                {profile?.business_name || 'HospitalityHub'}
              </div>
              <div className={styles.logoPlan}>{profile?.plan?.toUpperCase() ?? 'FREE'} PLAN</div>
            </div>
          </div>
        )}
        {collapsed && <div className={styles.logoIconOnly}>H</div>}

        <button onClick={onToggle} className={styles.collapseBtn} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Nav */}
      <nav className={`${styles.sidebarNav} sidebar-scroll`}>
        {visibleItems.map((item, i) => {
          const showSection = item.section && item.section !== lastSection
          if (item.section) lastSection = item.section

          return (
            <React.Fragment key={item.to}>
              {showSection && !collapsed && (
                <div className={styles.navSection}>{item.section}</div>
              )}
              {showSection && collapsed && <div className={styles.navSectionDivider} />}
              <NavLink
                to={item.to}
                end={item.to === '/hotel' || item.to === '/restaurant'}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className={styles.navIcon} />
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
                {!collapsed && <span className={styles.navActiveIndicator} />}
              </NavLink>
            </React.Fragment>
          )
        })}
      </nav>

      {/* User */}
      <div className={styles.sidebarUser}>
        {!collapsed && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {profile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className={styles.userMeta}>
              <div className={styles.userName}>{profile?.name ?? 'User'}</div>
              <div className={styles.userRole}>{role.replace('_', ' ')}</div>
            </div>
          </div>
        )}
        <button onClick={handleSignOut} className={styles.signOutBtn} title="Sign Out">
          <LogOut size={16} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
