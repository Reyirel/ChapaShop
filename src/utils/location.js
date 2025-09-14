// Utilidades para manejar ubicaciones y mapas

/**
 * Genera un enlace de Google Maps para una ubicación
 * @param {Object} options - Opciones para generar el enlace
 * @param {number} options.lat - Latitud
 * @param {number} options.lng - Longitud  
 * @param {string} options.address - Dirección de texto
 * @param {string} options.name - Nombre del lugar
 * @returns {string} URL de Google Maps
 */
export const generateGoogleMapsLink = ({ lat, lng, address, name }) => {
  const baseUrl = 'https://www.google.com/maps/search/?api=1&query='
  
  // Prioridad: coordenadas > dirección > nombre
  if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
    return `${baseUrl}${lat},${lng}`
  }
  
  if (address && address.trim()) {
    return `${baseUrl}${encodeURIComponent(address.trim())}`
  }
  
  if (name && name.trim()) {
    return `${baseUrl}${encodeURIComponent(name.trim())}`
  }
  
  // Fallback
  return 'https://www.google.com/maps'
}

/**
 * Formatea una ubicación para mostrar al usuario
 * @param {Object} options - Opciones de ubicación
 * @param {number} options.lat - Latitud
 * @param {number} options.lng - Longitud
 * @param {string} options.address - Dirección de texto
 * @param {string} options.name - Nombre del lugar
 * @returns {Object} {displayText, mapsLink, hasLocation}
 */
export const formatLocation = ({ lat, lng, address, name }) => {
  const hasCoordinates = lat && lng && !isNaN(lat) && !isNaN(lng)
  const hasAddress = address && address.trim()
  const hasLocation = hasCoordinates || hasAddress
  
  let displayText = 'Ubicación no disponible'
  
  if (hasAddress) {
    displayText = address.trim()
  } else if (hasCoordinates) {
    displayText = 'Ver ubicación en el mapa'
  } else if (name) {
    displayText = `Buscar "${name}" en el mapa`
  }
  
  const mapsLink = generateGoogleMapsLink({ lat, lng, address, name })
  
  return {
    displayText,
    mapsLink,
    hasLocation,
    hasCoordinates,
    hasAddress
  }
}

/**
 * Obtiene la distancia aproximada entre dos puntos (en km)
 * @param {number} lat1 - Latitud del punto 1
 * @param {number} lng1 - Longitud del punto 1
 * @param {number} lat2 - Latitud del punto 2
 * @param {number} lng2 - Longitud del punto 2
 * @returns {number} Distancia en kilómetros
 */
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  if (!lat1 || !lng1 || !lat2 || !lng2) return null
  
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  const distance = R * c
  
  return Math.round(distance * 100) / 100 // Redondear a 2 decimales
}

/**
 * Formatea la distancia para mostrar al usuario
 * @param {number} distanceKm - Distancia en kilómetros
 * @returns {string} Distancia formateada
 */
export const formatDistance = (distanceKm) => {
  if (!distanceKm || isNaN(distanceKm)) return ''
  
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`
  }
  
  return `${distanceKm}km`
}

/**
 * Obtiene la ubicación actual del usuario
 * @returns {Promise<{lat: number, lng: number}>} Coordenadas del usuario
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'))
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    )
  })
}
