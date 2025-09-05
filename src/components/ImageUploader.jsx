import { useState, useRef } from 'react'
import { Upload, X, Image } from 'lucide-react'

const ImageUploader = ({ onImagesChange, maxImages = 3 }) => {
  const [images, setImages] = useState([])
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    // Validar que no exceda el máximo
    if (images.length + files.length > maxImages) {
      alert(`Solo puedes subir un máximo de ${maxImages} imágenes`)
      return
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const invalidFiles = files.filter(file => !validTypes.includes(file.type))
    
    if (invalidFiles.length > 0) {
      alert('Solo se permiten archivos de imagen (JPG, PNG, WEBP)')
      return
    }

    // Validar tamaño (máximo 5MB por imagen)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert('Las imágenes no pueden superar los 5MB')
      return
    }

    // Procesar archivos
    processFiles(files)
  }

  const processFiles = async (files) => {
    setUploading(true)
    const newImages = []

    for (const file of files) {
      try {
        // Crear preview
        const preview = await createPreview(file)
        
        newImages.push({
          id: Date.now() + Math.random(),
          file,
          preview,
          name: file.name,
          size: file.size
        })
      } catch (error) {
        console.error('Error procesando imagen:', error)
      }
    }

    const updatedImages = [...images, ...newImages]
    setImages(updatedImages)
    onImagesChange(updatedImages)
    setUploading(false)

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const createPreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target.result)
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Image className="text-[#3ecf8e]" size={20} />
        <h3 className="text-lg font-bold text-white">
          Imágenes del Negocio 
          <span className="text-sm text-gray-400 font-normal ml-2">
            ({images.length}/{maxImages})
          </span>
        </h3>
      </div>

      {/* Área de subida */}
      {images.length < maxImages && (
        <div className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-[#3ecf8e]/50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <div className="space-y-4">
            <Upload className="mx-auto text-gray-400" size={48} />
            
            <div>
              <p className="text-white font-medium mb-2">
                Arrastra imágenes aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-400">
                Máximo {maxImages} imágenes • JPG, PNG, WEBP • Máximo 5MB cada una
              </p>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black px-6 py-3 rounded-xl hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 font-semibold disabled:opacity-50"
            >
              {uploading ? 'Procesando...' : 'Seleccionar Imágenes'}
            </button>
          </div>
        </div>
      )}

      {/* Preview de imágenes */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden">
              <img
                src={image.preview}
                alt={image.name}
                className="w-full h-48 object-cover"
              />
              
              <div className="p-3">
                <p className="text-sm text-white truncate">{image.name}</p>
                <p className="text-xs text-gray-400">{formatFileSize(image.size)}</p>
              </div>

              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors"
                title="Eliminar imagen"
              >
                <X size={16} />
              </button>

              {/* Indicador de imagen principal */}
              {images.indexOf(image) === 0 && (
                <div className="absolute top-2 left-2 bg-[#3ecf8e] text-black px-2 py-1 rounded-full text-xs font-bold">
                  Principal
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-3">
          <p className="text-xs text-blue-300">
            💡 <strong>Tip:</strong> La primera imagen será la imagen principal de tu negocio
          </p>
        </div>
      )}
    </div>
  )
}

export default ImageUploader
