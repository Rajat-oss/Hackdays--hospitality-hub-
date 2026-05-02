import React, { useState } from 'react'
import { useRestaurantStore } from '../../store'
import { Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import type { Order, OrderStatus } from '../../types'
import styles from './Restaurant.module.css'

const STATUS_FLOW: OrderStatus[] = ['pending', 'preparing', 'ready', 'served', 'billed']

export default function OrderManagement() {
  const { tables, menu, orders, addOrder, updateOrder } = useRestaurantStore()
  const [showNew, setShowNew] = useState(false)
  const [selectedTable, setSelectedTable] = useState('')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))]
  const filteredMenu = activeCategory === 'All' ? menu : menu.filter(m => m.category === activeCategory)

  const orderTotal = Object.entries(quantities).reduce((s, [id, qty]) => {
    const item = menu.find(m => m.id === id)
    return s + (item?.price ?? 0) * qty
  }, 0)

  const gstAmount = +(orderTotal * 0.12).toFixed(2)

  function setQty(itemId: string, qty: number) {
    setQuantities(prev => ({ ...prev, [itemId]: Math.max(0, qty) }))
  }

  function placeOrder() {
    if (!selectedTable) return toast.error('Select a table')
    const items = Object.entries(quantities).filter(([, q]) => q > 0).map(([id, qty]) => ({
      id: `oi${Date.now()}-${id}`,
      order_id: '',
      menu_item_id: id,
      quantity: qty,
      unit_price: menu.find(m => m.id === id)?.price ?? 0,
      menu_item: menu.find(m => m.id === id),
    }))
    if (!items.length) return toast.error('Add at least one item')

    const newOrder: Order = {
      id: `o${Date.now()}`,
      business_id: 'biz-rest-001',
      table_id: selectedTable,
      status: 'pending',
      total_amount: orderTotal,
      gst_amount: gstAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      table: tables.find(t => t.id === selectedTable),
      items: items.map(i => ({ ...i, order_id: `o${Date.now()}` })),
    }
    addOrder(newOrder)
    updateOrder(newOrder.id, {})
    toast.success(`Order placed for Table ${tables.find(t => t.id === selectedTable)?.number}!`)
    setQuantities({})
    setSelectedTable('')
    setShowNew(false)
  }

  function advanceStatus(order: Order) {
    const nextIdx = STATUS_FLOW.indexOf(order.status) + 1
    if (nextIdx >= STATUS_FLOW.length) return
    const next = STATUS_FLOW[nextIdx]
    updateOrder(order.id, { status: next })
    toast.success(`Order T${order.table?.number} → ${next}`)
  }

  const activeOrders = orders.filter(o => o.status !== 'billed')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="page-subtitle">{activeOrders.length} active orders · {orders.filter(o => o.status === 'pending').length} pending</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn btn-primary"><Plus size={16} /> New Order</button>
      </div>

      <div className={styles.ordersLayout}>
        {/* Orders List */}
        <div className={styles.ordersList}>
          {activeOrders.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>No active orders. Click "New Order" to start.</div>}
          {activeOrders.map(order => {
            const mins = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000)
            const nextStatus = STATUS_FLOW[STATUS_FLOW.indexOf(order.status) + 1]
            return (
              <div key={order.id} className={styles.orderCard}>
                <div className={styles.orderCardTop}>
                  <div>
                    <div className={styles.orderTableName}>Table {order.table?.number ?? '—'} · {order.table?.location}</div>
                    <div className={styles.orderTime}>{mins} min ago</div>
                  </div>
                  <span className={`badge badge-${order.status}`}>{order.status}</span>
                </div>

                <div className={styles.orderItems}>
                  {order.items?.map((item, i) => (
                    <span key={i} className={styles.orderItemChip}>
                      {item.menu_item?.name ?? '?'} × {item.quantity}
                    </span>
                  ))}
                </div>

                <div className={styles.orderFooter}>
                  <div>
                    <div className={styles.orderAmount}>₹{order.total_amount.toLocaleString()}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+ GST ₹{order.gst_amount.toFixed(0)}</div>
                  </div>
                  <div className={styles.orderStatusBtns}>
                    {nextStatus && nextStatus !== 'billed' && (
                      <button onClick={() => advanceStatus(order)} className="btn btn-sm btn-primary" style={{ fontSize: '12px' }}>
                        Mark {nextStatus}
                      </button>
                    )}
                    {order.status === 'served' && (
                      <button onClick={() => advanceStatus(order)} className="btn btn-sm" style={{ background: 'rgba(76,175,130,0.15)', color: '#4caf82', border: '1px solid rgba(76,175,130,0.25)', fontSize: '12px' }}>
                        Generate Bill
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* New Order Panel */}
        <div className={styles.newOrderPanel}>
          {showNew ? (
            <>
              <div className={styles.newOrderTitle}>📋 New Order</div>

              <div className="form-group">
                <label className="form-label">Select Table</label>
                <select className="form-select" value={selectedTable} onChange={e => setSelectedTable(e.target.value)}>
                  <option value="">Choose table...</option>
                  {tables.filter(t => t.status !== 'occupied').map(t => (
                    <option key={t.id} value={t.id}>Table {t.number} ({t.location})</option>
                  ))}
                </select>
              </div>

              <div className={styles.menuCategories}>
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`${styles.catBtn} ${activeCategory === cat ? styles.catBtnActive : ''}`}>
                    {cat}
                  </button>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredMenu.filter(m => m.is_available).map(item => (
                  <div key={item.id} className={styles.menuItemRow}>
                    <div>
                      <div className={styles.menuItemName}>{item.name}</div>
                      <div className={styles.menuItemPrice}>₹{item.price} · {item.is_vegetarian ? '🟢 Veg' : '🔴 Non-veg'}</div>
                    </div>
                    <div className={styles.qtyControl}>
                      <button className={styles.qtyBtn} onClick={() => setQty(item.id, (quantities[item.id] ?? 0) - 1)}>−</button>
                      <span className={styles.qtyValue}>{quantities[item.id] ?? 0}</span>
                      <button className={styles.qtyBtn} onClick={() => setQty(item.id, (quantities[item.id] ?? 0) + 1)}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {orderTotal > 0 && (
                <div className={styles.orderSummary}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    <span>Subtotal</span><span>₹{orderTotal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <span>GST (12%)</span><span>₹{gstAmount}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 800, color: 'var(--color-cream)' }}>
                    <span>Total</span><span>₹{(orderTotal + gstAmount).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setShowNew(false); setQuantities({}) }} className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={placeOrder} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center' }}>Place Order</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Click "New Order" to start taking orders from tables</div>
              <button onClick={() => setShowNew(true)} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}><Plus size={15} /> New Order</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
