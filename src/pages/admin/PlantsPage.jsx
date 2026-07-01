import { useState } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import PlantForm from '../../components/admin/PlantForm'
import { usePlants, useCreatePlant, useUpdatePlant, useDeletePlant } from '../../hooks/usePlants'
import { formatPrice } from '../../utils/formatters'
import { PLANT_CATEGORIES } from '../../constants'
import PlantPhotosManager from '../../components/admin/plants/PlantPhotosManager'

export default function PlantsPage() {
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)

  const { data: plants = [], isLoading } = usePlants()
  const createPlant = useCreatePlant()
  const updatePlant = useUpdatePlant()
  const deletePlant = useDeletePlant()

  const handleSubmit = async (formData) => {
    const photoFile = formData.photo?.[0] ?? null
    const plantData = {
      name: formData.name,
      scientific_name: formData.scientific_name || null,
      cost_price: parseFloat(formData.cost_price),
      sale_price: parseFloat(formData.sale_price),
      stock: parseInt(formData.stock),
      category: formData.category,
      supplier_id: formData.supplier_id || null,
      notes: formData.notes || null,
    }

    if (editing) {
      await updatePlant.mutateAsync({ id: editing.id, plantData, photoFile })
      setView('list')
      setEditing(null)
    } else {
      const created = await createPlant.mutateAsync({ plantData, photoFile })
  setEditing(created)
  setView('form')
    }
  }

  const handleEdit = (plant) => {
    setEditing(plant)
    setView('form')
  }

  const handleDelete = async (id) => {
    if (confirm('Seguro que queres eliminar esta planta?')) {
      await deletePlant.mutateAsync(id)
    }
  }

  const getCategoryLabel = (value) =>
    PLANT_CATEGORIES.find((c) => c.value === value)?.label ?? value

  return (
    <AdminLayout>
      <div className="page-header">
        <h2>{view === 'list' ? 'Plantas' : editing ? 'Editar planta' : 'Nueva planta'}</h2>
        {view === 'list' ? (
          <button className="btn-primary" onClick={() => { setEditing(null); setView('form') }}>
            + Nueva planta
          </button>
        ) : (
          <button className="btn-secondary" onClick={() => { setView('list'); setEditing(null) }}>
            Volver
          </button>
        )}
      </div>

 {view === 'form' && (
  <div className="card">
    <PlantForm
      onSubmit={handleSubmit}
      defaultValues={editing ?? {}}
      loading={createPlant.isPending || updatePlant.isPending}
    />
    {editing && (
      <div style={{ marginTop: 24, borderTop: '1px solid var(--gray-200)', paddingTop: 20 }}>
        <h3 style={{ marginBottom: 14, fontSize: 15 }}>Fotos adicionales</h3>
        <p className="text-muted" style={{ fontSize: 13, marginBottom: 12 }}>
          La planta ya esta guardada. Agregale mas fotos para el carrusel del catalogo.
        </p>
        <PlantPhotosManager plantId={editing.id} />
      </div>
    )}
  </div>
)}

      {view === 'list' && (
        <>
          {isLoading ? (
            <p className="text-muted">Cargando plantas...</p>
          ) : plants.length === 0 ? (
            <p className="text-muted">No hay plantas cargadas todavia.</p>
          ) : (
            <div className="table-wrapper plants-table-wrapper">
              {/* Tabla completa: visible en desktop, oculta en mobile via CSS */}
              <table className="plants-table-desktop">
                <thead>
                  <tr>
                    <th>Foto</th>
                    <th>Nombre</th>
                    <th>Categoria</th>
                    <th>Stock</th>
                    <th>Costo</th>
                    <th>Precio venta</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {plants.map((plant) => (
                    <tr key={plant.id}>
                      <td>
                        {plant.photo_url ? (
                          <img
                            src={plant.photo_url}
                            alt={plant.name}
                            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: 40, height: 40, borderRadius: 8,
                            background: 'var(--green-100)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18
                          }}>
                            ?
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{plant.name}</div>
                        {plant.scientific_name && (
                          <div className="text-muted" style={{ fontStyle: 'italic' }}>
                            {plant.scientific_name}
                          </div>
                        )}
                      </td>
                      <td>{getCategoryLabel(plant.category)}</td>
                      <td>
                        <span className={`pill ${plant.stock === 0 ? 'pill--danger' : plant.stock <= 2 ? 'pill--warn' : 'pill--ok'}`}>
                          {plant.stock} unid.
                        </span>
                      </td>
                      <td className="text-muted">{formatPrice(plant.cost_price)}</td>
                      <td style={{ fontWeight: 500 }}>{formatPrice(plant.sale_price)}</td>
                      <td>
                        <div className="flex-center gap-8">
                          <button className="btn-icon" onClick={() => handleEdit(plant)}>
                            Editar
                          </button>
                          <button className="btn-icon" onClick={() => handleDelete(plant.id)}>
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Lista compacta: visible solo en mobile via CSS */}
              <div className="plants-list-mobile">
                <div className="plant-row-mobile plant-row-mobile--header">
                  <span className="plant-row-mobile__head-photo">Foto</span>
                  <span className="plant-row-mobile__head-name">Nombre</span>
                  <span className="plant-row-mobile__head-stock">Stock</span>
                  <span className="plant-row-mobile__head-actions">Acciones</span>
                </div>
                {plants.map((plant) => (
                  <div className="plant-row-mobile" key={plant.id}>
                    {plant.photo_url ? (
                      <img
                        src={plant.photo_url}
                        alt={plant.name}
                        className="plant-row-mobile__photo"
                      />
                    ) : (
                      <div className="plant-row-mobile__photo plant-row-mobile__photo--empty">
                        ?
                      </div>
                    )}

                    <div className="plant-row-mobile__info">
                      <div className="plant-row-mobile__name">{plant.name}</div>
                      {plant.scientific_name && (
                        <div className="plant-row-mobile__scientific">{plant.scientific_name}</div>
                      )}
                    </div>

                    <span className={`pill ${plant.stock === 0 ? 'pill--danger' : plant.stock <= 2 ? 'pill--warn' : 'pill--ok'} plant-row-mobile__stock`}>
                      {plant.stock}
                    </span>

                    <div className="plant-row-mobile__actions">
                      <button
                        className="btn-icon-round"
                        aria-label="Editar"
                        title="Editar"
                        onClick={() => handleEdit(plant)}
                      >
                        ✎
                      </button>
                      <button
                        className="btn-icon-round"
                        aria-label="Ver detalle"
                        title="Ver detalle"
                        onClick={() => handleEdit(plant)}
                      >
                        👁
                      </button>
                      <button
                        className="btn-icon-round btn-icon-round--danger"
                        aria-label="Eliminar"
                        title="Eliminar"
                        onClick={() => handleDelete(plant.id)}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  )
}