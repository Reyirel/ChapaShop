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
    <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 p-8 rounded-2xl">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <IconComponent size={48} className="text-[#3ecf8e]" />
        </div>
        <h3 className="text-xl font-bold text-white mb-4">
          {title}
        </h3>
        <p className="text-gray-300 leading-relaxed mb-4">{description}</p>
      </div>
    </div>
  )

  const SimpleButton = ({ children, to, variant = 'primary', icon: IconComponent }) => {
    const baseClasses = "inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50"
    
    if (variant === 'primary') {
      return (
        <Link to={to} className={`${baseClasses} bg-[#3ecf8e] text-black`}>
          {IconComponent && <IconComponent size={20} />}
          <span>{children}</span>
        </Link>
      )
    } else {
      return (
        <Link to={to} className={`${baseClasses} border-2 border-[#3ecf8e] text-[#3ecf8e] bg-transparent`}>
          {IconComponent && <IconComponent size={20} />}
          <span>{children}</span>
        </Link>
      )
    }
  }

  return (
    <div className="h-screen bg-black text-white relative overflow-hidden">
      <HeroBackground />
      
      <div className="relative z-10 min-h-screen flex flex-col">        
        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-4 py-20">
          <div className="max-w-7xl mx-auto text-center">
            {/* Main Heading */}
            <div className="mb-12">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-[#3ecf8e] bg-clip-text text-transparent leading-tight">
                ChapaShop
              </h1>
              <div className="w-32 h-1 bg-gradient-to-r from-[#3ecf8e] to-transparent mx-auto mb-8 rounded-full" />
              
              {/* Simple subtitle */}
              <div className="flex items-center justify-center gap-3 text-2xl md:text-3xl text-gray-300 mb-6">
                <Rocket size={32} className="text-[#3ecf8e]" />
                <span>Descubre negocios locales</span>
              </div>
              
              <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                La plataforma moderna que revoluciona la forma de conectar con comercios locales
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="mb-16 flex flex-col sm:flex-row gap-6 justify-center items-center">
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
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
        <div className="relative mt-20">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3ecf8e] to-transparent" />
          <div className="text-center pb-8">
            <p className="text-gray-500 text-sm">
               2025 ChapaShop - Conectando comunidades digitalmente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
