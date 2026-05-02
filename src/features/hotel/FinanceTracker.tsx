import React, { useState } from 'react'
import { useHotelStore } from '../../store'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet } from 'lucide-react'
import styles from './Hotel.module.css'

const MONTHLY = [
  { month: 'Oct', income: 180000, expense: 42000 },
  { month: 'Nov', income: 220000, expense: 38000 },
  { month: 'Dec', income: 310000, expense: 55000 },
  { month: 'Jan', income: 265000, expense: 49000 },
  { month: 'Feb', income: 290000, expense: 44000 },
  { month: 'Mar', income: 345000, expense: 61000 },
  { month: 'Apr', income: 284500, expense: 47200 },
]

export default function FinanceTracker() {
  const { transactions } = useHotelStore()
  const [methodFilter, setMethodFilter] = useState('all')

  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const net = income - expense

  const cashTx = transactions.filter(t => t.payment_method === 'cash')
  const upiTx = transactions.filter(t => t.payment_method === 'upi')
  const cardTx = transactions.filter(t => t.payment_method === 'card')

  const filtered = methodFilter === 'all' ? transactions : transactions.filter(t => t.payment_method === methodFilter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="page-title">Finance & Revenue</h1>
        <p className="page-subtitle">All transactions and financial summary</p>
      </div>

      {/* Stats */}
      <div className={styles.financeStats}>
        {[
          { label: 'Total Income', value: `₹${income.toLocaleString()}`, icon: TrendingUp, color: '#4caf82', bg: 'rgba(76,175,130,0.1)' },
          { label: 'Total Expenses', value: `₹${expense.toLocaleString()}`, icon: TrendingDown, color: '#e74c3c', bg: 'rgba(192,57,43,0.1)' },
          { label: 'Net Revenue', value: `₹${net.toLocaleString()}`, icon: DollarSign, color: 'var(--color-teal-light)', bg: 'rgba(90,150,144,0.1)' },
          { label: 'Pending', value: `₹3,400`, icon: Wallet, color: '#d4a017', bg: 'rgba(212,160,23,0.1)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                <s.icon size={18} />
              </div>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: 800, color: s.color, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Income vs Expenses</div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>Last 7 months</div>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#4caf82' }} />Income</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)' }}><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-maroon-light)' }} />Expenses</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={MONTHLY}>
            <defs>
              <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4caf82" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4caf82" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c0392b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#c0392b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,150,144,0.08)" />
            <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v/1000}k`} />
            <Tooltip contentStyle={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '10px', color: 'var(--text-primary)' }} formatter={(v: any) => `₹${v.toLocaleString()}`} />
            <Area type="monotone" dataKey="income" stroke="#4caf82" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
            <Area type="monotone" dataKey="expense" stroke="#c0392b" strokeWidth={2} fill="url(#expGrad)" name="Expenses" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Payment method breakdown */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {[
          { label: 'Cash', icon: '💵', txs: cashTx, color: '#4caf82' },
          { label: 'UPI', icon: '📱', txs: upiTx, color: 'var(--color-teal-light)' },
          { label: 'Card', icon: '💳', txs: cardTx, color: '#d4a017' },
        ].map(m => (
          <div key={m.label} className="card" style={{ flex: 1, padding: '20px' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{m.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{m.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: m.color }}>₹{m.txs.reduce((s, t) => s + t.amount, 0).toLocaleString()}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{m.txs.length} transactions</div>
          </div>
        ))}
      </div>

      {/* Transaction Log */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Transaction Log</div>
          <select className="form-select" style={{ width: 'auto' }} value={methodFilter} onChange={e => setMethodFilter(e.target.value)}>
            <option value="all">All Methods</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
          </select>
        </div>
        <div className={styles.txList}>
          {filtered.map(t => (
            <div key={t.id} className={styles.txItem}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.description}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{t.created_at} · {t.payment_method}</div>
              </div>
              <div style={{ fontSize: '18px', fontWeight: 800 }} className={t.type === 'income' ? styles.txIncome : styles.txExpense}>
                {t.type === 'income' ? '+' : '-'}₹{t.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
