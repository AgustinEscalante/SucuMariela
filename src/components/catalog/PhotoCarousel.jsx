// src/components/catalog/PhotoCarousel.jsx — reemplaza el anterior
import { useState } from 'react'

// ─── LIGHTBOX ────────────────────────────────────────────────────────────────

function Lightbox({ photos, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex)

  const prev = (e) => { e.stopPropagation(); setCurrent((c) => (c === 0 ? photos.length - 1 : c - 1)) }
  const next = (e) => { e.stopPropagation(); setCurrent((c) => (c === photos.length - 1 ? 0 : c + 1)) }

  // Cerrar con Escape
  const handleKey = (e) => { if (e.key === 'Escape') onClose() }

  return (
    <div
      className="lightbox-overlay"
      onClick={onClose}
      onKeyDown={handleKey}
      tabIndex={-1}
    >
      {/* Boton cerrar */}
      <button className="lightbox-close" onClick={onClose}>✕</button>

      {/* Imagen */}
      <div className="lightbox-img-wrapper" onClick={(e) => e.stopPropagation()}>
        <img
          src={photos[current].url}
          alt={'Foto ' + (current + 1)}
          className="lightbox-img"
        />
      </div>

      {/* Flechas */}
      {photos.length > 1 && (
        <>
          <button className="lightbox-arrow lightbox-arrow--left" onClick={prev}>‹</button>
          <button className="lightbox-arrow lightbox-arrow--right" onClick={next}>›</button>
        </>
      )}

      {/* Contador */}
      {photos.length > 1 && (
        <div className="lightbox-counter">
          {current + 1} / {photos.length}
        </div>
      )}

      {/* Dots */}
      {photos.length > 1 && (
        <div className="lightbox-dots">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
              className={'lightbox-dot' + (i === current ? ' lightbox-dot--active' : '')}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── CARRUSEL ────────────────────────────────────────────────────────────────

export default function PhotoCarousel({ photos = [], altText = '' }) {
  const [current,      setCurrent]      = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx,  setLightboxIdx]  = useState(0)

  const openLightbox = (idx) => {
    setLightboxIdx(idx)
    setLightboxOpen(true)
  }

  if (photos.length === 0) {
    return (
      <div className="plant-card__img-placeholder">?</div>
    )
  }

  if (photos.length === 1) {
    return (
      <>
        <img
          src={photos[0].url}
          alt={altText}
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in' }}
          onClick={() => openLightbox(0)}
        />
        {lightboxOpen && (
          <Lightbox photos={photos} startIndex={0} onClose={() => setLightboxOpen(false)} />
        )}
      </>
    )
  }

  const prev = (e) => { e.stopPropagation(); setCurrent((c) => (c === 0 ? photos.length - 1 : c - 1)) }
  const next = (e) => { e.stopPropagation(); setCurrent((c) => (c === photos.length - 1 ? 0 : c + 1)) }

  return (
    <>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Imagen actual — click abre lightbox */}
        <img
          src={photos[current].url}
          alt={altText + ' ' + (current + 1)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'zoom-in', display: 'block' }}
          onClick={() => openLightbox(current)}
        />

        {/* Flechas del carrusel */}
        <button onClick={prev} className="carousel-arrow carousel-arrow--left">‹</button>
        <button onClick={next} className="carousel-arrow carousel-arrow--right">›</button>

        {/* Dots */}
        <div className="carousel-dots">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrent(i) }}
              className={'carousel-dot' + (i === current ? ' carousel-dot--active' : '')}
            />
          ))}
        </div>
      </div>

      {lightboxOpen && (
        <Lightbox photos={photos} startIndex={current} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  )
}