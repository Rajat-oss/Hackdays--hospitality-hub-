import { useEffect, useState } from 'react'
import { collection, query, where, getDocs, updateDoc, doc, orderBy, addDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../features/auth/AuthContext'
import { Bell, CheckCircle, Trash2, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { generateInquiryReply } from '../lib/gemini'
import { useHotelStore } from '../store'

interface Inquiry {
  id: string
  name: string
  phone: string
  details: string
  status: 'pending' | 'responded' | 'approved' | 'rejected' | 'archived'
  item_id?: string
  item_type?: 'room' | 'table'
  created_at: string
}

export default function InquiriesPage() {
  const { profile } = useAuth()
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [actioningId, setActioningId] = useState<string | null>(null)
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

  async function handleApprove(inq: Inquiry) {
    setActioningId(inq.id)
    try {
      // 1. Update Inquiry Status
      await updateDoc(doc(db, 'inquiries', inq.id), { status: 'approved' })
      
      // 2. Create Guest if it's a hotel booking
      if (inq.item_type === 'room' && inq.item_id) {
        // Create a new guest record
        const guestData = {
          business_id: profile!.business_id,
          name: inq.name,
          email: `${inq.name.toLowerCase().replace(' ', '.')}@example.com`,
          phone: inq.phone,
          id_proof: 'Pending Verification'
        }
        
        // We'll use the store to add the guest, but we need the ID to create the booking
        // For simplicity in this demo, we'll generate a temp ID or just rely on the store's addDoc
        // But since we need to link them, let's do a direct Firestore add here to get the IDs
        const guestRef = await addDoc(collection(db, 'guests'), { ...guestData, created_at: new Date().toISOString() })
        
        // 3. Create Booking
        await addDoc(collection(db, 'bookings'), {
          business_id: profile!.business_id,
          guest_id: guestRef.id,
          room_id: inq.item_id,
          check_in: new Date().toISOString().split('T')[0], // Today
          check_out: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          total_amount: 0,
          status: 'confirmed',
          created_at: new Date().toISOString()
        })
        
        toast.success("Guest & Booking created automatically!")
      } else {
        toast.success("Inquiry approved!")
      }

      setInquiries(prev => prev.map(i => i.id === inq.id ? { ...i, status: 'approved' } : i))
    } catch (err) {
      console.error(err)
      toast.error("Failed to approve inquiry")
    } finally {
      setActioningId(null)
    }
  }

  async function handleDraftReply(inq: Inquiry) {
    setDraftingId(inq.id)
    try {
      const reply = await generateInquiryReply(inq.name, inq.details)
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
                  {inq.item_type && (
                    <div style={{ fontSize: '11px', color: 'var(--color-teal-light)', marginTop: '4px', fontWeight: 600 }}>
                      Selected: {inq.item_type.toUpperCase()}
                    </div>
                  )}
                </td>
                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {inq.created_at ? format(new Date(inq.created_at), 'MMM d, h:mm a') : '—'}
                </td>
                <td>
                  <span className={`badge badge-${inq.status}`}>{inq.status}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {inq.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(inq)}
                          disabled={actioningId === inq.id}
                          className="btn btn-sm"
                          style={{ background: 'rgba(76,175,130,0.1)', color: '#4caf82', border: '1px solid rgba(76,175,130,0.2)' }}
                        >
                          {actioningId === inq.id ? '...' : <CheckCircle size={14} />} Approve
                        </button>
                        <button 
                          onClick={() => updateStatus(inq.id, 'rejected')}
                          className="btn btn-sm"
                          style={{ background: 'rgba(192,57,43,0.1)', color: '#e74c3c', border: '1px solid rgba(192,57,43,0.2)' }}
                        >
                          Reject
                        </button>
                      </>
                    )}
                    <button 
                      onClick={() => handleDraftReply(inq)}
                      disabled={draftingId === inq.id}
                      className="btn btn-sm btn-ghost"
                    >
                      <Sparkles size={14} />
                    </button>
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
