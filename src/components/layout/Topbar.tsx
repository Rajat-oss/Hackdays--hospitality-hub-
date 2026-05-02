import React, { useState } from 'react'
import { Bell, Search, Menu, X, ChevronDown } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import { useLocation } from 'react-router-dom'
import styles from './Topbar.module.css'

const ROUTE_TITLES: Record<string, string> = {
  '/hotel': 'Hotel Dashboard',
  '/hotel/rooms': 'Room Management',
  '/hotel/bookings': 'Bookings',
  '/hotel/guests': 'Guest Directory',
  '/hotel/finance': 'Finance & Revenue',
  '/restaurant': 'Restaurant Dashboard',
  '/restaurant/tables': 'Table Management',
  '/restaurant/orders': 'Order Management',
  '/restaurant/kitchen': 'Kitchen View',
  '/restaurant/menu': 'Menu Manager',
  '/restaurant/billing': 'Billing',
  '/analytics': 'Analytics',
  '/settings': 'Settings',
  '/hybrid': 'Hybrid Dashboard',
}

interface TopbarProps {
  sidebarCollapsed: boolean
  onMobileMenuToggle: () => void
}

export function Topbar({ sidebarCollapsed, onMobileMenuToggle }: TopbarProps) {
  const { profile } = useAuth()
  const location = useLocation()
  const [searchFocus, setSearchFocus] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const pageTitle = ROUTE_TITLES[location.pathname] ?? 'Dashboard'

  const MOCK_NOTIFS = [
    { id: 1, text: 'Room 204 — check-in due in 30 min', time: '2m ago', unread: true },
    { id: 2, text: 'Table 7 order marked ready', time: '8m ago', unread: true },
    { id: 3, text: 'Payment received: ₹8,400 (Room 301)', time: '1h ago', unread: false },
    { id: 4, text: 'Booking confirmed: Priya Sharma', time: '2h ago', unread: false },
  ]

  return (
    <header className={styles.topbar}>
      <div className={styles.topbarLeft}>
        <button className={styles.mobileMenuBtn} onClick={onMobileMenuToggle}>
          <Menu size={20} />
        </button>
        <h2 className={styles.pageTitle}>{pageTitle}</h2>
      </div>

      <div className={styles.topbarRight}>
        {/* Search */}
        <div className={`${styles.search} ${searchFocus ? styles.searchFocused : ''}`}>
          <Search size={14} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search rooms, guests, orders..."
            className={styles.searchInput}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
          />
        </div>

        {/* Notifications */}
        <div className={styles.notifWrapper}>
          <button
            className={styles.iconBtn}
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <Bell size={18} />
            <span className={styles.notifDot} />
          </button>

          {notifOpen && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>
                <span className={styles.notifTitle}>Notifications</span>
                <button className={styles.notifMarkAll}>Mark all read</button>
              </div>
              {MOCK_NOTIFS.map(n => (
                <div key={n.id} className={`${styles.notifItem} ${n.unread ? styles.notifItemUnread : ''}`}>
                  {n.unread && <span className={styles.notifItemDot} />}
                  <div>
                    <div className={styles.notifItemText}>{n.text}</div>
                    <div className={styles.notifItemTime}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className={styles.profileBtn}>
          <div className={styles.profileAvatar}>
            {profile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{profile?.name?.split(' ')[0] ?? 'User'}</span>
            <span className={styles.profileRole}>{profile?.role?.replace('_', ' ') ?? ''}</span>
          </div>
          <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
    </header>
  )
}
