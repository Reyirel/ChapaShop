import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { FloatingParticles, GridPattern, GlowOrbs } from '../components/BackgroundEffects'
import { LogIn, UserPlus, Shield, ArrowLeft } from 'lucide-react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [adminLoading, setAdminLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()
  const { signIn } = useAuth()

  // Detectar si estamos en modo desarrollo
  const isDevelopment = import.meta.env.DEV

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const { data, error } = await signIn(email, password)
      
      if (error) throw error
      
      setMessage('¡Inicio de sesión exitoso!')
      
      // Obtener el perfil del usuario para redirigir según su rol
      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()

        // Redirigir según el rol del usuario
        setTimeout(() => {
          if (profile?.role === 'admin') {
            navigate('/admin-panel')
          } else if (profile?.role === 'business') {
            navigate('/business-dashboard')
          } else {
            navigate('/negocios')
          }
        }, 1500)
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createAdminUser = async () => {
    setAdminLoading(true)
    setError('')
    setMessage('')

    try {
      // Verificar si ya existe un admin
      const { data: existingAdmin } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'admin@chapashop.com')
        .single()

      if (existingAdmin) {
        setMessage('El usuario admin ya existe! Email: admin@chapashop.com, Password: Admin123!')
        return
      }

      // Crear el usuario en Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: 'admin@chapashop.com',
        password: 'Admin123!',
        options: {
          data: {
            full_name: 'Administrador',
            role: 'admin'
          }
        }
      })

      if (authError) {
        // Si el error es que el usuario ya existe, intentar crear solo el perfil
        if (authError.message.includes('already registered')) {
          const { data: { session } } = await supabase.auth.signInWithPassword({
            email: 'admin@chapashop.com',
            password: 'Admin123!'
          })
          
          if (session?.user) {
            // Crear/actualizar el perfil
            const { error: profileError } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                email: 'admin@chapashop.com',
                full_name: 'Administrador',
                role: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })

            if (profileError) {
              console.log('Error actualizando perfil admin:', profileError)
            }
            
            await supabase.auth.signOut() // Cerrar la sesión del admin
          }
        } else {
          throw authError
        }
      } else if (authData.user) {
        // Usuario creado exitosamente, crear el perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: authData.user.id,
            email: 'admin@chapashop.com',
            full_name: 'Administrador',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.log('Error creando perfil admin:', profileError)
        }
      }

      setMessage('Usuario admin configurado exitosamente! Email: admin@chapashop.com, Password: Admin123!')
    } catch (error) {
      setError(`Error configurando admin: ${error.message}`)
    } finally {
      setAdminLoading(false)
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

          {/* Login Card */}
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-8 rounded-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="mb-4 flex justify-center">
                <LogIn size={48} className="text-[#3ecf8e]" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Iniciar Sesión</h1>
              <p className="text-gray-400">Accede a tu cuenta en ChapaShop</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                  placeholder="tu@email.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-white text-sm font-semibold mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#3ecf8e] focus:ring-2 focus:ring-[#3ecf8e]/20 transition-all"
                  placeholder="••••••••"
                  required
                />
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
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Development Admin Button */}
            {isDevelopment && (
              <div className="mt-6 pt-6 border-t border-gray-700/50">
                <button
                  onClick={createAdminUser}
                  disabled={adminLoading}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Shield size={20} />
                  {adminLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Creando Admin...
                    </div>
                  ) : (
                    'Crear Usuario Admin (DEV)'
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Solo visible en modo desarrollo
                </p>
              </div>
            )}
            
            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-gray-400 mb-2">¿No tienes cuenta?</p>
              <Link 
                to="/register" 
                className="inline-flex items-center gap-2 text-[#3ecf8e] hover:text-white transition-colors font-semibold"
              >
                <UserPlus size={18} />
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
