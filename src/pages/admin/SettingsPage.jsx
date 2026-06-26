import { useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useSettings, useUpdateSetting } from '../../hooks/useSettings'
import { useForm } from 'react-hook-form'

export default function SettingsPage() {
  const { data: settings, isLoading } = useSettings()
  const updateSetting = useUpdateSetting()

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    if (settings) {
      reset({
        store_name: settings.store_name ?? '',
        whatsapp_number: settings.whatsapp_number ?? '',
        margin_percent: settings.margin_percent ?? '150',
        notification_email: settings.notification_email ?? '',
      })
    }
  }, [settings, reset])

  const handleSave = async (formData) => {
    await Promise.all([
      updateSetting.mutateAsync({ key: 'store_name', value: formData.store_name }),
      updateSetting.mutateAsync({ key: 'whatsapp_number', value: formData.whatsapp_number }),
      updateSetting.mutateAsync({ key: 'margin_percent', value: formData.margin_percent }),
      updateSetting.mutateAsync({ key: 'notification_email', value: formData.notification_email }),
    ])
  }

  if (isLoading) return <AdminLayout><p className="text-muted">Cargando...</p></AdminLayout>

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Ajustes</h2>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <form onSubmit={handleSubmit(handleSave)} className="form-grid">

          <div className="field field--full">
            <label>Nombre del negocio</label>
            <input
              {...register('store_name')}
              placeholder="Ej: SucuMariela"
            />
          </div>

          <div className="field field--full">
            <label>Numero de WhatsApp</label>
            <input
              {...register('whatsapp_number')}
              placeholder="Ej: 1155551234 (sin 0, sin 15, sin +549)"
            />
            <span className="text-muted" style={{ marginTop: 4 }}>
              Este numero recibe los mensajes del catalogo publico
            </span>
          </div>

          <div className="field">
            <label>Margen de ganancia (%)</label>
            <input
              type="number"
              min="0"
              {...register('margin_percent')}
              placeholder="150"
            />
            <span className="text-muted" style={{ marginTop: 4 }}>
              Se aplica al calcular el precio de venta sugerido
            </span>
          </div>

          <div className="field">
            <label>Email para notificaciones</label>
            <input
              type="email"
              {...register('notification_email')}
              placeholder="tu@email.com"
            />
            <span className="text-muted" style={{ marginTop: 4 }}>
              Ahi llegan los avisos de cuidados y pedidos
            </span>
          </div>

          <div className="field field--full" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={updateSetting.isPending}
            >
              {updateSetting.isPending ? 'Guardando...' : 'Guardar ajustes'}
            </button>
          </div>

        </form>
      </div>
    </AdminLayout>
  )
}