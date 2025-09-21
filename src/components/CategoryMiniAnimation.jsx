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
  Stethoscope,
  Home,
  PawPrint,
  Trophy,
  Scissors
} from 'lucide-react'

const CategoryMiniAnimation = ({ category, size = 'small' }) => {
  // Configuración específica para cada categoría
  const getCategoryConfig = (cat) => {
    const normalizedCategory = cat?.toLowerCase() || 'otros'
    
    const configs = {
      restaurante: {
        primaryColor: '#B91C1C',
        secondaryColor: '#DC2626',
        icon: UtensilsCrossed,
        emoji: '🍽️'
      },
      cafe: {
        primaryColor: '#0F766E',
        secondaryColor: '#0D9488',
        icon: Coffee,
        emoji: '☕'
      },
      tienda: {
        primaryColor: '#1E40AF',
        secondaryColor: '#2563EB',
        icon: ShoppingBag,
        emoji: '🛍️'
      },
      servicios: {
        primaryColor: '#166534',
        secondaryColor: '#16A34A',
        icon: Wrench,
        emoji: '🔧'
      },
      tecnologia: {
        primaryColor: '#5B21B6',
        secondaryColor: '#7C3AED',
        icon: Laptop,
        emoji: '💻'
      },
      salud: {
        primaryColor: '#BE185D',
        secondaryColor: '#DB2777',
        icon: Heart,
        emoji: '🏥'
      },
      educacion: {
        primaryColor: '#0F766E',
        secondaryColor: '#0D9488',
        icon: GraduationCap,
        emoji: '📚'
      },
      entretenimiento: {
        primaryColor: '#A16207',
        secondaryColor: '#CA8A04',
        icon: Gamepad2,
        emoji: '🎮'
      },
      transporte: {
        primaryColor: '#C2410C',
        secondaryColor: '#EA580C',
        icon: Car,
        emoji: '🚗'
      },
      automotriz: {
        primaryColor: '#C2410C',
        secondaryColor: '#EA580C',
        icon: Car,
        emoji: '🚗'
      },
      belleza: {
        primaryColor: '#BE185D',
        secondaryColor: '#DB2777',
        icon: Scissors,
        emoji: '💄'
      },
      hogar: {
        primaryColor: '#059669',
        secondaryColor: '#10B981',
        icon: Home,
        emoji: '🏠'
      },
      deportes: {
        primaryColor: '#DC2626',
        secondaryColor: '#EF4444',
        icon: Trophy,
        emoji: '⚽'
      },
      mascotas: {
        primaryColor: '#7C2D12',
        secondaryColor: '#9A3412',
        icon: PawPrint,
        emoji: '🐕'
      },
      otros: {
        primaryColor: '#374151',
        secondaryColor: '#4B5563',
        icon: Package,
        emoji: '📦'
      },
      otro: {
        primaryColor: '#374151',
        secondaryColor: '#4B5563',
        icon: Package,
        emoji: '📦'
      }
    }

    return configs[normalizedCategory] || configs.otros
  }

  const config = getCategoryConfig(category)
  const Icon = config.icon

  const sizeConfig = {
    small: {
      container: 'w-12 h-12',
      icon: 20
    },
    medium: {
      container: 'w-16 h-16',
      icon: 24
    },
    large: {
      container: 'w-20 h-20',
      icon: 28
    }
  }

  const currentSize = sizeConfig[size] || sizeConfig.small

  return (
    <motion.div
      className={`${currentSize.container} rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden`}
      style={{
        background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})`
      }}
      whileHover={{ 
        scale: 1.05,
        rotate: [0, -2, 2, 0],
        transition: { duration: 0.3 }
      }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: 1, 
        rotate: 0,
        transition: { 
          duration: 0.6, 
          ease: "easeOut"
        }
      }}
    >
      {/* Brillo animado */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
        animate={{
          opacity: [0.3, 0.6, 0.3],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />

      {/* Partícula flotante */}
      <motion.div
        className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.6, 1, 0.6],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />

      {/* Icono principal */}
      <motion.div
        className="relative z-10"
        animate={{
          y: [-1, 1, -1],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <Icon 
          size={currentSize.icon} 
          className="text-white filter drop-shadow-sm" 
        />
      </motion.div>

      {/* Sparkle effect */}
      <motion.div
        className="absolute top-0 right-0"
        initial={{ scale: 0, rotate: 0 }}
        animate={{
          scale: [0, 1, 0],
          rotate: [0, 180, 360],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }
        }}
      >
        <Sparkles size={8} className="text-white/80" />
      </motion.div>

      {/* Emoji badge */}
      <motion.div
        className="absolute -bottom-1 -right-1 text-xs"
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          transition: { 
            delay: 0.3,
            duration: 0.3,
            ease: "easeOut"
          }
        }}
        whileHover={{ scale: 1.2 }}
      >
        {config.emoji}
      </motion.div>
    </motion.div>
  )
}

export default CategoryMiniAnimation
