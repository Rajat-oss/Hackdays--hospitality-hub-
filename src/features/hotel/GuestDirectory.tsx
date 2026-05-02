import React, { useState } from 'react'
import { useHotelStore } from '../../store'
import { Search, Phone, Mail, MapPin, Star } from 'lucide-react'
import styles from './Hotel.module.css'

export default function GuestDirectory() {
  const { guests, bookings } = useHotelStore()
  const [search, setSearch] = useState('')

  const filtered = guests.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.phone.includes(search)
  )

  function guestBookings(guestId: string) {
    return bookings.filter(b => b.guest_id === guestId)
  }

  function lastStay(guestId: string) {
    const gb = guestBookings(guestId)
    if (!gb.length) return '—'
    return gb[gb.length - 1].check_in
  }

  function totalSpent(guestId: string) {
    return guestBookings(guestId).reduce((s, b) => s + b.paid_amount, 0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Guest Directory</h1>
          <p className="page-subtitle">{guests.length} registered guests · {guests.filter(g => g.visit_count > 1).length} repeat guests</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '8px 14px', width: '240px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Name or phone..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }} />
        </div>
      </div>

      <div className={styles.guestGrid}>
        {filtered.map(g => (
          <div key={g.id} className={styles.guestCard}>
            <div className={styles.guestAvatar}>{g.name.charAt(0).toUpperCase()}</div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
              <div>
                <div className={styles.guestName}>{g.name}</div>
                <div className={styles.guestPhone}>{g.phone}</div>
              </div>
              {g.visit_count > 2 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#d4a017', fontWeight: 600, background: 'rgba(212,160,23,0.12)', padding: '3px 8px', borderRadius: '100px', border: '1px solid rgba(212,160,23,0.2)' }}>
                  <Star size={10} fill="#d4a017" /> VIP
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
              {g.email && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}><Mail size={11} /> {g.email}</div>}
              {g.address && <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}><MapPin size={11} /> {g.address}</div>}
              {g.id_type && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{g.id_type}: {g.id_number}</div>}
            </div>

            <div className={styles.guestMeta}>
              <div className={styles.guestMetaItem}>
                <div className={styles.guestMetaLabel}>Visits</div>
                <div className={styles.guestMetaValue}>{g.visit_count}</div>
              </div>
              <div className={styles.guestMetaItem}>
                <div className={styles.guestMetaLabel}>Total Spent</div>
                <div className={styles.guestMetaValue}>₹{totalSpent(g.id).toLocaleString()}</div>
              </div>
              <div className={styles.guestMetaItem}>
                <div className={styles.guestMetaLabel}>Last Stay</div>
                <div className={styles.guestMetaValue}>{lastStay(g.id)}</div>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            No guests found.
          </div>
        )}
      </div>
    </div>
  )
}
