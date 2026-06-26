import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useCareProcesses, useCreateCareProcess, useUpdateCareProcess } from '../../hooks/useCare'
import { usePlants } from '../../hooks/usePlants'
import { useForm } from 'react-hook-form'

export default function CarePage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: processes = [], isLoading } = useCareProcesses()
  const { data: plants = [] } = usePlants({ onlyActive: true })
  const createProcess = useCreateCareProcess()
  const updateProcess = useUpdateCareProcess()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const handleEdit = (process) => {
    setEditing(process)
    setValue('name', process.name)
    setValue('icon', process.icon ?? '')
    setValue('description', process.description ?? '')
    setValue('default_frequency_days', process.default_frequency_days)
    setShowForm(true)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    reset()
  }

  const handleSave = async (formData) => {
    const payload = {
      name: formData.name,
      icon: formData.icon || null,
      description: formData.description || null,
      default_frequency_days: parseInt(formData.default_frequency_days),
    }

    if (editing) {
      await updateProcess.mutateAsync({ id: editing.id, ...payload })
    } else {
      await createProcess.mutateAsync({ ...payload, is_custom: true })
    }

    handleCancel()
  }

  const isPending = createProcess.isPending || updateProcess.isPending

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Cuidados</h2>
        <button
          className="btn-primary"
          onClick={() => { setEditing(null); reset(); setShowForm(true) }}
        >
          + Nuevo proceso
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>
            {editing ? 'Editar proceso' : 'Nuevo tipo de cuidado'}
          </h3>
          <form onSubmit={handleSubmit(handleSave)} className="form-grid">
            <div className="field">
              <label>Nombre *</label>
              <input
                {...register('name', { required: 'El nombre es obligatorio' })}
                placeholder="Ej: Bano de sol controlado"
              />
              {errors.name && <span className="error-msg">{errors.name.message}</span>}
            </div>

            <div className="field">
              <label>Icono</label>
              <input
                {...register('icon')}
                placeholder="Opcional"
              />
            </div>

            <div className="field">
              <label>Cada cuantos dias *</label>
              <input
                type="number"
                min="1"
                {...register('default_frequency_days', { required: 'La frecuencia es obligatoria' })}
                placeholder="7"
              />
              {errors.default_frequency_days && (
                <span className="error-msg">{errors.default_frequency_days.message}</span>
              )}
            </div>

            <div className="field field--full">
              <label>Descripcion</label>
              <textarea
                {...register('description')}
                placeholder="Descripcion opcional..."
              />
            </div>

            <div className="field field--full" style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn-secondary" onClick={handleCancel}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={isPending}>
                {isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <h3 style={{ marginBottom: 12 }}>Tipos de cuidado</h3>
      {isLoading ? (
        <p className="text-muted">Cargando...</p>
      ) : (
        <div className="table-wrapper" style={{ marginBottom: 32 }}>
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Frecuencia</th>
                <th>Descripcion</th>
                <th>Tipo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process) => (
                <tr key={process.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {process.icon && <span style={{ fontSize: 18 }}>{process.icon}</span>}
                      <span style={{ fontWeight: 500 }}>{process.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">Cada {process.default_frequency_days} dias</td>
                  <td className="text-muted">{process.description ?? '-'}</td>
                  <td>
                    <span className={`pill ${process.is_custom ? 'pill--info' : 'pill--gray'}`}>
                      {process.is_custom ? 'Personalizado' : 'Sistema'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(process)}>
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 style={{ marginBottom: 12 }}>Cuidados por planta</h3>
      {plants.length === 0 ? (
        <p className="text-muted">No hay plantas cargadas todavia.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Planta</th>
                <th>Cuidados asignados</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {plants.map((plant) => (
                <tr key={plant.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {plant.photo_url ? (
                        <img
                          src={plant.photo_url}
                          alt={plant.name}
                          style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: 8,
                          background: 'var(--green-100)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>?</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 500 }}>{plant.name}</div>
                        {plant.scientific_name && (
                          <div className="text-muted" style={{ fontStyle: 'italic' }}>
                            {plant.scientific_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-muted">Por configurar</td>
                  <td>
                    <button className="btn-secondary" style={{ fontSize: 12 }}>
                      Asignar cuidados
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  )
}