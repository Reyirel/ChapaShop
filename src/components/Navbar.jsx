import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, Home, Store, LogIn, UserPlus, Shield, LogOut, Settings, User, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, profile, signOut, forceSignOut, isAdmin, isBusiness } = useAuth()
  const userMenuRef = useRef(null)

  // Cerrar menú de usuario al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Función para obtener las iniciales del nombre o email
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    } else if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const isActiveRoute = (path) => {
    return location.pathname === path
  }

  // Obtener elementos de navegación según el rol del usuario
  const getNavItems = () => {
    if (!user) {
      return [
        { path: '/login', label: 'Iniciar Sesión', icon: LogIn },
        { path: '/register', label: 'Registrarse', icon: UserPlus }
      ]
    }

    const baseItems = [
      { path: '/', label: 'Inicio', icon: Home },
      { path: '/negocios', label: 'Negocios', icon: Store }
    ]

    // Los enlaces específicos de rol se muestran en el menú desplegable del usuario
    // para mantener la barra de navegación limpia
    return baseItems
  }

  const navItems = getNavItems()

  const NavLink = ({ to, children, icon: IconComponent, mobile = false }) => {
    const isActive = isActiveRoute(to)
    const baseClasses = mobile 
      ? "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300"
      : "flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 relative"
    
    const activeClasses = isActive
      ? mobile
        ? "bg-[#3ecf8e] text-black"
        : "text-[#3ecf8e] bg-[#3ecf8e]/10"
      : mobile
        ? "text-white hover:bg-[#3ecf8e]/20 hover:text-[#3ecf8e]"
        : "text-white hover:text-[#3ecf8e] hover:bg-[#3ecf8e]/10"

    return (
      <Link 
        to={to} 
        className={`${baseClasses} ${activeClasses}`}
        onClick={() => mobile && setIsMenuOpen(false)}
      >
        {IconComponent && <IconComponent size={mobile ? 20 : 18} />}
        <span>{children}</span>
        {!mobile && isActive && (
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-[#3ecf8e] rounded-full"></div>
        )}
      </Link>
    )
  }

  return (
    <nav className="bg-black/95 backdrop-blur-md text-white border-b border-gray-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2 text-2xl font-bold text-white hover:text-[#3ecf8e] transition-all duration-300 group"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#3ecf8e] to-[#2ebd7e] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <Store size={18} className="text-black" />
            </div>
            <span className="bg-gradient-to-r from-white to-[#3ecf8e] bg-clip-text text-transparent">
              ChapaShop
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 bg-gray-800/30 rounded-xl border border-gray-700/50 hover:bg-gray-700/30 transition-all duration-300 group"
                >
                  {/* Avatar with initials */}
                  <div className="w-8 h-8 bg-gradient-to-br from-[#3ecf8e] to-[#2ebd7e] rounded-full flex items-center justify-center text-black text-sm font-bold">
                    {getInitials()}
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm text-white font-medium">
                      {profile?.full_name || 'Usuario'}
                    </span>
                    {profile?.role && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        profile.role === 'admin' 
                          ? 'bg-red-500/20 text-red-400' 
                          : profile.role === 'business'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {profile.role === 'admin' ? 'Admin' : profile.role === 'business' ? 'Negocio' : 'Usuario'}
                      </span>
                    )}
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform duration-200 ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-700/50">
                      <p className="text-sm text-gray-400">Conectado como</p>
                      <p className="text-sm text-white font-medium truncate">{user.email}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-700/50 transition-colors"
                    >
                      <User size={16} className="text-[#3ecf8e]" />
                      <span>Mi Perfil</span>
                    </Link>

                    {isAdmin() && (
                      <Link
                        to="/admin-panel"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-700/50 transition-colors"
                      >
                        <Shield size={16} className="text-red-400" />
                        <span>Panel Admin</span>
                      </Link>
                    )}

                    {isBusiness() && (
                      <Link
                        to="/business-dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-white hover:bg-gray-700/50 transition-colors"
                      >
                        <Settings size={16} className="text-blue-400" />
                        <span>Mi Dashboard</span>
                      </Link>
                    )}

                    <div className="border-t border-gray-700/50 mt-2 pt-2">
                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false)
                          
                          // Mostrar indicador de carga (opcional)
                          const button = event.target.closest('button')
                          const originalText = button.textContent
                          button.textContent = 'Cerrando sesión...'
                          button.disabled = true
                          
                          try {
                            // Timeout para el logout
                            const logoutTimeout = setTimeout(() => {
                              forceSignOut()
                            }, 3000)
                            
                            await signOut()
                            clearTimeout(logoutTimeout)
                          } catch (error) {
                            console.error('Error during logout, forcing logout:', error)
                            forceSignOut()
                          } finally {
                            // Restaurar botón (aunque probablemente la página se recargará)
                            button.textContent = originalText
                            button.disabled = false
                          }
                        }}
                        className="flex items-center gap-3 px-4 py-2 text-white hover:bg-red-500/20 hover:text-red-400 transition-colors w-full"
                      >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                      </button>
                      
                      {/* Botón de logout forzado */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false)
                          if (confirm('¿Estás seguro de que quieres forzar el cierre de sesión? Esto cerrará tu sesión inmediatamente.')) {
                            forceSignOut()
                          }
                        }}
                        className="flex items-center gap-3 px-4 py-1 text-xs text-gray-500 hover:text-gray-400 transition-colors w-full mt-1"
                        title="Forzar cierre de sesión si hay problemas"
                      >
                        <span>¿Problemas? Forzar salida</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-white hover:text-[#3ecf8e] hover:bg-[#3ecf8e]/10 transition-all duration-300"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen 
            ? 'max-h-96 opacity-100 pb-4' 
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="space-y-2 pt-4 border-t border-gray-800/50">
            {navItems.map((item) => (
              <NavLink key={item.path} to={item.path} icon={item.icon} mobile>
                {item.label}
              </NavLink>
            ))}
            
            {user && (
              <>
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-800/30 rounded-xl border border-gray-700/50 mx-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3ecf8e] to-[#2ebd7e] rounded-full flex items-center justify-center text-black text-sm font-bold">
                    {getInitials()}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm">
                      {profile?.full_name || 'Usuario'}
                    </p>
                    <p className="text-gray-400 text-xs truncate">{user.email}</p>
                    {profile?.role && (
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${
                        profile.role === 'admin' 
                          ? 'bg-red-500/20 text-red-400' 
                          : profile.role === 'business'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {profile.role === 'admin' ? 'Admin' : profile.role === 'business' ? 'Negocio' : 'Usuario'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-white hover:bg-[#3ecf8e]/20 hover:text-[#3ecf8e]"
                >
                  <User size={20} />
                  <span>Mi Perfil</span>
                </Link>

                {/* Admin Panel Link for Mobile */}
                {isAdmin() && (
                  <Link
                    to="/admin-panel"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-white hover:bg-red-400/20 hover:text-red-400"
                  >
                    <Shield size={20} />
                    <span>Panel Admin</span>
                  </Link>
                )}

                {/* Business Dashboard Link for Mobile */}
                {isBusiness() && (
                  <Link
                    to="/business-dashboard"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 text-white hover:bg-blue-400/20 hover:text-blue-400"
                  >
                    <Settings size={20} />
                    <span>Mi Dashboard</span>
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 w-full text-white hover:bg-red-400/20 hover:text-red-400"
                >
                  <LogOut size={20} />
                  <span>Cerrar Sesión</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3ecf8e]/30 to-transparent"></div>
    </nav>
  )
}

export default Navbar
