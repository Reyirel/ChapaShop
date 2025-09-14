import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, Home, Store, LogIn, UserPlus, Shield, LogOut, Settings, User, ChevronDown, Heart, BarChart3 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const { user, userProfile, logout, isAdmin, isBusiness, loading } = useAuth()
  const userMenuRef = useRef(null)

  // Cerrar menú móvil al hacer clic en overlay
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

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

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])

  // Función para obtener las iniciales del nombre o email
  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
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

  // Si está cargando, mostrar un estado de carga mínimo
  if (loading) {
    return (
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md text-white border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3ecf8e] to-[#2ebd7e] rounded-lg flex items-center justify-center shadow-lg">
                <Store className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-[#3ecf8e] bg-clip-text text-transparent">ChapaShop</span>
            </Link>
            
            {/* Loading indicator */}
            <div className="flex items-center space-x-2">
              <div className="animate-pulse bg-gray-700 h-8 w-24 rounded-lg"></div>
            </div>
          </div>
        </div>
      </nav>
    )
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
      { path: '/negocios', label: 'Negocios', icon: Store },
      { path: '/favorites', label: 'Mis Favoritos', icon: Heart }
    ]

    return baseItems
  }

  const navItems = getNavItems()

  // Componente de enlace de navegación
  const NavLink = ({ to, children, icon: IconComponent, mobile = false }) => {
    const isActive = isActiveRoute(to)
    
    if (mobile) {
      return (
        <Link 
          to={to} 
          className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 ${
            isActive 
              ? 'bg-gradient-to-r from-[#3ecf8e] to-[#2ebd7e] text-black shadow-lg transform scale-[0.98]' 
              : 'text-white hover:bg-gray-800/50 active:bg-gray-700/50 hover:transform hover:scale-[0.98]'
          }`}
          onClick={() => setIsMenuOpen(false)}
        >
          <IconComponent size={22} className={isActive ? 'text-black' : 'text-[#3ecf8e]'} />
          <span className="text-base">{children}</span>
        </Link>
      )
    }

    return (
      <Link 
        to={to} 
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
          isActive 
            ? 'bg-[#3ecf8e] text-black shadow-md' 
            : 'text-white hover:bg-gray-800/50 hover:text-[#3ecf8e]'
        }`}
      >
        <IconComponent size={18} className={isActive ? 'text-black' : 'text-[#3ecf8e]'} />
        <span className="hidden lg:block">{children}</span>
      </Link>
    )
  }

  // Componente de avatar del usuario
  const UserAvatar = ({ size = 'md', showName = false }) => {
    const sizeClasses = {
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base'
    }

    return (
      <div className="flex items-center gap-3">
        <div className={`${sizeClasses[size]} bg-gradient-to-br from-[#3ecf8e] to-[#2ebd7e] rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
          {getInitials()}
        </div>
        {showName && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white">
              {userProfile?.full_name || user?.email?.split('@')[0] || 'Usuario'}
            </span>
            <span className="text-xs text-gray-300">
              {isAdmin() ? 'Administrador' : isBusiness() ? 'Negocio' : 'Cliente'}
            </span>
          </div>
        )}
      </div>
    )
  }

  // Obtener opciones del menú de usuario
  const getUserMenuOptions = () => {
    const options = [
      { path: '/profile', label: 'Mi Perfil', icon: User }
    ]

    if (isAdmin()) {
      options.push(
        { path: '/admin-panel', label: 'Panel Admin', icon: Shield }
      )
    }

    if (isBusiness()) {
      options.push(
        { path: '/business-dashboard', label: 'Mi Dashboard', icon: BarChart3 }
      )
    }

    return options
  }

  const userMenuOptions = getUserMenuOptions()

  return (
    <>
      <nav className="sticky top-0 z-50 bg-black/95 backdrop-blur-md text-white border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-gradient-to-br from-[#3ecf8e] to-[#2ebd7e] rounded-lg flex items-center justify-center shadow-lg">
                <Store className="h-5 w-5 text-black" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-[#3ecf8e] bg-clip-text text-transparent">
                ChapaShop
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  icon={item.icon}
                >
                  {item.label}
                </NavLink>
              ))}
            </div>

            {/* User Menu - Desktop */}
            {user ? (
              <div className="hidden md:block relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:ring-offset-2 focus:ring-offset-black"
                >
                  <UserAvatar size="sm" />
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-xl py-2 z-10">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-700/50">
                      <UserAvatar size="md" showName />
                      <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>
                    </div>

                    {/* Menu Options */}
                    <div className="py-2">
                      {userMenuOptions.map((option) => (
                        <Link
                          key={option.path}
                          to={option.path}
                          className="flex items-center gap-3 px-4 py-2.5 text-white hover:bg-gray-700/50 transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <option.icon size={18} className="text-[#3ecf8e]" />
                          <span className="font-medium">{option.label}</span>
                        </Link>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-700/50 pt-2">
                      <button
                        onClick={() => {
                          logout()
                          setIsUserMenuOpen(false)
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/20 transition-colors w-full text-left"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.path} 
                    to={item.path} 
                    icon={item.icon}
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:ring-offset-2 focus:ring-offset-black"
              aria-label="Abrir menú"
            >
              {isMenuOpen ? (
                <X size={24} className="text-white" />
              ) : (
                <Menu size={24} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3ecf8e] to-[#2ebd7e] rounded-lg flex items-center justify-center shadow-lg">
                  <Store className="h-6 w-6 text-black" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-white to-[#3ecf8e] bg-clip-text text-transparent">
                  ChapaShop
                </span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3ecf8e] focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <X size={24} className="text-white" />
              </button>
            </div>

            {/* User Info (if logged in) */}
            {user && (
              <div className="p-4 bg-gradient-to-r from-gray-800 to-gray-800/80 border-b border-gray-700 flex-shrink-0">
                <UserAvatar size="lg" showName />
              </div>
            )}

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-2 navbar-mobile-scroll mobile-menu-content">
              {navItems.map((item) => (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  icon={item.icon}
                  mobile
                >
                  {item.label}
                </NavLink>
              ))}

              {/* User-specific links */}
              {user && (
                <>
                  <div className="my-4 border-t border-gray-700 pt-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                      Mi Cuenta
                    </div>
                    {userMenuOptions.map((option) => (
                      <Link
                        key={option.path}
                        to={option.path}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 text-white hover:bg-gray-800/50 active:bg-gray-700/50 hover:transform hover:scale-[0.98]"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <option.icon size={22} className="text-[#3ecf8e]" />
                        <span className="text-base">{option.label}</span>
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Logout Button (if logged in) */}
            {user && (
              <div className="p-4 border-t border-gray-700 flex-shrink-0">
                <button
                  onClick={() => {
                    logout()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-300 text-red-400 hover:bg-red-500/20 active:bg-red-500/30 hover:transform hover:scale-[0.98] w-full focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <LogOut size={22} />
                  <span className="text-base">Cerrar Sesión</span>
                </button>
              </div>
            )}


          </div>
        </div>
      )}
      
    </>
  )
}

export default Navbar
