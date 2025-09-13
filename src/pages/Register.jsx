import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'
import dbService from '../services/database'
import { FloatingParticles, GridPattern, GlowOrbs } from '../components/BackgroundEffects'
import { UserPlus, LogIn, ArrowLeft, Mail, Lock, CheckCircle, User, Store, Building, MapPin, Phone, Clock, FileText, Tag } from 'lucide-react'

const Register = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [userType, setUserType] = useState('person') // 'person' o 'business'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  // Business-specific fields
  const [businessName, setBusinessName] = useState('')
  const [businessCategory, setBusinessCategory] = useState('')
  const [businessDescription, setBusinessDescription] = useState('')
  const [businessAddress, setBusinessAddress] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [businessHours, setBusinessHours] = useState('')
  const [categories, setCategories] = useState([])

  // Load categories when user type is business
  useEffect(() => {
    if (userType === 'business') {
      loadCategories()
    }
  }, [userType])

  const loadCategories = async () => {
    try {
      const cats = await dbService.getBusinessCategories()
      setCategories(cats)
    } catch (error) {
      console.error('Error loading categories:', error)
      // Fallback categories
      setCategories([
        { id: 'restaurante', name: 'Restaurante', color: '#FF6B6B' },
        { id: 'cafe', name: 'Café', color: '#4ECDC4' },
        { id: 'tienda', name: 'Tienda', color: '#45B7D1' },
        { id: 'servicio', name: 'Servicio', color: '#96CEB4' },
        { id: 'entretenimiento', name: 'Entretenimiento', color: '#FFEAA7' },
        { id: 'salud', name: 'Salud y Belleza', color: '#DDA0DD' },
        { id: 'educacion', name: 'Educación', color: '#98D8C8' },
        { id: 'transporte', name: 'Transporte', color: '#F7DC6F' }
      ])
    }
  }

  // Get dynamic content based on selected category
  const getCategoryContent = (category) => {
    const content = {
      restaurante: {
        descriptionPlaceholder: 'Describe tu restaurante, especialidades, ambiente, capacidad...',
        descriptionHelp: 'Menciona el tipo de cocina, platos destacados, ambiente y servicios especiales',
        addressPlaceholder: 'Dirección completa del restaurante',
        phonePlaceholder: 'Teléfono de contacto del restaurante',
        hoursPlaceholder: 'Ej: Lunes-Viernes 12:00-23:00, Sábado-Domingo 11:00-24:00'
      },
      cafe: {
        descriptionPlaceholder: 'Describe tu café, especialidades, ambiente, menú...',
        descriptionHelp: 'Menciona bebidas destacadas, ambiente, wifi, eventos especiales',
        addressPlaceholder: 'Dirección completa del café',
        phonePlaceholder: 'Teléfono de contacto del café',
        hoursPlaceholder: 'Ej: Lunes-Viernes 7:00-20:00, Sábado-Domingo 8:00-18:00'
      },
      tienda: {
        descriptionPlaceholder: 'Describe tu tienda, productos, servicios, especialidades...',
        descriptionHelp: 'Menciona productos principales, marcas, servicios adicionales',
        addressPlaceholder: 'Dirección completa de la tienda',
        phonePlaceholder: 'Teléfono de contacto de la tienda',
        hoursPlaceholder: 'Ej: Lunes-Sábado 9:00-19:00, Domingo 10:00-16:00'
      },
      servicio: {
        descriptionPlaceholder: 'Describe tus servicios, especialidades, experiencia...',
        descriptionHelp: 'Menciona servicios específicos, experiencia, certificaciones, cobertura',
        addressPlaceholder: 'Dirección de tu oficina/local',
        phonePlaceholder: 'Teléfono de contacto principal',
        hoursPlaceholder: 'Ej: Lunes-Viernes 8:00-18:00, Sábado 9:00-14:00'
      },
      entretenimiento: {
        descriptionPlaceholder: 'Describe tu negocio de entretenimiento, actividades, servicios...',
        descriptionHelp: 'Menciona actividades principales, edades objetivo, instalaciones especiales',
        addressPlaceholder: 'Dirección completa del local',
        phonePlaceholder: 'Teléfono de contacto',
        hoursPlaceholder: 'Ej: Lunes-Domingo 10:00-22:00 (según actividad)'
      },
      salud: {
        descriptionPlaceholder: 'Describe tus servicios de salud y belleza, especialidades...',
        descriptionHelp: 'Menciona servicios específicos, especialidades, experiencia, certificaciones',
        addressPlaceholder: 'Dirección completa del centro',
        phonePlaceholder: 'Teléfono de contacto',
        hoursPlaceholder: 'Ej: Lunes-Viernes 9:00-19:00, Sábado 8:00-16:00'
      },
      educacion: {
        descriptionPlaceholder: 'Describe tu institución educativa, programas, metodología...',
        descriptionHelp: 'Menciona niveles educativos, especialidades, metodologías, instalaciones',
        addressPlaceholder: 'Dirección completa de la institución',
        phonePlaceholder: 'Teléfono de contacto',
        hoursPlaceholder: 'Ej: Lunes-Viernes 7:00-18:00 (según nivel educativo)'
      },
      transporte: {
        descriptionPlaceholder: 'Describe tus servicios de transporte, cobertura, flota...',
        descriptionHelp: 'Menciona tipo de transporte, zonas de cobertura, servicios adicionales',
        addressPlaceholder: 'Dirección de tu base/oficina principal',
        phonePlaceholder: 'Teléfono de contacto 24/7',
        hoursPlaceholder: 'Ej: Lunes-Domingo 24 horas (servicio continuo)'
      }
    }

    return content[category] || {
      descriptionPlaceholder: 'Describe tu negocio, servicios, especialidades...',
      descriptionHelp: 'Proporciona información detallada sobre tu negocio para que los clientes sepan qué esperar',
      addressPlaceholder: 'Dirección completa del negocio',
      phonePlaceholder: 'Teléfono de contacto',
      hoursPlaceholder: 'Horario de atención (ej: Lunes-Viernes 9:00-18:00)'
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    if (!fullName.trim()) {
      setError('El nombre completo es requerido')
      setLoading(false)
      return
    }

    // Business-specific validations
    if (userType === 'business') {
      if (!businessName.trim()) {
        setError('El nombre del negocio es requerido')
        setLoading(false)
        return
      }
      if (!businessCategory) {
        setError('Debes seleccionar una categoría para tu negocio')
        setLoading(false)
        return
      }
      if (!businessDescription.trim()) {
        setError('La descripción del negocio es requerida')
        setLoading(false)
        return
      }
      if (!businessAddress.trim()) {
        setError('La dirección del negocio es requerida')
        setLoading(false)
        return
      }
      if (!businessPhone.trim()) {
        setError('El teléfono del negocio es requerido')
        setLoading(false)
        return
      }
    }

    try {
      // Registrar usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      
      if (userCredential.user) {
        // Crear perfil de usuario en Firebase
        await dbService.createUserProfile(userCredential.user.uid, {
          email: email,
          full_name: fullName,
          role: userType,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

        // Create business if user type is business
        if (userType === 'business') {
          await dbService.createBusiness({
            ownerId: userCredential.user.uid,
            name: businessName,
            category: businessCategory,
            description: businessDescription,
            address: businessAddress,
            phone: businessPhone,
            businessHours: businessHours,
            contactName: fullName,
            contactEmail: email
          })
        }
      }
      
      setMessage(userType === 'business' 
        ? '¡Registro exitoso! Tu negocio está pendiente de aprobación. Te notificaremos cuando sea aprobado.' 
        : '¡Registro exitoso! Ahora puedes iniciar sesión.'
      )
      
      // Redirigir al login después de un breve delay
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const HeroBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <GridPattern />
      <GlowOrbs />
      <FloatingParticles />
    </div>
  )

  const PasswordStrength = ({ password }) => {
    const getStrength = () => {
      if (password.length < 6) return { level: 0, text: 'Muy débil', color: 'bg-red-500' }
      if (password.length < 8) return { level: 1, text: 'Débil', color: 'bg-orange-500' }
      if (password.length < 12) return { level: 2, text: 'Buena', color: 'bg-yellow-500' }
      return { level: 3, text: 'Fuerte', color: 'bg-green-500' }
    }

    const strength = getStrength()

    return (
      <div className="mt-2">
        <div className="flex gap-1 mb-1">
          {[0, 1, 2, 3].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded ${
                level <= strength.level ? strength.color : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400">Seguridad: {strength.text}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <HeroBackground />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-[#3ecf8e] hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Volver al inicio</span>
          </Link>

          {/* Register Card */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-8 rounded-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                <UserPlus size={48} className="text-[#3ecf8e]" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Crear Cuenta</h1>
              <p className="text-gray-400">Únete a la comunidad ChapaShop</p>
            </div>

            {/* Register Form */}
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Tipo de Usuario */}
              <div>
                <label className="block text-white text-sm font-semibold mb-4">
                  Tipo de Cuenta
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setUserType('person')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userType === 'person'
                        ? 'border-[#3ecf8e] bg-[#3ecf8e]/10'
                        : 'border-gray-600 bg-gray-900/30'
                    }`}
                  >
                    <User size={32} className={`mx-auto mb-2 ${userType === 'person' ? 'text-[#3ecf8e]' : 'text-gray-400'}`} />
                    <p className="text-sm font-medium">Persona</p>
                    <p className="text-xs text-gray-400">Cliente/Usuario</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('business')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      userType === 'business'
                        ? 'border-[#3ecf8e] bg-[#3ecf8e]/10'
                        : 'border-gray-600 bg-gray-900/30'
                    }`}
                  >
                    <Store size={32} className={`mx-auto mb-2 ${userType === 'business' ? 'text-[#3ecf8e]' : 'text-gray-400'}`} />
                    <p className="text-sm font-medium">Negocio</p>
                    <p className="text-xs text-gray-400">Vendedor/Empresa</p>
                  </button>
                </div>
              </div>

              {/* Nombre Completo */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <User size={16} />
                  {userType === 'business' ? 'Nombre del Responsable' : 'Nombre Completo'}
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                  placeholder={userType === 'business' ? 'Nombre del responsable' : 'Tu nombre completo'}
                  required
                />
              </div>

              {/* Business-specific fields */}
              {userType === 'business' && (
                <>
                  {/* Business Name */}
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <Building size={16} />
                      Nombre del Negocio
                    </label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                      placeholder="Nombre oficial de tu negocio"
                      required
                    />
                  </div>

                  {/* Business Category */}
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <Tag size={16} />
                      Categoría del Negocio
                    </label>
                    <select
                      value={businessCategory}
                      onChange={(e) => setBusinessCategory(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Business Description */}
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <FileText size={16} />
                      Descripción del Negocio
                    </label>
                    <textarea
                      value={businessDescription}
                      onChange={(e) => setBusinessDescription(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all resize-none"
                      placeholder={businessCategory ? getCategoryContent(businessCategory.toLowerCase().replace(/\s+/g, '')).descriptionPlaceholder : 'Describe tu negocio, servicios, especialidades...'}
                      rows="3"
                      required
                    />
                    {businessCategory && (
                      <p className="text-xs text-gray-400 mt-1">
                        💡 {getCategoryContent(businessCategory.toLowerCase().replace(/\s+/g, '')).descriptionHelp}
                      </p>
                    )}
                  </div>

                  {/* Business Address */}
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <MapPin size={16} />
                      Dirección del Negocio
                    </label>
                    <input
                      type="text"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                      placeholder={businessCategory ? getCategoryContent(businessCategory.toLowerCase().replace(/\s+/g, '')).addressPlaceholder : 'Dirección completa del negocio'}
                      required
                    />
                  </div>

                  {/* Business Phone */}
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <Phone size={16} />
                      Teléfono del Negocio
                    </label>
                    <input
                      type="tel"
                      value={businessPhone}
                      onChange={(e) => setBusinessPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                      placeholder={businessCategory ? getCategoryContent(businessCategory.toLowerCase().replace(/\s+/g, '')).phonePlaceholder : 'Teléfono de contacto'}
                      required
                    />
                  </div>

                  {/* Business Hours */}
                  <div>
                    <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                      <Clock size={16} />
                      Horario de Atención
                    </label>
                    <input
                      type="text"
                      value={businessHours}
                      onChange={(e) => setBusinessHours(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                      placeholder={businessCategory ? getCategoryContent(businessCategory.toLowerCase().replace(/\s+/g, '')).hoursPlaceholder : 'Horario de atención (ej: Lunes-Viernes 9:00-18:00)'}
                    />
                  </div>
                </>
              )}
              
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 text-red-400 p-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-900/30 border border-green-500/50 text-green-400 p-3 rounded-xl text-sm">
                  {message}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#3ecf8e] text-black py-3 px-4 rounded-xl font-semibold hover:bg-[#2eb57a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    Registrando...
                  </div>
                ) : (
                  userType === 'business' ? 'Registrar Negocio' : 'Crear Cuenta'
                )}
              </button>
            </form>
            
            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 mb-2">¿Ya tienes cuenta?</p>
              <Link 
                to="/login" 
                className="inline-flex items-center gap-2 text-[#3ecf8e] hover:text-white transition-colors font-semibold"
              >
                <LogIn size={18} />
                Iniciar sesión
              </Link>
            </div>

            {/* Terms */}
            <div className="mt-6 pt-6 border-t border-gray-700/50">
              <p className="text-xs text-gray-500 text-center">
                Al crear una cuenta, aceptas nuestros{' '}
                <span className="text-[#3ecf8e] cursor-pointer hover:underline">
                  Términos de Servicio
                </span>{' '}
                y{' '}
                <span className="text-[#3ecf8e] cursor-pointer hover:underline">
                  Política de Privacidad
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
