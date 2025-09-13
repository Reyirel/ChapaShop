import { useState, useEffect } from 'react'
import { Clock, Plus, X } from 'lucide-react'

const BusinessHours = ({ onHoursChange, initialHours = null }) => {
  // Default hours with proper structure
  const getDefaultHours = () => ({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '15:00', closed: false },
    sunday: { open: '09:00', close: '15:00', closed: true }
  })

  const [hours, setHours] = useState(() => {
    if (initialHours && typeof initialHours === 'object') {
      // Validate and merge with defaults to ensure all days are present
      const defaultHours = getDefaultHours()
      const validatedHours = {}
      
      Object.keys(defaultHours).forEach(day => {
        if (initialHours[day] && typeof initialHours[day] === 'object') {
          validatedHours[day] = {
            open: initialHours[day].open || defaultHours[day].open,
            close: initialHours[day].close || defaultHours[day].close,
            closed: Boolean(initialHours[day].closed)
          }
        } else {
          validatedHours[day] = { ...defaultHours[day] }
        }
      })
      
      return validatedHours
    }
    return getDefaultHours()
  })

  // Call onHoursChange whenever hours change and ensure it's properly formatted
  useEffect(() => {
    if (onHoursChange && typeof onHoursChange === 'function') {
      // Create a clean copy with proper validation
      const cleanedHours = {}
      Object.keys(hours).forEach(day => {
        cleanedHours[day] = {
          open: hours[day].open || '09:00',
          close: hours[day].close || '18:00',
          closed: Boolean(hours[day].closed)
        }
      })
      
      onHoursChange(cleanedHours)
    }
  }, [hours, onHoursChange])

  const dayNames = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }

  const handleDayChange = (day, field, value) => {
    // Validate time format and logic
    if (field === 'open' || field === 'close') {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(value)) {
        console.warn(`⚠️ Formato de hora inválido: ${value}`)
        return
      }
    }

    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value
      }
    }
    
    // Validate that open time is before close time
    if (field === 'open' || field === 'close') {
      const openTime = field === 'open' ? value : newHours[day].open
      const closeTime = field === 'close' ? value : newHours[day].close
      
      if (openTime >= closeTime) {
        console.warn(`⚠️ Hora de apertura (${openTime}) debe ser anterior a hora de cierre (${closeTime})`)
        // You could add user feedback here if needed
      }
    }
    
    setHours(newHours)
  }

  const toggleDayClosed = (day) => {
    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        closed: !hours[day].closed
      }
    }
    
    setHours(newHours)
  }

  const copyToAllDays = (day) => {
    const dayHours = hours[day]
    const newHours = {}
    
    Object.keys(hours).forEach(d => {
      newHours[d] = { 
        open: dayHours.open,
        close: dayHours.close,
        closed: dayHours.closed
      }
    })
    
    setHours(newHours)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-[#3ecf8e]" size={20} />
        <h3 className="text-lg font-bold text-white">Horarios de Atención</h3>
      </div>

      <div className="space-y-3">
        {Object.entries(hours).map(([day, dayHours]) => (
          <div key={day} className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-white text-sm">{dayNames[day]}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToAllDays(day)}
                  className="text-xs text-[#3ecf8e] hover:text-[#35d499] transition-colors"
                  title="Aplicar a todos los días"
                >
                  Copiar a todos
                </button>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={dayHours.closed}
                    onChange={() => toggleDayClosed(day)}
                    className="rounded border-gray-600 bg-gray-700 text-[#3ecf8e] focus:ring-[#3ecf8e] focus:ring-offset-0"
                  />
                  <span className="text-gray-300">Cerrado</span>
                </label>
              </div>
            </div>

            {!dayHours.closed && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Apertura</label>
                  <input
                    type="time"
                    value={dayHours.open}
                    onChange={(e) => handleDayChange(day, 'open', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Cierre</label>
                  <input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) => handleDayChange(day, 'close', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                  />
                </div>
              </div>
            )}

            {dayHours.closed && (
              <div className="text-center py-2">
                <span className="text-gray-500 text-sm">Cerrado todo el día</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-3">
        <p className="text-xs text-blue-300 mb-2">
          💡 <strong>Tip:</strong> Puedes copiar los horarios de un día a todos los demás usando el botón "Copiar a todos"
        </p>
        <div className="text-xs text-gray-400">
          Los horarios se actualizan automáticamente. Formato: 24 horas (ej: 14:30)
        </div>
      </div>
    </div>
  )
}

export default BusinessHours
