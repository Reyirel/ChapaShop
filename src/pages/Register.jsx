import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../services/firebase'
import dbService from '../services/database'
import { FloatingParticles, GridPattern, GlowOrbs } from '../components/BackgroundEffects'
import { UserPlus, LogIn, ArrowLeft, Mail, Lock, CheckCircle, User, Store } from 'lucide-react'

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
            name: fullName, // Usar el nombre completo como nombre del negocio
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

              {/* Email */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <Mail size={16} />
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                  placeholder="tu@ejemplo.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <Lock size={16} />
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <PasswordStrength password={password} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                  placeholder="Repite la contraseña"
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-400 text-xs mt-1">Las contraseñas no coinciden</p>
                )}
              </div>


              
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
