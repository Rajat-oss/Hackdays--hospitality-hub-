import { useHotelStore, useRestaurantStore } from '../../store'
import { useAuth } from '../../features/auth/AuthContext'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, PieChart, Pie
} from 'recharts'
import { 
  Building2, BedDouble, UtensilsCrossed, Users, DollarSign, 
  ArrowUpRight, Activity
} from 'lucide-react'
import hotelStyles from '../hotel/Hotel.module.css'

const styles = hotelStyles;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ 
        background: 'var(--color-bg-elevated)', 
        border: '1px solid var(--border-default)', 
        borderRadius: '12px', 
        padding: '12px 16px',
        boxShadow: 'var(--shadow-lg)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: i === 0 ? '4px' : 0 }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {p.name}: <span style={{ color: p.color }}>₹{p.value.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function HybridDashboard() {
  const { profile } = useAuth()
  const { rooms, bookings: hotelBookings } = useHotelStore()
  const { tables, orders: restaurantOrders } = useRestaurantStore()

  // Hotel Stats
  const totalRooms = rooms.length
  const bookedRooms = rooms.filter(r => r.status === 'booked').length
  const occupancyRate = Math.round((bookedRooms / Math.max(totalRooms, 1)) * 100)
  
  // Restaurant Stats
  const occupiedTables = tables.filter(t => t.status === 'occupied').length

  // Real revenue calculations
  const hotelRevenue = hotelBookings.reduce((s, b) => s + (b.paid_amount || 0), 0)
  const restaurantRevenue = restaurantOrders.reduce((s, o) => s + (o.total_amount || 0), 0)
  const totalCombinedRevenue = hotelRevenue + restaurantRevenue

  const ALLOCATION = [
    { name: 'Hotel', value: hotelRevenue || 1, color: '#5A9690' },
    { name: 'Restaurant', value: restaurantRevenue || 1, color: '#4caf82' },
  ]

  const COMBINED_REVENUE = [
    { day: 'MTD', hotel: hotelRevenue, restaurant: restaurantRevenue }
  ]

  const STATS = [
    { 
      label: 'Total Revenue', 
      value: `₹${totalCombinedRevenue.toLocaleString()}`, 
      sub: 'Cumulative earnings', 
      icon: DollarSign, 
      trend: totalCombinedRevenue > 0 ? '+100%' : '0%', 
      up: totalCombinedRevenue > 0, 
      color: '#4caf82' 
    },
    { 
      label: 'Hotel Occupancy', 
      value: `${occupancyRate}%`, 
      sub: `${bookedRooms} rooms occupied`, 
      icon: BedDouble, 
      trend: 'Current', 
      up: true, 
      color: 'var(--color-teal-light)' 
    },
    { 
      label: 'Table Occupancy', 
      value: `${Math.round((occupiedTables / Math.max(tables.length, 1)) * 100)}%`, 
      sub: `${occupiedTables} tables active`, 
      icon: UtensilsCrossed, 
      trend: 'Live', 
      up: true, 
      color: '#d4a017' 
    },
    { 
      label: 'Active Guests', 
      value: String(hotelBookings.filter(b => b.status === 'checked-in').length + occupiedTables), 
      sub: 'In-house + Dining', 
      icon: Users, 
      trend: 'Real-time', 
      up: true, 
      color: 'var(--color-cream)' 
    },
  ]

  return (
    <div className={styles.dashPage}>
      <div className={styles.dashHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '16px', 
            background: 'linear-gradient(135deg, var(--color-teal), var(--color-teal-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <h1 className={styles.dashTitle}>{profile?.business_name || 'Hybrid'} Command Center</h1>
            <p className={styles.dashSub}>Welcome back, {profile?.name} · Managing Hotel & Restaurant</p>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {STATS.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ 
                width: '44px', height: '44px', borderRadius: '12px', 
                background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color 
              }}>
                <s.icon size={20} />
              </div>
              <div style={{ 
                display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', 
                color: s.up ? '#4caf82' : 'var(--text-muted)', fontWeight: 600,
                background: s.up ? 'rgba(76, 175, 130, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                padding: '4px 8px', borderRadius: '20px'
              }}>
                {s.up ? <ArrowUpRight size={12} /> : null}
                {s.trend}
              </div>
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-cream)', letterSpacing: '-0.02em', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '3px', opacity: 0.7 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className={styles.chartsRow}>
        <div className="card" style={{ flex: 2 }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Revenue Overview</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Month-to-date performance</div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={COMBINED_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="hotel" fill="#5A9690" radius={[4, 4, 0, 0]} name="Hotel" />
              <Bar dataKey="restaurant" fill="#4caf82" radius={[4, 4, 0, 0]} name="Restaurant" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Revenue Allocation</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Distribution by entity</div>
          </div>
          <div style={{ position: 'relative', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ALLOCATION}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={totalCombinedRevenue > 0 ? 8 : 0}
                  dataKey="value"
                >
                  {ALLOCATION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={totalCombinedRevenue > 0 ? entry.color : 'rgba(255,255,255,0.05)'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ 
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-cream)' }}>₹{(totalCombinedRevenue / 100000).toFixed(1)}L</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Total</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomRow}>
        <div className="card" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BedDouble size={18} color="var(--color-teal-light)" /> Hotel Status
            </div>
            <a href="/hotel" style={{ fontSize: '12px', color: 'var(--color-teal-light)' }}>Open Hotel →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(90, 150, 144, 0.05)', borderRadius: '10px', border: '1px solid rgba(90, 150, 144, 0.1)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Todays Check-ins</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{hotelBookings.length} Guests</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(76, 175, 130, 0.05)', borderRadius: '10px', border: '1px solid rgba(76, 175, 130, 0.1)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Rooms Cleaning</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{rooms.filter(r => r.status === 'cleaning').length} Units</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UtensilsCrossed size={18} color="#d4a017" /> Restaurant Activity
            </div>
            <a href="/restaurant" style={{ fontSize: '12px', color: 'var(--color-teal-light)' }}>Open Kitchen →</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: 'rgba(212, 160, 23, 0.05)', borderRadius: '10px', border: '1px solid rgba(212, 160, 23, 0.1)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active Orders</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{restaurantOrders.length} Tables</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(160, 96, 96, 0.05)', borderRadius: '10px', border: '1px solid rgba(160, 96, 96, 0.1)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Pending Bills</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{restaurantOrders.filter(o => o.status === 'ready').length} Orders</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ flex: 1 }}>
          <div style={{ marginBottom: '20px', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={18} color="var(--color-cream)" /> System Pulse
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
             {[
               { label: 'Staff Online', value: '12/14', status: 'optimal' },
               { label: 'Inventory Level', value: '82%', status: 'good' },
               { label: 'Cloud Sync', value: 'Active', status: 'optimal' },
             ].map((item, i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.label}</span>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
                   <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.status === 'optimal' ? '#4caf82' : '#d4a017' }} />
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  )
}
