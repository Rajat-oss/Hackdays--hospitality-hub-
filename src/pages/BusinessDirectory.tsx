import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { collection, getDocs, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Business } from '../types'
import { Building2, Star, Wifi, Tv, Battery, Phone, Crosshair, Moon, Sun, Filter } from 'lucide-react'

const LOCATIONS = ['Majestic', 'Koramangala', 'Marathahalli', 'HSR Layout', 'Indiranagar']

export default function BusinessDirectory() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [isDarkTheme, setIsDarkTheme] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const navigate = useNavigate()

  // Filter States
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number>(10000)
  const [sortBy, setSortBy] = useState('popularity')

  useEffect(() => {
    async function fetchBusinesses() {
      try {
        const q = query(collection(db, 'businesses'), orderBy('created_at', 'desc'))
        const querySnapshot = await getDocs(q)
        
        const fetchedBusinesses: Business[] = []
        querySnapshot.forEach((doc) => {
          fetchedBusinesses.push({ id: doc.id, ...doc.data() } as Business)
        })

        setBusinesses(fetchedBusinesses)
      } catch (err) {
        console.error('Error fetching businesses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [])

  const toggleLocation = (loc: string) => {
    if (selectedLocations.includes(loc)) {
      setSelectedLocations(selectedLocations.filter(l => l !== loc))
    } else {
      setSelectedLocations([...selectedLocations, loc])
    }
  }

  const filteredBusinesses = useMemo(() => {
    return businesses.filter(biz => {
      // text search (name or address)
      if (searchTerm) {
        const term = searchTerm.toLowerCase()
        const matchesName = biz.name.toLowerCase().includes(term)
        const matchesAddress = biz.address && biz.address.toLowerCase().includes(term)
        if (!matchesName && !matchesAddress) return false
      }
      
      // location pills
      if (selectedLocations.length > 0) {
        if (!biz.address) return false
        const addrLower = biz.address.toLowerCase()
        const matchesLoc = selectedLocations.some(loc => addrLower.includes(loc.toLowerCase()))
        if (!matchesLoc) return false
      }
      
      // price range
      const price = biz.discounted_price || biz.base_price || 999
      if (price > priceRange) return false
      
      return true
    }).sort((a, b) => {
      if (sortBy === 'price_asc') {
        const pa = a.discounted_price || a.base_price || 999
        const pb = b.discounted_price || b.base_price || 999
        return pa - pb
      }
      if (sortBy === 'price_desc') {
        const pa = a.discounted_price || a.base_price || 999
        const pb = b.discounted_price || b.base_price || 999
        return pb - pa
      }
      if (sortBy === 'rating') {
        const ra = a.rating || 0
        const rb = b.rating || 0
        return rb - ra
      }
      return 0 // default popularity
    })
  }, [businesses, searchTerm, selectedLocations, priceRange, sortBy])

  const oyoStyles = `
    .oyo-wrapper {
      --oyo-bg: #f8f9fa;
      --oyo-card-bg: #fff;
      --oyo-text: #222;
      --oyo-text-muted: #666;
      --oyo-border: #e0e0e0;
      --oyo-pill-bg: #f3f4f5;
      --oyo-primary: #e52b50;
      --oyo-success: #1ab64f;
      --oyo-image-bg: #eee;
    }

    .oyo-wrapper.dark-theme {
      --oyo-bg: #0a0a0a;
      --oyo-card-bg: #111;
      --oyo-text: #fff;
      --oyo-text-muted: #aaa;
      --oyo-border: #333;
      --oyo-pill-bg: #222;
      --oyo-image-bg: #1a1a1a;
    }

    .oyo-container {
      min-height: 100vh;
      background: var(--oyo-bg);
      font-family: 'Inter', sans-serif;
      color: var(--oyo-text);
      transition: background 0.3s, color 0.3s;
    }

    /* Top Bar */
    .oyo-header {
      background: var(--oyo-card-bg);
      border-bottom: 1px solid var(--oyo-border);
      position: sticky; top: 0; z-index: 100;
    }
    .oyo-header-top {
      display: flex; justify-content: space-between; align-items: center; padding: 0 20px; height: 72px;
    }
    .oyo-logo {
      font-size: 24px; font-weight: 900; color: var(--oyo-primary); letter-spacing: -1px; text-decoration: none;
    }
    
    .oyo-search-container {
      display: none; /* hidden on mobile */
      align-items: center; border: 1px solid var(--oyo-border); border-radius: 4px; height: 48px; background: var(--oyo-card-bg); margin-left: 24px; flex: 1; max-width: 800px;
    }
    .search-input-group {
      display: flex; align-items: center; padding: 0 16px; border-right: 1px solid var(--oyo-border); height: 100%;
    }
    .search-input-group input { border: none; outline: none; font-size: 14px; font-weight: 600; width: 100%; background: transparent; color: var(--oyo-text); }
    .search-btn {
      background: var(--oyo-success); color: white; border: none; height: 100%; padding: 0 32px; font-weight: 700; font-size: 16px; border-radius: 0 4px 4px 0; cursor: pointer;
    }
    
    .header-right {
      display: flex; align-items: center; gap: 16px; font-size: 14px; font-weight: 600; margin-left: auto;
    }
    
    /* Main Layout */
    .oyo-main {
      display: flex; flex-direction: column; max-width: 1440px; margin: 0 auto; padding: 0;
    }
    
    /* Sidebar */
    .oyo-sidebar {
      display: none; /* hidden on mobile */
      width: 320px; background: var(--oyo-card-bg); border-right: 1px solid var(--oyo-border); padding: 24px; flex-shrink: 0;
    }
    .oyo-sidebar.mobile-open {
      display: block; width: 100%; border-right: none; border-bottom: 1px solid var(--oyo-border);
    }
    
    .sidebar-section { margin-bottom: 32px; }
    .sidebar-title { font-size: 24px; font-weight: 800; margin-bottom: 16px; color: var(--oyo-text); }
    .sidebar-subtitle { font-size: 15px; font-weight: 700; margin-bottom: 12px; color: var(--oyo-text); }
    .location-pill {
      display: inline-block; padding: 8px 12px; background: var(--oyo-pill-bg); border: 1px solid var(--oyo-border); border-radius: 4px; font-size: 13px; margin: 0 8px 8px 0; color: var(--oyo-text); cursor: pointer; transition: all 0.2s;
    }
    .location-pill.active {
      background: var(--oyo-primary); color: #fff; border-color: var(--oyo-primary);
    }
    .view-more { color: var(--oyo-primary); font-size: 13px; font-weight: 700; cursor: pointer; margin-top: 8px; }
    
    /* Custom Range Slider */
    input[type=range] {
      -webkit-appearance: none; width: 100%; background: transparent; margin: 16px 0;
    }
    input[type=range]::-webkit-slider-thumb {
      -webkit-appearance: none; height: 16px; width: 16px; border-radius: 50%; background: var(--oyo-card-bg); border: 2px solid var(--oyo-primary); cursor: pointer; margin-top: -6px;
    }
    input[type=range]::-webkit-slider-runnable-track {
      width: 100%; height: 4px; cursor: pointer; background: var(--oyo-primary); border-radius: 2px;
    }
    
    /* Content Area */
    .oyo-content {
      flex: 1; padding: 16px; background: var(--oyo-bg);
    }
    .content-header { display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
    .breadcrumbs { font-size: 12px; color: var(--oyo-text-muted); margin-bottom: 8px; }
    .content-title { font-size: 20px; font-weight: 800; margin: 0; color: var(--oyo-text); }
    
    .mobile-filter-btn {
      display: flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--oyo-card-bg); border: 1px solid var(--oyo-border); border-radius: 4px; font-size: 14px; font-weight: 600; cursor: pointer; color: var(--oyo-text);
    }
    
    /* Hotel Card */
    .hotel-card {
      display: flex; flex-direction: column; background: var(--oyo-card-bg); border: 1px solid var(--oyo-border); margin-bottom: 24px; border-radius: 8px; overflow: hidden;
    }
    .hotel-images { display: flex; width: 100%; height: 200px; }
    .main-image { flex: 1; background: var(--oyo-image-bg); position: relative; }
    .main-image img { width: 100%; height: 100%; object-fit: cover; }
    .thumbnail-column { display: none; } /* hidden on mobile */
    
    .hotel-info { padding: 16px; flex: 1; display: flex; flex-direction: column; }
    .hotel-name { font-size: 18px; font-weight: 800; margin: 0 0 4px; color: var(--oyo-text); }
    .hotel-location { font-size: 13px; color: var(--oyo-text-muted); margin: 0 0 12px; }
    .rating-badge { display: inline-flex; align-items: center; background: var(--oyo-success); color: white; padding: 3px 6px; border-radius: 3px; font-size: 12px; font-weight: 700; gap: 4px; }
    .rating-text { font-size: 12px; color: var(--oyo-text-muted); margin-left: 8px; }
    .amenities { display: flex; flex-wrap: wrap; gap: 12px; margin: 16px 0; color: var(--oyo-text); font-size: 12px; align-items: center; }
    .amenity { display: flex; align-items: center; gap: 4px; }
    .wizard-tag { display: inline-flex; align-items: center; background: var(--oyo-pill-bg); border: 1px solid var(--oyo-border); padding: 4px 8px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; border-radius: 2px; color: var(--oyo-text); }
    
    .price-section { margin-top: 16px; display: flex; flex-direction: column; gap: 12px; }
    .price-large { font-size: 24px; font-weight: 800; color: var(--oyo-text); margin-right: 8px; }
    .price-strike { font-size: 14px; color: var(--oyo-text-muted); text-decoration: line-through; margin-right: 8px; }
    .discount-text { font-size: 14px; color: #f5a623; font-weight: 700; }
    .taxes-text { font-size: 11px; color: var(--oyo-text-muted); display: block; margin-top: 4px; }
    
    .btn-group { display: flex; gap: 8px; width: 100%; }
    .btn-outline { flex: 1; border: 1px solid var(--oyo-border); background: var(--oyo-card-bg); color: var(--oyo-text); padding: 10px; font-weight: 700; font-size: 14px; cursor: pointer; border-radius: 4px; text-align: center; }
    .btn-solid { flex: 1; border: none; background: var(--oyo-success); color: #fff; padding: 10px; font-weight: 700; font-size: 14px; cursor: pointer; border-radius: 4px; text-align: center; }

    @media (min-width: 768px) {
      .oyo-header-top { padding: 0 40px; }
      .oyo-logo { font-size: 28px; }
      .oyo-search-container { display: flex; }
      
      .oyo-main { flex-direction: row; }
      .oyo-sidebar { display: block; }
      .mobile-filter-btn { display: none; }
      .oyo-content { padding: 24px 40px; }
      .content-header { flex-direction: row; }
      .content-title { font-size: 24px; }
      
      .hotel-card { flex-direction: row; }
      .hotel-images { width: 420px; height: auto; }
      .thumbnail-column { display: flex; flex-direction: column; width: 90px; }
      .thumbnail { height: 25%; border-left: 2px solid var(--oyo-card-bg); border-bottom: 2px solid var(--oyo-card-bg); background: var(--oyo-image-bg); }
      .thumbnail img { width: 100%; height: 100%; object-fit: cover; }
      
      .hotel-info { padding: 20px; }
      .hotel-name { font-size: 20px; }
      .price-section { flex-direction: row; justify-content: space-between; align-items: flex-end; }
      .price-large { font-size: 28px; }
      .btn-group { width: auto; justify-content: flex-end; }
      .btn-outline { flex: none; padding: 10px 24px; border-color: var(--oyo-text); border-radius: 2px; }
      .btn-solid { flex: none; padding: 10px 24px; border-radius: 2px; }
    }
  `

  return (
    <div className={`oyo-wrapper ${isDarkTheme ? 'dark-theme' : ''}`}>
      <style>{oyoStyles}</style>
      <div className="oyo-container">
        
        {/* Top Header */}
        <header className="oyo-header">
          <div className="oyo-header-top">
            <Link to="/" className="oyo-logo">HospitalityHub</Link>
            
            <div className="oyo-search-container">
              <div className="search-input-group" style={{ flex: 1 }}>
                <input 
                  type="text" 
                  placeholder="Search by city or hotel..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--oyo-text)', background: 'var(--oyo-pill-bg)', padding: '4px 8px', borderRadius: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                   <Crosshair size={14} /> Near me
                </div>
              </div>
              <div className="search-input-group" style={{ width: '240px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Sat, 2 May – Sun, 3 May</span>
              </div>
              <div className="search-input-group" style={{ width: '160px', borderRight: 'none' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>1 Room, 1 Guest</span>
              </div>
              <button className="search-btn">Search</button>
            </div>
            
            <div className="header-right">
              {/* Theme Toggle */}
              <button 
                onClick={() => setIsDarkTheme(!isDarkTheme)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--oyo-text)' }}
              >
                {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              
              <div style={{ display: 'none', alignItems: 'center', gap: '8px' }} className="desktop-only-phone">
                <Phone size={20} color="var(--oyo-text-muted)" />
                <div>
                  <div style={{ fontWeight: 800 }}>0124-6201611</div>
                  <div style={{ fontSize: '11px', color: 'var(--oyo-text-muted)', fontWeight: 400 }}>Call us to Book now</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="oyo-main">
          {/* Sidebar Filters */}
          <aside className={`oyo-sidebar ${showMobileFilters ? 'mobile-open' : ''}`}>
            <div className="sidebar-section">
              <div className="sidebar-title">Filters</div>
              <div className="sidebar-subtitle">Search</div>
              <input 
                type="text" 
                placeholder="Search hotels, addresses.." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid var(--oyo-border)', borderRadius: '4px', marginBottom: '16px', outline: 'none', background: 'var(--oyo-bg)', color: 'var(--oyo-text)' }} 
              />
              <div className="sidebar-subtitle">Popular locations</div>
              <div>
                {LOCATIONS.map(loc => (
                  <span 
                    key={loc}
                    className={`location-pill ${selectedLocations.includes(loc) ? 'active' : ''}`}
                    onClick={() => toggleLocation(loc)}
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="sidebar-section" style={{ borderTop: '1px solid var(--oyo-border)', paddingTop: '24px' }}>
              <div className="sidebar-subtitle">Max Price: ₹{priceRange}</div>
              <input 
                type="range" 
                min="500" 
                max="10000" 
                step="100" 
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700 }}>
                <span>₹500</span><span>₹10000+</span>
              </div>
            </div>

            <div className="sidebar-section" style={{ borderTop: '1px solid var(--oyo-border)', paddingTop: '24px' }}>
              <div className="sidebar-subtitle">Collections</div>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', marginBottom: '16px', cursor: 'pointer' }}><input type="checkbox" style={{ marginRight: '12px', width: '16px', height: '16px' }} /> Family OYOs</label>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', marginBottom: '16px', cursor: 'pointer' }}><input type="checkbox" style={{ marginRight: '12px', width: '16px', height: '16px' }} /> Friendly neighbourhood stay</label>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', marginBottom: '16px', cursor: 'pointer' }}><input type="checkbox" style={{ marginRight: '12px', width: '16px', height: '16px' }} /> For Group Travellers</label>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', marginBottom: '16px', cursor: 'pointer' }}><input type="checkbox" style={{ marginRight: '12px', width: '16px', height: '16px' }} /> Local IDs accepted</label>
            </div>
          </aside>

          {/* Hotel List Area */}
          <main className="oyo-content">
            <div className="breadcrumbs">
              <span style={{ color: 'var(--oyo-primary)', cursor: 'pointer' }}>India</span> &gt; Bangalore Hotels
            </div>
            
            <div className="content-header">
              <h1 className="content-title">Hotels in Bangalore ({filteredBusinesses.length} found)</h1>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: '12px' }}>
                 <button className="mobile-filter-btn" onClick={() => setShowMobileFilters(!showMobileFilters)}>
                   <Filter size={16} /> Filters
                 </button>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                   Sort By
                   <select 
                     value={sortBy}
                     onChange={(e) => setSortBy(e.target.value)}
                     style={{ padding: '6px 12px', border: '1px solid var(--oyo-border)', borderRadius: '4px', outline: 'none', background: 'var(--oyo-card-bg)', color: 'var(--oyo-text)', fontSize: '13px' }}
                   >
                     <option value="popularity">Popularity</option>
                     <option value="rating">Rating (High to Low)</option>
                     <option value="price_asc">Price (Low to High)</option>
                     <option value="price_desc">Price (High to Low)</option>
                   </select>
                 </div>
              </div>
            </div>

            {loading ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>Loading properties...</div>
            ) : filteredBusinesses.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--oyo-text-muted)' }}>
                 No hotels found matching your filters.
              </div>
            ) : (
              <div>
                {filteredBusinesses.map((biz) => (
                  <div key={biz.id} className="hotel-card">
                     <div className="hotel-images">
                       <div className="main-image">
                         {biz.cover_image ? <img src={biz.cover_image} alt="" /> : <div style={{width:'100%',height:'100%',background:'var(--oyo-image-bg)',display:'flex',alignItems:'center',justifyContent:'center'}}><Building2 size={48} color="var(--oyo-border)" /></div>}
                         <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'var(--oyo-card-bg)', padding: '4px 8px', fontSize: '11px', fontWeight: 800, borderRadius: '2px', display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                           <Building2 size={12} /> HOSPITALITY-SERVICED
                         </span>
                       </div>
                       <div className="thumbnail-column">
                          <div className="thumbnail">{biz.cover_image && <img src={biz.cover_image} alt=""/>}</div>
                          <div className="thumbnail">{biz.cover_image && <img src={biz.cover_image} alt=""/>}</div>
                          <div className="thumbnail">{biz.cover_image && <img src={biz.cover_image} alt=""/>}</div>
                          <div className="thumbnail">{biz.cover_image && <img src={biz.cover_image} alt=""/>}</div>
                       </div>
                     </div>
                     
                     <div className="hotel-info">
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                         <div>
                           <h2 className="hotel-name">{biz.name}</h2>
                           <p className="hotel-location">{biz.address || 'Kattigenahalli, Bangalore'}</p>
                           <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                             <span className="rating-badge"><Star size={10} fill="#fff" /> {biz.rating || '4.5'}</span>
                             <span className="rating-text">({biz.rating_count || '120'} Ratings) · {(biz.rating || 4.5) >= 4.5 ? 'Excellent' : 'Very Good'}</span>
                           </div>
                         </div>
                       </div>
                       
                       <div className="amenities">
                         <span className="amenity"><Wifi size={14} /> Free Wifi</span>
                         <span className="amenity"><Tv size={14} /> TV</span>
                         <span className="amenity"><Battery size={14} /> Power backup</span>
                         <span style={{ color: 'var(--oyo-text-muted)', fontWeight: 600 }}>+ 15 more</span>
                       </div>

                       <div>
                         <span className="wizard-tag">
                           <span style={{ background: 'var(--oyo-text)', color: 'var(--oyo-card-bg)', padding: '0 4px', marginRight: '6px', borderRadius: '1px' }}>W</span>
                           {biz.membership_tag || 'WIZARD MEMBER'}
                         </span>
                       </div>

                       <div className="price-section">
                         <div>
                           <span className="price-large">₹{biz.discounted_price || biz.base_price || 999}</span>
                           {biz.base_price && biz.discounted_price && biz.base_price > biz.discounted_price ? (
                             <>
                               <span className="price-strike">₹{biz.base_price}</span>
                               <span className="discount-text">{Math.round((1 - biz.discounted_price / biz.base_price) * 100)}% off</span>
                             </>
                           ) : null}
                           <span className="taxes-text">+ ₹{Math.round((biz.discounted_price || biz.base_price || 999) * 0.12)} taxes & fees · per room per night</span>
                         </div>
                         <div className="btn-group">
                           <button className="btn-outline" onClick={() => navigate(`/business/${biz.id}`)}>View Details</button>
                           <button className="btn-solid" onClick={() => navigate(`/business/${biz.id}`)}>Book Now</button>
                         </div>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

