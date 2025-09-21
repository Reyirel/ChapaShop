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
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_white_1px,_transparent_0)] bg-[size:24px_24px] animate-pulse"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-8">
        {/* Enhanced Header with Better Visual Hierarchy */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <Store className="text-white" size={32} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Panel de Negocios
                  </h1>
                  <p className="text-gray-400 text-lg">Administra y haz crecer tu imperio empresarial</p>
                </div>
              </div>
              <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"></div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                to="/favorites"
                className="group relative overflow-hidden flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-800/80 to-gray-700/80 hover:from-gray-700/80 hover:to-gray-600/80 rounded-xl border border-gray-600/50 backdrop-blur-sm transition-all duration-300 text-white text-center shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Heart size={20} className="relative z-10 group-hover:text-pink-400 transition-colors" />
                <span className="relative z-10">Favoritos</span>
              </Link>
              
              <button
                onClick={() => setShowCreateForm(true)}
                className="group relative overflow-hidden flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus size={20} className="relative z-10 group-hover:rotate-90 transition-transform duration-300" />
                <span className="relative z-10 font-semibold">Crear Negocio</span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Stats with Better Visual Impact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm hover:border-indigo-500/50 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 rounded-xl border border-indigo-500/30 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-all duration-300">
                <Store className="text-indigo-400 group-hover:scale-110 transition-transform duration-300" size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">Total Negocios</p>
                <p className="text-3xl font-bold text-white group-hover:text-indigo-300 transition-colors duration-300">
                  {businesses.length}
                </p>
                <div className="h-1 w-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl border border-green-500/30 group-hover:shadow-lg group-hover:shadow-green-500/25 transition-all duration-300">
                <CheckCircle className="text-green-400 group-hover:scale-110 transition-transform duration-300" size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">Aprobados</p>
                <p className="text-3xl font-bold text-white group-hover:text-green-300 transition-colors duration-300">
                  {businesses.filter(b => b.status === 'approved').length}
                </p>
                <div className="h-1 w-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-gray-800/50 to-gray-700/30 rounded-2xl p-6 border border-gray-600/30 backdrop-blur-sm hover:border-yellow-500/50 transition-all duration-300 hover:scale-105">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl border border-yellow-500/30 group-hover:shadow-lg group-hover:shadow-yellow-500/25 transition-all duration-300">
                <AlertCircle className="text-yellow-400 group-hover:scale-110 transition-transform duration-300" size={28} />
              </div>
              <div className="space-y-1">
                <p className="text-gray-400 text-sm font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-white group-hover:text-yellow-300 transition-colors duration-300">
                  {businesses.filter(b => b.status === 'pending').length}
                </p>
                <div className="h-1 w-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full group-hover:w-20 transition-all duration-300"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Business List with Modern Design */}
        <div className="relative">
          <div className="bg-gradient-to-br from-gray-800/60 to-gray-700/40 rounded-2xl border border-gray-600/30 backdrop-blur-sm overflow-hidden shadow-2xl">
            {/* Header with gradient background */}
            <div className="relative bg-gradient-to-r from-gray-800/80 to-gray-700/80 p-6 border-b border-gray-600/30">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10"></div>
              <h2 className="relative text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-lg border border-indigo-500/30">
                  <Package size={24} className="text-indigo-400" />
                </div>
                Mis Negocios
                <span className="ml-auto text-sm bg-gray-700/50 px-3 py-1 rounded-full border border-gray-600/50">
                  {businesses.length} total
                </span>
              </h2>
            </div>

            {businesses.length === 0 ? (
              <div className="relative p-16 text-center">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-gray-800/20"></div>
                <div className="relative space-y-6">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-gray-700/50 to-gray-600/50 rounded-full flex items-center justify-center border border-gray-600/30">
                    <Store className="text-gray-400" size={48} />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-gray-300">¡Comienza tu aventura empresarial!</h3>
                    <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                      No tienes negocios registrados aún. Crea tu primer negocio y comienza a construir tu presencia digital.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-2">
                      <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                      Crear mi Primer Negocio
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-600/30">
                {businesses.map((business) => (
                  <div key={business.id} className="group relative p-6 hover:bg-gradient-to-r hover:from-gray-700/20 hover:to-gray-600/20 transition-all duration-300">
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6 pl-2">
                      {/* Enhanced Logo/Animation with glow effect */}
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                        <div className="relative w-full h-full bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl border border-gray-600/30 group-hover:border-indigo-500/50 transition-all duration-300 overflow-hidden">
                          <CategoryMiniAnimation category={business.category} />
                        </div>
                      </div>

                      {/* Enhanced Business Info */}
                      <div className="flex-1 min-w-0 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors duration-300 truncate">
                                {business.name}
                              </h3>
                              <span className="px-2 py-1 bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-gray-300 text-xs rounded-full border border-gray-600/30 capitalize">
                                {business.category}
                              </span>
                            </div>
                          </div>
                          
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium ${
                            business.status === 'approved' 
                              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                              : business.status === 'rejected'
                              ? 'bg-red-500/10 border-red-500/30 text-red-400'
                              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                          }`}>
                            {getStatusIcon(business.status)}
                            <span className="capitalize">{business.status || 'pending'}</span>
                          </div>
                        </div>

                        <p className="text-gray-300 leading-relaxed line-clamp-2 group-hover:text-gray-200 transition-colors duration-300">
                          {business.description}
                        </p>

                        {/* Enhanced contact info */}
                        <div className="flex flex-wrap items-center gap-6 text-sm">
                          {business.address && (
                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
                              <div className="p-1 bg-gray-700/50 rounded">
                                <MapPin size={14} />
                              </div>
                              <span className="truncate max-w-xs">{business.address}</span>
                            </div>
                          )}
                          {business.phone && (
                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
                              <div className="p-1 bg-gray-700/50 rounded">
                                <Phone size={14} />
                              </div>
                              <span>{business.phone}</span>
                            </div>
                          )}
                          {business.businessHours && (
                            <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
                              <div className="p-1 bg-gray-700/50 rounded">
                                <Clock size={14} />
                              </div>
                              <span>Horarios configurados</span>
                            </div>
                          )}
                        </div>

                        {/* Enhanced products display */}
                        {business.products && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Productos/Servicios</p>
                            <div className="flex flex-wrap gap-2">
                              {business.products.split(', ').slice(0, 4).map((product, index) => (
                                <span 
                                  key={index}
                                  className="px-3 py-1 bg-gradient-to-r from-gray-700/50 to-gray-600/50 hover:from-indigo-600/20 hover:to-purple-600/20 text-gray-300 hover:text-white text-xs rounded-lg border border-gray-600/30 hover:border-indigo-500/50 transition-all duration-300 cursor-default"
                                >
                                  {product.trim()}
                                </span>
                              ))}
                              {business.products.split(', ').length > 4 && (
                                <span className="px-3 py-1 bg-gray-600/30 text-gray-400 text-xs rounded-lg border border-gray-600/30">
                                  +{business.products.split(', ').length - 4} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Enhanced Actions with better styling */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setBusinessToEdit(business)
                            setShowEditForm(true)
                          }}
                          className="group/btn relative overflow-hidden p-3 text-gray-400 hover:text-white hover:bg-indigo-600/20 rounded-xl border border-gray-600/30 hover:border-indigo-500/50 transition-all duration-300"
                          title="Editar negocio"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          <Edit size={18} className="relative z-10 group-hover/btn:scale-110 transition-transform duration-300" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteBusiness(business.id)}
                          className="group/btn relative overflow-hidden p-3 text-gray-400 hover:text-red-400 hover:bg-red-600/20 rounded-xl border border-gray-600/30 hover:border-red-500/50 transition-all duration-300"
                          title="Eliminar negocio"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          <X size={18} className="relative z-10 group-hover/btn:scale-110 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-700/95 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-600/30 backdrop-blur-sm">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 pointer-events-none"></div>
        
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-gray-800/90 to-gray-700/90 p-6 border-b border-gray-600/30">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-600/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-xl border border-indigo-500/30">
                <Plus className="text-indigo-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Crear Nuevo Negocio
                </h2>
                <p className="text-gray-400 text-sm">Comparte tu negocio con el mundo</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Información Básica</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Ej: Restaurante El Buen Sabor"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm"
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

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Descripción *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300 backdrop-blur-sm resize-none"
                  placeholder="Describe tu negocio, qué ofreces y qué te hace especial..."
                />
                <p className="text-xs text-gray-400">Describe tu negocio de manera atractiva para los clientes</p>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Información de Contacto</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="contacto@negocio.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Sitio Web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
                  placeholder="https://www.minegocio.com"
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Ubicación</h3>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-600/30">
                <LocationPicker
                  onLocationChange={setLocation}
                  initialPosition={location ? { lat: location.latitude, lng: location.longitude } : null}
                />
              </div>
            </div>

            {/* Business Hours Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Horarios de Atención</h3>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-600/30">
                <BusinessHours
                  onHoursChange={setBusinessHours}
                  initialHours={businessHours}
                />
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Productos y Servicios</h3>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-600/30">
                <ProductList
                  onProductsChange={setProducts}
                  initialProducts={products}
                />
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-600/30">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Crear Negocio
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="relative bg-gradient-to-br from-gray-800/95 to-gray-700/95 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-600/30 backdrop-blur-sm">
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-600/5 pointer-events-none"></div>
        
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-gray-800/90 to-gray-700/90 p-6 border-b border-gray-600/30">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-600/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-600/20 rounded-xl border border-blue-500/30">
                <Edit className="text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Editar Negocio
                </h2>
                <p className="text-gray-400 text-sm">Actualiza la información de tu negocio</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Enhanced Form */}
        <div className="relative overflow-y-auto max-h-[calc(90vh-120px)]">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Información Básica</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Nombre del Negocio *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="Ej: Restaurante El Buen Sabor"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Categoría *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm"
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

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Descripción *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 backdrop-blur-sm resize-none"
                  placeholder="Describe tu negocio, qué ofreces y qué te hace especial..."
                />
                <p className="text-xs text-gray-400">Describe tu negocio de manera atractiva para los clientes</p>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Información de Contacto</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="+1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-300">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
                    placeholder="contacto@negocio.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Sitio Web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-all duration-300 backdrop-blur-sm"
                  placeholder="https://www.minegocio.com"
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Ubicación</h3>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-600/30">
                <LocationPicker
                  onLocationChange={setLocation}
                  initialPosition={location ? { lat: location.latitude, lng: location.longitude } : null}
                />
              </div>
            </div>

            {/* Business Hours Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-orange-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Horarios de Atención</h3>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-600/30">
                <BusinessHours
                  onHoursChange={setBusinessHours}
                  initialHours={businessHours}
                />
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-gradient-to-b from-red-500 to-pink-600 rounded-full"></div>
                <h3 className="text-lg font-semibold text-white">Productos y Servicios</h3>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-600/30">
                <ProductList
                  onProductsChange={setProducts}
                  initialProducts={products}
                />
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-600/30">
              <button
                type="button"
                onClick={onClose}
                className="px-8 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-xl border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="group relative overflow-hidden px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center gap-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Edit size={18} />
                      Actualizar Negocio
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BusinessDashboard
