// src/components/admin/PushSettings.jsx
// Agregar este componente dentro de AjustesPage o como seccion separada
import { usePushNotifications } from '../../hooks/usePushNotifications'

export default function PushSettings() {
  const { supported, permission, subscribed, loading, error, subscribe, unsubscribe } =
    usePushNotifications()

  if (!supported) {
    return (
      <p className="text-muted" style={{ fontSize: 13 }}>
        Tu navegador no soporta notificaciones push.
      </p>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--green-700)' }}>
            Notificaciones push
          </div>
          <div className="text-muted" style={{ fontSize: 12, marginTop: 2 }}>
            {subscribed
              ? 'Activas en este dispositivo'
              : 'Recibí alertas de cuidados y pedidos en tu celular'}
          </div>
        </div>

        <button
          className={subscribed ? 'btn-secondary' : 'btn-primary'}
          onClick={subscribed ? unsubscribe : subscribe}
          disabled={loading || permission === 'denied'}
          style={{ flexShrink: 0 }}
        >
          {loading
            ? 'Procesando...'
            : subscribed
            ? 'Desactivar'
            : 'Activar'}
        </button>
      </div>

      {permission === 'denied' && (
        <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>
          Bloqueaste los permisos en el navegador. Habilitatlos manualmente en la configuracion del sitio.
        </p>
      )}

      {error && (
        <p style={{ fontSize: 12, color: 'var(--danger)', marginTop: 6 }}>{error}</p>
      )}
    </div>
  )
}
