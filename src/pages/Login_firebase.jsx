import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext_firebase'
import { FloatingParticles, GridPattern, GlowOrbs } from '../components/BackgroundEffects'
import { LogIn, UserPlus, Shield, ArrowLeft, User, Store, Crown } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { signin, demoLogin } = useAuth()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await signin(email, password)
      setMessage('¡Inicio de sesión exitoso!')
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        navigate('/negocios')
      }, 1000)
    } catch (error) {
      console.error('Login error:', error)
      setError(getErrorMessage(error.code || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async (userType) => {
    setDemoLoading(userType)
    setError('')
    setMessage('')

    try {
      await demoLogin(userType)
      setMessage(`¡Conectado como ${getDemoUserName(userType)}!`)
      
      // Redirigir según el tipo de usuario
      setTimeout(() => {
        if (userType === 'admin') {
          navigate('/admin-panel')
        } else if (userType === 'business') {
          navigate('/business-dashboard')
        } else {
          navigate('/negocios')
        }
      }, 1000)
    } catch (error) {
      console.error('Demo login error:', error)
      setError('Error al conectar con usuario demo')
    } finally {
      setDemoLoading('')
    }
  }

  const getDemoUserName = (userType) => {
    const names = {
      admin: 'Administrador',
      business: 'Dueño de Negocio',
      client: 'Cliente'
    }
    return names[userType] || 'Usuario'
  }

  const getErrorMessage = (errorCode) => {
    const errorMessages = {
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-email': 'Email inválido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
    }
    return errorMessages[errorCode] || 'Error al iniciar sesión. Verifica tus credenciales.'
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <GridPattern />
        <FloatingParticles />
        <GlowOrbs />
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
        >
          <ArrowLeft size={20} />
          Volver al Inicio
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#3ecf8e]/20 to-[#3ecf8e]/5 border border-[#3ecf8e]/20 mb-6">
              <LogIn className="h-6 w-6 text-[#3ecf8e]" />
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Iniciar Sesión
            </h2>
            <p className="mt-2 text-gray-400">
              Accede a tu cuenta de ChapaShop
            </p>
          </div>

          {/* Demo Login Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-gray-300">
              🚀 Acceso Rápido Demo
            </h3>
            
            <div className="grid grid-cols-1 gap-3">
              {/* Admin Demo */}
              <button
                onClick={() => handleDemoLogin('admin')}
                disabled={demoLoading === 'admin'}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-red-600/20 to-red-500/20 border border-red-500/30 text-red-300 hover:from-red-600/30 hover:to-red-500/30 hover:border-red-400/50 hover:text-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demoLoading === 'admin' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-300"></div>
                ) : (
                  <Crown size={20} />
                )}
                <span className="font-medium">Administrador</span>
                <span className="text-xs opacity-70">(Gestiona todo)</span>
              </button>

              {/* Business Demo */}
              <button
                onClick={() => handleDemoLogin('business')}
                disabled={demoLoading === 'business'}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-blue-500/20 border border-blue-500/30 text-blue-300 hover:from-blue-600/30 hover:to-blue-500/30 hover:border-blue-400/50 hover:text-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demoLoading === 'business' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-300"></div>
                ) : (
                  <Store size={20} />
                )}
                <span className="font-medium">Dueño de Negocio</span>
                <span className="text-xs opacity-70">(Gestiona negocio)</span>
              </button>

              {/* Client Demo */}
              <button
                onClick={() => handleDemoLogin('client')}
                disabled={demoLoading === 'client'}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 text-green-300 hover:from-green-600/30 hover:to-green-500/30 hover:border-green-400/50 hover:text-green-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {demoLoading === 'client' ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-300"></div>
                ) : (
                  <User size={20} />
                )}
                <span className="font-medium">Cliente</span>
                <span className="text-xs opacity-70">(Explora negocios)</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">O inicia sesión con tu cuenta</span>
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:border-transparent transition-all duration-200"
                  placeholder="tu@email.com"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-800/50 backdrop-blur-sm text-white rounded-xl placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:border-transparent transition-all duration-200"
                  placeholder="Tu contraseña"
                />
              </div>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                <p className="text-green-400 text-sm text-center">{message}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-black bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] hover:from-[#35d499] hover:to-[#28a866] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3ecf8e] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              <p className="text-gray-400">
                ¿No tienes una cuenta?{' '}
                <Link
                  to="/register"
                  className="font-medium text-[#3ecf8e] hover:text-[#35d499] transition-colors duration-200"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
