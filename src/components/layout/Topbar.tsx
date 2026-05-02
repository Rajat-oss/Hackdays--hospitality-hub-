import { useState } from 'react'
import { Bell, Search, Menu, ChevronDown } from 'lucide-react'
import { useAuth } from '../../features/auth/AuthContext'
import styles from './DashboardLayout.module.css'

interface TopbarProps {
  sidebarCollapsed: boolean
  onMobileMenuToggle: () => void
}

export function Topbar({ onMobileMenuToggle }: TopbarProps) {
  const { profile } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  return (
    <header className={styles.topbar}>
      <button className={styles.mobileMenuBtn} onClick={onMobileMenuToggle}>
        <Menu size={20} />
      </button>

      <div className={styles.searchBox}>
        <Search size={18} className={styles.searchIcon} />
        <input type="text" placeholder="Search anything..." className={styles.searchInput} />
      </div>

      <div className={styles.topbarActions}>
        <button className={styles.actionBtn} title="Notifications">
          <Bell size={20} />
          <span className={styles.notificationBadge} />
        </button>

        <div className={styles.userProfile}>
          <button 
            className={styles.userTrigger}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className={styles.topAvatar}>
              {profile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className={styles.topUserInfo}>
              <div className={styles.topUserName}>{profile?.name ?? 'User'}</div>
              <div className={styles.topUserRole}>{profile?.role?.replace('_', ' ') ?? 'Admin'}</div>
            </div>
            <ChevronDown size={14} className={`${styles.chevron} ${showUserMenu ? styles.chevronOpen : ''}`} />
          </button>

          {showUserMenu && (
            <div className={styles.userDropdown}>
              <div className={styles.dropdownHeader}>
                <strong>{profile?.name}</strong>
                <span>{profile?.email}</span>
              </div>
              <div className={styles.dropdownDivider} />
              <button className={styles.dropdownItem}>Account Settings</button>
              <button className={styles.dropdownItem}>Help Center</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
