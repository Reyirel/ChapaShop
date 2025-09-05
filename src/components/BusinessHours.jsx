import { useState } from 'react'
import { Clock, Plus, X } from 'lucide-react'

const BusinessHours = ({ onHoursChange, initialHours = null }) => {
  const [hours, setHours] = useState(
    initialHours || {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '15:00', closed: false },
      sunday: { open: '09:00', close: '15:00', closed: true }
    }
  )

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
    const newHours = {
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value
      }
    }
    setHours(newHours)
    onHoursChange(newHours)
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
    onHoursChange(newHours)
  }

  const copyToAllDays = (day) => {
    const dayHours = hours[day]
    const newHours = {}
    
    Object.keys(hours).forEach(d => {
      newHours[d] = { ...dayHours }
    })
    
    setHours(newHours)
    onHoursChange(newHours)
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
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> Puedes copiar los horarios de un día a todos los demás usando el botón "Copiar a todos"
        </p>
      </div>
    </div>
  )
}

export default BusinessHours
