import { useRestaurantStore } from '../../store'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import { 
  UtensilsCrossed, Table2, ClipboardList, DollarSign,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import styles from './Restaurant.module.css'

export default function RestaurantDashboard() {
  const { tables, orders } = useRestaurantStore()

  // Stats calculation
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const totalRevenue = orders.reduce((sum, o) => sum + o.total_amount, 0)
  
  // Popular items calculation
  const popularItems = (() => {
    const itemMap: Record<string, { name: string, quantity: number, revenue: number }> = {}
    orders.forEach(o => {
      o.items?.forEach(i => {
        const name = i.menu_item?.name || 'Unknown'
        if (!itemMap[name]) itemMap[name] = { name, quantity: 0, revenue: 0 }
        itemMap[name].quantity += i.quantity
        itemMap[name].revenue += ((i.unit_price || i.menu_item?.price || 0) * i.quantity)
      })
    })
    return Object.values(itemMap).sort((a, b) => b.quantity - a.quantity).slice(0, 5)
  })()

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: '+12.5%', isUp: true, color: '#FFD700' },
    { label: 'Active Orders', value: totalOrders - orders.filter(o => o.status === 'billed').length, icon: ClipboardList, trend: '+4', isUp: true, color: '#5A9690' },
    { label: 'Table Occupancy', value: `${Math.round((tables.filter(t => t.status === 'occupied').length / (tables.length || 1)) * 100)}%`, icon: Table2, trend: '-2%', isUp: false, color: '#E63946' },
    { label: 'Pending Kitchen', value: pendingOrders, icon: UtensilsCrossed, trend: 'High', isUp: true, color: '#A8DADC' },
  ]

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Restaurant Overview</h1>
          <p className="page-subtitle">Real-time dining operations and revenue analytics</p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div style={{ padding: '8px', background: `${stat.color}15`, borderRadius: '10px', color: stat.color }}>
                <stat.icon size={20} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: stat.isUp ? '#4caf82' : '#e74c3c' }}>
                {stat.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-cream)', marginBottom: '4px' }}>{stat.value}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Revenue Chart */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Revenue Analytics</h3>
            <select className="form-select" style={{ width: '120px', padding: '4px 8px', fontSize: '12px' }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularItems}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px' }}
                />
                <Bar dataKey="revenue" fill="var(--color-teal-light)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Items */}
        <div className="card">
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '20px' }}>Top Selling Items</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {popularItems.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--color-teal-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {i === 0 ? '🏆' : '🔥'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.quantity} orders today</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-cream)' }}>₹{item.revenue.toLocaleString()}</div>
                  <div style={{ fontSize: '11px', color: '#4caf82' }}>Revenue</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
