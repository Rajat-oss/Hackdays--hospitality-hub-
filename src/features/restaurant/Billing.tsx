import React, { useState } from 'react'
import { useRestaurantStore } from '../../store'
import { Receipt, Printer } from 'lucide-react'
import { toast } from 'react-hot-toast'
import styles from './Restaurant.module.css'

const GST_RATE = 12

export default function Billing() {
  const { orders, updateOrder, tables } = useRestaurantStore()
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash')

  const billableOrders = orders.filter(o => o.status === 'served' || o.status === 'billed')
  const selected = orders.find(o => o.id === selectedOrder)

  const subtotal = selected?.total_amount ?? 0
  const gst = selected?.gst_amount ?? 0
  const total = subtotal + gst

  function generateBill() {
    if (!selected) return toast.error('Select an order to bill')
    updateOrder(selected.id, { status: 'billed', payment_method: paymentMethod })
    toast.success(`Bill generated! ₹${total.toLocaleString()} via ${paymentMethod.toUpperCase()}`)
    setSelectedOrder(null)
  }

  function handlePrint() {
    window.print()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="page-title">Billing</h1>
        <p className="page-subtitle">Generate GST-ready invoices and process payments</p>
      </div>

      <div className={styles.billLayout}>
        {/* Order picker */}
        <div>
          <div style={{ marginBottom: '16px', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>Served Orders — Ready to Bill</div>

          {billableOrders.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', background: 'var(--color-bg-card)', borderRadius: '16px', border: '1px solid var(--border-subtle)' }}>
              No orders ready to bill. Orders marked "Served" will appear here.
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {billableOrders.map(order => (
              <div
                key={order.id}
                onClick={() => order.status !== 'billed' ? setSelectedOrder(order.id) : null}
                style={{
                  padding: '16px 20px',
                  background: 'var(--color-bg-card)',
                  border: `2px solid ${selectedOrder === order.id ? 'var(--color-teal-light)' : order.status === 'billed' ? 'rgba(76,175,130,0.2)' : 'var(--border-subtle)'}`,
                  borderRadius: '12px',
                  cursor: order.status !== 'billed' ? 'pointer' : 'default',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>Table {order.table?.number} · {order.items?.length} items</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>
                    {order.items?.map(i => `${i.menu_item?.name ?? '?'} ×${i.quantity}`).join(' · ')}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: '17px', color: order.status === 'billed' ? '#4caf82' : 'var(--color-cream)' }}>
                    ₹{(order.total_amount + order.gst_amount).toLocaleString()}
                  </div>
                  <span className={`badge badge-${order.status}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice */}
        <div>
          <div className={styles.billInvoice}>
            <div className={styles.billHeader}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>🍽️</div>
              <div className={styles.billBusinessName}>Spice Garden Restaurant</div>
              <div className={styles.billSubtitle}>GST No: 27AAAPZ1234A1Z5</div>
              <div className={styles.billSubtitle} style={{ marginTop: '4px' }}>
                INVOICE #{selected ? `SG-${selected.id.toUpperCase()}` : 'SG-XXXXXX'}
              </div>
              <div className={styles.billSubtitle}>{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>

            {selected ? (
              <>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Table {selected.table?.number} · {selected.table?.location}</div>

                <div className={styles.billItems}>
                  {selected.items?.map((item, i) => (
                    <div key={i} className={styles.billItemRow}>
                      <div>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.menu_item?.name ?? '?'}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>×{item.quantity} @ ₹{item.unit_price}</div>
                      </div>
                      <div style={{ fontWeight: 600 }}>₹{(item.quantity * item.unit_price).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <div className={styles.billTotals}>
                  <div className={styles.billTotalRow}>
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className={styles.billTotalRow}>
                    <span>CGST (6%)</span>
                    <span>₹{(gst / 2).toFixed(2)}</span>
                  </div>
                  <div className={styles.billTotalRow}>
                    <span>SGST (6%)</span>
                    <span>₹{(gst / 2).toFixed(2)}</span>
                  </div>
                  <div className={styles.billGrandTotal}>
                    <span>Total</span>
                    <span>₹{(subtotal + gst).toLocaleString()}</span>
                  </div>
                </div>

                {selected.status !== 'billed' && (
                  <div style={{ marginTop: '20px' }}>
                    <div className="form-label" style={{ marginBottom: '10px' }}>Payment Method</div>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                      {(['cash', 'upi', 'card'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => setPaymentMethod(m)}
                          className={`btn btn-sm ${paymentMethod === m ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ flex: 1, justifyContent: 'center', textTransform: 'uppercase', fontSize: '12px' }}
                        >
                          {m === 'cash' ? '💵' : m === 'upi' ? '📱' : '💳'} {m}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={handlePrint} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                        <Printer size={15} /> Print
                      </button>
                      <button onClick={generateBill} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}>
                        <Receipt size={15} /> Collect Payment
                      </button>
                    </div>
                  </div>
                )}

                {selected.status === 'billed' && (
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(76,175,130,0.1)', borderRadius: '12px', color: '#4caf82', fontWeight: 700, marginTop: '16px' }}>
                    ✅ Payment Collected
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Receipt size={32} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                <div>Select a served order to generate invoice</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
