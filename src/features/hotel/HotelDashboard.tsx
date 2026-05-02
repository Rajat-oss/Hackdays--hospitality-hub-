import { useHotelStore } from '../../store'
import { useAuth } from '../../features/auth/AuthContext'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts'
import { BedDouble, Users, DollarSign, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import styles from './Hotel.module.css'



const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '12px 16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{label}</div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-teal-light)' }}>
          {payload[0].name === 'revenue' ? `₹${payload[0].value.toLocaleString()}` : `${payload[0].value}%`}
        </div>
      </div>
    )
  }
  return null
}

export default function HotelDashboard() {
  const { profile } = useAuth()
  const { rooms, bookings, transactions } = useHotelStore()

  const totalRooms = rooms.length
  const bookedRooms = rooms.filter(r => r.status === 'booked').length
  const availableRooms = rooms.filter(r => r.status === 'available').length
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance' || r.status === 'cleaning').length
  const occupancyRate = totalRooms > 0 ? Math.round((bookedRooms / totalRooms) * 100) : 0

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const todayRevenue = transactions.filter(t => t.type === 'income' && t.created_at.startsWith(todayStr)).reduce((s, t) => s + t.amount, 0)
  const totalRevenue = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const pendingPayments = bookings.filter(b => b.paid_amount < b.total_amount && b.status !== 'cancelled')
  const pendingAmount = pendingPayments.reduce((s, b) => s + (b.total_amount - b.paid_amount), 0)

  const activeBookings = bookings.filter(b => b.status === 'checked-in')
  const todayCheckouts = bookings.filter(b => b.status === 'checked-in' && b.check_out === todayStr)
  const upcomingBookings = bookings.filter(b => b.status === 'confirmed')

  // Dynamic Chart Data mapping (simplified for live view)
  const REVENUE_DATA = [{ day: 'Today', revenue: todayRevenue }]
  const OCCUPANCY_DATA = [{ month: format(new Date(), 'MMM'), rate: occupancyRate }]

  const STATS = [
    { label: 'Occupancy Rate', value: `${occupancyRate}%`, sub: `${bookedRooms} of ${totalRooms} rooms`, icon: BedDouble, trend: 'Live', up: true, color: 'var(--color-teal-light)' },
    { label: "Today's Revenue", value: `₹${todayRevenue.toLocaleString()}`, sub: 'Updated just now', icon: DollarSign, trend: todayRevenue > 0 ? 'Active' : 'Awaiting', up: todayRevenue > 0, color: '#4caf82' },
    { label: 'Active Guests', value: String(activeBookings.length), sub: `${todayCheckouts.length} checking out today`, icon: Users, trend: `${upcomingBookings.length} upcoming`, up: true, color: 'var(--color-cream)' },
    { label: 'Pending Payments', value: `₹${pendingAmount.toLocaleString()}`, sub: `${pendingPayments.length} bookings`, icon: AlertCircle, trend: 'Needs attention', up: false, color: '#d4a017' },
  ]

  return (
    <div className={styles.dashPage}>
      <div className={styles.dashHeader}>
        <div>
          <h1 className={styles.dashTitle}>Welcome to {profile?.business_name || 'HospitalityHub'}, {profile?.name?.split(' ')[0]} 👋</h1>
          <p className={styles.dashSub}>{format(new Date(), 'EEEE, do MMMM yyyy')} · Here's your hotel overview</p>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {STATS.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.icon size={20} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: s.up ? '#4caf82' : '#d4a017', fontWeight: 600 }}>
                {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {s.trend}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', opacity: 0.7 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        <div className="card" style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Revenue Overview</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Daily earnings overview</div>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-teal-light)' }}>₹{totalRevenue.toLocaleString()}</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={REVENUE_DATA}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5A9690" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#5A9690" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,150,144,0.08)" />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#5A9690" strokeWidth={2.5} fill="url(#revenueGrad)" name="revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Occupancy Trend</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Last 7 months</div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={OCCUPANCY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,150,144,0.08)" />
              <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="rate" fill="#2F5755" radius={[4, 4, 0, 0]} name="rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Room Status + Recent Bookings */}
      <div className={styles.bottomRow}>
        {/* Room Status Grid */}
        <div className="card" style={{ flex: 1 }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Room Status</div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
              {[
                { label: 'Available', count: availableRooms, color: '#4caf82' },
                { label: 'Booked', count: bookedRooms, color: 'var(--color-teal-light)' },
                { label: 'Unavailable', count: maintenanceRooms, color: '#d4a017' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.label} ({s.count})</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.roomGrid}>
            {rooms.map(r => (
              <div key={r.id} className={`${styles.roomCell} ${styles[`room_${r.status}`]}`} title={`Room ${r.number} — ${r.status}`}>
                <span style={{ fontSize: '11px', fontWeight: 700 }}>{r.number}</span>
                <span style={{ fontSize: '9px', opacity: 0.8 }}>{r.type[0].toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card" style={{ flex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Bookings</div>
            <a href="/hotel/bookings" style={{ fontSize: '13px', color: 'var(--color-teal-light)', fontWeight: 500 }}>View all →</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Guest</th>
                <th>Room</th>
                <th>Check-in/out</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map(b => (
                <tr key={b.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{b.guest?.name ?? '—'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{b.type}</div>
                  </td>
                  <td>Room {b.room?.number ?? '—'}</td>
                  <td style={{ fontSize: '12px' }}>
                    {b.check_in} → {b.check_out}
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                      {differenceInDays(new Date(b.check_out), new Date(b.check_in))} nights
                    </div>
                  </td>
                  <td>
                    <div>₹{b.total_amount.toLocaleString()}</div>
                    {b.paid_amount < b.total_amount && (
                      <div style={{ fontSize: '11px', color: '#d4a017' }}>₹{(b.total_amount - b.paid_amount).toLocaleString()} due</div>
                    )}
                  </td>
                  <td><span className={`badge badge-${b.status}`}>{b.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
