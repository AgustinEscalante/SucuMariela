// src/App.jsx
import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage      from './pages/LoginPage'
import LandingPage    from './pages/LandingPage'
import DashboardPage  from './pages/admin/DashboardPage'
import PlantsPage     from './pages/admin/PlantsPage'
import CarePage       from './pages/admin/CarePage'
import OrdersPage     from './pages/admin/OrdersPage'
import SuppliersPage  from './pages/admin/SuppliersPage'
import SettingsPage   from './pages/admin/SettingsPage'
import StatsPage      from './pages/admin/StatsPage'
import CatalogPage    from './pages/catalog/CatalogPage'

const ProtectedRoute = ({ children }) => {
  const user    = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const init = useAuthStore((s) => s.init)
  useEffect(() => { init() }, [init])

  return (
    <Routes>
      <Route path="/"         element={<LandingPage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/catalogo" element={<CatalogPage />} />

      <Route path="/admin"              element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/admin/plantas"      element={<ProtectedRoute><PlantsPage /></ProtectedRoute>} />
      <Route path="/admin/cuidados"     element={<ProtectedRoute><CarePage /></ProtectedRoute>} />
      <Route path="/admin/pedidos"      element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/admin/proveedores"  element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
      <Route path="/admin/ajustes"      element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="/admin/estadisticas" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}