import React, { useState, useEffect } from 'react'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../auth/AuthContext'
import { toast } from 'react-hot-toast'
import { Save, Image as ImageIcon, Globe, Eye, Sparkles } from 'lucide-react'
import type { Business } from '../../types'
import { enhanceStorefrontDescription } from '../../lib/gemini'

export default function StorefrontManager() {
  const { profile } = useAuth()
  const [business, setBusiness] = useState<Partial<Business>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enhancing, setEnhancing] = useState(false)

  useEffect(() => {
    async function fetchBusiness() {
      if (!profile?.business_id) return
      try {
        const docRef = doc(db, 'businesses', profile.business_id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setBusiness(docSnap.data() as Business)
        }
      } catch (err) {
        toast.error('Failed to load business details')
      } finally {
        setLoading(false)
      }
    }
    fetchBusiness()
  }, [profile?.business_id])

  async function handleEnhance() {
    if (!business.description) {
      toast.error("Please write a few basic words first to enhance.")
      return
    }
    setEnhancing(true)
    const toastId = toast.loading("AI is enhancing your description...")
    try {
      const enhanced = await enhanceStorefrontDescription(business.description)
      setBusiness({ ...business, description: enhanced })
      toast.success("Description enhanced! Don't forget to save.", { id: toastId })
    } catch (err) {
      toast.error("Failed to enhance.", { id: toastId })
    } finally {
      setEnhancing(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!profile?.business_id) return

    setSaving(true)
    try {
      const docRef = doc(db, 'businesses', profile.business_id)
      await updateDoc(docRef, {
        cover_image: business.cover_image || '',
        description: business.description || '',
        is_published: !!business.is_published,
        address: business.address || '',
        phone: business.phone || '',
        base_price: Number(business.base_price) || 0,
        discounted_price: Number(business.discounted_price) || 0,
        rating: Number(business.rating) || 0,
        rating_count: Number(business.rating_count) || 0,
        membership_tag: business.membership_tag || ''
      })
      toast.success('Public storefront updated successfully!')
    } catch (err) {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="page-loader"><span className="spinner" /></div>

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={24} /> Public View
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Manage how your business appears to the public in the directory.
          </p>
        </div>
        <a 
          href={`/business/${profile?.business_id}`} 
          target="_blank" 
          rel="noreferrer"
          className="btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', color: 'white' }}
        >
          <Eye size={16} /> View Live Page
        </a>
      </div>

      <div className="card">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(212, 175, 55, 0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <label className="custom-checkbox" style={{ margin: 0 }}>
              <input 
                type="checkbox" 
                checked={business.is_published || false}
                onChange={e => setBusiness({ ...business, is_published: e.target.checked })}
              />
              <span className="checkmark" />
            </label>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--gold)' }}>Publish to Public Directory</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Allow users to find you and send booking inquiries.</div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Cover Image URL</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <input 
                type="url" 
                className="form-input" 
                placeholder="https://images.unsplash.com/photo-..."
                value={business.cover_image || ''}
                onChange={e => setBusiness({ ...business, cover_image: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
            {business.cover_image && (
              <div style={{ marginTop: '12px', width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                <img src={business.cover_image} alt="Cover Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Business Description</label>
              <button 
                type="button" 
                onClick={handleEnhance} 
                disabled={enhancing}
                style={{ 
                  background: 'linear-gradient(135deg, var(--gold), #A67C00)', color: '#000', 
                  border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.8rem', 
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', cursor: enhancing ? 'wait' : 'pointer' 
                }}
              >
                {enhancing ? <span className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px', borderColor: 'rgba(0,0,0,0.3)', borderTopColor: '#000' }} /> : <Sparkles size={14} />}
                AI Enhance
              </button>
            </div>
            <textarea 
              className="form-input" 
              placeholder="Tell guests what makes your place special... (or type basic notes and click AI Enhance)"
              value={business.description || ''}
              onChange={e => setBusiness({ ...business, description: e.target.value })}
              style={{ minHeight: '120px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Public Phone Number</label>
              <input 
                type="tel" 
                className="form-input" 
                value={business.phone || ''}
                onChange={e => setBusiness({ ...business, phone: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Full Address</label>
              <input 
                type="text" 
                className="form-input" 
                value={business.address || ''}
                onChange={e => setBusiness({ ...business, address: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Base Price (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={business.base_price || ''}
                onChange={e => setBusiness({ ...business, base_price: Number(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Discounted Price (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={business.discounted_price || ''}
                onChange={e => setBusiness({ ...business, discounted_price: Number(e.target.value) })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Rating (e.g. 4.8)</label>
              <input 
                type="number" step="0.1" max="5" min="0"
                className="form-input" 
                value={business.rating || ''}
                onChange={e => setBusiness({ ...business, rating: Number(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Rating Count</label>
              <input 
                type="number" 
                className="form-input" 
                value={business.rating_count || ''}
                onChange={e => setBusiness({ ...business, rating_count: Number(e.target.value) })}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Membership Tag</label>
              <input 
                type="text" placeholder="e.g. WIZARD MEMBER"
                className="form-input" 
                value={business.membership_tag || ''}
                onChange={e => setBusiness({ ...business, membership_tag: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : <><Save size={16} /> Save Changes</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
