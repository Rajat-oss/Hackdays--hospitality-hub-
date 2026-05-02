import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { auth, db } from '../../lib/firebase'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import type { User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore'
import type { UserProfile, UserRole, BusinessType } from '../../types'
import { toast } from 'react-hot-toast'

interface AuthState {
  user: FirebaseUser | null
  profile: UserProfile | null
  session: any | null
  loading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, name: string, role: UserRole, businessName?: string, phone?: string) => Promise<{ error: string | null, session: any | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  createBusiness: (name: string, type: BusinessType) => Promise<{ error: string | null }>
}

type AuthContextType = AuthState & AuthActions

const AuthContext = createContext<AuthContextType | null>(null)

// Mock profiles for demo
const MOCK_USERS: Record<string, UserProfile> = {
  'hotel@demo.com': {
    id: 'demo-hotel-001',
    email: 'hotel@demo.com',
    name: 'Raj Sharma',
    role: 'hotel_admin',
    business_id: 'biz-hotel-001',
    business_name: 'The Grand Aurora Hotel',
    plan: 'pro',
    created_at: new Date().toISOString(),
  },
  'restaurant@demo.com': {
    id: 'demo-rest-001',
    email: 'restaurant@demo.com',
    name: 'Priya Nair',
    role: 'restaurant_admin',
    business_id: 'biz-rest-001',
    business_name: 'Spice Symphony',
    plan: 'pro',
    created_at: new Date().toISOString(),
  },
  'admin@demo.com': {
    id: 'demo-hybrid-001',
    email: 'admin@demo.com',
    name: 'Arjun Mehta',
    role: 'hybrid_admin',
    business_id: 'biz-hybrid-001',
    business_name: 'Oasis Resort & Spa',
    plan: 'premium',
    created_at: new Date().toISOString(),
  },
}

// Since they gave a real Firebase config, let's use it actively, but keep a mock toggle just in case
const isDemoMode = false

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoMode) {
      const savedProfile = localStorage.getItem('hh_demo_profile')
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile)
        setProfile(parsed)
        setUser({ uid: parsed.id, email: parsed.email } as unknown as FirebaseUser)
      }
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        await fetchProfile(currentUser.uid)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  async function fetchProfile(uid: string) {
    try {
      const docRef = doc(db, 'profiles', uid)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile)
      }
    } catch (err) {
      console.error('Error fetching profile from Firebase:', err)
    } finally {
      setLoading(false)
    }
  }

  // ── Sign In ──────────────────────────────────────────────
  async function signIn(email: string, password: string) {
    if (isDemoMode) {
      const mockProfile = MOCK_USERS[email]
      if (mockProfile && password === 'demo123') {
        setProfile(mockProfile)
        setUser({ uid: mockProfile.id, email: mockProfile.email } as unknown as FirebaseUser)
        localStorage.setItem('hh_demo_profile', JSON.stringify(mockProfile))
        return { error: null }
      }
      return { error: 'Invalid credentials. Use demo accounts below.' }
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { error: null }
    } catch (err: any) {
      return { error: err.message || 'Failed to sign in' }
    }
  }

  // ── Sign Up ──────────────────────────────────────────────
  async function signUp(email: string, password: string, name: string, role: UserRole, businessName?: string, phone?: string) {
    if (isDemoMode) {
      return { error: 'Sign up is disabled in demo mode.', session: null }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const newUser = userCredential.user

      let businessId = null

      // If business name provided, create business document in Firestore
      if (businessName) {
        const bizType = role === 'restaurant_admin' ? 'restaurant' : 
                        role === 'hybrid_admin' ? 'both' : 'hotel'

        const bizRef = await addDoc(collection(db, 'businesses'), {
          name: businessName,
          phone: phone || '',
          type: bizType,
          owner_id: newUser.uid,
          created_at: new Date().toISOString()
        })
        businessId = bizRef.id
      }

      const newProfile: UserProfile = {
        id: newUser.uid,
        email: newUser.email || email,
        name: name,
        role: role,
        plan: 'free',
        business_id: businessId || '',
        business_name: businessName || '',
        created_at: new Date().toISOString()
      }

      // Save profile to Firestore
      await setDoc(doc(db, 'profiles', newUser.uid), newProfile)
      
      setProfile(newProfile)
      return { error: null, session: {} }
    } catch (err: any) {
      return { error: err.message || 'Failed to sign up', session: null }
    }
  }

  // ── Sign Out ─────────────────────────────────────────────
  async function signOut() {
    if (isDemoMode) {
      setProfile(null)
      setUser(null)
      localStorage.removeItem('hh_demo_profile')
      return
    }
    await firebaseSignOut(auth)
  }

  // ── Update Profile ───────────────────────────────────────
  async function updateProfile(updates: Partial<UserProfile>) {
    if (!profile) return
    const newProfile = { ...profile, ...updates }
    setProfile(newProfile as UserProfile)
    
    if (isDemoMode) {
      localStorage.setItem('hh_demo_profile', JSON.stringify(newProfile))
      return
    }
    
    try {
      const docRef = doc(db, 'profiles', profile.id)
      await updateDoc(docRef, updates)
    } catch (err) {
      console.error("Error updating profile in Firebase:", err)
    }
  }

  // ── Create Business ──────────────────────────────────────
  async function createBusiness(name: string, type: BusinessType) {
    if (isDemoMode) return { error: null }
    if (!user) return { error: 'Not authenticated' }
    
    try {
      const bizRef = await addDoc(collection(db, 'businesses'), {
        name,
        type,
        owner_id: user.uid,
        created_at: new Date().toISOString()
      })
      await updateProfile({ business_id: bizRef.id })
      return { error: null }
    } catch (err: any) {
      return { error: err.message || 'Failed to create business' }
    }
  }

  return (
    <AuthContext.Provider value={{
      user, profile, session: {}, loading,
      isAuthenticated: !!user,
      signIn, signUp, signOut, updateProfile, createBusiness,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
