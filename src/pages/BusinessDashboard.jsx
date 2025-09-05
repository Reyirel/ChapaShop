import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
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
  const [user, setUser] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const navigate = useNavigate()

  const checkUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()

    // Permitir acceso a usuarios 'person', 'business' y 'admin'
    // Un usuario 'person' puede crear su primer negocio aquí
    if (!profile || !['person', 'business', 'admin'].includes(profile?.role)) {
      navigate('/negocios')
      return
    }

    setUser(profile)
  }, [navigate])

  const fetchBusinesses = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data, error } = await supabase
        .from('businesses')
        .select(`
          *,
          business_categories(name, color, icon),
          reviews(rating),
          products(id)
        `)
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setBusinesses(data || [])
    } catch (error) {
      console.error('Error fetching businesses:', error)
    } finally {
      setLoading(false)
    }
  }, [])

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
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    return (total / reviews.length).toFixed(1)
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
                <p className="text-gray-400 text-lg">Bienvenido, {user?.full_name}</p>
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
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/20">
                <Store className="text-blue-400" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Negocios</p>
                <p className="text-3xl font-bold text-white">{businesses.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/20">
                <CheckCircle className="text-green-400" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Aprobados</p>
                <p className="text-3xl font-bold text-white">
                  {businesses.filter(b => b.status === 'approved').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 border border-yellow-500/20">
                <Clock className="text-yellow-400" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Pendientes</p>
                <p className="text-3xl font-bold text-white">
                  {businesses.filter(b => b.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 rounded-2xl">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20">
                <Star className="text-[#3ecf8e]" size={24} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Rating Promedio</p>
                <p className="text-3xl font-bold text-white">
                  {businesses.length > 0 
                    ? (businesses.reduce((acc, b) => acc + parseFloat(calculateAverageRating(b.reviews)), 0) / businesses.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

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
                        {business.business_categories && (
                          <span 
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: business.business_categories.color || '#3ecf8e' }}
                          >
                            {business.business_categories.name}
                          </span>
                        )}
                        {getStatusBadge(business.status)}
                      </div>
                      
                      <p className="text-gray-300 mb-4 leading-relaxed">{business.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                        {business.address && (
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#3ecf8e]" />
                            <span>{business.address}</span>
                          </div>
                        )}
                        {business.phone && (
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-[#3ecf8e]" />
                            <span>{business.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-[#3ecf8e]" />
                          <span>{business.products?.length || 0} productos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Star size={14} className="text-[#3ecf8e]" />
                          <span>{calculateAverageRating(business.reviews)} ({business.reviews?.length || 0} reseñas)</span>
                        </div>
                      </div>
                      
                      {business.status === 'rejected' && business.admin_notes && (
                        <div className="mt-4 p-4 bg-red-900/20 border border-red-700/50 rounded-xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle size={16} className="text-red-400 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-red-300">Razón del rechazo:</p>
                              <p className="text-sm text-red-400">{business.admin_notes}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3 ml-6">
                      <button
                        onClick={() => navigate(`/business/${business.id}/edit`)}
                        className="p-3 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all duration-200 border border-gray-700/50 hover:border-blue-500/30"
                        title="Editar negocio"
                      >
                        <Edit size={18} />
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
    </div>
  )
}

const CreateBusinessModal = ({ onClose, onSuccess }) => {
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    whatsapp: ''
  })
  const [location, setLocation] = useState(null)
  const [businessHours, setBusinessHours] = useState(null)
  const [images, setImages] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('business_categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) {
        console.error('Error fetching categories:', error)
        throw error
      }
      
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      // Si hay error con las categorías, mostrar un mensaje al usuario
      if (error.message.includes('permission denied')) {
        console.warn('Permission denied for categories. Setting empty categories.')
        setCategories([])
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Solo procesar el envío si estamos en el último paso
    if (currentStep !== totalSteps) {
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No hay sesión activa')

      // Verificar el perfil del usuario antes de proceder
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('id, role, full_name, email')
        .eq('id', session.user.id)
        .single()

      if (!userProfile) {
        throw new Error('No se encontró el perfil del usuario. Por favor, contacta al administrador.')
      }

      // Preparar datos del negocio
      const businessData = {
        ...formData,
        owner_id: session.user.id,
        status: 'pending',
        latitude: location?.latitude || null,
        longitude: location?.longitude || null,
        business_hours: businessHours ? JSON.stringify(businessHours) : null
      }

      // Si hay ubicación, usar esa dirección
      if (location?.address) {
        businessData.address = location.address
      }

      // Insertar negocio
      const { data: business, error: businessError } = await supabase
        .from('businesses')
        .insert(businessData)
        .select()
        .single()

      if (businessError) {
        console.error('Error al insertar negocio:', businessError)
        throw businessError
      }

      // Subir imágenes si las hay
      if (images.length > 0) {
        await uploadBusinessImages(business.id, images)
      }

      // Agregar productos si los hay
      if (products.length > 0) {
        await addBusinessProducts(business.id, products)
      }

      // Mostrar mensaje de éxito con información sobre configuración
      
      onSuccess()
    } catch (error) {
      console.error('Error completo:', error)
      
      // Mejorar el mensaje de error para el usuario
      let errorMessage = error.message
      if (error.code === '42501') {
        errorMessage = 'Error de permisos: No tienes autorización para crear negocios. Por favor, verifica que tu cuenta esté configurada correctamente.'
      } else if (error.message.includes('permission denied')) {
        errorMessage = 'Error de permisos: Asegúrate de estar autenticado correctamente.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const uploadBusinessImages = async (businessId, imageFiles) => {
    for (let i = 0; i < imageFiles.length; i++) {
      const image = imageFiles[i]
      const fileName = `${businessId}_${i}_${Date.now()}.${image.file.name.split('.').pop()}`
      
      try {
        // Subir archivo a Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('business-images')
          .upload(fileName, image.file)

        if (uploadError) {
          if (uploadError.message.includes('Bucket not found')) {
            console.warn('⚠️ Bucket de storage no configurado. Las imágenes no se subirán.')
            console.warn('📋 Consulta STORAGE_SETUP.md para configurar el storage correctamente.')
            continue // Continuar sin fallar
          }
          throw uploadError
        }

        // Guardar referencia en la base de datos solo si la subida fue exitosa
        const { error: dbError } = await supabase
          .from('business_images')
          .insert({
            business_id: businessId,
            image_url: fileName,
            is_primary: i === 0,
            order_index: i
          })

        if (dbError) {
          // Manejar errores de permisos específicamente
          if (dbError.code === '42501' || 
              dbError.message.includes('permission denied') ||
              dbError.message.includes('403') ||
              dbError.details?.includes('policy')) {
            console.warn('⚠️ Error 403: Políticas RLS de business_images no configuradas.')
            console.warn('📋 Consulta SOLUCION_ERROR_403_PRODUCTOS.md para configurar las políticas.')
            console.warn('💡 El negocio se creó correctamente, solo fallan las imágenes.')
            continue // No fallar por esto
          }
          console.error('Error guardando referencia de imagen:', dbError)
          // No fallar por esto, la imagen ya se subió
        }
      } catch (error) {
        console.error('Error subiendo imagen:', error)
        // No fallar todo el proceso por una imagen
      }
    }
  }

  const addBusinessProducts = async (businessId, productNames) => {
    if (productNames.length === 0) return

    const productsData = productNames.map(name => ({
      business_id: businessId,
      name: name,
      description: '',
      price: 0,
      is_available: true
    }))

    try {
      const { error } = await supabase
        .from('products')
        .insert(productsData)

      if (error) {
        // Manejar errores de permisos (PostgreSQL y HTTP)
        if (error.code === '42501' || 
            error.message.includes('permission denied') ||
            error.message.includes('403') ||
            error.details?.includes('policy')) {
          console.warn('⚠️ Error 403: Políticas RLS de productos no configuradas.')
          console.warn('📋 Consulta SOLUCION_ERROR_403_PRODUCTOS.md para configurar las políticas.')
          console.warn('💡 El negocio se creó correctamente, solo fallan los productos.')
          return // No fallar por esto
        }
        throw error
      }

    } catch (error) {
      console.error('Error agregando productos:', error)
      // Manejar error 403 en el catch también
      if (error.message && (error.message.includes('403') || error.message.includes('Forbidden'))) {
        console.warn('⚠️ Error 403: Políticas RLS de productos no configuradas.')
        console.warn('📋 Consulta SOLUCION_ERROR_403_PRODUCTOS.md para configurar las políticas.')
        console.warn('💡 El negocio se creó correctamente, solo fallan los productos.')
      }
      // No fallar todo el proceso por los productos
    }
  }

  const nextStep = (e) => {
    if (e) {
      e.preventDefault() // Prevenir envío accidental del formulario
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = (e) => {
    if (e) {
      e.preventDefault() // Prevenir envío accidental del formulario
    }
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.category_id
      case 2:
        return true // Información de contacto es opcional
      case 3:
        return true // Ubicación es opcional
      case 4:
        return true // Horarios son opcionales
      case 5:
        return true // Permitir proceder siempre en el último paso
      default:
        return false
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                Nombre del Negocio *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                placeholder="Ingresa el nombre de tu negocio"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                Categoría *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                required
              >
                <option value="">Selecciona una categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} - {category.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-3">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                placeholder="Describe tu negocio..."
                rows={3}
              />
            </div>
          </div>
        )
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                  placeholder="Número de contacto"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Sitio Web
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                  placeholder="https://tusitio.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Facebook
                </label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={(e) => setFormData({...formData, facebook: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                  placeholder="@tu_negocio"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({...formData, instagram: e.target.value})}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
                  placeholder="@tu_negocio"
                />
              </div>
            </div>
          </div>
        )

      case 3:
        return <LocationPicker onLocationChange={setLocation} />

      case 4:
        return <BusinessHours onHoursChange={setBusinessHours} />

      case 5:
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-[#3ecf8e]/10 to-[#2fb577]/10 border border-[#3ecf8e]/20 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Image size={20} className="text-[#3ecf8e]" />
                Personaliza tu Negocio
              </h4>
              <p className="text-gray-300 text-sm">
                Agrega imágenes y productos para hacer tu negocio más atractivo. 
                Estas secciones son opcionales pero recomendadas.
              </p>
            </div>
            
            <ImageUploader onImagesChange={setImages} maxImages={3} />
            <ProductList onProductsChange={setProducts} />
            
            <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>¿Listo para continuar?</strong> Puedes agregar más imágenes y productos después de crear tu negocio.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Información Básica'
      case 2: return 'Información de Contacto'
      case 3: return 'Ubicación'
      case 4: return 'Horarios de Atención'
      case 5: return 'Imágenes y Productos'
      default: return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 border border-gray-700/50 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header con progreso */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-white">Crear Nuevo Negocio</h2>
              <div className="text-sm text-gray-400">
                Paso {currentStep} de {totalSteps}
              </div>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-800 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>

            <h3 className="text-xl font-semibold text-gray-300">{getStepTitle()}</h3>
          </div>
          
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {error && (
              <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4 mt-6">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Navegación */}
            <div className="flex gap-4 pt-8 mt-8 border-t border-gray-700/50">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors"
              >
                Cancelar
              </button>
              
              <div className="flex-1 flex gap-3">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      prevStep(e)
                    }}
                    className="px-6 py-3 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-800/50 transition-colors"
                  >
                    Anterior
                  </button>
                )}
                
                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      nextStep(e)
                    }}
                    disabled={!canProceedToNext()}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-xl hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-xl hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 disabled:opacity-50 font-semibold"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        Creando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <CheckCircle size={18} />
                        Crear Negocio
                      </div>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BusinessDashboard
