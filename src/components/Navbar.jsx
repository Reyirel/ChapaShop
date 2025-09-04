import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, Home, Store, LogIn, UserPlus, Shield } from 'lucide-react'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const isActiveRoute = (path) => {
    return location.pathname === path
  }

  const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/negocios', label: 'Negocios', icon: Store },
    { path: '/login', label: 'Iniciar Sesión', icon: LogIn },
    { path: '/register', label: 'Registrarse', icon: UserPlus },
    { path: '/admin', label: 'Admin', icon: Shield }
  ]

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
          </div>
        </div>
      </div>

      {/* Subtle bottom glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3ecf8e]/30 to-transparent"></div>
    </nav>
  )
}

export default Navbar
