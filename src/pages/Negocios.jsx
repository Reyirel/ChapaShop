import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import dbService from '../services/database'
import { useAuth } from '../context/AuthContext'
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Users,
  Heart,
  Share2,
  Store,
  ShoppingBag,
  Award,
  Sparkles,
  MessageSquare,
  ThumbsUp
} from 'lucide-react'

const Negocios = () => {
  const [negocios, setNegocios] = useState([])
  const [categorias, setCategorias] = useState([])
  const [topNegocios, setTopNegocios] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [sortBy, setSortBy] = useState('recent')

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Obtener categorías de negocios
      let categoriasData = []
      try {
        categoriasData = await dbService.getBusinessCategories()
      } catch {
        categoriasData = []
      }

      // Obtener negocios aprobados con sus categorías y calcular ratings
      let negociosData = []
      try {
        negociosData = await dbService.getApprovedBusinesses()
      } catch {
        negociosData = []
      }

      // Cargar reviews para cada negocio y calcular ratings
      const negociosConReviews = await Promise.all(
        negociosData.map(async (negocio) => {
          try {
            const reviews = await dbService.getReviews(negocio.id)
            const avgRating = reviews.length > 0 
              ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
              : 0
            
            return {
              ...negocio,
              reviews,
              avgRating: parseFloat(avgRating.toFixed(1)),
              reviewCount: reviews.length
            }
          } catch (error) {
            console.error('Error loading reviews for business:', negocio.id, error)
            return {
              ...negocio,
              reviews: [],
              avgRating: 0,
              reviewCount: 0
            }
          }
        })
      )

      // Procesar negocios para calcular ratings promedio
      const negociosConRating = negociosConReviews

      // Establecer datos
      setNegocios(negociosConRating)
      setCategorias(categoriasData || [])

      // Top 10 negocios con mejor rating
      const topRated = [...negociosConReviews]
        .filter(n => n.reviewCount > 0)
        .sort((a, b) => {
          if (a.avgRating !== b.avgRating) return b.avgRating - a.avgRating
          return b.reviewCount - a.reviewCount
        })
        .slice(0, 10)

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
  }, []) // Empty dependency array for useCallback

  // Make debug functions available globally for testing
  useEffect(() => {
    window.debugFirebase = {
      showAllBusinesses: () => dbService.debugAllBusinesses(),
      approveAllPending: () => dbService.approveAllPendingBusinesses(),
      refreshPage: () => fetchData()
    }
  }, [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredNegocios = negocios.filter(negocio => {
    const matchesSearch = negocio.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         negocio.description?.toLowerCase().includes(searchTerm.toLowerCase())
    // Fix: Check both category and category_id fields for compatibility
    const matchesCategory = !selectedCategory || 
                           negocio.category === selectedCategory || 
                           negocio.category_id === selectedCategory ||
                           negocio.category?.toLowerCase() === selectedCategory.toLowerCase()
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-gray-800 to-[#3ecf8e] bg-clip-text text-transparent">
              Descubre Negocios
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explora una selección curada de los mejores negocios verificados por nuestra comunidad
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-[#3ecf8e] focus:border-[#3ecf8e] outline-none min-w-[180px]"
              >
                <option value="recent">Más recientes</option>
                <option value="rating">Mejor calificados</option>
                <option value="reviews">Más reseñas</option>
                <option value="name">Nombre A-Z</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-8">
            <div className="text-center bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl md:text-3xl font-bold text-[#3ecf8e] mb-1">
                {negocios.length}+
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar izquierdo - Categorías */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Filter className="h-6 w-6 text-[#3ecf8e]" />
                Categorías
              </h2>
              
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                    !selectedCategory 
                      ? 'bg-[#3ecf8e] text-white font-semibold shadow-md' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-4 w-4" />
                    Todas las categorías
                  </div>
                </button>
                
                {categorias.map((categoria) => (
                  <button
                    key={categoria.id}
                    onClick={() => setSelectedCategory(categoria.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedCategory === categoria.id
                        ? 'bg-[#3ecf8e] text-white font-semibold shadow-md'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoria.color }}
                      ></div>
                      {categoria.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenido principal - Negocios */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {filteredNegocios.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                  <div className="text-6xl mb-6">🏪</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">
                    No se encontraron negocios
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Intenta cambiar tus filtros de búsqueda
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
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Award className="h-6 w-6 text-yellow-500" />
                Top Calificados
              </h2>
              
              <div className="space-y-3">
                {topNegocios.slice(0, 10).map((negocio, index) => (
                  <Link
                    key={negocio.id}
                    to={`/negocio/${negocio.id}`}
                    className="block p-3 rounded-xl hover:bg-gray-50 transition-all group border border-gray-100"
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
  const [userReview, setUserReview] = useState(null)
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
    <Link 
      to={`/negocio/${negocio.id}`}
      className="block group"
      onClick={handleCardClick}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group-hover:shadow-lg group-hover:border-[#3ecf8e] transition-all duration-300">
        {/* Imagen del negocio */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={
              negocio.image_url || 
              negocio.images?.[0] || 
              negocio.imageUrl || 
              'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop'
            } 
            alt={negocio.name || 'Imagen del negocio'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {user && (
              <button
                onClick={handleFavoriteToggle}
                disabled={loadingFavorite}
                className={`action-button p-2 rounded-full backdrop-blur-sm transition-all ${
                  isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
                }`}
                title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            )}
            {user && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // Reset form state when opening modal
                  setUserRating(0)
                  setReviewComment('')
                  setShowReviewModal(true)
                }}
                className="action-button p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-[#3ecf8e] hover:text-white transition-all"
                title="Dejar reseña"
              >
                <MessageSquare className="h-4 w-4" />
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
                  // Fallback: copy to clipboard
                  navigator.clipboard.writeText(window.location.origin + `/negocio/${negocio.id}`)
                  alert('Enlace copiado al portapapeles')
                }
              }}
              className="action-button p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-[#3ecf8e] hover:text-white transition-all"
              title="Compartir"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          
          {/* Badge de categoría */}
          {(negocio.category || negocio.business_categories?.name) && (
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#3ecf8e] backdrop-blur-sm">
                {negocio.business_categories?.name || negocio.category || 'Categoría'}
              </span>
            </div>
          )}

          {/* Rating badge */}
          {negocio.reviewCount > 0 && (
            <div className="absolute bottom-4 right-4">
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-semibold text-gray-800">
                  {negocio.avgRating}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Contenido de la tarjeta */}
        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-800 group-hover:text-[#3ecf8e] transition-colors mb-2">
              {negocio.name || 'Nombre no disponible'}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {negocio.description || 'Descripción no disponible'}
            </p>
          </div>

          {/* Estadísticas del negocio */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-[#3ecf8e]" />
              <span className="text-gray-600">
                {negocio.reviewCount || 0} reseñas
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Store className="h-4 w-4 text-[#3ecf8e]" />
              <span className="text-gray-600">
                {negocio.status === 'approved' ? 'Verificado' : 'Pendiente'}
              </span>
            </div>
          </div>

          {/* Dirección si está disponible */}
          {negocio.address && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <MapPin className="h-4 w-4 text-[#3ecf8e]" />
              <span className="truncate">{negocio.address}</span>
            </div>
          )}

          {/* Información adicional */}
          {(negocio.phone || negocio.email) && (
            <div className="space-y-2 mb-6">
              {negocio.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-[#3ecf8e]">📞</span>
                  <span>{negocio.phone}</span>
                </div>
              )}
              {negocio.email && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="text-[#3ecf8e]">✉️</span>
                  <span className="truncate">{negocio.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Login prompt for non-authenticated users */}
          {!user && (
            <div className="mb-6 p-4 bg-gradient-to-r from-[#3ecf8e]/10 to-[#2dd4bf]/10 border border-[#3ecf8e]/20 rounded-xl">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <ThumbsUp className="h-4 w-4 text-[#3ecf8e]" />
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
          <div className="bg-gradient-to-r from-[#3ecf8e] to-[#2dd4bf] text-white text-center py-3 rounded-xl font-semibold group-hover:from-[#2dd4bf] group-hover:to-[#3ecf8e] transition-all duration-200 shadow-md">
            Ver Detalles
          </div>
        </div>
      </div>

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
                  <span className="text-gray-500 text-2xl">×</span>
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-2">{negocio.name}</h4>
                <p className="text-sm text-gray-600">{negocio.description}</p>
              </div>

              <form onSubmit={handleReviewSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Calificación *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setUserRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= userRating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentario (opcional)
                  </label>
                  <textarea
                    value={reviewComment}
                    onChange={(e) => {
                      const value = e.target.value
                      console.log('Comment changed:', value, 'Length:', value.length) // Debug log
                      setReviewComment(value)
                      // Force re-render by updating state
                      setTimeout(() => {
                        if (e.target.value !== value) {
                          setReviewComment(e.target.value)
                        }
                      }, 0)
                    }}
                    onInput={(e) => {
                      const value = e.target.value
                      setReviewComment(value)
                    }}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-[#3ecf8e] focus:border-[#3ecf8e] outline-none resize-none transition-colors"
                    placeholder="Comparte tu experiencia con este negocio..."
                    name="reviewComment"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview || userRating === 0}
                    className="flex-1 px-4 py-3 bg-[#3ecf8e] text-white rounded-xl hover:bg-[#2dd4bf] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? 'Enviando...' : 'Enviar Reseña'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Link>
  )
}

export default Negocios
