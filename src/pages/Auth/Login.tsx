import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '../../features/auth/AuthContext'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import styles from './Auth.module.css'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
type FormData = z.infer<typeof schema>

const DEMO_ACCOUNTS = [
  { role: 'Hotel Admin', email: 'hotel@demo.com', password: 'demo123', color: 'var(--color-teal-dark)' },
  { role: 'Restaurant Admin', email: 'restaurant@demo.com', password: 'demo123', color: 'var(--color-maroon)' },
  { role: 'Hybrid Admin', email: 'admin@demo.com', password: 'demo123', color: '#4a3520' },
]

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const { error } = await signIn(data.email, data.password)
    setLoading(false)

    if (error) {
      toast.error(error)
      return
    }

    toast.success('Welcome back!')
    navigate(from, { replace: true })
  }

  function fillDemo(email: string, password: string) {
    setValue('email', email)
    setValue('password', password)
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.authBg}>
        <div className={styles.authGrid} />
        <div className={styles.authGlow1} />
        <div className={styles.authGlow2} />
      </div>

      <div className={styles.authBox}>
        <div className={styles.authHeader}>
          <Link to="/" className={styles.authLogo}>
            <span className={styles.authLogoIcon}>H</span>
            HospitalityHub
          </Link>
          <h1 className={styles.authTitle}>Welcome back</h1>
          <p className={styles.authSub}>Sign in to your dashboard</p>
        </div>

        {/* Demo shortcuts */}
        <div className={styles.demoRow}>
          <div className={styles.demoLabel}>Quick Demo Access:</div>
          <div className={styles.demoBtns}>
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                type="button"
                onClick={() => fillDemo(acc.email, acc.password)}
                className={styles.demoBtn}
                style={{ borderColor: acc.color }}
              >
                {acc.role}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.authForm}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              {...register('email')}
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && <p className="form-error">{errors.email.message}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('password')}
                type={showPass ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: '8px' }}>
            {loading ? <span className="spinner" /> : <>Sign In <ArrowRight size={16} /></>}
          </button>
        </form>

        <p className={styles.authSwitch}>
          Don't have an account? <Link to="/signup" className={styles.authSwitchLink}>Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
