import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Componente para manejar clics en el mapa
function LocationMarker({ position, onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng)
    },
  })

  return position === null ? null : (
    <Marker position={position} />
  )
}

const LocationPicker = ({ onLocationChange, initialPosition = null }) => {
  const [position, setPosition] = useState(initialPosition)
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)

  // Establecer posición inicial si existe
  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition)
    }
  }, [initialPosition])

  // Posición por defecto (Chapantongo, Hidalgo)
  const defaultCenter = [20.2833, -99.4167]
  const mapCenter = position ? [position.lat, position.lng] : defaultCenter
  const mapKey = position ? `${position.lat}-${position.lng}` : 'default'

  // Notificar ubicación inicial si existe
  useEffect(() => {
    if (initialPosition && onLocationChange) {
      // Si hay posición inicial, intentar obtener la dirección
      const getInitialAddress = async () => {
        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${initialPosition.lat}&longitude=${initialPosition.lng}&localityLanguage=es`
          )
          
          if (response.ok) {
            const data = await response.json()
            if (data.locality || data.city) {
              const addressParts = []
              if (data.locality) addressParts.push(data.locality)
              if (data.city && data.city !== data.locality) addressParts.push(data.city)
              if (data.principalSubdivision) addressParts.push(data.principalSubdivision)
              if (data.countryName) addressParts.push(data.countryName)
              
              if (addressParts.length > 0) {
                setAddress(addressParts.join(', '))
                onLocationChange({
                  latitude: initialPosition.lat,
                  longitude: initialPosition.lng,
                  address: addressParts.join(', ')
                })
                return
              }
            }
          }
        } catch (error) {
        }
        
        // Si no se pudo obtener dirección, usar coordenadas
        const defaultAddress = `Lat: ${initialPosition.lat.toFixed(6)}, Lng: ${initialPosition.lng.toFixed(6)}`
        setAddress(defaultAddress)
        onLocationChange({
          latitude: initialPosition.lat,
          longitude: initialPosition.lng,
          address: defaultAddress
        })
      }
      
      getInitialAddress()
    }
  }, []) // Solo ejecutar una vez al montar

  useEffect(() => {
    // Establecer la posición inicial si se proporciona
    if (initialPosition) {
      setPosition(initialPosition)
    } else {
      // Intentar obtener la ubicación actual del usuario
      getCurrentLocation()
    }
  }, [initialPosition])

  const handleLocationSelect = async (latlng) => {
    setPosition(latlng)
    setLoading(true)
    
    try {
      // Verificar que onLocationChange esté definido
      if (!onLocationChange || typeof onLocationChange !== 'function') {
        console.error('onLocationChange no está definido o no es una función')
        setLoading(false)
        return
      }

      // Crear dirección por defecto con coordenadas
      const defaultAddress = `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`
      
      // Intentar obtener dirección usando diferentes servicios
      let finalAddress = defaultAddress
      
      try {
        // Timeout de 5 segundos para evitar bloqueos
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        // Intentar con el servicio de geocoding inverso
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latlng.lat}&longitude=${latlng.lng}&localityLanguage=es`,
          { signal: controller.signal }
        )
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const data = await response.json()
          if (data.locality || data.city) {
            const addressParts = []
            if (data.locality) addressParts.push(data.locality)
            if (data.city && data.city !== data.locality) addressParts.push(data.city)
            if (data.principalSubdivision) addressParts.push(data.principalSubdivision)
            if (data.countryName) addressParts.push(data.countryName)
            
            if (addressParts.length > 0) {
              finalAddress = addressParts.join(', ')
            }
          }
        }
      } catch {
      }
      
      setAddress(finalAddress)
      onLocationChange({
        latitude: latlng.lat,
        longitude: latlng.lng,
        address: finalAddress
      })
      
    } catch (error) {
      console.error('Error al procesar la ubicación:', error)
      if (onLocationChange && typeof onLocationChange === 'function') {
        onLocationChange({
          latitude: latlng.lat,
          longitude: latlng.lng,
          address: `Lat: ${latlng.lat.toFixed(6)}, Lng: ${latlng.lng.toFixed(6)}`
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('La geolocalización no está soportada en este navegador.')
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latlng = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        handleLocationSelect(latlng)
      },
      (error) => {
        console.error('Error al obtener ubicación:', error)
        setLoading(false)
        
        let errorMessage = 'No se pudo obtener tu ubicación.'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso denegado para acceder a tu ubicación. Por favor, habilita la geolocalización en la configuración de tu navegador.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'La ubicación no está disponible. Verifica que tengas señal GPS o intenta nuevamente.'
            break
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación. Intenta nuevamente.'
            break
          default:
            errorMessage = 'Error desconocido al obtener la ubicación.'
            break
        }
        
        alert(errorMessage)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loading}
          className="px-4 py-2 bg-[#3ecf8e] text-black rounded-xl hover:bg-[#35d499] transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {loading ? 'Obteniendo...' : 'Usar mi ubicación'}
        </button>
        
        {position && (
          <button
            type="button"
            onClick={() => {
              setPosition(null)
              setAddress('')
              onLocationChange(null)
            }}
            className="px-4 py-2 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors text-sm"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="h-64 rounded-xl overflow-hidden border border-gray-700/50">
        <MapContainer
          center={mapCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          key={mapKey}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </div>

      {address && (
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-3">
          <p className="text-sm text-gray-300">
            <span className="font-medium text-[#3ecf8e]">Dirección seleccionada:</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">{address}</p>
        </div>
      )}

      <p className="text-xs text-gray-500">
        Haz clic en el mapa para seleccionar la ubicación de tu negocio
      </p>
    </div>
  )
}

export default LocationPicker
