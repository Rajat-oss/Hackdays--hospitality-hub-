import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import styles from './Landing.module.css'

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}>
      <div className={styles.navInner}>
        <Link to="/" className={styles.navLogo}>
          <span className={styles.logoIcon}>H</span>
          <span>Hospitality<span className={styles.logoAccent}>Hub</span></span>
        </Link>

        <div className={`${styles.navLinks} ${menuOpen ? styles.navLinksOpen : ''}`}>
          <a href="#features" className={styles.navLink} onClick={() => setMenuOpen(false)}>Features</a>
          <a href="#hotel" className={styles.navLink} onClick={() => setMenuOpen(false)}>Hotel</a>
          <a href="#restaurant" className={styles.navLink} onClick={() => setMenuOpen(false)}>Restaurant</a>
          <Link to="/pricing" className={styles.navLink} onClick={() => setMenuOpen(false)}>Pricing</Link>
          <Link to="/login" className="btn btn-secondary btn-sm" style={{ marginLeft: '8px' }}>Sign In</Link>
          <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
        </div>

        <button className={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  )
}
