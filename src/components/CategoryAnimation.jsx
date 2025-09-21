import { motion } from 'framer-motion'
import { 
  UtensilsCrossed, 
  Coffee, 
  ShoppingBag, 
  Wrench, 
  Laptop, 
  Heart, 
  GraduationCap, 
  Gamepad2,
  Package,
  Car,
  Store,
  Sparkles,
  Zap,
  Star,
  Crown,
  Gem,
  Palette,
  Music,
  Camera,
  Code,
  Settings,
  Stethoscope,
  Dumbbell,
  BookOpen,
  Calculator,
  Brush,
  Scissors,
  MapPin,
  Clock,
  Home,
  PawPrint,
  Trophy,
  Bike
} from 'lucide-react'

const CategoryAnimation = ({ category, businessName }) => {
  // Configuración específica para cada categoría
  const getCategoryConfig = (cat) => {
    const normalizedCategory = cat?.toLowerCase() || 'otros'
    
    const configs = {
      restaurante: {
        primaryColor: '#B91C1C',
        secondaryColor: '#DC2626',
        accentColor: '#EF4444',
        icons: [UtensilsCrossed, Coffee, Heart, Star],
        backgroundPattern: 'food',
        title: 'Restaurante',
        emoji: '🍽️'
      },
      cafe: {
        primaryColor: '#0F766E',
        secondaryColor: '#0D9488',
        accentColor: '#14B8A6',
        icons: [Coffee, Heart, Sparkles, Crown],
        backgroundPattern: 'coffee',
        title: 'Café',
        emoji: '☕'
      },
      tienda: {
        primaryColor: '#1E40AF',
        secondaryColor: '#2563EB',
        accentColor: '#3B82F6',
        icons: [ShoppingBag, Store, Gem, Star],
        backgroundPattern: 'retail',
        title: 'Tienda',
        emoji: '🛍️'
      },
      servicios: {
        primaryColor: '#166534',
        secondaryColor: '#16A34A',
        accentColor: '#22C55E',
        icons: [Wrench, Settings, Zap, Sparkles],
        backgroundPattern: 'tools',
        title: 'Servicios',
        emoji: '🔧'
      },
      tecnologia: {
        primaryColor: '#5B21B6',
        secondaryColor: '#7C3AED',
        accentColor: '#8B5CF6',
        icons: [Laptop, Code, Zap, Settings],
        backgroundPattern: 'tech',
        title: 'Tecnología',
        emoji: '💻'
      },
      salud: {
        primaryColor: '#BE185D',
        secondaryColor: '#DB2777',
        accentColor: '#EC4899',
        icons: [Heart, Stethoscope, Dumbbell, Sparkles],
        backgroundPattern: 'health',
        title: 'Salud y Belleza',
        emoji: '🏥'
      },
      educacion: {
        primaryColor: '#0F766E',
        secondaryColor: '#0D9488',
        accentColor: '#14B8A6',
        icons: [GraduationCap, BookOpen, Calculator, Star],
        backgroundPattern: 'education',
        title: 'Educación',
        emoji: '📚'
      },
      entretenimiento: {
        primaryColor: '#A16207',
        secondaryColor: '#CA8A04',
        accentColor: '#EAB308',
        icons: [Gamepad2, Music, Camera, Sparkles],
        backgroundPattern: 'entertainment',
        title: 'Entretenimiento',
        emoji: '🎮'
      },
      transporte: {
        primaryColor: '#C2410C',
        secondaryColor: '#EA580C',
        accentColor: '#F97316',
        icons: [Car, MapPin, Clock, Zap],
        backgroundPattern: 'transport',
        title: 'Transporte',
        emoji: '🚗'
      },
      automotriz: {
        primaryColor: '#C2410C',
        secondaryColor: '#EA580C',
        accentColor: '#F97316',
        icons: [Car, Settings, Wrench, Zap],
        backgroundPattern: 'automotive',
        title: 'Automotriz',
        emoji: '🚗'
      },
      belleza: {
        primaryColor: '#BE185D',
        secondaryColor: '#DB2777',
        accentColor: '#EC4899',
        icons: [Sparkles, Scissors, Brush, Star],
        backgroundPattern: 'beauty',
        title: 'Belleza',
        emoji: '💄'
      },
      hogar: {
        primaryColor: '#059669',
        secondaryColor: '#10B981',
        accentColor: '#34D399',
        icons: [Home, Settings, Sparkles, Crown],
        backgroundPattern: 'home',
        title: 'Hogar',
        emoji: '🏠'
      },
      deportes: {
        primaryColor: '#DC2626',
        secondaryColor: '#EF4444',
        accentColor: '#F87171',
        icons: [Trophy, Dumbbell, Bike, Star],
        backgroundPattern: 'sports',
        title: 'Deportes',
        emoji: '⚽'
      },
      mascotas: {
        primaryColor: '#7C2D12',
        secondaryColor: '#9A3412',
        accentColor: '#C2410C',
        icons: [PawPrint, Heart, Star, Sparkles],
        backgroundPattern: 'pets',
        title: 'Mascotas',
        emoji: '🐕'
      },
      otros: {
        primaryColor: '#374151',
        secondaryColor: '#4B5563',
        accentColor: '#6B7280',
        icons: [Package, Store, Sparkles, Star],
        backgroundPattern: 'general',
        title: 'Otros',
        emoji: '📦'
      },
      otro: {
        primaryColor: '#374151',
        secondaryColor: '#4B5563',
        accentColor: '#6B7280',
        icons: [Package, Store, Sparkles, Star],
        backgroundPattern: 'general',
        title: 'Otros',
        emoji: '📦'
      }
    }

    return configs[normalizedCategory] || configs.otros
  }

  const config = getCategoryConfig(category)

  // Animaciones de los iconos flotantes
  const floatingIconVariants = {
    animate: {
      y: [-10, -20, -10],
      x: [-5, 5, -5],
      rotate: [-5, 5, -5],
      scale: [1, 1.1, 1],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Animación del logo ChapaShop
  const logoVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        delay: 0.2
      }
    }
  }

  // Animación del texto de categoría
  const categoryTextVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.6, 
        ease: "easeOut",
        delay: 0.5
      }
    }
  }

  // Animación de las partículas de fondo
  const particleVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Gradiente animado de fondo
  const backgroundVariants = {
    animate: {
      background: [
        `linear-gradient(135deg, ${config.primaryColor}05, ${config.secondaryColor}03)`,
        `linear-gradient(135deg, ${config.secondaryColor}03, ${config.accentColor}02)`,
        `linear-gradient(135deg, ${config.primaryColor}05, ${config.secondaryColor}03)`
      ],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div 
      className="relative h-48 overflow-hidden rounded-t-2xl"
      variants={backgroundVariants}
      animate="animate"
      style={{
        background: `linear-gradient(135deg, ${config.primaryColor}05, ${config.secondaryColor}03)`
      }}
    >
      {/* Partículas de fondo animadas */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            variants={particleVariants}
            animate="animate"
            style={{
              width: Math.random() * 40 + 20,
              height: Math.random() * 40 + 20,
              background: `${config.accentColor}15`,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
      </div>

      {/* Patrón geométrico de fondo */}
      <div className="absolute inset-0 opacity-3">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${config.primaryColor} 2px, transparent 2px), radial-gradient(circle at 75% 75%, ${config.secondaryColor} 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Iconos flotantes específicos de la categoría */}
      <div className="absolute inset-0">
        {config.icons.map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute"
            variants={floatingIconVariants}
            animate="animate"
            style={{
              left: `${20 + (index * 20)}%`,
              top: `${15 + (index % 2) * 20}%`,
              animationDelay: `${index * 0.4}s`,
              color: config.primaryColor
            }}
          >
            <Icon size={16 + index * 2} className="opacity-15" />
          </motion.div>
        ))}
      </div>

      {/* Contenido principal centrado */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Logo ChapaShop animado */}
        <motion.div
          variants={logoVariants}
          initial="initial"
          animate="animate"
          className="mb-4"
        >
          <div className="relative">
            {/* Círculo de fondo con gradiente */}
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: 360,
                transition: { duration: 0.6 }
              }}
            >
              {/* Logo ChapaShop */}
              <motion.div
                className="text-white font-bold text-xl"
                animate={{
                  rotate: [0, 5, -5, 0],
                  transition: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                CS
              </motion.div>
            </motion.div>

            {/* Anillo exterior animado */}
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-white/30"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
          </div>
        </motion.div>

        {/* Texto de categoría */}
        <motion.div
          variants={categoryTextVariants}
          initial="initial"
          animate="animate"
          className="text-center"
        >
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{config.emoji}</span>
            <span 
              className="font-bold text-lg text-gray-800"
            >
              {config.title}
            </span>
          </div>
          
          {/* Nombre del negocio truncado */}
          <motion.div
            className="text-xs text-gray-700 max-w-32 truncate"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: 0.8 }
            }}
          >
            {businessName}
          </motion.div>
        </motion.div>
      </div>

      {/* Efecto de brillo superior */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />

      {/* Insignia de ChapaShop en la esquina */}
      <motion.div
        className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-semibold text-gray-800 shadow-sm"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          transition: { 
            duration: 0.8, 
            ease: "easeOut",
            delay: 1
          }
        }}
        whileHover={{ scale: 1.1 }}
      >
        ChapaShop
      </motion.div>
    </motion.div>
  )
}

export default CategoryAnimation
