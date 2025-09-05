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
  const map = useMapEvents({
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

  // Posición por defecto (Ciudad de México)
  const defaultCenter = [19.4326, -99.1332]

  const handleLocationSelect = async (latlng) => {
    setPosition(latlng)
    setLoading(true)
    
    try {
      // Usar Nominatim para reverse geocoding (gratuito)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latlng.lat}&lon=${latlng.lng}&accept-language=es`
      )
      const data = await response.json()
      
      if (data.display_name) {
        setAddress(data.display_name)
        onLocationChange({
          latitude: latlng.lat,
          longitude: latlng.lng,
          address: data.display_name
        })
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error)
      onLocationChange({
        latitude: latlng.lat,
        longitude: latlng.lng,
        address: `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
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
        }
      )
    }
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
          center={position || defaultCenter}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          key={position ? `${position.lat}-${position.lng}` : 'default'}
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
