import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext_firebase'
import dbService from '../services/database'
import driveService from '../services/googleDrive'
import LocationPicker from '../components/LocationPicker'
import BusinessHours from '../components/BusinessHours'
import ImageUploader from '../components/ImageUploader'
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
  Image
} from 'lucide-react'

const BusinessDashboard = () => {
  const { user, userProfile } = useAuth()
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const navigate = useNavigate()

  const checkUser = useCallback(async () => {
    if (!user) {
      navigate('/login')
      return
    }

    // Permitir acceso a usuarios 'person', 'business' y 'admin'
    if (!userProfile || !['person', 'business', 'admin'].includes(userProfile?.role)) {
      navigate('/negocios')
      return
    }
  }, [user, userProfile, navigate])

  const fetchBusinesses = useCallback(async () => {
    try {
      if (!user) return

      const data = await dbService.getBusinesses({ ownerId: user.uid })
      setBusinesses(data || [])
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    checkUser()
    fetchBusinesses()
  }, [checkUser, fetchBusinesses])

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-500', icon: Clock, text: 'Pendiente' },
      approved: { color: 'bg-green-500', icon: CheckCircle, text: 'Aprobado' },
      rejected: { color: 'bg-red-500', icon: XCircle, text: 'Rechazado' }
    }
    
    const badge = badges[status]
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${badge.color}`}>
        <Icon size={12} />
        {badge.text}
      </span>
    )
  }

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ecf8e] mx-auto"></div>
          <p className="mt-4 text-gray-300">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-8">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20">
                <Store size={32} className="text-[#3ecf8e]" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Dashboard de Negocios
                </h1>
                <p className="text-gray-400 text-lg">Bienvenido, {userProfile?.displayName}</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black px-6 py-3 rounded-xl hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 flex items-center gap-2 font-semibold"
            >
              <Plus size={20} />
              Crear Negocio
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Negocios</p>
                <p className="text-3xl font-bold text-white">{businesses.length}</p>
              </div>
              <Store className="text-[#3ecf8e]" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Aprobados</p>
                <p className="text-3xl font-bold text-white">
                  {businesses.filter(b => b.status === 'approved').length}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Pendientes</p>
                <p className="text-3xl font-bold text-white">
                  {businesses.filter(b => b.status === 'pending').length}
                </p>
              </div>
              <Clock className="text-yellow-500" size={32} />
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Rating Promedio</p>
                <p className="text-3xl font-bold text-white">
                  {businesses.length > 0 
                    ? (businesses.reduce((acc, b) => acc + (b.rating || 0), 0) / businesses.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
              <Star className="text-yellow-500" size={32} />
            </div>
          </div>
        </div>

        {/* Información sobre el proceso de aprobación */}
        {businesses.some(b => b.status === 'pending') && (
          <div className="mb-8 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
                <AlertCircle className="text-yellow-400" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  Negocios Pendientes de Aprobación
                </h3>
                <p className="text-gray-300 mb-3">
                  Tienes {businesses.filter(b => b.status === 'pending').length} negocio(s) esperando aprobación. 
                  Nuestro equipo los revisará pronto.
                </p>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>• Los negocios deben ser aprobados por un administrador antes de aparecer públicamente</p>
                  <p>• El proceso de revisión puede tomar entre 24-48 horas</p>
                  <p>• Recibirás una notificación cuando tu negocio sea aprobado o rechazado</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business List */}
        <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-700/50">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20">
                <Store className="text-[#3ecf8e]" size={20} />
              </div>
              Mis Negocios
            </h2>
          </div>
          
          {businesses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20 mx-auto mb-6 w-fit">
                <Store size={48} className="text-[#3ecf8e]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">No tienes negocios registrados</h3>
              <p className="text-gray-400 mb-6 text-lg">Crea tu primer negocio para comenzar</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black px-6 py-3 rounded-xl hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 font-semibold"
              >
                Crear Negocio
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-700/50">
              {businesses.map((business) => (
                <div key={business.id} className="p-6 hover:bg-gray-700/20 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-white">{business.name}</h3>
                        {business.category && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white bg-[#3ecf8e]/20 border border-[#3ecf8e]/30">
                            {business.category}
                          </span>
                        )}
                        {getStatusBadge(business.status)}
                      </div>
                      
                      <p className="text-gray-300 mb-4">{business.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-400">
                        {business.address && (
                          <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span>{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-center gap-1">
                            <Phone size={16} />
                            <span>{business.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Star size={16} />
                          <span>{business.rating || 0} ({business.totalReviews || 0} reseñas)</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/50 transition-colors">
                        <Edit size={16} className="text-gray-300" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Business Images */}
                  {business.images && business.images.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto">
                      {business.images.slice(0, 4).map((imageId, index) => (
                        <img
                          key={index}
                          src={driveService.getImageUrl(imageId)}
                          alt={`${business.name} imagen ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      ))}
                      {business.images.length > 4 && (
                        <div className="w-20 h-20 bg-gray-700/50 rounded-lg flex items-center justify-center text-gray-400 text-xs flex-shrink-0">
                          +{business.images.length - 4}
                        </div>
                      )}
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
    </div>
  )
}

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
  const [images, setImages] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    try {
      const businessData = {
        ...formData,
        ownerId: user.uid,
        location: location ? {
          lat: location.latitude,
          lng: location.longitude
        } : null,
        businessHours: businessHours ? businessHours : null
      }

      // Si hay ubicación, usar esa dirección
      if (location?.address) {
        businessData.address = location.address
      }

      // Crear negocio
      const business = await dbService.createBusiness(businessData)

      // Subir imágenes si las hay
      if (images.length > 0) {
        await dbService.uploadBusinessImages(business.id, images)
      }

      // Agregar productos si los hay
      if (products.length > 0) {
        for (const product of products) {
          await dbService.createProduct({
            ...product,
            businessId: business.id
          })
        }
      }

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
          3. Reinicia la aplicación
          
          Mientras tanto, tu negocio se guardará localmente.
        `
      } else if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        errorMessage = 'Ya existe un negocio con este nombre. Por favor, elige otro nombre.'
      } else if (error.message.includes('required')) {
        errorMessage = 'Por favor, completa todos los campos requeridos.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Crear Nuevo Negocio</h2>
          <p className="text-gray-400 mt-1">Completa la información de tu negocio</p>
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:border-transparent"
                placeholder="Mi Negocio"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:border-transparent"
              >
                <option value="">Seleccionar categoría</option>
                <option value="Restaurante">Restaurante</option>
                <option value="Tienda">Tienda</option>
                <option value="Servicios">Servicios</option>
                <option value="Entretenimiento">Entretenimiento</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:border-transparent"
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
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:border-transparent"
                placeholder="+52 55 1234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:border-transparent"
                placeholder="contacto@minegocio.com"
              />
            </div>
          </div>

          {/* Location Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Ubicación
            </label>
            <LocationPicker onLocationSelect={setLocation} />
          </div>

          {/* Business Hours */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Horarios de Atención
            </label>
            <BusinessHours onChange={setBusinessHours} />
          </div>

          {/* Image Uploader */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Imágenes del Negocio
            </label>
            <ImageUploader onImagesChange={setImages} />
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-lg hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Creando...
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

export default BusinessDashboard
