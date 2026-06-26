import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { useSuppliers, useCreateSupplier, useUpdateSupplier } from '../../hooks/useSuppliers'
import { useForm } from 'react-hook-form'
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '../../hooks/useSuppliers'

export default function SuppliersPage() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: suppliers = [], isLoading } = useSuppliers()
  const createSupplier = useCreateSupplier()
  const updateSupplier = useUpdateSupplier()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm()

  const handleEdit = (supplier) => {
    setEditing(supplier)
    setValue('name', supplier.name)
    setValue('location', supplier.location ?? '')
    setValue('phone', supplier.phone ?? '')
    setValue('email', supplier.email ?? '')
    setValue('notes', supplier.notes ?? '')
    setShowForm(true)
  }

  const deleteSupplier = useDeleteSupplier()


  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    reset()
  }

  const handleSave = async (formData) => {
    const payload = {
      name: formData.name,
      location: formData.location || null,
      phone: formData.phone || null,
      email: formData.email || null,
      notes: formData.notes || null,
    }

    if (editing) {
      await updateSupplier.mutateAsync({ id: editing.id, ...payload })
    } else {
      await createSupplier.mutateAsync(payload)
    }

    handleCancel()
  }

  const isPending = createSupplier.isPending || updateSupplier.isPending

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>Proveedores</h2>
        <button
          className="btn-primary"
          onClick={() => { setEditing(null); reset(); setShowForm(true) }}
        >
          + Nuevo proveedor
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ marginBottom: 16 }}>
            {editing ? 'Editar proveedor' : 'Nuevo proveedor'}
          </h3>
          <form onSubmit={handleSubmit(handleSave)} className="form-grid">
            <div className="field">
              <label>Nombre *</label>
              <input
                {...register('name', { required: 'El nombre es obligatorio' })}
                placeholder="Ej: Vivero del Sur"
              />
              {errors.name && <span className="error-msg">{errors.name.message}</span>}
            </div>

            <div className="field">
              <label>Ubicacion</label>
              <input
                {...register('location')}
                placeholder="Ej: Lanus, GBA"
              />
            </div>

            <div className="field">
              <label>Telefono</label>
              <input
                {...register('phone')}
                placeholder="Ej: 11-5555-1234"
              />
            </div>

            <div className="field">
              <label>Email</label>
              <input
                type="email"
                {...register('email')}
                placeholder="Ej: contacto@vivero.com"
              />
            </div>

            <div className="field field--full">
              <label>Notas</label>
              <textarea
                {...register('notes')}
                placeholder="Informacion adicional..."
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

      {isLoading ? (
        <p className="text-muted">Cargando proveedores...</p>
      ) : suppliers.length === 0 ? (
        <p className="text-muted">No hay proveedores cargados todavia.</p>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ubicacion</th>
                <th>Telefono</th>
                <th>Email</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td style={{ fontWeight: 500 }}>{supplier.name}</td>
                  <td className="text-muted">{supplier.location ?? '-'}</td>
                  <td className="text-muted">{supplier.phone ?? '-'}</td>
                  <td className="text-muted">{supplier.email ?? '-'}</td>
                  <td className="text-muted">{supplier.notes ?? '-'}</td>
                 <td>
  <div className="flex-center gap-8">
    <button className="btn-icon" onClick={() => handleEdit(supplier)}>
      Editar
    </button>
    <button
      className="btn-icon"
      style={{ color: 'var(--danger)' }}
      onClick={() => {
        if (confirm('Seguro que queres eliminar este proveedor?')) {
          deleteSupplier.mutate(supplier.id)
        }
      }}
    >
      Eliminar
    </button>
  </div>
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