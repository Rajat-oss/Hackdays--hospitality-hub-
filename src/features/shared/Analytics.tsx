import React from 'react'
import { useHotelStore } from '../../store'
import { useRestaurantStore } from '../../store'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, Hotel, UtensilsCrossed } from 'lucide-react'

const MONTHLY = [
  { month: 'Oct', hotel: 180000, restaurant: 92000 },
  { month: 'Nov', hotel: 220000, restaurant: 110000 },
  { month: 'Dec', hotel: 310000, restaurant: 145000 },
  { month: 'Jan', hotel: 265000, restaurant: 138000 },
  { month: 'Feb', hotel: 290000, restaurant: 152000 },
  { month: 'Mar', hotel: 345000, restaurant: 171000 },
  { month: 'Apr', hotel: 284500, restaurant: 128000 },
]

export default function Analytics() {
  const { rooms, bookings, transactions } = useHotelStore()
  const { orders, tables } = useRestaurantStore()

  const hotelRevenue = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const restaurantRevenue = orders.reduce((s, o) => s + o.total_amount + o.gst_amount, 0)
  const totalRevenue = hotelRevenue + restaurantRevenue

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Combined performance across hotel and restaurant</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[
          { label: 'Total Revenue (All Time)', value: `₹${totalRevenue.toLocaleString()}`, icon: TrendingUp, color: 'var(--color-teal-light)' },
          { label: 'Hotel Revenue', value: `₹${hotelRevenue.toLocaleString()}`, icon: Hotel, color: '#4caf82' },
          { label: 'Restaurant Revenue', value: `₹${restaurantRevenue.toLocaleString()}`, icon: UtensilsCrossed, color: '#d4a017' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.icon size={18} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Combined Chart */}
      <div className="card">
        <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Hotel vs Restaurant Revenue</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>7-month performance comparison</div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-teal-light)' }} /> Hotel</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d4a017' }} /> Restaurant</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={MONTHLY}>
            <defs>
              <linearGradient id="hotelGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5A9690" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#5A9690" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="restGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4a017" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#d4a017" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,150,144,0.08)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
            <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)' }} formatter={(v: any) => `₹${v.toLocaleString()}`} />
            <Area type="monotone" dataKey="hotel" stroke="#5A9690" strokeWidth={2.5} fill="url(#hotelGrad)" name="Hotel" />
            <Area type="monotone" dataKey="restaurant" stroke="#d4a017" strokeWidth={2.5} fill="url(#restGrad)" name="Restaurant" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Quick metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div className="card">
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>🏨 Hotel Quick Stats</div>
          {[
            { label: 'Total Rooms', value: rooms.length },
            { label: 'Total Bookings', value: bookings.length },
            { label: 'Checked-In', value: bookings.filter(b => b.status === 'checked-in').length },
            { label: 'Occupancy Rate', value: `${Math.round((rooms.filter(r => r.status === 'booked').length / rooms.length) * 100)}%` },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border-subtle)' : '' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.label}</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>🍽️ Restaurant Quick Stats</div>
          {[
            { label: 'Total Tables', value: tables.length },
            { label: 'Active Orders', value: orders.filter(o => o.status !== 'billed').length },
            { label: 'Billed Orders', value: orders.filter(o => o.status === 'billed').length },
            { label: 'Table Occupancy', value: `${Math.round((tables.filter(t => t.status === 'occupied').length / tables.length) * 100)}%` },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 3 ? '1px solid var(--border-subtle)' : '' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{m.label}</span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
