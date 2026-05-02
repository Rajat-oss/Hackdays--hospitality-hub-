import React, { useState } from 'react'
import { useHotelStore } from '../../store'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Room, RoomStatus } from '../../types'
import styles from './Hotel.module.css'

const STATUS_FILTERS: { label: string; value: RoomStatus | 'all' }[] = [
  { label: 'All Rooms', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Booked', value: 'booked' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Maintenance', value: 'maintenance' },
]

export default function RoomManagement() {
  const { rooms, addRoom, updateRoom, deleteRoom } = useHotelStore()
  const [filter, setFilter] = useState<RoomStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editRoom, setEditRoom] = useState<Room | null>(null)
  const [form, setForm] = useState({ number: '', type: 'single', floor: '1', capacity: '1', price_per_night: '', amenities: '', status: 'available' })

  const filtered = rooms.filter(r => {
    if (filter !== 'all' && r.status !== filter) return false
    if (search && !r.number.includes(search) && !r.type.includes(search)) return false
    return true
  })

  function openAdd() { setEditRoom(null); setForm({ number: '', type: 'single', floor: '1', capacity: '1', price_per_night: '', amenities: '', status: 'available' }); setShowModal(true) }
  function openEdit(r: Room) { setEditRoom(r); setForm({ number: r.number, type: r.type, floor: String(r.floor), capacity: String(r.capacity), price_per_night: String(r.price_per_night), amenities: r.amenities.join(', '), status: r.status }); setShowModal(true) }

  function handleSave() {
    if (!form.number || !form.price_per_night) return toast.error('Fill all required fields')
    if (editRoom) {
      updateRoom(editRoom.id, { number: form.number, type: form.type as any, floor: +form.floor, capacity: +form.capacity, price_per_night: +form.price_per_night, amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean), status: form.status as any })
      toast.success('Room updated')
    } else {
      addRoom({ id: `r${Date.now()}`, business_id: 'biz-hotel-001', number: form.number, type: form.type as any, floor: +form.floor, capacity: +form.capacity, price_per_night: +form.price_per_night, amenities: form.amenities.split(',').map(a => a.trim()).filter(Boolean), status: form.status as any, created_at: new Date().toISOString() })
      toast.success('Room added')
    }
    setShowModal(false)
  }

  function handleDelete(id: string) {
    deleteRoom(id)
    toast.success('Room removed')
  }

  function cycleStatus(room: Room) {
    const cycle: RoomStatus[] = ['available', 'cleaning', 'maintenance', 'booked']
    const next = cycle[(cycle.indexOf(room.status) + 1) % cycle.length]
    updateRoom(room.id, { status: next })
    toast.success(`Room ${room.number} → ${next}`)
  }

  return (
    <div className={styles.roomManagePage}>
      {/* Header */}
      <div className={styles.pageActions}>
        <div>
          <h1 className="page-title">Rooms</h1>
          <p className="page-subtitle">{rooms.length} total rooms · {rooms.filter(r => r.status === 'available').length} available</p>
        </div>
        <button onClick={openAdd} className="btn btn-primary"><Plus size={16} /> Add Room</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div className={styles.filterRow}>
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`${styles.filterBtn} ${filter === f.value ? styles.filterBtnActive : ''}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '8px 14px', width: '220px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search room..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }} />
        </div>
      </div>

      {/* Room Cards */}
      <div className={styles.roomCardsGrid}>
        {filtered.map(r => (
          <div key={r.id} className={styles.roomCard}>
            <div className={styles.roomCardTop}>
              <div>
                <div className={styles.roomCardNumber}>Room {r.number}</div>
                <div className={styles.roomCardFloor}>Floor {r.floor}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                <span className={`badge badge-${r.status}`}>{r.status}</span>
                <span className={styles.roomCardType}>{r.type}</span>
              </div>
            </div>

            <div className={styles.roomCardPrice}>
              ₹{r.price_per_night.toLocaleString()} <span className={styles.roomCardPriceSub}>/night</span>
            </div>

            <div className={styles.roomCardAmenities}>
              {r.amenities.slice(0, 4).map(a => (
                <span key={a} className={styles.amenityTag}>{a}</span>
              ))}
              {r.amenities.length > 4 && <span className={styles.amenityTag}>+{r.amenities.length - 4}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '14px' }}>
              👤 {r.capacity} {r.capacity === 1 ? 'person' : 'persons'}
            </div>

            <div className={styles.roomCardActions}>
              <button onClick={() => cycleStatus(r)} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: '12px' }}>Change Status</button>
              <button onClick={() => openEdit(r)} className="btn btn-secondary btn-sm"><Edit2 size={13} /></button>
              <button onClick={() => handleDelete(r.id)} className="btn btn-danger btn-sm"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            No rooms match the filter.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editRoom ? 'Edit Room' : 'Add New Room'}</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Room Number *</label>
                <input className="form-input" value={form.number} onChange={e => setForm(p => ({ ...p, number: e.target.value }))} placeholder="e.g. 101" />
              </div>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="single">Single</option>
                  <option value="double">Double</option>
                  <option value="suite">Suite</option>
                  <option value="deluxe">Deluxe</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Floor</label>
                <input className="form-input" type="number" value={form.floor} onChange={e => setForm(p => ({ ...p, floor: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity</label>
                <input className="form-input" type="number" value={form.capacity} onChange={e => setForm(p => ({ ...p, capacity: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Price / Night (₹) *</label>
                <input className="form-input" type="number" value={form.price_per_night} onChange={e => setForm(p => ({ ...p, price_per_night: e.target.value }))} placeholder="e.g. 4000" />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="available">Available</option>
                  <option value="booked">Booked</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Amenities (comma-separated)</label>
                <input className="form-input" value={form.amenities} onChange={e => setForm(p => ({ ...p, amenities: e.target.value }))} placeholder="AC, WiFi, TV, Mini Bar" />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={handleSave} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>{editRoom ? 'Save Changes' : 'Add Room'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
