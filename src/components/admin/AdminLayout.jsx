import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useUnreadCount } from '../../hooks/useNotifications'
import NotificationsPanel from './NotificationsPanel'

const NAV_ITEMS = [
  { to: '/admin',             label: 'Inicio',       end: true },
  { to: '/admin/plantas',     label: 'Plantas' },
  { to: '/admin/cuidados',    label: 'Cuidados' },
  { to: '/admin/pedidos',     label: 'Pedidos' },
  { to: '/admin/proveedores', label: 'Proveedores' },
  { to: '/admin/ajustes',     label: 'Ajustes' },
  { to: '/admin/estadisticas', label: 'Estadisticas' },
]

export default function AdminLayout({ children }) {
  const [menuOpen,  setMenuOpen]  = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const signOut     = useAuthStore((s) => s.signOut)
  const navigate    = useNavigate()
  const unreadCount = useUnreadCount()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const closeMenu = () => setMenuOpen(false)

  return (
    <div className="admin-layout">

      {menuOpen && <div className="sidebar-overlay" onClick={closeMenu} />}

      <aside className={'sidebar' + (menuOpen ? ' sidebar--open' : '')}>
        <div className="sidebar-logo">
          <span className="brand-name">SucuMariela</span>
          <span className="brand-sub">Panel de gestion</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeMenu}
              className={({ isActive }) =>
                isActive ? 'nav-item nav-item--active' : 'nav-item'
              }
            >
              {label}
            </NavLink>
          ))}

          <a
            href="/catalogo"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-item"
            onClick={closeMenu}
          >
            Ver catalogo
          </a>
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleSignOut} className="btn-signout">
            Cerrar sesion
          </button>
        </div>
      </aside>

      <div className="admin-main-wrapper">

        {/* Top bar */}
        <div className="mobile-topbar">
          <button
            className="hamburger"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Abrir menu"
          >
            <span /><span /><span />
          </button>
          <span className="mobile-topbar__title">SucuMariela</span>

          {/* Campana de notificaciones en mobile */}
          <button
            className="notif-bell"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notificaciones"
          >
            🔔
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
        </div>

        <main className="admin-main">

          {/* Campana en desktop — arriba a la derecha del contenido */}
          <div className="notif-bell-desktop-wrapper">
            <button
              className="notif-bell notif-bell--desktop"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notificaciones"
            >
              🔔
              {unreadCount > 0 && (
                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <NotificationsPanel onClose={() => setNotifOpen(false)} />
            )}
          </div>

          {children}
        </main>
      </div>

    </div>
  )
}