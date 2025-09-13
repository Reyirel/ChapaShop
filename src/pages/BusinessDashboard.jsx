import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import dbService from '../services/database'
import LocationPicker from '../components/LocationPicker'
import BusinessHours from '../components/BusinessHours'
import ProductList from '../components/ProductList'
import { 
  Store, 
  Plus, 
  Edit, 
  Clock, 
  MapPin, 
  Phone, 
  Star,
  Users,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Image,
  X,
  Heart
} from 'lucide-react'

// Helper function to format business hours for Firebase
const formatBusinessHours = (hours) => {
  if (!hours || typeof hours !== 'object') {
    return null
  }

  const formatted = {}
  const validDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

  validDays.forEach(day => {
    if (hours[day] && typeof hours[day] === 'object') {
      formatted[day] = {
        open: hours[day].open || '09:00',
        close: hours[day].close || '18:00',
        closed: Boolean(hours[day].closed)
      }
    } else {
      // Default values if day is missing
      formatted[day] = {
        open: '09:00',
        close: '18:00',
        closed: true
      }
    }
  })

  return formatted
}

const BusinessDashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [businessToEdit, setBusinessToEdit] = useState(null)

  const fetchBusinesses = useCallback(async () => {
    try {
      if (!user) return

      
      // Usar la función específica para evitar problemas de índice
      const data = await dbService.getUserBusinesses(user.uid)
      
      setBusinesses(data || [])
    } catch (error) {
      console.error('Error fetching businesses:', error)
      
      // Si hay error de índice, mostrar mensaje informativo y usar datos vacíos
      if (error.message && error.message.includes('index')) {
        
        setBusinesses([])
        
        // Mostrar mensaje informativo al usuario
        setTimeout(() => {
          alert(`
🔧 Configuración de Firebase Pendiente

El sistema necesita algunos índices adicionales en Firebase para funcionar correctamente.

Mientras tanto:
• Puedes crear nuevos negocios
• Los datos se guardarán correctamente
• La visualización se arreglará una vez configurados los índices

Para configurar los índices, ve a Firebase Console > Firestore Database > Indexes
          `)
        }, 1000)
      } else {
        setBusinesses([])
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      fetchBusinesses()
    } else {
      setLoading(false)
    }
  }, [user, fetchBusinesses])

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-400'
      case 'rejected': return 'text-red-400'
      case 'pending': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} />
      case 'rejected': return <XCircle size={16} />
      case 'pending': return <AlertCircle size={16} />
      default: return <AlertCircle size={16} />
    }
  }

  const getStatusBadge = (status) => {
    const color = getStatusColor(status)
    const icon = getStatusIcon(status)
    const text = {
      approved: 'Aprobado',
      rejected: 'Rechazado', 
      pending: 'Pendiente'
    }[status] || 'Desconocido'

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${color}`}>
        {icon}
        {text}
      </span>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Acceso Requerido</h2>
          <p className="text-gray-300 mb-6">Necesitas iniciar sesión para acceder al panel de negocios</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-lg hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Panel de Negocios</h1>
              <p className="text-gray-300">Gestiona tus negocios y su información</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                to="/favorites"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700/50 transition-colors text-white text-center"
              >
                <Heart size={16} className="text-red-400" />
                <span>Mis Favoritos</span>
              </Link>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-xl hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 font-medium"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Crear Negocio</span>
                <span className="sm:hidden">Crear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ecf8e]"></div>
              <span className="ml-3 text-gray-300">Cargando negocios...</span>
            </div>
          ) : businesses.length === 0 ? (
            <div className="text-center py-12">
              <Store className="mx-auto h-16 w-16 text-gray-500 mb-4" />
              <h3 className="text-xl font-medium text-gray-300 mb-2">No tienes negocios registrados</h3>
              <p className="text-gray-400 mb-6">Crea tu primer negocio para comenzar</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-xl hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 font-medium"
              >
                <Plus size={20} />
                Crear Primer Negocio
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {businesses.map((business) => (
                <div key={business.id} className="p-4 md:p-6 hover:bg-gray-700/20 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <h3 className="text-lg md:text-xl font-bold text-white break-words">{business.name}</h3>
                        <div className="flex flex-wrap items-center gap-2">
                          {business.category && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white bg-[#3ecf8e]/20 border border-[#3ecf8e]/30">
                              {business.category}
                            </span>
                          )}
                          {getStatusBadge(business.status)}
                        </div>
                      </div>
                      
                      {/* Admin Notes */}
                      {business.admin_notes && (
                        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle size={14} className="text-yellow-400 flex-shrink-0" />
                            <span className="text-sm font-medium text-yellow-400">Comentarios del Administrador:</span>
                          </div>
                          <p className="text-yellow-200 text-sm break-words">{business.admin_notes}</p>
                        </div>
                      )}
                      
                      <p className="text-gray-300 mb-4 break-words">{business.description}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-gray-400">
                        {business.address && (
                          <div className="flex items-start gap-1">
                            <MapPin size={16} className="flex-shrink-0 mt-0.5" />
                            <span className="break-words">{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={16} className="flex-shrink-0" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Business Hours - Improved responsive */}
                      {business.businessHours && (
                        <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock size={14} className="text-[#3ecf8e] flex-shrink-0" />
                            <span className="text-sm font-medium text-gray-300">Horarios de Atención:</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                            {Object.entries(business.businessHours).map(([day, hours]) => {
                              const dayNames = {
                                monday: 'Lun', tuesday: 'Mar', wednesday: 'Mié',
                                thursday: 'Jue', friday: 'Vie', saturday: 'Sáb', sunday: 'Dom'
                              }
                              return (
                                <div key={day} className="text-xs">
                                  <span className="text-gray-400">{dayNames[day]}: </span>
                                  <span className={hours.closed ? 'text-red-400' : 'text-green-400'}>
                                    {hours.closed ? 'Cerrado' : `${hours.open}-${hours.close}`}
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex lg:flex-col gap-2 lg:flex-shrink-0">
                      <button 
                        onClick={() => {
                          setBusinessToEdit(business)
                          setShowEditForm(true)
                        }}
                        className="flex items-center justify-center gap-2 p-2 lg:p-3 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors text-gray-300 hover:text-white flex-1 lg:flex-initial"
                        title="Editar negocio"
                      >
                        <Edit size={16} />
                        <span className="lg:hidden">Editar</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Business Products - Improved responsive */}
                  {business.products && (
                    <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Package size={14} className="text-[#3ecf8e] flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-300">Productos/Servicios:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {business.products.split(', ').map((product, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-lg border border-gray-600/30 break-words"
                          >
                            {product.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Business Modal */}
      {showCreateForm && (
        <CreateBusinessModal 
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false)
            fetchBusinesses()
          }}
        />
      )}

      {/* Edit Business Modal */}
      {showEditForm && businessToEdit && (
        <EditBusinessModal 
          business={businessToEdit}
          onClose={() => {
            setShowEditForm(false)
            setBusinessToEdit(null)
          }}
          onSuccess={() => {
            setShowEditForm(false)
            setBusinessToEdit(null)
            fetchBusinesses()
          }}
        />
      )}
    </div>
  )
}

// Componente para crear negocio
const CreateBusinessModal = ({ onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    address: '',
    phone: '',
    email: '',
    website: ''
  })
  const [location, setLocation] = useState(null)
  const [businessHours, setBusinessHours] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Prepare business data with proper formatting
      const businessData = {
        ...formData,
        ownerId: user.uid,
        location: location ? {
          lat: location.latitude,
          lng: location.longitude
        } : null,
        businessHours: businessHours ? formatBusinessHours(businessHours) : null,
        products: products.length > 0 ? products.join(', ') : ''
      }

      // Si hay ubicación, usar esa dirección
      if (location?.address) {
        businessData.address = location.address
      }

      // Crear negocio
      const business = await dbService.createBusiness(businessData)

      // Mostrar mensaje de éxito con información sobre el proceso de aprobación
      alert(`
🎉 ¡Negocio creado exitosamente!

📋 Nombre: ${business.name}
📍 Ubicación: ${business.address || 'No especificada'}
⏰ Estado: Pendiente de aprobación

ℹ️ Información importante:
• Tu negocio ha sido enviado para revisión
• Un administrador lo revisará en las próximas 24-48 horas  
• Recibirás una notificación cuando sea aprobado
• Solo los negocios aprobados aparecen públicamente

¡Gracias por unirte a ChapaShop! 🚀
      `)
      
      onSuccess()
    } catch (error) {
      console.error('Error completo:', error)
      
      // Mejorar el mensaje de error para el usuario
      let errorMessage = error.message
      if (error.code === 'permission-denied') {
        errorMessage = `
          🚨 Error de permisos detectado
          
          Esto significa que las reglas de Firebase no están configuradas correctamente.
          
          Para solucionarlo:
          1. Ve a tu proyecto de Firebase
          2. Configura las reglas de Firestore según la documentación
          3. Asegúrate de que los usuarios autenticados puedan escribir en la colección 'businesses'
          
          Error técnico: ${error.message}
        `
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 p-4 md:p-6 border-b border-gray-700/50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-white">Crear Nuevo Negocio</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="text-gray-400 hover:text-white" size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                placeholder="Ej: Restaurante El Buen Sabor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
              >
                <option value="">Selecciona una categoría</option>
                <option value="restaurante">Restaurante</option>
                <option value="tienda">Tienda</option>
                <option value="servicios">Servicios</option>
                <option value="tecnologia">Tecnología</option>
                <option value="salud">Salud</option>
                <option value="educacion">Educación</option>
                <option value="entretenimiento">Entretenimiento</option>
                <option value="otros">Otros</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
              placeholder="Describe tu negocio, qué ofreces, qué te hace especial..."
            />
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                placeholder="Ej: +1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                placeholder="contacto@negocio.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sitio Web
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
              placeholder="https://www.negocio.com"
            />
          </div>

          {/* Location Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ubicación
            </label>
            <LocationPicker onLocationChange={setLocation} />
          </div>

          {/* Business Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Horarios de Atención
            </label>
            <BusinessHours onHoursChange={setBusinessHours} />
          </div>

          {/* Products */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Productos/Servicios
            </label>
            <ProductList onProductsChange={setProducts} />
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-lg hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>Creando...</span>
                </div>
              ) : (
                'Crear Negocio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Componente para editar negocio
const EditBusinessModal = ({ business, onClose, onSuccess }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: business.name || '',
    description: business.description || '',
    category: business.category || '',
    address: business.address || '',
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || ''
  })
  const [location, setLocation] = useState(business.location ? {
    latitude: business.location.lat,
    longitude: business.location.lng,
    address: business.address
  } : null)
  const [initialMapPosition, setInitialMapPosition] = useState(
    business.location ? [business.location.lat, business.location.lng] : [20.2833, -99.4167]
  )
  const [businessHours, setBusinessHours] = useState(business.businessHours || null)
  const [products, setProducts] = useState(business.products ? business.products.split(', ') : [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      // Prepare business data with proper formatting
      const businessData = {
        ...formData,
        location: location ? {
          lat: location.latitude,
          lng: location.longitude
        } : null,
        businessHours: businessHours ? formatBusinessHours(businessHours) : null,
        products: products.length > 0 ? products.join(', ') : ''
      }

      // Si hay ubicación, usar esa dirección
      if (location?.address) {
        businessData.address = location.address
      }

      // Actualizar negocio
      await dbService.updateBusiness(business.id, businessData)

      // Si el negocio estaba aprobado o rechazado, cambiar a pendiente para nueva aprobación
      if (business.status === 'approved' || business.status === 'rejected') {
        await dbService.updateBusinessStatus(business.id, 'pending', 'Actualización pendiente de aprobación')
        
        alert(`
🎉 ¡Negocio actualizado exitosamente!

📋 Nombre: ${businessData.name}
📍 Estado: Pendiente de aprobación

ℹ️ Información importante:
• Tu negocio ha sido actualizado y enviado para nueva revisión
• Un administrador lo revisará en las próximas 24-48 horas  
• Recibirás una notificación cuando sea aprobado nuevamente
• Los cambios no serán visibles públicamente hasta nueva aprobación

¡Gracias por mantener tu información actualizada! 🚀
        `)
      } else {
        alert('Negocio actualizado exitosamente')
      }
      
      onSuccess()
    } catch (error) {
      console.error('Error completo:', error)
      
      let errorMessage = error.message
      if (error.code === 'permission-denied') {
        errorMessage = `
          🚨 Error de permisos detectado
          
          Esto significa que las reglas de Firebase no están configuradas correctamente.
          
          Para solucionarlo:
          1. Ve a tu proyecto de Firebase
          2. Configura las reglas de Firestore según la documentación
          3. Asegúrate de que los usuarios autenticados puedan escribir en la colección 'businesses'
          
          Error técnico: ${error.message}
        `
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-gray-800 to-gray-900 p-4 md:p-6 border-b border-gray-700/50 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold text-white">Editar Negocio</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            >
              <X className="text-gray-400 hover:text-white" size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                placeholder="Ej: Restaurante El Buen Sabor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoría *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
              >
                <option value="">Selecciona una categoría</option>
                <option value="restaurante">Restaurante</option>
                <option value="tienda">Tienda</option>
                <option value="servicios">Servicios</option>
                <option value="tecnologia">Tecnología</option>
                <option value="salud">Salud</option>
                <option value="educacion">Educación</option>
                <option value="entretenimiento">Entretenimiento</option>
                <option value="otros">Otros</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
              placeholder="Describe tu negocio, qué ofreces, qué te hace especial..."
            />
          </div>

          {/* Contact Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                placeholder="Ej: +1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                placeholder="contacto@negocio.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Sitio Web
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
              placeholder="https://www.negocio.com"
            />
          </div>

          {/* Location Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ubicación
            </label>
            <LocationPicker 
              onLocationChange={setLocation} 
              {...(business.location ? { initialPosition: { lat: business.location.lat, lng: business.location.lng } } : {})} 
            />
          </div>

          {/* Business Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Horarios de Atención
            </label>
            <BusinessHours onHoursChange={setBusinessHours} initialHours={business.businessHours} />
          </div>

          {/* Products */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Productos/Servicios
            </label>
            <ProductList onProductsChange={setProducts} initialProducts={products} />
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm whitespace-pre-line">{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-lg hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  <span>Actualizando...</span>
                </div>
              ) : (
                'Actualizar Negocio'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BusinessDashboard
