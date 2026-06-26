import imageCompression from 'browser-image-compression'

const OPTIONS = {
  maxSizeMB: 0.4,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
}

export const compressImage = async (file) => {
  try {
    return await imageCompression(file, OPTIONS)
  } catch (error) {
    console.error('Error compressing image:', error)
    throw error
  }
}