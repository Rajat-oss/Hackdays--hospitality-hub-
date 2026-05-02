import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import s from './Landing.module.css'

/* ── SCROLL REVEAL UTILITY ────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-r]')
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add(s.in || 'in') // Need to ensure global or local '.in' is targeted, we defined [data-r].in in css. 
          io.unobserve(e.target)
        }
      }),
      { threshold: 0.15 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

/* ── PLACEHOLDER IMAGE COMPONENT ──────────────────────────── */
function ImgPlaceholder({ className, text = "Image Placement" }: { className: string, text?: string }) {
  return (
    <div className={`${s.imgPlaceholder} ${className}`}>
      <span className={s.imgPlaceholderText}>{text}</span>
    </div>
  )
}

export default function Landing() {
  useScrollReveal()
  const [navVisible, setNavVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setNavVisible(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={s.lp}>
      {/* ── NAVIGATION ─────────────────────────────────────── */}
      <nav className={`${s.nav} ${navVisible ? s.navVisible : ''}`}>
        <Link to="/" className={s.logo}>
          <div className={s.logoMark}>H</div>
          <span className={s.logoName}>HospitalityHub</span>
        </Link>
        <div className={s.navCta}>
          <Link to="/businesses" className={s.navLink}>book </Link>
          <Link to="/login" className={s.navLink}>Member Portal</Link>
          <Link to="/signup" className={s.btnGold}>Inquire Now</Link>
        </div>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className={s.hero}>
        <div className={s.heroContent}>
          <div className={s.eyebrow}>The New Standard in Management</div>
          <h1 className={s.heroTitle}>
            Uncompromising
            <span>Excellence</span>
          </h1>
          <p className={s.heroSub}>
            An exclusive, all-in-one cinematic command center for ultra-premium hotels and fine-dining establishments. Oversee every detail, effortlessly.
          </p>
        </div>

        <div className={s.heroImgWrap}>
          <ImgPlaceholder className={s.heroMainImg} text="Cinematic Hero Image Placeholder (16:9)" />
        </div>
      </section>

      {/* ── STATS GRID ─────────────────────────────────────── */}
      <section className={s.statGrid}>
        {[
          { val: '₹14L+', lbl: 'Daily Revenue Processed' },
          { val: '99%', lbl: 'Occupancy Optimation' },
          { val: 'ZERO', lbl: 'Downtime Guarantee' },
          { val: '24/7', lbl: 'White-Glove Support' },
        ].map((st, i) => (
          <div key={i} className={s.statItem} data-r>
            <div className={s.statVal}>{st.val}</div>
            <div className={s.statLbl}>{st.lbl}</div>
          </div>
        ))}
      </section>

      {/* ── EDITORIAL MODULE 1: HOTEL ──────────────────────── */}
      <section className={s.editorialSec}>
        <div className={s.grid2}>
          <div data-r>
            <div className={s.edLabel}>01 — The Residency</div>
            <h2 className={s.edH2}>Flawless<br /><i>Operations</i></h2>
            <p className={s.edP}>
              Elevate your front desk to an art form. Visual room grids, VIP guest histories, and instant check-ins beautifully orchestrated on a single pane of glass.
            </p>
            <Link to="/signup" className={s.btnGold}>Explore Hotel Suite</Link>
          </div>
          <div data-r>
            <img 
              src="/hotel1.jfif" 
              alt="The Residency" 
              className={s.edImgTall} 
              style={{ width: '100%', objectFit: 'cover', display: 'block' }} 
            />
          </div>
        </div>
      </section>

      {/* ── FULL WIDTH SHOWCASE ────────────────────────────── */}
      <section className={s.fwImgWrap} data-r>
        <img 
          src="/hotel2.jfif" 
          alt="Luxury Property View" 
          className={s.fwImg} 
          style={{ width: '100%', objectFit: 'cover', display: 'block' }} 
        />
      </section>

      {/* ── EDITORIAL MODULE 2: RESTAURANT ─────────────────── */}
      <section className={s.editorialSec}>
        <div className={`${s.grid2} ${s.grid2Rev}`}>
          <div data-r>
            <div className={s.edLabel}>02 — The Dining Room</div>
            <h2 className={s.edH2}>Culinary<br /><i>Precision</i></h2>
            <p className={s.edP}>
              From the maître d's floor plan to the chef's real-time KDS. Harmonize front-of-house grace with back-of-house velocity.
            </p>
            <Link to="/signup" className={s.btnGold}>Discover Restaurant</Link>
          </div>
          <div data-r>
            <ImgPlaceholder className={s.edImgTall} text="Portrait Image: Fine Dining Setup" />
          </div>
        </div>
      </section>

      {/* ── MARQUEE ────────────────────────────────────────── */}
      <div className={s.marquee}>
        <div className={s.marqueeTrack}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={s.marqueeItem}>
              HospitalityHub <span>✦</span> Premium <span>✦</span> Secure <span>✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BENTO GRID FEATURES ────────────────────────────── */}
      <section className={s.bentoSec}>
        <div className={s.bentoHeader} data-r>
          <div className={s.edLabel} style={{ justifyContent: 'center', paddingLeft: 0 }}>The Ecosystem</div>
          <h2 className={s.edH2}>Intelligence <i>&amp;</i> Design</h2>
        </div>

        <div className={s.bentoGrid}>
          {/* Card 1 */}
          <div className={`${s.bCard} ${s.c8}`} data-r>
            <div>
              <div className={s.bT}>Hybrid Command</div>
              <div className={s.bD}>Manage hospitality and gastronomy concurrently without ever switching contexts.</div>
            </div>
            <ImgPlaceholder className={s.bImgLg} text="Dashboard Snapshot" />
          </div>

          {/* Card 2 */}
          <div className={`${s.bCard} ${s.c4}`} data-r>
            <div>
              <div className={s.bT}>Live Analytics</div>
              <div className={s.bD}>Revenue, metrics, and KPI tracking in real-time, presented with extreme clarity.</div>
            </div>
            <ImgPlaceholder className={s.bImg} text="Chart Preview" />
          </div>

          {/* Card 3 */}
          <div className={`${s.bCard} ${s.c6}`} data-r>
            <div>
              <div className={s.bT}>GST &amp; Accounting</div>
              <div className={s.bD}>Auto-calculated splits, audit-proof logs, and immaculate folio generation.</div>
            </div>
            <ImgPlaceholder className={s.bImg} text="Invoice Graphic" />
          </div>

          {/* Card 4 */}
          <div className={`${s.bCard} ${s.c6}`} data-r>
            <div>
              <div className={s.bT}>Supabase Secured</div>
              <div className={s.bD}>Bank-grade encryption, instant synchronization, and role-based access controls.</div>
            </div>
            <ImgPlaceholder className={s.bImg} text="Architecture Abstract" />
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className={s.footer}>
        <div data-r>
          <h2 className={s.footerTitle}>HospitalityHub</h2>
          <div className={s.footerNav}>
            <Link to="/login" className={s.navLink}>Member Portal</Link>
            <Link to="/pricing" className={s.navLink}>Membership Tiers</Link>
            <a href="#" className={s.navLink}>Contact Concierge</a>
          </div>
          <Link to="/signup" className={s.btnGold} style={{ display: 'inline-block', marginBottom: '6vw' }}>Request Access</Link>
        </div>

        <div className={s.footerBot}>
          <span>© 2026 HospitalityHub Elite.</span>
          <div style={{ display: 'flex', gap: '2vw' }}>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
