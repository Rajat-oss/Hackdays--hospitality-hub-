import React, { useState } from 'react'
import { useRestaurantStore } from '../../store'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import styles from './Restaurant.module.css'

export default function MenuManager() {
  const { menu, addMenuItem, updateMenuItem } = useRestaurantStore()
  const [activeCategory, setActiveCategory] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Starters', price: '', description: '', is_vegetarian: true, is_available: true })

  const categories = ['All', ...Array.from(new Set(menu.map(m => m.category)))]
  const filtered = activeCategory === 'All' ? menu : menu.filter(m => m.category === activeCategory)

  function handleAdd() {
    if (!form.name || !form.price) return toast.error('Fill required fields')
    addMenuItem({ id: `m${Date.now()}`, business_id: 'biz-rest-001', name: form.name, category: form.category, price: +form.price, description: form.description, is_vegetarian: form.is_vegetarian, is_available: form.is_available, created_at: new Date().toISOString() })
    toast.success('Menu item added')
    setShowModal(false)
  }

  function toggleAvail(id: string, current: boolean) {
    updateMenuItem(id, { is_available: !current })
    toast.success(current ? 'Item marked unavailable' : 'Item marked available')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
        <div>
          <h1 className="page-title">Menu Manager</h1>
          <p className="page-subtitle">{menu.length} items · {menu.filter(m => m.is_available).length} available</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary"><Plus size={16} /> Add Item</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className={styles.menuGrid}>
        {filtered.map(item => (
          <div key={item.id} className={styles.menuCard} style={{ opacity: item.is_available ? 1 : 0.6 }}>
            <div className={styles.menuCardCat}>{item.category}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
              <div className={styles.menuCardName}>{item.name}</div>
              <span style={{ fontSize: '11px' }}>{item.is_vegetarian ? '🟢' : '🔴'}</span>
            </div>
            {item.description && <div className={styles.menuCardDesc}>{item.description}</div>}

            <div className={styles.menuCardFooter}>
              <div className={styles.menuCardPrice}>₹{item.price}</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => toggleAvail(item.id, item.is_available)}
                  className={`btn btn-sm ${item.is_available ? 'btn-secondary' : 'btn-primary'}`}
                  style={{ fontSize: '11px' }}
                >
                  {item.is_available ? 'Hide' : 'Show'}
                </button>
                <button className="btn btn-danger btn-sm"><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Add Menu Item</h2>
              <button onClick={() => setShowModal(false)} className="btn btn-ghost btn-sm">✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Item Name *</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Paneer Butter Masala" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    {['Starters', 'Main Course', 'Breads', 'Beverages', 'Desserts'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input type="number" className="form-input" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="e.g. 280" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <input className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description" />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                {[{ label: '🟢 Vegetarian', key: 'is_vegetarian' as const }, { label: '✅ Available', key: 'is_available' as const }].map(opt => (
                  <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    <input type="checkbox" checked={form[opt.key]} onChange={e => setForm(p => ({ ...p, [opt.key]: e.target.checked }))} />
                    {opt.label}
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowModal(false)} className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button onClick={handleAdd} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>Add Item</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
