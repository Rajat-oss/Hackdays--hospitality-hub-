import { useState, useEffect } from 'react'
import { useRestaurantStore } from '../../store'
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'react-hot-toast'
import styles from './Restaurant.module.css'

export default function KitchenView() {
  const { orders, updateOrder } = useRestaurantStore()
  const [, setTick] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 10000)
    return () => clearInterval(timer)
  }, [])

  const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'pending')

  function handleOrderReady(orderId: string) {
    updateOrder(orderId, { status: 'ready' })
    toast.success('Order marked as ready!')
  }

  return (
    <div style={{ padding: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Kitchen View</h1>
          <p className="page-subtitle">{preparingOrders.length} orders in progress</p>
        </div>
      </div>

      <div className={styles.kitchenGrid}>
        {preparingOrders.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>♨️</div>
            <h3>No orders to prepare</h3>
            <p>New orders from the dining hall will appear here.</p>
          </div>
        )}
        {preparingOrders.map(order => {
          const mins = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
          const isLate = mins > 15

          return (
            <div key={order.id} className={`${styles.kitchenCard} ${isLate ? styles.kitchenCardLate : ''}`}>
              <div className={styles.kitchenCardHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className={styles.tableNum}>{order.table?.number}</div>
                  <div className={styles.orderTime}>
                    <Clock size={12} /> {mins}m
                  </div>
                </div>
                {isLate && <AlertCircle size={16} color="#e74c3c" />}
              </div>

              <div className={styles.kitchenItems}>
                {order.items?.map((item, i) => (
                  <div key={i} className={styles.kitchenItem}>
                    <span className={styles.itemQty}>{item.quantity}</span>
                    <span className={styles.itemName}>{item.menu_item?.name}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleOrderReady(order.id)}
                className={styles.readyBtn}
              >
                <CheckCircle2 size={16} /> Mark Ready
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
