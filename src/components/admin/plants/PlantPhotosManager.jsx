// src/components/admin/plants/PlantPhotosManager.jsx
import { useRef, useState } from 'react'
import {
  usePlantPhotos,
  useUploadPlantPhoto,
  useDeletePlantPhoto,
} from '../../../hooks/usePlantPhotos'

export default function PlantPhotosManager({ plantId }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState(null)
  

  const { data: photos = [], isLoading } = usePlantPhotos(plantId)
  const uploadPhoto  = useUploadPlantPhoto()
  const deletePhoto  = useDeletePlantPhoto()

  async function handleFiles(e) {
    const files = Array.from(e.target.files)
    if (!files.length) return

    setUploading(true)
    setError(null)
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadPhoto.mutateAsync({
          plantId,
          file:       files[i],
          orderIndex: photos.length + i,
        })
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleDelete(photo) {
    if (!window.confirm('Eliminar esta foto?')) return
    try {
      await deletePhoto.mutateAsync({ photo, plantId })
    } catch (err) {
      setError(err.message)
    }
  }

  if (isLoading) return <p className="text-muted">Cargando fotos...</p>

  return (
    <div>
      {/* Grid de fotos */}
      {photos.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 10,
          marginBottom: 16,
        }}>
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', aspectRatio: '1' }}
            >
              <img
                src={photo.url}
                alt={'Foto ' + (idx + 1)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <button
                onClick={() => handleDelete(photo)}
                style={{
                  position: 'absolute', top: 6, right: 6,
                  background: 'rgba(0,0,0,0.55)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50%',
                  width: 24, height: 24,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ✕
              </button>
              {idx === 0 && (
                <span style={{
                  position: 'absolute', bottom: 6, left: 6,
                  background: 'var(--green-600)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                }}>
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zona de subida */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--green-300)',
          borderRadius: 10,
          padding: '20px',
          textAlign: 'center',
          cursor: uploading ? 'default' : 'pointer',
          background: uploading ? 'var(--green-50)' : 'transparent',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => !uploading && (e.currentTarget.style.background = 'var(--green-50)')}
        onMouseLeave={(e) => !uploading && (e.currentTarget.style.background = 'transparent')}
      >
        <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
        <p style={{ color: 'var(--green-600)', fontSize: 13, margin: 0, fontWeight: 500 }}>
          {uploading ? 'Subiendo...' : 'Agregar fotos'}
        </p>
        <p className="text-muted" style={{ fontSize: 11, marginTop: 4 }}>
          Podés seleccionar varias a la vez
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFiles}
      />

      {error && <p className="error-msg" style={{ marginTop: 10 }}>{error}</p>}
    </div>
  )
}
