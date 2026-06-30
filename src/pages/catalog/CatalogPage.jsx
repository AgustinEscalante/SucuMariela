import { useState } from 'react'
import { usePlants } from '../../hooks/usePlants'
import { useSettings } from '../../hooks/useSettings'
import { formatPrice } from '../../utils/formatters'
import { buildWhatsappLink } from '../../utils/whatsapp'
import { PLANT_CATEGORIES } from '../../constants'
import { usePlantPhotos } from '../../hooks/usePlantPhotos'
import PhotoCarousel from '../../components/catalog/PhotoCarousel'

// ─── Fuera del componente principal para evitar re-renders ───────────────────
function PlantCardImage({ plant }) {
  const { data: photos = [], isLoading } = usePlantPhotos(plant.id)

  if (isLoading) {
    return (
      <div className="plant-card__img">
        <div className="plant-card__img-placeholder" />
      </div>
    )
  }

  if (photos.length > 0) {
    return (
      <div className="plant-card__img">
        <PhotoCarousel photos={photos} altText={plant.name} />
      </div>
    )
  }

  return (
    <div className="plant-card__img">
      {plant.photo_url ? (
        <img src={plant.photo_url} alt={plant.name} />
      ) : (
        <div className="plant-card__img-placeholder">?</div>
      )}
    </div>
  )
}

// ─── Componente principal ────────────────────────────────────────────────────
export default function CatalogPage() {
  const [filterCategory, setFilterCategory] = useState('')
  const [search, setSearch] = useState('')

  const { data: plants = [], isLoading } = usePlants({ onlyActive: true })
  const { data: settings } = useSettings()

  const storeName = settings?.store_name || localStorage.getItem('store_name') || 'SucuMariela'
  if (settings?.store_name) localStorage.setItem('store_name', settings.store_name)

  const whatsappNumber = settings?.whatsapp_number || ''
  const contactLink    = 'https://wa.me/549' + whatsappNumber

  const filtered = plants.filter((p) => {
    const matchCategory = filterCategory ? p.category === filterCategory : true
    const matchSearch   = search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.scientific_name?.toLowerCase().includes(search.toLowerCase()))
      : true
    return matchCategory && matchSearch && p.stock > 0
  })

  return (
    <div className="catalog">
      <header className="catalog-header">
        <div className="catalog-header__inner">
          <div>
            <h1 className="catalog-header__title">{storeName}</h1>
            <p className="catalog-header__sub">Suculentas con amor</p>
          </div>
          {whatsappNumber && (
            <a
              href={contactLink}
              target="_blank"
              rel="noopener noreferrer"
              className="catalog-header__wapp"
            >
              Contactar
            </a>
          )}
        </div>
      </header>

      <div className="catalog-body">
        <div className="catalog-filters">
          <input
            type="text"
            placeholder="Buscar planta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="catalog-search"
          />
          <div className="catalog-chips">
            <button
              className={filterCategory === '' ? 'chip chip--active' : 'chip'}
              onClick={() => setFilterCategory('')}
            >
              Todas
            </button>
            {PLANT_CATEGORIES.map((c) => (
              <button
                key={c.value}
                className={filterCategory === c.value ? 'chip chip--active' : 'chip'}
                onClick={() => setFilterCategory(c.value)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: 40 }}>
            Cargando plantas...
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-muted" style={{ textAlign: 'center', padding: 40 }}>
            No hay plantas disponibles.
          </p>
        ) : (
          <div className="catalog-grid">
            {filtered.map((plant) => (
              <div key={plant.id} className="plant-card">
                <PlantCardImage plant={plant} />
                <div className="plant-card__body">
                  <div className="plant-card__name">{plant.name}</div>
                  {plant.scientific_name && (
                    <div className="plant-card__sci">{plant.scientific_name}</div>
                  )}
                  <div className="plant-card__price">{formatPrice(plant.sale_price)}</div>
                  <div className="plant-card__stock">
                    {plant.stock <= 2
                      ? 'Ultimas ' + plant.stock + ' unidades'
                      : plant.stock + ' disponibles'}
                  </div>
                  <div className="plant-card__actions">
                    {whatsappNumber && (
                      <a
                        href={buildWhatsappLink(whatsappNumber, plant.name, plant.sale_price)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-wapp"
                      >
                        Consultar por WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="catalog-footer">
        <p>{storeName} — Retiro en domicilio</p>
      </footer>
    </div>
  )
}