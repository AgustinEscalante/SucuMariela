// src/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

export default function LandingPage() {
  const navigate = useNavigate()
  const user     = useAuthStore((s) => s.user)

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--green-800)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 16,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🌵</div>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          color: '#fff',
          fontSize: 32,
          margin: 0,
          letterSpacing: 1,
        }}>
          SucuMariela
        </h1>
        <p style={{ color: 'var(--green-200)', fontSize: 14, margin: '6px 0 0' }}>
          Suculentas con amor
        </p>
      </div>

      <button
        onClick={() => navigate('/catalogo')}
        style={{
          width: '100%',
          maxWidth: 300,
          padding: '16px 24px',
          background: '#fff',
          color: 'var(--green-800)',
          border: 'none',
          borderRadius: 'var(--radius-lg)',
          fontSize: 16,
          fontWeight: 700,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        }}
      >
        Ver catalogo
      </button>

      <button
        onClick={() => navigate(user ? '/admin' : '/login')}
        style={{
          width: '100%',
          maxWidth: 300,
          padding: '16px 24px',
          background: 'transparent',
          color: '#fff',
          border: '2px solid rgba(255,255,255,0.4)',
          borderRadius: 'var(--radius-lg)',
          fontSize: 16,
          fontWeight: 600,
          fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
        }}
      >
        Panel admin
      </button>
    </div>
  )
}
