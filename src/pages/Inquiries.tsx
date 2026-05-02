import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../features/auth/AuthContext'
import { Bell, Search, CheckCircle, Clock, Trash2, MessageSquare, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { generateInquiryReply } from '../lib/gemini'

interface Inquiry {
  id: string
  name: string
  phone: string
  details: string
  status: 'pending' | 'responded' | 'archived'
  created_at: string
}

export default function InquiriesPage() {
  const { profile } = useAuth()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [draftingId, setDraftingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInquiries() {
      if (!profile?.business_id) return
      try {
        const q = query(
          collection(db, 'inquiries'),
          where('business_id', '==', profile.business_id),
          orderBy('created_at', 'desc')
        )
        const snap = await getDocs(q)
        setInquiries(snap.docs.map(d => ({ id: d.id, ...d.data() } as Inquiry)))
      } catch (err) {
        console.error('Error fetching inquiries:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchInquiries()
  }, [profile?.business_id])

  async function updateStatus(id: string, status: string) {
    try {
      await updateDoc(doc(db, 'inquiries', id), { status })
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: status as any } : inq))
      toast.success(`Inquiry marked as ${status}`)
    } catch (err) {
      toast.error('Failed to update status')
    }
  }

  async function handleDraftReply(inq: Inquiry) {
    setDraftingId(inq.id)
    try {
      const reply = await generateInquiryReply(inq.name, inq.details)
      // For this demo, we'll show it in a prompt so they can copy it
      alert(`AI Drafted Response:\n\n${reply}\n\n(You can copy this to your email/SMS)`)
    } catch (err) {
      toast.error("Failed to draft reply")
    } finally {
      setDraftingId(null)
    }
  }

  if (loading) return <div className="page-loader"><span className="spinner" /></div>

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 className="page-title">Booking Inquiries</h1>
          <p className="page-subtitle">Manage customer leads from your public profile</p>
        </div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Guest Details</th>
              <th>Request</th>
              <th>Date Received</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map(inq => (
              <tr key={inq.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{inq.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{inq.phone}</div>
                </td>
                <td style={{ maxWidth: '300px' }}>
                  <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{inq.details}</div>
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {inq.created_at ? format(new Date(inq.created_at), 'MMM d, h:mm a') : '—'}
                </td>
                <td>
                  <span className={`badge badge-${inq.status}`}>{inq.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => handleDraftReply(inq)}
                      disabled={draftingId === inq.id}
                      className="btn btn-sm"
                      style={{ background: 'rgba(90,150,144,0.1)', color: 'var(--color-teal-light)', border: '1px solid rgba(90,150,144,0.2)' }}
                    >
                      {draftingId === inq.id ? '...' : <Sparkles size={14} />} AI Draft
                    </button>
                    {inq.status === 'pending' && (
                      <button 
                        onClick={() => updateStatus(inq.id, 'responded')}
                        className="btn btn-sm"
                        style={{ background: 'rgba(76,175,130,0.1)', color: '#4caf82', border: '1px solid rgba(76,175,130,0.2)' }}
                      >
                        <CheckCircle size={14} /> Mark Handled
                      </button>
                    )}
                    <button 
                      onClick={() => updateStatus(inq.id, 'archived')}
                      className="btn btn-sm btn-ghost"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {inquiries.length === 0 && (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bell size={40} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <div>No inquiries yet. They will appear here when customers contact you from your public page.</div>
          </div>
        )}
      </div>
    </div>
  )
}
