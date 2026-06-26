import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'

const NAV_ITEMS = [
  { to: '/admin', label: 'Inicio', end: true },
  { to: '/admin/plantas', label: 'Plantas' },
  { to: '/admin/cuidados', label: 'Cuidados' },
  { to: '/admin/pedidos', label: 'Pedidos' },
  { to: '/admin/proveedores', label: 'Proveedores' },
  { to: '/admin/ajustes', label: 'Ajustes' },
]

export default function AdminLayout({ children }) {
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="admin-layout">
      <aside className="sidebar">
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
              className={({ isActive }) =>
                isActive ? 'nav-item nav-item--active' : 'nav-item'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleSignOut} className="btn-signout">
            Cerrar sesion
          </button>
        </div>
      </aside>
      <main className="admin-main">
        {children}
      </main>
    </div>
  )
}