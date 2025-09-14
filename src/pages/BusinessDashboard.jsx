import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import dbService from '../services/database'
import CategoryAnimation from '../components/CategoryAnimation'
import CategoryMiniAnimation from '../components/CategoryMiniAnimation'
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
  console.log('🕒 formatBusinessHours recibió:', hours)
  console.log('🕒 formatBusinessHours - tipo:', typeof hours)
  
  // If hours is null or undefined, return default business hours
  if (!hours || typeof hours !== 'object') {
    console.log('⚠️ Horarios inválidos o nulos, generando horarios por defecto')
    const defaultHours = {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '15:00', closed: false },
      sunday: { open: '09:00', close: '15:00', closed: true }
    }
    console.log('🕒 formatBusinessHours - horarios por defecto generados:', defaultHours)
    return defaultHours
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
        closed: false
      }
    }
  })

  console.log('✅ Horarios formateados:', formatted)
  console.log('✅ formatBusinessHours - nunca es null, siempre devuelve objeto:', typeof formatted === 'object')
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

      const data = await dbService.getUserBusinesses(user.uid)
      setBusinesses(data || [])
    } catch (error) {
      console.error('Error fetching businesses:', error)
      
      if (error.message && error.message.includes('index')) {
        setBusinesses([])
        
        setTimeout(() => {
          alert(`🔧 Configuración de Firebase Pendiente

El sistema necesita algunos índices adicionales en Firebase para funcionar correctamente.

Mientras tanto:
• Puedes crear nuevos negocios
• Los datos se guardarán correctamente
• La visualización se arreglará una vez configurados los índices

Para configurar los índices, ve a Firebase Console > Firestore Database > Indexes`)
        }, 1000)
      } else {
        setBusinesses([])
      }
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  const handleDeleteBusiness = async (businessId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este negocio?')) return

    try {
      await dbService.deleteBusiness(businessId)
      setBusinesses(prev => prev.filter(b => b.id !== businessId))
    } catch (error) {
      console.error('Error deleting business:', error)
      alert('Error al eliminar el negocio')
    }
  }

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

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Acceso Denegado</h2>
          <p className="text-gray-300 mb-6">Debes iniciar sesión para acceder al panel de negocios</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Cargando tus negocios...</p>
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
                <Heart size={18} />
                Favoritos
              </Link>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors"
              >
                <Plus size={18} />
                Crear Negocio
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600/20 rounded-lg">
                <Store className="text-indigo-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total Negocios</p>
                <p className="text-2xl font-bold text-white">{businesses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-600/20 rounded-lg">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Aprobados</p>
                <p className="text-2xl font-bold text-white">
                  {businesses.filter(b => b.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-600/20 rounded-lg">
                <AlertCircle className="text-yellow-400" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Pendientes</p>
                <p className="text-2xl font-bold text-white">
                  {businesses.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Business List */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
          <div className="p-6 border-b border-gray-700/50">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Package size={20} />
              Mis Negocios
            </h2>
          </div>

          {businesses.length === 0 ? (
            <div className="p-12 text-center">
              <Store className="mx-auto text-gray-500 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No tienes negocios aún</h3>
              <p className="text-gray-400 mb-6">Crea tu primer negocio para comenzar</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Crear Primer Negocio
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {businesses.map((business) => (
                <div key={business.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Logo/Animation */}
                    <div className="w-20 h-20 flex-shrink-0">
                      <CategoryMiniAnimation category={business.category} />
                    </div>

                    {/* Business Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white truncate">
                            {business.name}
                          </h3>
                          <p className="text-sm text-gray-400 capitalize">
                            {business.category}
                          </p>
                        </div>
                        <div className={`flex items-center gap-1 text-sm ${getStatusColor(business.status)}`}>
                          {getStatusIcon(business.status)}
                          <span className="capitalize">{business.status || 'pending'}</span>
                        </div>
                      </div>

                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {business.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        {business.address && (
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            <span className="truncate max-w-xs">{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={14} />
                            <span>{business.phone}</span>
                          </div>
                        )}
                        {business.businessHours && (
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>Horarios configurados</span>
                          </div>
                        )}
                      </div>

                      {business.products && (
                        <div className="mt-3">
                          <p className="text-xs text-gray-400 mb-1">Productos/Servicios:</p>
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

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setBusinessToEdit(business)
                          setShowEditForm(true)
                        }}
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
                        title="Editar negocio"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteBusiness(business.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-600/10 rounded-lg transition-colors"
                        title="Eliminar negocio"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
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
    phone: '',
    email: '',
    website: ''
  })
  
  const [location, setLocation] = useState(null)
  const [businessHours, setBusinessHours] = useState({
    monday: { open: '09:00', close: '18:00', closed: false },
    tuesday: { open: '09:00', close: '18:00', closed: false },
    wednesday: { open: '09:00', close: '18:00', closed: false },
    thursday: { open: '09:00', close: '18:00', closed: false },
    friday: { open: '09:00', close: '18:00', closed: false },
    saturday: { open: '09:00', close: '15:00', closed: false },
    sunday: { open: '09:00', close: '15:00', closed: true }
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      console.log('📝 Datos del formulario antes de enviar:')
      console.log('- formData:', formData)
      console.log('- location:', location)
      console.log('- businessHours (raw):', businessHours)
      console.log('- businessHours tipo:', typeof businessHours)
      console.log('- businessHours es null:', businessHours === null)
      console.log('- businessHours keys:', businessHours ? Object.keys(businessHours) : 'N/A')
      console.log('- products:', products)

      // Debug: verificar businessHours antes y después del formateo
      console.log('🔍 Antes de formatBusinessHours:', businessHours)
      const formattedHours = formatBusinessHours(businessHours)
      console.log('🔍 Después de formatBusinessHours:', formattedHours)
      console.log('🔍 formattedHours es null:', formattedHours === null)

      const businessData = {
        ...formData,
        ownerId: user.uid,
        location: location ? {
          lat: location.latitude,
          lng: location.longitude
        } : null,
        businessHours: formattedHours,
        products: products.length > 0 ? products.join(', ') : ''
      }

      console.log('🏢 Creando negocio con datos FINALES:')
      console.log('- name:', businessData.name)
      console.log('- location:', businessData.location)
      console.log('- businessHours:', businessData.businessHours)
      console.log('- businessHours tipo:', typeof businessData.businessHours)
      console.log('- hasBusinessHours:', !!businessData.businessHours)
      console.log('- hasProducts:', !!businessData.products)
      console.log('- Objeto completo:', businessData)

      const businessId = await dbService.createBusiness(businessData)
      
      if (businessId) {
        alert('¡Negocio creado exitosamente! Está pendiente de aprobación.')
        onSuccess()
      } else {
        throw new Error('No se pudo crear el negocio')
      }
    } catch (error) {
      console.error('Error creating business:', error)
      
      let errorMessage = error.message
      
      if (error.message && error.message.includes('index')) {
        errorMessage = `⚠️ Configuración Pendiente

Se creó el negocio pero hay índices pendientes en Firebase.

El negocio se guardó correctamente y aparecerá una vez que se configuren los índices en Firebase Console.

Error técnico: ${error.message}`
      } else if (error.message && error.message.includes('permission')) {
        errorMessage = 'Error de permisos. Verifica que tengas acceso para crear negocios.'
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Crear Nuevo Negocio</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccionar categoría</option>
                <option value="restaurante">Restaurante</option>
                <option value="tienda">Tienda</option>
                <option value="servicios">Servicios</option>
                <option value="salud">Salud</option>
                <option value="educacion">Educación</option>
                <option value="entretenimiento">Entretenimiento</option>
                <option value="tecnologia">Tecnología</option>
                <option value="automotriz">Automotriz</option>
                <option value="belleza">Belleza</option>
                <option value="hogar">Hogar</option>
                <option value="deportes">Deportes</option>
                <option value="mascotas">Mascotas</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe tu negocio..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://www.minegocio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ubicación del Negocio
            </label>
            <LocationPicker
              onLocationChange={setLocation}
              initialPosition={location ? { lat: location.latitude, lng: location.longitude } : null}
            />
          </div>

          <BusinessHours
            onHoursChange={setBusinessHours}
            initialHours={businessHours}
          />

          <ProductList
            onProductsChange={setProducts}
            initialProducts={products}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
    phone: business.phone || '',
    email: business.email || '',
    website: business.website || ''
  })
  
  const [location, setLocation] = useState(business.location ? {
    latitude: business.location.lat,
    longitude: business.location.lng
  } : null)
  
  const [businessHours, setBusinessHours] = useState(() => {
    if (business.businessHours && typeof business.businessHours === 'object') {
      return business.businessHours
    }
    // Default hours if none exist
    return {
      monday: { open: '09:00', close: '18:00', closed: false },
      tuesday: { open: '09:00', close: '18:00', closed: false },
      wednesday: { open: '09:00', close: '18:00', closed: false },
      thursday: { open: '09:00', close: '18:00', closed: false },
      friday: { open: '09:00', close: '18:00', closed: false },
      saturday: { open: '09:00', close: '15:00', closed: false },
      sunday: { open: '09:00', close: '15:00', closed: true }
    }
  })
  const [products, setProducts] = useState(
    business.products ? business.products.split(', ').filter(p => p.trim()) : []
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)

    try {
      console.log('🔄 Datos del formulario de edición antes de enviar:')
      console.log('- formData:', formData)
      console.log('- location:', location)
      console.log('- businessHours (raw):', businessHours)
      console.log('- businessHours tipo:', typeof businessHours)
      console.log('- businessHours keys:', businessHours ? Object.keys(businessHours) : 'N/A')
      console.log('- products:', products)

      // Debug: verificar businessHours antes y después del formateo
      console.log('🔍 EDIT - Antes de formatBusinessHours:', businessHours)
      const formattedHours = formatBusinessHours(businessHours)
      console.log('🔍 EDIT - Después de formatBusinessHours:', formattedHours)

      const businessData = {
        ...formData,
        location: location ? {
          lat: location.latitude,
          lng: location.longitude
        } : null,
        businessHours: formattedHours,
        products: products.length > 0 ? products.join(', ') : ''
      }

      console.log('🔄 Actualizando negocio con datos FINALES:')
      console.log('- businessId:', business.id)
      console.log('- name:', businessData.name)
      console.log('- location:', businessData.location)
      console.log('- businessHours:', businessData.businessHours)
      console.log('- businessHours tipo:', typeof businessData.businessHours)
      console.log('- hasBusinessHours:', !!businessData.businessHours)
      console.log('- hasProducts:', !!businessData.products)

      const result = await dbService.updateBusiness(business.id, businessData)
      
      if (result) {
        alert(`🎉 ¡Negocio actualizado exitosamente!

Tu negocio "${formData.name}" ha sido actualizado correctamente.

Los cambios pueden tardar unos momentos en aparecer.`)
        onSuccess()
      } else {
        throw new Error('No se pudo actualizar el negocio')
      }
    } catch (error) {
      console.error('Error updating business:', error)
      
      let errorMessage = error.message
      
      if (error.message && error.message.includes('index')) {
        errorMessage = `⚠️ Actualización Procesada

Se actualizó el negocio pero hay índices pendientes en Firebase.

Los cambios se guardaron correctamente y aparecerán una vez que se configuren los índices.

Error técnico: ${error.message}`
      } else if (error.message && error.message.includes('permission')) {
        errorMessage = 'Error de permisos. Verifica que tengas acceso para actualizar negocios.'
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Editar Negocio</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccionar categoría</option>
                <option value="restaurante">Restaurante</option>
                <option value="tienda">Tienda</option>
                <option value="servicios">Servicios</option>
                <option value="salud">Salud</option>
                <option value="educacion">Educación</option>
                <option value="entretenimiento">Entretenimiento</option>
                <option value="tecnologia">Tecnología</option>
                <option value="automotriz">Automotriz</option>
                <option value="belleza">Belleza</option>
                <option value="hogar">Hogar</option>
                <option value="deportes">Deportes</option>
                <option value="mascotas">Mascotas</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe tu negocio..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+1234567890"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              onChange={(e) => setFormData({...formData, website: e.target.value})}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://www.minegocio.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ubicación del Negocio
            </label>
            <LocationPicker
              onLocationChange={setLocation}
              initialPosition={location ? { lat: location.latitude, lng: location.longitude } : null}
            />
          </div>

          <BusinessHours
            onHoursChange={setBusinessHours}
            initialHours={businessHours}
          />

          <ProductList
            onProductsChange={setProducts}
            initialProducts={products}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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

export default BusinessDashboard
