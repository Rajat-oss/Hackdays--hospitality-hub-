import React from 'react'
import { Link } from 'react-router-dom'
import { LandingNav } from './Landing/LandingNav'
import { CheckCircle2, Star, ArrowRight } from 'lucide-react'

const PLANS = [
  {
    plan: 'Free',
    price: '₹0',
    sub: 'Forever free',
    desc: 'Perfect for getting started',
    featured: false,
    features: [
      '1 Property',
      'Up to 10 Rooms or 5 Tables',
      'Basic Bookings & Orders',
      'Manual Billing',
      '1 Admin User',
      'Email Support',
    ],
    unavailable: ['GST Invoices', 'Analytics Dashboard', 'Realtime Kitchen View', 'Guest History'],
  },
  {
    plan: 'Pro',
    price: '₹2,499',
    sub: '/month · billed annually',
    desc: 'For growing hotel or restaurant businesses',
    featured: true,
    badge: 'Most Popular',
    features: [
      '3 Properties',
      'Unlimited Rooms & Tables',
      'Full Analytics Dashboard',
      'GST Invoice Generation',
      'Real-time Kitchen View',
      'Guest History & Preferences',
      '5 Admin Users',
      'Priority Email Support',
    ],
    unavailable: ['Hybrid Hotel + Restaurant', 'AI Insights', 'Custom Domain'],
  },
  {
    plan: 'Premium',
    price: '₹5,999',
    sub: '/month · billed annually',
    desc: 'For established hospitality businesses',
    featured: false,
    features: [
      'Unlimited Properties',
      'Hotel + Restaurant (Hybrid Mode)',
      'All Pro Features',
      'AI Insights Dashboard (Coming Soon)',
      'Custom Branding & White-label',
      'Unlimited Admin Users',
      'API & Webhook Access',
      'Dedicated Account Manager',
      '99.9% Uptime SLA',
    ],
    unavailable: [],
  },
]

const FAQ = [
  { q: 'Can I switch plans later?', a: 'Yes — you can upgrade or downgrade your plan at any time. Upgrades take effect immediately, downgrades at the end of the billing cycle.' },
  { q: 'Is my data safe?', a: 'Absolutely. We use Supabase with row-level security, meaning your business data is completely isolated from other tenants.' },
  { q: 'Do you support multiple properties?', a: 'Pro supports 3 properties, and Premium supports unlimited properties under the same account.' },
  { q: 'What happens after my free trial?', a: 'The Free plan has no trial — it\'s free forever with basic features. Paid plans include a 14-day free trial, no credit card required.' },
  { q: 'Can I get a demo?', a: 'Yes! Use the demo login on our home page (hotel@demo.com, password: demo123) to explore all features instantly.' },
]

export default function PricingPage() {
  return (
    <div style={{ background: 'var(--color-bg)', minHeight: '100vh' }}>
      <LandingNav />

      <div style={{ paddingTop: '120px', paddingBottom: '100px' }}>
        <div className="container">
          {/* Header */}
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 72px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(90,150,144,0.08)', border: '1px solid rgba(90,150,144,0.18)', borderRadius: '100px', padding: '5px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--color-teal-light)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '20px' }}>
              Simple, Transparent Pricing
            </div>
            <h1 className="text-display" style={{ marginBottom: '16px' }}>
              Start free, scale <span className="gradient-text">without limits</span>
            </h1>
            <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              No hidden fees. No per-transaction charges. Just straightforward plans that grow with your hospitality business.
            </p>
          </div>

          {/* Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', maxWidth: '1100px', margin: '0 auto 80px', alignItems: 'stretch' }}>
            {PLANS.map((p, i) => (
              <div key={i} style={{
                background: p.featured ? 'linear-gradient(135deg, rgba(47,87,85,0.2) 0%, rgba(22,10,9,0.9) 100%)' : 'var(--color-bg-card)',
                border: `1px solid ${p.featured ? 'rgba(90,150,144,0.35)' : 'var(--border-subtle)'}`,
                borderRadius: '24px',
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: p.featured ? '0 0 40px rgba(90,150,144,0.1)' : 'none',
                transform: p.featured ? 'scale(1.02)' : 'none',
              }}>
                {p.badge && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(90,150,144,0.15)', color: 'var(--color-teal-light)', border: '1px solid rgba(90,150,144,0.25)', borderRadius: '100px', padding: '4px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '20px', width: 'fit-content' }}>
                    <Star size={10} fill="currentColor" /> {p.badge}
                  </div>
                )}
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{p.plan}</div>
                <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--color-cream)', letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '4px' }}>{p.price}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>{p.sub}</div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>{p.desc}</div>

                <div style={{ height: '1px', background: 'var(--border-subtle)', marginBottom: '24px' }} />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
                      <CheckCircle2 size={14} style={{ color: 'var(--color-teal-light)', flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                  {p.unavailable?.map((f, j) => (
                    <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: 'var(--text-muted)', opacity: 0.5 }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '1.5px solid var(--text-muted)', flexShrink: 0 }} /> {f}
                    </div>
                  ))}
                </div>

                <Link
                  to="/signup"
                  className={`btn ${p.featured ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ justifyContent: 'center', width: '100%' }}
                >
                  {p.plan === 'Free' ? 'Get Started Free' : `Start ${p.plan} Trial`} <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 800, textAlign: 'center', marginBottom: '40px', color: 'var(--text-primary)' }}>Frequently Asked Questions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {FAQ.map((f, i) => (
                <div key={i} style={{ background: 'var(--color-bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', padding: '20px 24px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{f.q}</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
