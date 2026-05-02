import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../features/auth/AuthContext'
import { toast } from 'react-hot-toast'
import { ArrowRight, BedDouble, UtensilsCrossed, Building2 } from 'lucide-react'
import type { UserRole } from '../../types'
import styles from './Auth.module.css'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['hotel_admin', 'restaurant_admin', 'hybrid_admin']),
  businessName: z.string().min(2, 'Company Name must be at least 2 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
})
type FormData = z.infer<typeof schema>

const ROLES = [
  { value: 'hotel_admin' as UserRole, label: 'Hotel Admin', desc: 'Manage rooms, bookings & guest operations', icon: BedDouble },
  { value: 'restaurant_admin' as UserRole, label: 'Restaurant Admin', desc: 'Manage tables, orders & kitchen ops', icon: UtensilsCrossed },
  { value: 'hybrid_admin' as UserRole, label: 'Hybrid Admin', desc: 'Full access to hotel + restaurant modules', icon: Building2 },
]

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('hotel_admin')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'hotel_admin' },
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const { error, session } = await signUp(data.email, data.password, data.name, data.role, data.businessName, data.phone)
    setLoading(false)

    if (error) {
      toast.error(error)
      return
    }

    if (!session) {
      toast.success('Account created! Please check your email to confirm your account.', {
        duration: 6000,
      })
      navigate('/login')
      return
    }

    toast.success('Account created! Welcome to HospitalityHub.')
    navigate('/dashboard')
  }

  function selectRole(role: UserRole) {
    setSelectedRole(role)
    setValue('role', role)
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authBg}>
        <div className={styles.authGrid} />
        <div className={styles.authGlow1} />
        <div className={styles.authGlow2} />
      </div>

      <div className={`${styles.authBox} ${styles.authBoxWide}`}>
        <div className={styles.authHeader}>
          <Link to="/" className={styles.authLogo}>
            <span className={styles.authLogoIcon}>H</span>
            HospitalityHub
          </Link>
          <h1 className={styles.authTitle}>Create your account</h1>
          <p className={styles.authSub}>Get started in minutes — no credit card required</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
          {/* Role Selection */}
          <div style={{ gridColumn: '1 / -1' }}>
            <div className="form-label" style={{ marginBottom: '12px' }}>I want to manage my</div>
            <div className={styles.roleGrid}>
              {ROLES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => selectRole(r.value)}
                  className={`${styles.roleCard} ${selectedRole === r.value ? styles.roleCardSelected : ''}`}
                >
                  <r.icon size={20} />
                  <span className={styles.roleCardLabel}>{r.label}</span>
                  <span className={styles.roleCardDesc}>{r.desc}</span>
                </button>
              ))}
            </div>
            <input type="hidden" {...register('role')} />
          </div>

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              {...register('name')}
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Raj Sharma"
            />
            {errors.name && <p className="form-error">{errors.name.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              {...register('businessName')}
              type="text"
              className={`form-input ${errors.businessName ? 'error' : ''}`}
              placeholder="Your Company Name"
            />
            {errors.businessName && <p className="form-error">{errors.businessName.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              {...register('phone')}
              type="tel"
              className={`form-input ${errors.phone ? 'error' : ''}`}
              placeholder="+91 9876543210"
            />
            {errors.phone && <p className="form-error">{errors.phone.message}</p>}
          </div>

          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label className="form-label">Password</label>
            <input
              {...register('password')}
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="At least 8 characters"
            />
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ gridColumn: '1 / -1', justifyContent: 'center' }}
          >
            {loading ? <span className="spinner" /> : <>Create Account <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className={styles.authSwitch}>
          Already have an account? <Link to="/login" className={styles.authSwitchLink}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
