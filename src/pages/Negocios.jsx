import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import dbService from '../services/database'
import { useAuth } from '../context/AuthContext'
import CategoryAnimation from '../components/CategoryAnimation'
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Users,
  Heart,
  Share2,
  Store,
  Award,
  MessageSquare,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Layers,
  X
} from 'lucide-react'

// Function to get appropriate icon for each category
const getCategoryIcon = (categoryName) => {
  const categoryIcons = {
    'Restaurante': Store,
    'Café': Store,
    'Tienda': Store,
    'Servicio': Store,
    'Servicios': Store,
    'Entretenimiento': Store,
    'Salud y Belleza': Store,
    'Salud': Store,
    'Educación': Store,
    'Tecnología': Store,
    'Transporte': Store,
    'Otros': Store
  }
  
  return categoryIcons[categoryName] || Store
}

const Negocios = () => {
  const [negocios, setNegocios] = useState([])
  const [categorias, setCategorias] = useState([])
  const [topNegocios, setTopNegocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  
  // Estados para controlar la expansión en móvil
  const [isStatsExpanded, setIsStatsExpanded] = useState(false)
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false)
  const [isTopBusinessExpanded, setIsTopBusinessExpanded] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Obtener categorías de negocios
      let categoriasData = []
      try {
        categoriasData = await dbService.getBusinessCategories()
        console.log('Categories loaded:', categoriasData)
      } catch (error) {
        console.error('Error loading categories:', error)
        categoriasData = []
      }

      // Obtener negocios aprobados con sus categorías y calcular ratings
      let negociosData = []
      try {
        negociosData = await dbService.getApprovedBusinesses()
        console.log('Businesses loaded:', negociosData.length)
      } catch (error) {
        console.error('Error loading businesses:', error)
        negociosData = []
      }

      // Cargar reviews para cada negocio y calcular ratings
      const negociosConReviews = []
      
      if (negociosData && negociosData.length > 0) {
        for (const negocio of negociosData) {
          try {
            const reviews = await dbService.getBusinessReviews(negocio.id)
            const avgRating = reviews.length > 0 
              ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
              : 0
            
            negociosConReviews.push({
              ...negocio,
              avgRating: parseFloat(avgRating.toFixed(1)),
              reviewCount: reviews.length
            })
          } catch (error) {
            console.error(`Error loading reviews for business ${negocio.id}:`, error)
            negociosConReviews.push({
              ...negocio,
              avgRating: 0,
              reviewCount: 0
            })
          }
        }
      }

      // Calcular top negocios (mejor rating con al menos 1 reseña)
      const topRated = [...negociosConReviews]
        .filter(n => n.reviewCount > 0)
        .sort((a, b) => {
          if (a.avgRating !== b.avgRating) return b.avgRating - a.avgRating
          return b.reviewCount - a.reviewCount
        })
        .slice(0, 10)

      setNegocios(negociosConReviews)
      setCategorias(categoriasData)
      setTopNegocios(topRated)
      setLoading(false)

    } catch (error) {
      console.error('Error al cargar datos:', error)
      setLoading(false)
      
      // En caso de error, mostrar datos vacíos
      setNegocios([])
      setCategorias([])
      setTopNegocios([])
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredNegocios = negocios.filter(negocio => {
    const matchesSearch = negocio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         negocio.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Improved category matching - check multiple possible fields
    const negocioCategory = negocio.category || negocio.category_name || negocio.business_categories?.name || ''
    const matchesCategory = !selectedCategory || 
                           negocioCategory.toLowerCase() === selectedCategory.toLowerCase() ||
                           negocioCategory === selectedCategory
    
    return matchesSearch && matchesCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.avgRating - a.avgRating
      case 'reviews':
        return b.reviewCount - a.reviewCount
      case 'name':
        return a.name.localeCompare(b.name)
      default: {
        // Fix: Handle both created_at and createdAt field names
        const dateA = a.created_at || a.createdAt
        const dateB = b.created_at || b.createdAt
        if (!dateA || !dateB) return 0
        return new Date(dateB) - new Date(dateA)
      }
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#3ecf8e] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600">Cargando negocios increíbles...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-800 px-2">
              Descubre Negocios
            </h1>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-2">
              Explora una selección curada de los mejores negocios verificados por nuestra comunidad
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="¿Qué tipo de negocio buscas?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#3ecf8e] focus:border-[#3ecf8e] outline-none transition-all"
                />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-6 py-3 border border-gray-300 rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-[#3ecf8e] focus:border-[#3ecf8e] outline-none transition-all"
              >
                <option value="recent">Más recientes</option>
                <option value="rating">Mejor calificados</option>
                <option value="reviews">Más reseñas</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#3ecf8e] mb-1">
                {filteredNegocios.length}
              </div>
              <div className="text-gray-500 text-sm">Negocios</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#3ecf8e] mb-1">
                {topNegocios.reduce((acc, neg) => acc + neg.reviewCount, 0)}+
              </div>
              <div className="text-gray-500 text-sm">Reseñas</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#3ecf8e] mb-1">
                {categorias.length}+
              </div>
              <div className="text-gray-500 text-sm">Categorías</div>
            </div>
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#3ecf8e] mb-1">
                {topNegocios.length > 0 ? Math.round(topNegocios.reduce((acc, neg) => acc + neg.avgRating, 0) / topNegocios.length * 10) / 10 : 0}★
              </div>
              <div className="text-gray-500 text-sm">Promedio</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {/* Sidebar izquierdo - Categorías */}
          <div className="lg:col-span-1">
            {/* Versión móvil colapsible */}
            <div className="lg:hidden mb-4 sm:mb-6">
              <button
                onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-[#3ecf8e]" />
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    Filtrar por Categoría
                    {selectedCategory && (
                      <span className="text-xs sm:text-sm text-[#3ecf8e] ml-2">({selectedCategory})</span>
                    )}
                  </span>
                </div>
                {isCategoriesExpanded ? (
                  <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                )}
              </button>
            </div>

            {/* Contenido de categorías */}
            <div className={`bg-white rounded-lg sm:rounded-xl shadow-sm border p-4 sm:p-6 sticky top-6 transition-all duration-300 overflow-hidden ${
              !isCategoriesExpanded ? 'lg:block hidden' : 'block'
            }`}>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 hidden lg:flex">
                <Filter className="h-6 w-6 text-[#3ecf8e]" />
                Categorías ({categorias.length})
              </h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory('')
                    setIsCategoriesExpanded(false)
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    !selectedCategory 
                      ? 'bg-[#3ecf8e] text-white font-semibold shadow-md' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Layers className="h-4 w-4" />
                    Todas las categorías
                  </div>
                </button>
                
                {categorias.map((categoria) => {
                  const CategoryIcon = getCategoryIcon(categoria.name)
                  return (
                    <button
                      key={categoria.id}
                      onClick={() => {
                        setSelectedCategory(categoria.name)
                        setIsCategoriesExpanded(false)
                      }}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        selectedCategory === categoria.name
                          ? 'bg-[#3ecf8e] text-white font-semibold shadow-md'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CategoryIcon className="h-4 w-4 text-[#3ecf8e]" />
                        {categoria.name}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Contenido principal - Negocios */}
          <div className="lg:col-span-2">
            <div className="space-y-4 sm:space-y-6">
              {filteredNegocios.length === 0 ? (
                <div className="text-center py-12 sm:py-16 bg-white rounded-lg sm:rounded-xl shadow-sm mx-1 sm:mx-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3 sm:mb-4 px-4">
                    {selectedCategory ? 'No hay negocios en esta categoría' : 'No se encontraron negocios'}
                  </h3>
                  <p className="text-gray-600 text-base sm:text-lg px-4">
                    {selectedCategory ? 'Prueba seleccionando otra categoría o cambiando tus filtros de búsqueda' : 'Intenta cambiar tus filtros de búsqueda'}
                  </p>
                </div>
              ) : (
                filteredNegocios.map((negocio) => (
                  <BusinessCard key={negocio.id} negocio={negocio} />
                ))
              )}
            </div>
          </div>

          {/* Sidebar derecho - Top negocios */}
          <div className="lg:col-span-1">
            {/* Versión móvil colapsible */}
            <div className="lg:hidden mb-4 sm:mb-6">
              <button
                onClick={() => setIsTopBusinessExpanded(!isTopBusinessExpanded)}
                className="w-full flex items-center justify-between p-3 sm:p-4 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                  <span className="font-semibold text-gray-800">Top Calificados</span>
                </div>
                {isTopBusinessExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            {/* Contenido de top negocios */}
            <div className={`bg-white rounded-xl shadow-sm border p-6 sticky top-6 transition-all duration-300 overflow-hidden ${
              !isTopBusinessExpanded ? 'lg:block hidden' : 'block'
            }`}>
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3 hidden lg:flex">
                <Award className="h-6 w-6 text-yellow-500" />
                Top Calificados
              </h2>
              
              <div className="space-y-3">
                {topNegocios.slice(0, 10).map((negocio, index) => (
                  <Link
                    key={negocio.id}
                    to={`/negocio/${negocio.id}`}
                    className="block p-3 rounded-xl hover:bg-gray-50 transition-all group border border-gray-100"
                    onClick={() => setIsTopBusinessExpanded(false)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                          index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-[#3ecf8e] transition-colors">
                          {negocio.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600">
                              {negocio.avgRating}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            ({negocio.reviewCount} reseñas)
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente para cada tarjeta de negocio
const BusinessCard = ({ negocio }) => {
  const { user } = useAuth()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  // Check if business is in user's favorites
  useEffect(() => {
    if (user && negocio.id) {
      checkIfFavorite()
    }
  }, [user, negocio.id])

  const checkIfFavorite = async () => {
    if (!user || !negocio.id) return
    
    try {
      const favorite = await dbService.isFavorite(user.uid, negocio.id)
      setIsFavorite(favorite)
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const handleFavoriteToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      alert('Debes iniciar sesión para guardar favoritos')
      return
    }

    setLoadingFavorite(true)
    try {
      if (isFavorite) {
        await dbService.removeFromFavorites(user.uid, negocio.id)
        setIsFavorite(false)
      } else {
        await dbService.addToFavorites(user.uid, negocio.id)
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Error al actualizar favoritos. Inténtalo de nuevo.')
    } finally {
      setLoadingFavorite(false)
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('Debes iniciar sesión para dejar reseñas')
      return
    }

    if (userRating === 0) {
      alert('Por favor selecciona una calificación')
      return
    }

    setSubmittingReview(true)
    try {
      const reviewData = {
        businessId: negocio.id,
        userId: user.uid,
        userName: user.displayName || user.email || 'Usuario anónimo',
        rating: userRating,
        comment: reviewComment.trim(),
        createdAt: new Date()
      }

      await dbService.createReview(reviewData)
      
      alert('¡Reseña enviada exitosamente!')
      setShowReviewModal(false)
      setUserRating(0)
      setReviewComment('')
      
      // Refresh the page to update ratings
      window.location.reload()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Error al enviar la reseña. Inténtalo de nuevo.')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleCardClick = (e) => {
    // Evitar navegación si se hace clic en botones de acción
    if (e.target.closest('.action-button')) {
      e.preventDefault()
      return
    }
  }

  return (
    <>
      <Link 
        to={`/negocio/${negocio.id}`}
        className="block group"
        onClick={handleCardClick}
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group-hover:shadow-lg group-hover:border-[#3ecf8e] transition-all duration-300">
          {/* Animación de categoría con action buttons */}
          <div className="relative">
            <CategoryAnimation 
              category={negocio.business_categories?.name || negocio.category || 'otros'} 
              businessName={negocio.name}
            />
            
            {/* Action buttons */}
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              {user && (
                <button
                  onClick={handleFavoriteToggle}
                  disabled={loadingFavorite}
                  className={`action-button p-2 rounded-full backdrop-blur-sm transition-all ${
                    isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                  }`}
                  title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                >
                  <Heart className={`h-3 w-3 sm:h-4 sm:w-4 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
              {user && (
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setUserRating(0)
                    setReviewComment('')
                    setShowReviewModal(true)
                  }}
                  className="action-button p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-[#3ecf8e] hover:text-white transition-all"
                  title="Dejar reseña"
                >
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              )}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  if (navigator.share) {
                    navigator.share({
                      title: negocio.name,
                      text: negocio.description,
                      url: window.location.origin + `/negocio/${negocio.id}`
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.origin + `/negocio/${negocio.id}`)
                    alert('Enlace copiado al portapapeles')
                  }
                }}
                className="action-button p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-[#3ecf8e] hover:text-white transition-all"
                title="Compartir"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {/* Contenido de la tarjeta */}
          <div className="p-4 sm:p-6">
            <div className="mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 group-hover:text-[#3ecf8e] transition-colors mb-1 sm:mb-2 line-clamp-1">
                {negocio.name || 'Nombre no disponible'}
              </h3>
              <p className="text-gray-600 text-sm sm:text-base line-clamp-2 leading-relaxed">
                {negocio.description || 'Descripción no disponible'}
              </p>
            </div>

            {/* Estadísticas del negocio */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Users className="h-3 w-3 sm:h-4 sm:w-4 text-[#3ecf8e] flex-shrink-0" />
                <span className="text-gray-600 truncate">
                  {negocio.reviewCount || 0} reseñas
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm">
                <Store className="h-3 w-3 sm:h-4 sm:w-4 text-[#3ecf8e] flex-shrink-0" />
                <span className="text-gray-600 truncate">
                  {negocio.status === 'approved' ? 'Verificado' : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Rating display */}
            {negocio.reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="flex items-center gap-1 bg-yellow-50 px-2 sm:px-3 py-1 rounded-full">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                  <span className="text-xs sm:text-sm font-semibold text-yellow-700">
                    {negocio.avgRating}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-gray-500">
                  ({negocio.reviewCount} reseñas)
                </span>
              </div>
            )}

            {/* Dirección si está disponible */}
            {negocio.address && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-[#3ecf8e] flex-shrink-0" />
                <span className="truncate">{negocio.address}</span>
              </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!user && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-[#3ecf8e]/10 to-[#2dd4bf]/10 border border-[#3ecf8e]/20 rounded-lg sm:rounded-xl">
                <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                  <ThumbsUp className="h-3 w-3 sm:h-4 sm:w-4 text-[#3ecf8e] flex-shrink-0" />
                  <span>
                    <Link to="/login" className="text-[#3ecf8e] hover:underline font-medium">
                      Inicia sesión
                    </Link>
                    {' '}para guardar favoritos y dejar reseñas
                  </span>
                </div>
              </div>
            )}

            {/* Botón de acción */}
            <div className="bg-gradient-to-r from-[#3ecf8e] to-[#2dd4bf] text-white text-center py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base group-hover:from-[#2dd4bf] group-hover:to-[#3ecf8e] transition-all duration-200 shadow-md">
              Ver Detalles
            </div>
          </div>
        </div>
      </Link>

      {/* Review Modal */}
      {showReviewModal && user && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Dejar Reseña</h3>
                <button
                  onClick={() => {
                    setShowReviewModal(false)
                    setUserRating(0)
                    setReviewComment('')
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className={`text-2xl transition-colors ${
                          star <= userRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3ecf8e] focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Comparte tu experiencia con este negocio..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewModal(false)
                      setUserRating(0)
                      setReviewComment('')
                    }}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || userRating === 0}
                    className="flex-1 px-4 py-2 bg-[#3ecf8e] text-white rounded-lg hover:bg-[#2dd4bf] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submittingReview ? 'Enviando...' : 'Enviar Reseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Negocios
