import { Link } from 'react-router-dom'
import { FloatingParticles, GridPattern, GlowOrbs } from '../components/BackgroundEffects'
import { Store, Star, Rocket, LogIn, UserPlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()

  const HeroBackground = () => (
    <div className="absolute inset-0 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      
      {/* Background Effects */}
      <GridPattern />
      <GlowOrbs />
      <FloatingParticles />
    </div>
  )

  const FeatureCard = ({ icon: IconComponent, title, description }) => (
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-6 sm:p-8 rounded-2xl h-full">
      <div className="text-center h-full flex flex-col">
        <div className="mb-4 sm:mb-6 flex justify-center">
          <IconComponent size={40} className="text-[#3ecf8e] sm:w-12 sm:h-12" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
          {title}
        </h3>
        <p className="text-gray-300 leading-relaxed text-sm sm:text-base flex-1">{description}</p>
      </div>
    </div>
  )

  const SimpleButton = ({ children, to, variant = 'primary', icon: IconComponent }) => {
    const baseClasses = "inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 transition-all duration-300 min-w-0 w-full sm:w-auto justify-center"
    
    if (variant === 'primary') {
      return (
        <Link to={to} className={`${baseClasses} bg-[#3ecf8e] text-black hover:bg-[#35d499] transform hover:scale-105`}>
          {IconComponent && <IconComponent size={18} className="flex-shrink-0" />}
          <span className="truncate">{children}</span>
        </Link>
      )
    } else {
      return (
        <Link to={to} className={`${baseClasses} border-2 border-[#3ecf8e] text-[#3ecf8e] bg-transparent hover:bg-[#3ecf8e]/10 transform hover:scale-105`}>
          {IconComponent && <IconComponent size={18} className="flex-shrink-0" />}
          <span className="truncate">{children}</span>
        </Link>
      )
    }
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <HeroBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col">        
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
          <div className="max-w-7xl mx-auto text-center w-full">
            {/* Main Heading */}
            <div className="mb-8 sm:mb-12">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-white via-gray-100 to-[#3ecf8e] bg-clip-text text-transparent leading-tight">
                ChapaShop
              </h1>
              <div className="w-20 sm:w-24 md:w-32 h-1 bg-gradient-to-r from-[#3ecf8e] to-transparent mx-auto mb-6 sm:mb-8 rounded-full" />
              
              {/* Simple subtitle */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-4 sm:mb-6">
                <Rocket size={24} className="text-[#3ecf8e] sm:w-6 sm:h-6 md:w-8 md:h-8" />
                <span className="text-center">Descubre negocios locales</span>
              </div>
              
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                La plataforma moderna que revoluciona la forma de conectar con comercios locales
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mb-12 sm:mb-16 flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4">
              {!user && (
                <SimpleButton to="/login" variant="primary" icon={LogIn}>
                  Iniciar Sesión
                </SimpleButton>
              )}
              <SimpleButton to="/register" variant="secondary" icon={UserPlus}>
                Crear Cuenta
              </SimpleButton>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto px-4">
              <FeatureCard
                icon={Store}
                title="Negocios Locales"
                description="Conecta con comercios de tu comunidad y apoya la economía local con una experiencia digital moderna"
              />
              <FeatureCard
                icon={Star}
                title="Calidad Premium"
                description="Solo los mejores productos y servicios verificados por nuestra comunidad activa"
              />
              <FeatureCard
                icon={Rocket}
                title="Experiencia Rápida"
                description="Interfaz intuitiva y moderna para encontrar lo que necesitas al instante"
              />
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="relative mt-12 sm:mt-20">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3ecf8e] to-transparent" />
          <div className="text-center pb-6 sm:pb-8 px-4">
            <p className="text-gray-500 text-xs sm:text-sm">
               2025 ChapaShop - Conectando comunidades digitalmente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
