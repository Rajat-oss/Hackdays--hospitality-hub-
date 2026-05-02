import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './features/auth/AuthContext'
import { AppRouter } from './router'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--color-bg-elevated)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              fontSize: '14px',
              fontFamily: 'Inter, sans-serif',
              boxShadow: 'var(--shadow-lg)',
            },
            success: {
              iconTheme: {
                primary: '#5A9690',
                secondary: 'var(--color-bg)',
              },
            },
            error: {
              iconTheme: {
                primary: '#e74c3c',
                secondary: 'var(--color-bg)',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  )
}
