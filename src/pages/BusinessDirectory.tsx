import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Business } from '../types'
import { Search, MapPin, Building2, UtensilsCrossed, Star, Filter, Globe, ChevronRight } from 'lucide-react'
import styles from './BusinessDirectory.module.css'

export default function BusinessDirectory() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'hotel' | 'restaurant' | 'both'>('all')

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const q = query(collection(db, 'businesses'))
        const snap = await getDocs(q)
        setBusinesses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Business)))
      } catch (err) {
        console.error('Failed to fetch businesses:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchBusinesses()
  }, [])

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.address?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = filter === 'all' || b.type === filter
      return matchesSearch && matchesType
    })
  }, [businesses, searchQuery, filter])

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className="spinner spinner-lg" />
      <p>Discovering premier hospitality destinations...</p>
    </div>
  )

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Premier <span className={styles.goldText}>Directory</span></h1>
          <p className={styles.heroSubtitle}>Explore the most exclusive hospitality destinations managed by HospitalityHub</p>
          
          <div className={styles.searchBarWrapper}>
            <div className={styles.searchBar}>
              <Search className={styles.searchIcon} size={20} />
              <input 
                type="text" 
                placeholder="Search by name, city or cuisine..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.filterTabs}>
              {(['all', 'hotel', 'restaurant', 'both'] as const).map(type => (
                <button 
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`${styles.filterTab} ${filter === type ? styles.filterTabActive : ''}`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.heroOverlay} />
      </div>

      <div className={styles.resultsHeader}>
        <div className={styles.resultsCount}>
          <Filter size={16} />
          Showing <span>{filteredBusinesses.length}</span> results
        </div>
      </div>

      <div className={styles.grid}>
        {filteredBusinesses.map(biz => (
          <div key={biz.id} className={styles.card} onClick={() => navigate(`/business/${biz.id}`)}>
            <div className={styles.cardImage}>
              {biz.cover_image ? (
                <img src={biz.cover_image} alt={biz.name} />
              ) : (
                <div className={styles.imagePlaceholder}>
                  <span>{biz.name.charAt(0)}</span>
                </div>
              )}
              <div className={styles.cardBadge}>
                {biz.type === 'both' ? <><Building2 size={12} /> + <UtensilsCrossed size={12} /></> : biz.type === 'hotel' ? <Building2 size={12} /> : <UtensilsCrossed size={12} />}
                <span style={{ marginLeft: '4px', textTransform: 'capitalize' }}>{biz.type}</span>
              </div>
            </div>
            
            <div className={styles.cardBody}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{biz.name}</h3>
                <div className={styles.rating}>
                  <Star size={14} fill="var(--gold)" color="var(--gold)" />
                  <span>{biz.rating || '4.9'}</span>
                </div>
              </div>
              
              <div className={styles.cardMeta}>
                <MapPin size={14} />
                <span>{biz.address || 'Location information available on request'}</span>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.priceInfo}>
                  <span className={styles.priceLabel}>Starting from</span>
                  <span className={styles.priceValue}>₹{biz.base_price || '2,499'}</span>
                </div>
                <button className={styles.viewBtn}>
                  <Globe size={14} />
                  Visit
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBusinesses.length === 0 && (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>🔍</div>
          <h3>No destinations found</h3>
          <p>We couldn't find any results matching your current search and filter selection.</p>
          <button onClick={() => { setSearchQuery(''); setFilter('all') }} className="btn btn-secondary">Clear all filters</button>
        </div>
      )}
    </div>
  )
}
