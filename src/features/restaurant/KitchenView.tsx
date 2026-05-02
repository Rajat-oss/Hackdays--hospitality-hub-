import React, { useState, useEffect } from 'react'
import { useRestaurantStore } from '../../store'
import { toast } from 'react-hot-toast'
import { ChefHat } from 'lucide-react'
import type { OrderStatus } from '../../types'
import styles from './Restaurant.module.css'

export default function KitchenView() {
  const { orders, updateOrder } = useRestaurantStore()
  const [tick, setTick] = useState(0)

  // Live clock refresh
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 30000)
    return () => clearInterval(timer)
  }, [])

  const kitchenOrders = orders.filter(o => o.status === 'pending' || o.status === 'preparing' || o.status === 'ready')

  function advance(id: string, current: OrderStatus) {
    const next: Record<string, OrderStatus> = { pending: 'preparing', preparing: 'ready' }
    if (next[current]) {
      updateOrder(id, { status: next[current] })
      toast.success(`Marked as ${next[current]}`)
    }
  }

  const cardStyleMap: Record<string, string> = {
    pending: styles.kitchenCardPending,
    preparing: styles.kitchenCardPreparing,
    ready: styles.kitchenCardReady,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Kitchen Display</h1>
          <p className="page-subtitle">{kitchenOrders.length} active · {orders.filter(o => o.status === 'pending').length} new · {orders.filter(o => o.status === 'preparing').length} cooking · {orders.filter(o => o.status === 'ready').length} ready</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--color-teal-light)', fontWeight: 600, background: 'rgba(90,150,144,0.1)', border: '1px solid rgba(90,150,144,0.2)', borderRadius: '100px', padding: '6px 14px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4caf82', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Live View
        </div>
      </div>

      {kitchenOrders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '100px 40px', color: 'var(--text-muted)' }}>
          <ChefHat size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Kitchen is all caught up!</div>
          <div style={{ fontSize: '14px' }}>New orders will appear here automatically.</div>
        </div>
      ) : (
        <div className={styles.kitchenGrid}>
          {kitchenOrders.map(order => {
            const mins = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
            return (
              <div key={order.id} className={`${styles.kitchenCard} ${cardStyleMap[order.status]}`}>
                <div className={styles.kitchenCardHeader}>
                  <div>
                    <div className={styles.kitchenTableName}>Table {order.table?.number ?? '?'}</div>
                    <div className={styles.kitchenTime}>{mins} min ago · {order.table?.location}</div>
                  </div>
                  <span className={`badge badge-${order.status}`}>{order.status}</span>
                </div>

                <div className={styles.kitchenItemsList}>
                  {order.items?.map((item, i) => (
                    <div key={i} className={styles.kitchenItem}>
                      <span>{item.menu_item?.name ?? '?'}</span>
                      <span className={styles.kitchenItemQty}>× {item.quantity}</span>
                    </div>
                  ))}
                </div>

                {order.status !== 'ready' && (
                  <button
                    onClick={() => advance(order.id, order.status)}
                    className="btn btn-primary w-full"
                    style={{ justifyContent: 'center', marginTop: '4px' }}
                  >
                    {order.status === 'pending' ? '🔥 Start Cooking' : '✅ Mark Ready'}
                  </button>
                )}

                {order.status === 'ready' && (
                  <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '13px', color: '#4caf82', fontWeight: 700, padding: '10px', background: 'rgba(76,175,130,0.1)', borderRadius: '10px' }}>
                    ✅ Ready for pickup!
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {orders.filter(o => o.status === 'served').length > 0 && (
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Recently Served</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {orders.filter(o => o.status === 'served').map(o => (
              <div key={o.id} style={{ padding: '8px 16px', background: 'var(--color-bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                Table {o.table?.number} · ₹{o.total_amount}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
