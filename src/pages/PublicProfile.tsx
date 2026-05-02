import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Business } from '../types'
import { Building2, Phone, MapPin, Send, Star, ChevronLeft, Users, Coffee, Sparkles } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { generateBookingResponse, getDietaryMenuMatch, getPricingInsightsAndAlternatives } from '../lib/gemini'

export default function PublicProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)
  const [inquiry, setInquiry] = useState({ name: '', phone: '', details: '' })
  const [submitting, setSubmitting] = useState(false)

  const [dietaryInput, setDietaryInput] = useState('')
  const [dietaryLoading, setDietaryLoading] = useState(false)
  const [dietaryRecommendation, setDietaryRecommendation] = useState('')
  const [alternativesLoading, setAlternativesLoading] = useState(false)

  const [rooms, setRooms] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])

  useEffect(() => {
    async function fetchBusiness() {
      try {
        const docRef = doc(db, 'businesses', id as string)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const biz = { id: docSnap.id, ...docSnap.data() } as Business
          setBusiness(biz)

          import('firebase/firestore').then(async ({ collection, query, where, getDocs }) => {
            const roomsQ = query(collection(db, 'rooms'), where('business_id', '==', biz.id), where('status', '==', 'available'))
            const tablesQ = query(collection(db, 'restaurant_tables'), where('business_id', '==', biz.id), where('status', '==', 'available'))
            const [roomsSnap, tablesSnap] = await Promise.all([getDocs(roomsQ), getDocs(tablesQ)])
            
            setRooms(roomsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
            setTables(tablesSnap.docs.map(d => ({ id: d.id, ...d.data() })))
          })
        }
      } catch (err) {
        console.error('Error fetching business:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchBusiness()
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!business) return

    if (!inquiry.name || !inquiry.phone || !inquiry.details) {
      toast.error("Please fill in all fields.")
      return
    }

    setSubmitting(true)
    const toastId = toast.loading('AI Concierge processing request...')
    
    try {
      const smsMessage = await generateBookingResponse(business.name, inquiry.details, inquiry.phone, inquiry.name)
      toast.success('Confirmed!', { id: toastId })
      setTimeout(() => alert(smsMessage), 500)
      setInquiry({ name: '', phone: '', details: '' })
    } catch (err) {
      toast.error('Failed to process.', { id: toastId })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDietaryMatch() {
    if (!dietaryInput) return
    setDietaryLoading(true)
    const toastId = toast.loading("Consulting the Chef...")
    try {
      const rec = await getDietaryMenuMatch(dietaryInput)
      setDietaryRecommendation(rec)
      toast.success("Recommendation ready!", { id: toastId })
    } catch (e) {
      toast.error("Failed to get recommendation.", { id: toastId })
    } finally {
      setDietaryLoading(false)
    }
  }

  async function handleFindAlternatives() {
    if (!business) return
    setAlternativesLoading(true)
    const toastId = toast.loading("Finding alternatives...")
    try {
      const alts = await getPricingInsightsAndAlternatives(business.name)
      toast.success("Alternatives found!", { id: toastId })
      setTimeout(() => alert(`💡 AI Insight:\n\n${alts}`), 500)
    } catch (e) {
      toast.error("Failed to find alternatives.", { id: toastId })
    } finally {
      setAlternativesLoading(false)
    }
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}><span className="spinner" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: 'var(--gold)' }} /></div>
  }

  if (!business) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
        <h2 style={{ color: 'white', marginBottom: '16px' }}>Business not found</h2>
        <button onClick={() => navigate('/businesses')} style={{ background: 'var(--gold)', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '24px', fontWeight: 600, cursor: 'pointer' }}>Go Back</button>
      </div>
    )
  }

  const responsiveStyles = `
    .profile-container {
      max-width: 600px;
      margin: 0 auto;
      background: #111;
      min-height: 100vh;
      position: relative;
      box-shadow: 0 0 50px rgba(0,0,0,0.5);
    }
    .hero-image-wrap {
      position: relative; width: 100%; height: 380px; background: #1a1a1a;
    }
    .content-sheet {
      background: #111; border-radius: 32px 32px 0 0; margin-top: -32px; position: relative; padding: 32px 24px 40px; z-index: 10;
    }
    .layout-grid {
      display: block;
    }
    .booking-sidebar {
      display: block;
      margin-top: 32px;
    }
    .mobile-action-bar {
      position: fixed; bottom: 0; left: 0; right: 0; background: rgba(17, 17, 17, 0.9); backdrop-filter: blur(20px); border-top: 1px solid rgba(255,255,255,0.05); padding: 16px 24px; z-index: 100; display: flex; justify-content: center;
    }
    .submit-btn-mobile { display: flex; }
    .submit-btn-desktop { display: none; }

    @media (min-width: 1024px) {
      .profile-container {
        max-width: 1100px;
        padding: 40px 24px;
        background: transparent;
        box-shadow: none;
      }
      .hero-image-wrap {
        height: 450px;
        border-radius: 24px;
        overflow: hidden;
        margin-bottom: 40px;
      }
      .content-sheet {
        margin-top: 0;
        padding: 0;
        background: transparent;
      }
      .layout-grid {
        display: grid;
        grid-template-columns: 1fr 380px;
        gap: 60px;
        align-items: start;
      }
      .booking-sidebar {
        position: sticky;
        top: 40px;
        background: rgba(255,255,255,0.03);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 24px;
        padding: 32px;
        margin-top: 0;
      }
      .mobile-action-bar {
        display: none;
      }
      .submit-btn-desktop { display: flex; margin-top: 24px; }
    }
  `

  return (
    <div style={{ minHeight: '100vh', background: '#000', fontFamily: '"Inter", sans-serif', paddingBottom: '100px' }}>
      <style>{responsiveStyles}</style>
      
      <div className="profile-container">
        
        {/* Full Bleed Hero Image */}
        <div className="hero-image-wrap">
          {business.cover_image ? (
            <img src={business.cover_image} alt={business.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ 
              width: '100%', height: '100%', 
              background: 'radial-gradient(circle at center, #1a1a1a 0%, #000 100%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden'
            }}>
              {/* Luxury Geometric Pattern overlay */}
              <div style={{ 
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                opacity: 0.05, 
                backgroundImage: 'repeating-linear-gradient(45deg, var(--gold) 0, var(--gold) 1px, transparent 1px, transparent 30px), repeating-linear-gradient(-45deg, var(--gold) 0, var(--gold) 1px, transparent 1px, transparent 30px)'
              }} />
              
              {/* Soft gold glow behind the monogram */}
              <div style={{ position: 'absolute', width: '200px', height: '200px', background: 'var(--gold)', filter: 'blur(100px)', opacity: 0.15, borderRadius: '50%' }} />

              {/* Diamond Monogram Box */}
              <div style={{ 
                width: '120px', height: '120px', 
                border: '1px solid rgba(212, 175, 55, 0.4)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', zIndex: 2, transform: 'rotate(45deg)',
                boxShadow: 'inset 0 0 20px rgba(212, 175, 55, 0.05)'
              }}>
                <div style={{ 
                  width: '104px', height: '104px', 
                  border: '1px solid rgba(212, 175, 55, 0.15)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.05) 0%, transparent 100%)'
                }}>
                  <span style={{ 
                    transform: 'rotate(-45deg)', 
                    fontSize: '3rem', fontWeight: 300, color: 'var(--gold)', 
                    fontFamily: '"Times New Roman", serif', letterSpacing: '2px',
                    textShadow: '0 2px 10px rgba(212,175,55,0.2)'
                  }}>
                    {business.name ? business.name.charAt(0).toUpperCase() : 'H'}
                  </span>
                </div>
              </div>

              {/* Business Type Subtitle */}
              <div style={{ 
                marginTop: '60px', position: 'relative', zIndex: 2,
                color: 'rgba(212,175,55,0.7)', fontSize: '0.75rem', letterSpacing: '6px', textTransform: 'uppercase',
                fontWeight: 600
              }}>
                {business.type === 'both' ? 'Hotel & Dining' : business.type || 'Exclusive'}
              </div>
            </div>
          )}
          
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)' }} />
          
          <button onClick={() => navigate(-1)} style={{ position: 'absolute', top: '24px', left: '20px', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ChevronLeft size={24} />
          </button>
          <div style={{ position: 'absolute', top: '24px', right: '20px', padding: '8px 12px', borderRadius: '20px', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', color: 'white', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
            <Star size={14} fill="var(--gold)" color="var(--gold)" /> 4.9
          </div>
        </div>

        {/* Content Sheet */}
        <div className="content-sheet">
          <div className="layout-grid">
            
            {/* Left Column */}
            <div>
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <span style={{ background: 'rgba(212, 175, 55, 0.1)', color: 'var(--gold)', padding: '6px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {business.type === 'both' ? 'Hotel & Dining' : business.type}
                  </span>
                </div>
                <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: 'white', margin: '0 0 16px 0', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                  {business.name}
                </h1>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem' }}>
                  {business.address && <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}><MapPin size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> <span style={{ lineHeight: 1.4 }}>{business.address}</span></div>}
                  {business.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Phone size={18} style={{ flexShrink: 0 }} /> <span>{business.phone}</span></div>}
                  <button 
                    onClick={handleFindAlternatives}
                    disabled={alternativesLoading}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', alignSelf: 'flex-start', cursor: alternativesLoading ? 'wait' : 'pointer', marginTop: '12px' }}
                  >
                    {alternativesLoading ? <span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }}/> : <Sparkles size={16} color="var(--gold)" />}
                    Find Cheaper Alternatives
                  </button>
                </div>
              </div>

              {business.description && (
                <div style={{ paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '12px' }}>About</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', fontSize: '1rem', margin: 0 }}>
                    {business.description}
                  </p>
                </div>
              )}

              <div style={{ paddingBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="var(--gold)" /> AI Menu Matcher
                </h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', marginBottom: '16px' }}>Tell us your dietary preferences and our AI Chef will recommend the perfect dish.</p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <input 
                    type="text" 
                    placeholder="E.g., Vegan, allergic to peanuts..." 
                    value={dietaryInput}
                    onChange={e => setDietaryInput(e.target.value)}
                    style={{ flex: '1 1 200px', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', color: 'white', outline: 'none', fontSize: '0.95rem' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--gold)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                  <button 
                    onClick={handleDietaryMatch}
                    disabled={dietaryLoading}
                    style={{ background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '12px', padding: '14px 20px', fontWeight: 700, cursor: dietaryLoading ? 'wait' : 'pointer' }}
                  >
                    {dietaryLoading ? <span className="spinner" style={{ width: '16px', height: '16px', borderColor: 'rgba(0,0,0,0.3)', borderTopColor: '#000' }}/> : 'Ask AI'}
                  </button>
                </div>
                {dietaryRecommendation && (
                  <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.2)', borderRadius: '16px', color: '#f3e5b5', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {dietaryRecommendation}
                  </div>
                )}
              </div>

              {(rooms.length > 0 || tables.length > 0) && (
                <div style={{ paddingBottom: '32px', marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '16px' }}>Available Today</h3>
                  
                  <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px', scrollSnapType: 'x mandatory', margin: '0 -24px', padding: '0 24px 16px' }}>
                    {rooms.map(room => (
                      <div key={room.id} style={{ flex: '0 0 260px', scrollSnapAlign: 'start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ color: 'white', fontSize: '1.1rem', margin: 0, textTransform: 'capitalize', fontWeight: 700 }}>{room.type} Room</h4>
                          <span style={{ background: 'rgba(76, 175, 130, 0.1)', color: '#4caf82', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>1 Left</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '16px' }}>
                          <Users size={14} /> Up to {room.capacity} guests
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold)' }}>
                          ₹{room.price_per_night} <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>/ night</span>
                        </div>
                      </div>
                    ))}
                    {tables.map(table => (
                      <div key={table.id} style={{ flex: '0 0 260px', scrollSnapAlign: 'start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ color: 'white', fontSize: '1.1rem', margin: 0, fontWeight: 700 }}>Table {table.number}</h4>
                          <span style={{ background: 'rgba(76, 175, 130, 0.1)', color: '#4caf82', padding: '4px 8px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>Open</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '16px' }}>
                          <Coffee size={14} /> Seats {table.capacity} · {table.location || 'Dining'}
                        </div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold)' }}>
                          Reserve Now
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (Booking Form Sidebar) */}
            <div className="booking-sidebar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--gold), #A67C00)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000' }}>
                  <Send size={16} />
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', margin: 0 }}>AI Concierge</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
                Skip the wait. Send your request and our intelligent agent will confirm availability instantly via SMS.
              </p>

              <form id="ai-booking-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontWeight: 500 }}>Full Name</label>
                  <input 
                    type="text" placeholder="John Doe" value={inquiry.name} onChange={e => setInquiry({ ...inquiry, name: e.target.value })}
                    style={{
                      width: '100%', padding: '16px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', color: 'white', fontSize: '1rem', outline: 'none'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }} onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontWeight: 500 }}>Contact Number</label>
                  <input 
                    type="tel" placeholder="+1 (234) 567-890" value={inquiry.phone} onChange={e => setInquiry({ ...inquiry, phone: e.target.value })}
                    style={{
                      width: '100%', padding: '16px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', color: 'white', fontSize: '1rem', outline: 'none'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }} onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '8px', fontWeight: 500 }}>Request Details</label>
                  <textarea 
                    placeholder="I'd like to book a suite for this weekend..." value={inquiry.details} onChange={e => setInquiry({ ...inquiry, details: e.target.value })}
                    style={{
                      width: '100%', padding: '16px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', color: 'white', fontSize: '1rem', outline: 'none', minHeight: '120px', resize: 'vertical'
                    }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--gold)' }} onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)' }}
                  />
                </div>
                
                {/* Desktop Submit Button */}
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="submit-btn-desktop"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, var(--gold) 0%, #A67C00 100%)',
                    color: '#000', border: 'none', borderRadius: '16px', padding: '18px',
                    fontSize: '1.1rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                    alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 8px 30px rgba(212, 175, 55, 0.2)',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? <span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} /> : 'Send Request'}
                </button>
              </form>
            </div>

          </div>
        </div>

        {/* Mobile Sticky Bottom Action Bar */}
        <div className="mobile-action-bar">
          <div style={{ maxWidth: '600px', width: '100%' }}>
            <button 
              type="submit" 
              form="ai-booking-form"
              disabled={submitting}
              className="submit-btn-mobile"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, var(--gold) 0%, #A67C00 100%)',
                color: '#000', border: 'none', borderRadius: '16px', padding: '18px',
                fontSize: '1.1rem', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer',
                alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: '0 8px 30px rgba(212, 175, 55, 0.2)',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? <span className="spinner" style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#000' }} /> : 'Send Request'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
