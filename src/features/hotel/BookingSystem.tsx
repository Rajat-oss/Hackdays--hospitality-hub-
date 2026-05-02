import React, { useState } from 'react'
import { useHotelStore } from '../../store'
import { Plus, Search, CalendarCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Booking, BookingStatus } from '../../types'
import { differenceInDays } from 'date-fns'
import styles from './Hotel.module.css'

const FILTERS: { label: string; value: BookingStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Checked In', value: 'checked-in' },
  { label: 'Checked Out', value: 'checked-out' },
  { label: 'Cancelled', value: 'cancelled' },
]

export default function BookingSystem() {
  const { bookings, rooms, guests, addBooking, updateBooking, addGuest } = useHotelStore()
  const [filter, setFilter] = useState<BookingStatus | 'all'>('all')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ guest_name: '', guest_phone: '', room_id: '', check_in: '', check_out: '', type: 'walk-in', payment_method: 'cash', special_requests: '', paid_amount: '' })

  const filtered = bookings.filter(b => {
    if (filter !== 'all' && b.status !== filter) return false
    if (search) {
      const guestName = b.guest?.name?.toLowerCase() ?? ''
      const roomNum = b.room?.number ?? ''
      if (!guestName.includes(search.toLowerCase()) && !roomNum.includes(search)) return false
    }
    return true
  })

  const availableRooms = rooms.filter(r => r.status === 'available')

  function calcTotal() {
    const room = rooms.find(r => r.id === form.room_id)
    if (!room || !form.check_in || !form.check_out) return 0
    const nights = Math.max(1, differenceInDays(new Date(form.check_out), new Date(form.check_in)))
    return room.price_per_night * nights
  }

  function handleBook() {
    if (!form.guest_name || !form.room_id || !form.check_in || !form.check_out) return toast.error('Fill all required fields')
    const room = rooms.find(r => r.id === form.room_id)
    if (!room) return

    const newGuest = { id: `g${Date.now()}`, business_id: 'biz-hotel-001', name: form.guest_name, phone: form.guest_phone, visit_count: 1, created_at: new Date().toISOString() }
    addGuest(newGuest)

    const total = calcTotal()
    addBooking({
      id: `b${Date.now()}`, business_id: 'biz-hotel-001',
      room_id: form.room_id, guest_id: newGuest.id,
      check_in: form.check_in, check_out: form.check_out,
      type: form.type as any, status: 'confirmed',
      total_amount: total, paid_amount: +(form.paid_amount || 0),
      payment_method: form.payment_method as any,
      special_requests: form.special_requests,
      created_at: new Date().toISOString(),
      room, guest: newGuest,
    })
    toast.success(`Booking confirmed for ${form.guest_name}!`)
    setShowModal(false)
  }

  function changeStatus(b: Booking, status: BookingStatus) {
    updateBooking(b.id, { status })
    toast.success(`Booking updated to ${status}`)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className={styles.pageActions}>
        <div>
          <h1 className="page-title">Bookings</h1>
          <p className="page-subtitle">{bookings.length} total · {bookings.filter(b => b.status === 'checked-in').length} currently checked in</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> New Booking</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div className={styles.filterRow}>
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)} className={`${styles.filterBtn} ${filter === f.value ? styles.filterBtnActive : ''}`}>
              {f.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '8px 14px', width: '220px' }}>
          <Search size={14} style={{ color: 'var(--text-muted)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guest, room..." style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '13px', width: '100%' }} />
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Nights</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => {
              const nights = differenceInDays(new Date(b.check_out), new Date(b.check_in))
              const due = b.total_amount - b.paid_amount
              return (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.guest?.name ?? '—'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.type}</div>
                  </td>
                  <td style={{ fontWeight: 600 }}>Room {b.room?.number ?? '—'}</td>
                  <td>{b.check_in}</td>
                  <td>{b.check_out}</td>
                  <td style={{ textAlign: 'center' }}>{nights}</td>
                  <td>
                    <div>₹{b.total_amount.toLocaleString()}</div>
                    {due > 0 && <div style={{ fontSize: '11px', color: '#d4a017' }}>₹{due.toLocaleString()} due</div>}
                  </td>
                  <td><span style={{ fontSize: '12px', textTransform: 'capitalize' }}>{b.payment_method}</span></td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {b.status === 'confirmed' && <button onClick={() => changeStatus(b, 'checked-in')} className="btn btn-sm" style={{ background: 'rgba(76,175,130,0.15)', color: '#4caf82', border: '1px solid rgba(76,175,130,0.25)', fontSize: '11px' }}>Check In</button>}
                      {b.status === 'checked-in' && <button onClick={() => changeStatus(b, 'checked-out')} className="btn btn-sm btn-secondary" style={{ fontSize: '11px' }}>Check Out</button>}
                      {b.status !== 'cancelled' && b.status !== 'checked-out' && <button onClick={() => changeStatus(b, 'cancelled')} className="btn btn-sm btn-danger" style={{ fontSize: '11px' }}>Cancel</button>}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No bookings found.</div>}
      </div>

      {/* New Booking Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" style={{ maxWidth: '640px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">New Booking</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>

            <div className={styles.bookingForm}>
              <div className="form-group">
                <label className="form-label">Guest Name *</label>
                <input className="form-input" value={form.guest_name} onChange={e => setForm(p => ({ ...p, guest_name: e.target.value }))} placeholder="Full name" />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.guest_phone} onChange={e => setForm(p => ({ ...p, guest_phone: e.target.value }))} placeholder="10-digit number" />
              </div>
              <div className="form-group">
                <label className="form-label">Room *</label>
                <select className="form-select" value={form.room_id} onChange={e => setForm(p => ({ ...p, room_id: e.target.value }))}>
                  <option value="">Select room</option>
                  {availableRooms.map(r => <option key={r.id} value={r.id}>Room {r.number} — {r.type} — ₹{r.price_per_night}/night</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Booking Type</label>
                <select className="form-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="walk-in">Walk-in</option>
                  <option value="pre-booked">Pre-booked</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Check-in Date *</label>
                <input type="date" className="form-input" value={form.check_in} onChange={e => setForm(p => ({ ...p, check_in: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Check-out Date *</label>
                <input type="date" className="form-input" value={form.check_out} onChange={e => setForm(p => ({ ...p, check_out: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={form.payment_method} onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))}>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="card">Card</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount Paid (₹)</label>
                <input type="number" className="form-input" value={form.paid_amount} onChange={e => setForm(p => ({ ...p, paid_amount: e.target.value }))} placeholder={`Total: ₹${calcTotal().toLocaleString()}`} />
              </div>
              <div className="form-group bookingFormFull" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Special Requests</label>
                <textarea className="form-input" rows={2} value={form.special_requests} onChange={e => setForm(p => ({ ...p, special_requests: e.target.value }))} placeholder="Any special requirements..." style={{ resize: 'none' }} />
              </div>
            </div>

            {calcTotal() > 0 && (
              <div style={{ background: 'var(--color-bg-elevated)', borderRadius: '10px', padding: '14px 16px', margin: '16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Total Amount</span>
                <span style={{ fontWeight: 800, fontSize: '20px', color: 'var(--color-teal-light)' }}>₹{calcTotal().toLocaleString()}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button onClick={handleBook} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}><CalendarCheck size={15} /> Confirm Booking</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
