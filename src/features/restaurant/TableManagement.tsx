import React, { useState } from 'react'
import { useRestaurantStore } from '../../store'
import { Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { TableStatus } from '../../types'
import styles from './Restaurant.module.css'

const STATUS_CYCLE: TableStatus[] = ['available', 'occupied', 'reserved']

export default function TableManagement() {
  const { tables, addTable, updateTable } = useRestaurantStore()
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<TableStatus | 'all'>('all')
  const [form, setForm] = useState({ number: '', capacity: '4', location: 'Indoor', status: 'available' })

  const filtered = filterStatus === 'all' ? tables : tables.filter(t => t.status === filterStatus)

  function cycleStatus(id: string, current: TableStatus) {
    const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
    updateTable(id, { status: next })
    toast.success(`Table status → ${next}`)
  }

  function handleAdd() {
    if (!form.number) return toast.error('Enter table number')
    addTable({ id: `tbl${Date.now()}`, business_id: 'biz-rest-001', number: form.number, capacity: +form.capacity, location: form.location, status: form.status as TableStatus, created_at: new Date().toISOString() })
    toast.success('Table added')
    setShowModal(false)
  }

  const tableStyleMap: Record<TableStatus, string> = {
    available: styles.tableCardAvailable,
    occupied: styles.tableCardOccupied,
    reserved: styles.tableCardReserved,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Table Management</h1>
          <p className="page-subtitle">{tables.length} tables · {tables.filter(t => t.status === 'available').length} available · {tables.filter(t => t.status === 'occupied').length} occupied</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Add Table</button>
      </div>

      {/* Legend & filters */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {(['all', 'available', 'occupied', 'reserved'] as const).map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}>
            {s === 'all' ? 'All Tables' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.tableFloor}>
        {filtered.map(t => (
          <div key={t.id} className={`${styles.tableCard} ${tableStyleMap[t.status]}`}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>{t.location}</div>
            <div className={styles.tableNumber}>{t.number}</div>
            <div className={styles.tableCapacity}>👤 {t.capacity} seats</div>
            <span className={`badge badge-${t.status}`}>{t.status}</span>
            <div className={styles.tableActions}>
              <button onClick={() => cycleStatus(t.id, t.status)} className="btn btn-ghost btn-sm" style={{ fontSize: '11px', width: '100%', justifyContent: 'center' }}>
                Change Status
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', padding: '12px 16px', background: 'var(--color-bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginRight: '8px' }}>Legend:</span>
        {[{ color: 'rgba(76,175,130,0.3)', label: 'Available' }, { color: 'rgba(192,57,43,0.3)', label: 'Occupied' }, { color: 'rgba(212,160,23,0.3)', label: 'Reserved' }].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: l.color }} />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Table</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Table Number *</label>
                <input className="form-input" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder="e.g. 9" />
              </div>
              <div className="form-group">
                <label className="form-label">Seating Capacity</label>
                <input type="number" className="form-input" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <select className="form-select" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))}>
                  <option>Indoor</option><option>Outdoor</option><option>Terrace</option><option>Private</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={handleAdd} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Add Table</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
