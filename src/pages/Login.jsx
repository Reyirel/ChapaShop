import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FloatingParticles, GridPattern, GlowOrbs } from '../components/BackgroundEffects'
import { LogIn, UserPlus, Shield, ArrowLeft, User, Store, Crown } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [firebaseStatus, setFirebaseStatus] = useState('checking') // checking, working, mock
  const navigate = useNavigate()
  const { signin, createBasicDemoData, createMockData, createDemoUsers, initializeCompleteDatabase } = useAuth()

  // Verificar el estado de Firebase al cargar
  useEffect(() => {
    const checkFirebaseStatus = async () => {
      // Simulamos una verificación rápida
      setTimeout(() => {
        // Por ahora asumimos que está en modo mock debido a los errores de permisos
        setFirebaseStatus('mock')
      }, 1000)
    }
    
    checkFirebaseStatus()
  }, [])

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

  // Función para inicializar la base de datos completa
  const handleInitializeDatabase = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await initializeCompleteDatabase()
      if (result.success) {
        setMessage(result.message)
      } else {
        setError(`⚠️ ${result.message}`)
      }
    } catch (error) {
      console.error('Error initializing database:', error)
      setError('Error al inicializar la base de datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDemoData = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await createBasicDemoData()
      if (result.success) {
        setMessage('✅ Datos de prueba creados exitosamente en Firebase')
      } else {
        setError(`⚠️ ${result.message}`)
      }
    } catch (error) {
      console.error('Error creating demo data:', error)
      setError('Error al crear datos de prueba')
    } finally {
      setLoading(false)
    }
  }

  const handleUseMockData = () => {
    const mockData = createMockData()
    setMessage(`✅ Usando ${mockData.length} negocios de ejemplo (datos mock)`)
    console.log('📦 Datos mock creados:', mockData)
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

  const handleResetFirebaseStatus = async () => {
    setFirebaseStatus('checking')
    setError('')
    setMessage('')

    try {
      // Intentar una operación simple para verificar permisos
      const { createBasicDemoData } = useAuth()
      const result = await createBasicDemoData()
      
      if (result.success) {
        setFirebaseStatus('working')
        setMessage('🔥 ¡Firebase configurado correctamente!')
      } else {
        setFirebaseStatus('mock')
        setError('⚠️ Aún hay problemas de permisos')
      }
    } catch (error) {
      setFirebaseStatus('mock')
      setError('⚠️ Error al verificar Firebase')
    }
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

          {/* Botones de Desarrollo - Solo visible en modo desarrollo */}
          {import.meta.env.DEV && (
            <div className="space-y-4 p-4 rounded-xl bg-gray-900/50 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-center text-yellow-400">
                � Herramientas de Desarrollo
              </h3>
              <p className="text-xs text-gray-400 text-center">
                Solo visible en modo desarrollo
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                {/* Crear datos en Firebase */}
                <button
                  onClick={handleInitializeDatabase}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-[#3ecf8e]/20 to-[#3ecf8e]/10 border border-[#3ecf8e]/30 text-[#3ecf8e] hover:from-[#3ecf8e]/30 hover:to-[#3ecf8e]/20 hover:border-[#3ecf8e]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#3ecf8e]"></div>
                  ) : (
                    <Shield size={20} />
                  )}
                  <span className="font-medium">Crear Datos en Firebase</span>
                </button>

                {/* Usar datos mock */}
                <button
                  onClick={handleUseMockData}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600/20 to-orange-500/20 border border-orange-500/30 text-orange-300 hover:from-orange-600/30 hover:to-orange-500/30 hover:border-orange-400/50 hover:text-orange-200 transition-all duration-200"
                >
                  <Store size={20} />
                  <span className="font-medium">Usar Datos Mock</span>
                </button>
              </div>

              <div className="text-xs text-gray-500 space-y-1">
                <p>• <strong>Crear Datos en Firebase:</strong> Crea usuarios y negocios reales en Firebase (sin auto-login)</p>
                <p>• <strong>Usar Datos Mock:</strong> Usa datos temporales locales para desarrollo</p>
                <p>• Para iniciar sesión usa: admin@chapashop.com/admin123</p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-black text-gray-400">Iniciar sesión con tu cuenta</span>
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
          </form>            {/* Botones para desarrollo - Solo en desarrollo */}
            {!import.meta.env.PROD && (
              <div className="pt-4 border-t border-gray-700 space-y-2">
                <h4 className="text-sm font-medium text-gray-400 text-center">🔧 Herramientas de Desarrollo</h4>
                
                {/* Botón para crear datos de prueba */}
                <button
                  onClick={handleCreateDemoData}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600/20 to-purple-500/20 border border-purple-500/30 text-purple-300 hover:from-purple-600/30 hover:to-purple-500/30 hover:border-purple-400/50 hover:text-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300"></div>
                  ) : (
                    <span>🗂️</span>
                  )}
                  <span className="font-medium">Crear Datos en Firebase</span>
                </button>

                {/* Botón para usar datos mock */}
                <button
                  onClick={handleUseMockData}
                  className="w-full flex items-center justify-center gap-3 px-6 py-2 rounded-xl bg-gradient-to-r from-orange-600/20 to-orange-500/20 border border-orange-500/30 text-orange-300 hover:from-orange-600/30 hover:to-orange-500/30 hover:border-orange-400/50 hover:text-orange-200 transition-all duration-200 text-sm"
                >
                  <span>📦</span>
                  <span className="font-medium">Usar Datos Mock</span>
                </button>

                {/* Botón para verificar Firebase después de configurar reglas */}
                {firebaseStatus === 'mock' && (
                  <button
                    onClick={handleResetFirebaseStatus}
                    className="w-full flex items-center justify-center gap-3 px-6 py-2 rounded-xl bg-gradient-to-r from-green-600/20 to-green-500/20 border border-green-500/30 text-green-300 hover:from-green-600/30 hover:to-green-500/30 hover:border-green-400/50 hover:text-green-200 transition-all duration-200 text-sm"
                  >
                    <span>🔄</span>
                    <span className="font-medium">Verificar Firebase</span>
                  </button>
                )}

                {/* Información de configuración Firebase */}
                <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-xs text-blue-300 text-center">
                    💡 Si hay errores de permisos, configura las reglas de Firestore en modo test
                  </p>
                </div>
              </div>
            )}

            {/* Estado de Firebase */}
            <div className="p-3 rounded-lg border" style={{
              backgroundColor: firebaseStatus === 'working' ? 'rgb(34 197 94 / 0.1)' : 
                              firebaseStatus === 'mock' ? 'rgb(234 179 8 / 0.1)' : 'rgb(59 130 246 / 0.1)',
              borderColor: firebaseStatus === 'working' ? 'rgb(34 197 94 / 0.2)' : 
                          firebaseStatus === 'mock' ? 'rgb(234 179 8 / 0.2)' : 'rgb(59 130 246 / 0.2)'
            }}>
              <div className="flex items-center justify-center gap-2 text-sm">
                {firebaseStatus === 'checking' && (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                    <span className="text-blue-300">Verificando Firebase...</span>
                  </>
                )}
                {firebaseStatus === 'working' && (
                  <>
                    <span className="text-green-400">🔥</span>
                    <span className="text-green-300">Firebase Conectado</span>
                  </>
                )}
                {firebaseStatus === 'mock' && (
                  <>
                    <span className="text-yellow-400">📦</span>
                    <span className="text-yellow-300">Usando Datos Mock</span>
                    <span className="text-xs text-yellow-400 ml-2">(Configura las reglas de Firestore)</span>
                  </>
                )}
              </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Login
