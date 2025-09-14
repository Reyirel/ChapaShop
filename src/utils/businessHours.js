// Utilidades para manejar y mostrar horarios comerciales

/**
 * Formatea los horarios comerciales para mostrar al usuario
 * @param {Object} hours - Objeto con horarios por día
 * @returns {Array} Array de objetos con {day, time, isOpen}
 */
export const formatBusinessHours = (hours) => {
  const dayNames = [
    { key: 'monday', name: 'Lunes' },
    { key: 'tuesday', name: 'Martes' },
    { key: 'wednesday', name: 'Miércoles' },
    { key: 'thursday', name: 'Jueves' },
    { key: 'friday', name: 'Viernes' },
    { key: 'saturday', name: 'Sábado' },
    { key: 'sunday', name: 'Domingo' }
  ]

  return dayNames.map(({ key, name }) => {
    let timeDisplay = 'Cerrado'
    let isOpen = false
    
    // Si no hay datos de horarios o el día no existe
    if (!hours || typeof hours !== 'object' || !hours[key]) {
      return {
        day: name,
        time: 'Cerrado',
        isOpen: false
      }
    }

    const data = hours[key]
    
    // Manejar diferentes formatos de datos
    if (typeof data === 'string') {
      timeDisplay = data === '' ? 'Cerrado' : data
      isOpen = data !== '' && data.toLowerCase() !== 'cerrado'
    } else if (typeof data === 'object' && data !== null) {
      // PRIORIDAD ALTA: Verificar si está cerrado primero
      if (data.closed === true) {
        timeDisplay = 'Cerrado'
        isOpen = false
      } else if (data.isOpen === false) {
        timeDisplay = 'Cerrado'
        isOpen = false
      } else if (data.time) {
        timeDisplay = data.time
        isOpen = data.time.toLowerCase() !== 'cerrado'
      } else if (data.open && data.close) {
        timeDisplay = `${data.open} - ${data.close}`
        isOpen = true
      } else if (data.isOpen === true) {
        timeDisplay = data.hours || '24 horas'
        isOpen = true
      } else {
        timeDisplay = 'Cerrado'
        isOpen = false
      }
    }

    return {
      day: name,
      time: timeDisplay,
      isOpen: isOpen
    }
  })
}

/**
 * Obtiene el horario para el día actual
 * @param {Object} hours - Objeto con horarios por día
 * @returns {Object} {day, time, isOpen} para el día actual
 */
export const getTodayHours = (hours) => {
  const today = new Date()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const todayKey = dayNames[today.getDay()]
  
  const allHours = formatBusinessHours(hours)
  return allHours.find(h => h.day.toLowerCase().startsWith(todayKey.substring(0, 3))) || {
    day: 'Hoy',
    time: 'Cerrado',
    isOpen: false
  }
}

/**
 * Verifica si un negocio está abierto ahora
 * @param {Object} hours - Objeto con horarios por día
 * @returns {boolean} true si está abierto ahora
 */
export const isOpenNow = (hours) => {
  const today = new Date()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const todayKey = dayNames[today.getDay()]
  
  if (!hours || typeof hours !== 'object' || !hours[todayKey]) {
    return false
  }

  const todayData = hours[todayKey]
  
  // Si está marcado como cerrado
  if (todayData.closed === true || todayData.isOpen === false) {
    return false
  }

  // Si tiene horarios específicos, verificar la hora actual
  if (todayData.open && todayData.close) {
    const now = today.getHours() * 100 + today.getMinutes()
    const [openHour, openMin] = todayData.open.split(':').map(Number)
    const [closeHour, closeMin] = todayData.close.split(':').map(Number)
    
    const openTime = openHour * 100 + openMin
    const closeTime = closeHour * 100 + closeMin
    
    return now >= openTime && now <= closeTime
  }

  // Si isOpen está true sin horarios específicos
  return todayData.isOpen === true
}

/**
 * Formatea un horario para mostrar de manera compacta
 * @param {Object} dayData - Datos del día específico
 * @returns {string} Horario formateado
 */
export const formatDayHours = (dayData) => {
  if (!dayData || typeof dayData !== 'object') {
    return 'Cerrado'
  }

  if (dayData.closed === true || dayData.isOpen === false) {
    return 'Cerrado'
  }

  if (dayData.open && dayData.close) {
    return `${dayData.open} - ${dayData.close}`
  }

  if (dayData.time) {
    return dayData.time
  }

  if (dayData.isOpen === true) {
    return dayData.hours || '24 horas'
  }

  return 'Cerrado'
}
