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
  Clock
} from 'lucide-react'

const CategoryAnimationDetail = ({ category, businessName }) => {
  // Configuración específica para cada categoría
  const getCategoryConfig = (cat) => {
    const normalizedCategory = cat?.toLowerCase() || 'otros'
    
    const configs = {
      restaurante: {
        primaryColor: '#FF6B6B',
        secondaryColor: '#FF8E8E',
        accentColor: '#FFB3B3',
        icons: [UtensilsCrossed, Coffee, Heart, Star],
        backgroundPattern: 'food',
        title: 'Restaurante',
        emoji: '🍽️'
      },
      cafe: {
        primaryColor: '#4ECDC4',
        secondaryColor: '#6ED4CC',
        accentColor: '#8EDCD5',
        icons: [Coffee, Heart, Sparkles, Crown],
        backgroundPattern: 'coffee',
        title: 'Café',
        emoji: '☕'
      },
      tienda: {
        primaryColor: '#45B7D1',
        secondaryColor: '#6BC5D8',
        accentColor: '#91D3DF',
        icons: [ShoppingBag, Store, Gem, Star],
        backgroundPattern: 'retail',
        title: 'Tienda',
        emoji: '🛍️'
      },
      servicios: {
        primaryColor: '#96CEB4',
        secondaryColor: '#A8D5C1',
        accentColor: '#BADCCE',
        icons: [Wrench, Settings, Zap, Sparkles],
        backgroundPattern: 'tools',
        title: 'Servicios',
        emoji: '🔧'
      },
      tecnologia: {
        primaryColor: '#9B59B6',
        secondaryColor: '#A569BD',
        accentColor: '#B579C4',
        icons: [Laptop, Code, Zap, Settings],
        backgroundPattern: 'tech',
        title: 'Tecnología',
        emoji: '💻'
      },
      salud: {
        primaryColor: '#DDA0DD',
        secondaryColor: '#E3B0E3',
        accentColor: '#E9C0E9',
        icons: [Heart, Stethoscope, Dumbbell, Sparkles],
        backgroundPattern: 'health',
        title: 'Salud y Belleza',
        emoji: '🏥'
      },
      educacion: {
        primaryColor: '#98D8C8',
        secondaryColor: '#A8DDD0',
        accentColor: '#B8E2D8',
        icons: [GraduationCap, BookOpen, Calculator, Star],
        backgroundPattern: 'education',
        title: 'Educación',
        emoji: '📚'
      },
      entretenimiento: {
        primaryColor: '#FFEAA7',
        secondaryColor: '#FFEDD6',
        accentColor: '#FFF0E5',
        icons: [Gamepad2, Music, Camera, Sparkles],
        backgroundPattern: 'entertainment',
        title: 'Entretenimiento',
        emoji: '🎮'
      },
      transporte: {
        primaryColor: '#F7DC6F',
        secondaryColor: '#F9E79F',
        accentColor: '#FBEECF',
        icons: [Car, MapPin, Clock, Zap],
        backgroundPattern: 'transport',
        title: 'Transporte',
        emoji: '🚗'
      },
      otros: {
        primaryColor: '#3ecf8e',
        secondaryColor: '#5dd6a3',
        accentColor: '#7cddb8',
        icons: [Package, Store, Sparkles, Star],
        backgroundPattern: 'general',
        title: 'Otros',
        emoji: '📦'
      }
    }

    return configs[normalizedCategory] || configs.otros
  }

  const config = getCategoryConfig(category)

  // Animaciones de los iconos flotantes (más iconos para pantalla más grande)
  const floatingIconVariants = {
    animate: {
      y: [-15, -25, -15],
      x: [-8, 8, -8],
      rotate: [-8, 8, -8],
      scale: [1, 1.15, 1],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Animación del logo ChapaShop
  const logoVariants = {
    initial: { scale: 0.3, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 1, 
        ease: "easeOut",
        delay: 0.3
      }
    }
  }

  // Animación del texto de categoría
  const categoryTextVariants = {
    initial: { y: 30, opacity: 0 },
    animate: { 
      y: 0, 
      opacity: 1,
      transition: { 
        duration: 0.8, 
        ease: "easeOut",
        delay: 0.6
      }
    }
  }

  // Animación de las partículas de fondo (más partículas)
  const particleVariants = {
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.2, 0.5, 0.2],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  // Gradiente animado de fondo
  const backgroundVariants = {
    animate: {
      background: [
        `linear-gradient(135deg, ${config.primaryColor}15, ${config.secondaryColor}15)`,
        `linear-gradient(135deg, ${config.secondaryColor}15, ${config.accentColor}15)`,
        `linear-gradient(135deg, ${config.primaryColor}15, ${config.secondaryColor}15)`
      ],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div 
      className="relative h-96 w-full overflow-hidden"
      variants={backgroundVariants}
      animate="animate"
      style={{
        background: `linear-gradient(135deg, ${config.primaryColor}15, ${config.secondaryColor}15)`
      }}
    >
      {/* Partículas de fondo animadas (más grandes y más cantidad) */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            variants={particleVariants}
            animate="animate"
            style={{
              width: Math.random() * 60 + 30,
              height: Math.random() * 60 + 30,
              background: `${config.accentColor}30`,
              left: `${Math.random() * 90 + 5}%`,
              top: `${Math.random() * 90 + 5}%`,
              animationDelay: `${i * 0.4}s`
            }}
          />
        ))}
      </div>

      {/* Patrón geométrico de fondo */}
      <div className="absolute inset-0 opacity-8">
        <div 
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle at 30% 30%, ${config.primaryColor} 3px, transparent 3px), radial-gradient(circle at 70% 70%, ${config.secondaryColor} 2px, transparent 2px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Iconos flotantes específicos de la categoría (más distribuidos) */}
      <div className="absolute inset-0">
        {config.icons.map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute"
            variants={floatingIconVariants}
            animate="animate"
            style={{
              left: `${15 + (index * 18)}%`,
              top: `${20 + (index % 3) * 25}%`,
              animationDelay: `${index * 0.5}s`,
              color: config.primaryColor
            }}
          >
            <Icon size={24 + index * 3} className="opacity-25" />
          </motion.div>
        ))}
        
        {/* Iconos adicionales para llenar más espacio */}
        {config.icons.map((Icon, index) => (
          <motion.div
            key={`extra-${index}`}
            className="absolute"
            variants={floatingIconVariants}
            animate="animate"
            style={{
              left: `${70 + (index * 8)}%`,
              top: `${15 + (index % 4) * 20}%`,
              animationDelay: `${index * 0.3 + 2}s`,
              color: config.secondaryColor
            }}
          >
            <Icon size={18 + index * 2} className="opacity-20" />
          </motion.div>
        ))}
      </div>

      {/* Contenido principal centrado */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
        {/* Logo ChapaShop animado (más grande) */}
        <motion.div
          variants={logoVariants}
          initial="initial"
          animate="animate"
          className="mb-6"
        >
          <div className="relative">
            {/* Círculo de fondo con gradiente */}
            <motion.div
              className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`
              }}
              whileHover={{ 
                scale: 1.1,
                rotate: 360,
                transition: { duration: 0.8 }
              }}
            >
              {/* Logo ChapaShop */}
              <motion.div
                className="text-white font-bold text-3xl"
                animate={{
                  rotate: [0, 5, -5, 0],
                  transition: {
                    duration: 3,
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
              className="absolute inset-0 rounded-full border-3 border-white/40"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.4, 0.7, 0.4],
                transition: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
          </div>
        </motion.div>

        {/* Texto de categoría (más grande) */}
        <motion.div
          variants={categoryTextVariants}
          initial="initial"
          animate="animate"
          className="text-center"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl">{config.emoji}</span>
            <span 
              className="font-bold text-2xl"
              style={{ color: config.primaryColor }}
            >
              {config.title}
            </span>
          </div>
          
          {/* Nombre del negocio */}
          <motion.div
            className="text-lg font-medium text-gray-700 max-w-80 truncate"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: 1 }
            }}
          >
            {businessName}
          </motion.div>
        </motion.div>
      </div>

      {/* Efectos de brillo superior e inferior */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/30 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          transition: {
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-white/20 to-transparent"
        animate={{
          opacity: [0.2, 0.4, 0.2],
          transition: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />

      {/* Insignia de ChapaShop en la esquina (más grande) */}
      <motion.div
        className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-bold shadow-lg"
        style={{ color: config.primaryColor }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ 
          scale: 1, 
          rotate: 0,
          transition: { 
            duration: 1, 
            ease: "easeOut",
            delay: 1.2
          }
        }}
        whileHover={{ scale: 1.1 }}
      >
        ChapaShop
      </motion.div>
    </motion.div>
  )
}

export default CategoryAnimationDetail
