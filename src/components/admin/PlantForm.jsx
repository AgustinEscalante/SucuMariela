import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useSettings } from '../../hooks/useSettings'
import { useSuppliers } from '../../hooks/useSuppliers'
import { calculateSalePrice } from '../../utils/formatters'
import { PLANT_CATEGORIES } from '../../constants'

export default function PlantForm({ onSubmit, defaultValues, loading }) {
  const { data: settings } = useSettings()
  const { data: suppliers = [] } = useSuppliers()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ defaultValues })

  const costPrice = watch('cost_price')

  useEffect(() => {
    if (costPrice && settings?.margin_percent) {
      const suggested = calculateSalePrice(
        parseFloat(costPrice),
        parseFloat(settings.margin_percent)
      )
      setValue('sale_price', suggested)
    }
  }, [costPrice, settings, setValue])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-grid">
      <div className="field">
        <label>Nombre *</label>
        <input
          {...register('name', { required: 'El nombre es obligatorio' })}
          placeholder="Ej: Echeveria"
        />
        {errors.name && <span className="error-msg">{errors.name.message}</span>}
      </div>

      <div className="field">
        <label>Nombre cientifico</label>
        <input
          {...register('scientific_name')}
          placeholder="Ej: Echeveria elegans"
        />
      </div>

      <div className="field">
        <label>Precio costo *</label>
        <input
          type="number"
          step="0.01"
          {...register('cost_price', { required: 'El precio costo es obligatorio' })}
          placeholder="0"
        />
        {errors.cost_price && <span className="error-msg">{errors.cost_price.message}</span>}
      </div>

      <div className="field">
        <label>Precio venta *</label>
        <input
          type="number"
          step="0.01"
          {...register('sale_price', { required: 'El precio de venta es obligatorio' })}
          placeholder="0"
        />
        {errors.sale_price && <span className="error-msg">{errors.sale_price.message}</span>}
      </div>

      <div className="field">
        <label>Stock *</label>
        <input
          type="number"
          {...register('stock', { required: 'El stock es obligatorio', min: 0 })}
          placeholder="0"
        />
        {errors.stock && <span className="error-msg">{errors.stock.message}</span>}
      </div>

      <div className="field">
        <label>Categoria</label>
        <select {...register('category')}>
          {PLANT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Proveedor</label>
        <select {...register('supplier_id')}>
          <option value="">Sin proveedor</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Foto</label>
        <input
          type="file"
          accept="image/*"
          {...register('photo')}
        />
      </div>

      <div className="field field--full">
        <label>Notas</label>
        <textarea
          {...register('notes')}
          placeholder="Informacion adicional sobre la planta..."
        />
      </div>

      <div className="field field--full" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Guardando...' : 'Guardar planta'}
        </button>
      </div>
    </form>
  )
}