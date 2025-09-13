import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import dbService from '../services/database'
import {
  Heart,
  MapPin,
  Star,
  Users,
  Store,
  ArrowLeft,
  Trash2
} from 'lucide-react'

const Favorites = () => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [removingIds, setRemovingIds] = useState(new Set())

  useEffect(() => {
    if (user) {
      fetchFavorites()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchFavorites = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userFavorites = await dbService.getUserFavorites(user.uid)
      setFavorites(userFavorites)
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (businessId) => {
    if (!user) return

    setRemovingIds(prev => new Set(prev).add(businessId))

    try {
      await dbService.removeFromFavorites(user.uid, businessId)
      setFavorites(prev => prev.filter(fav => fav.businessId !== businessId))
    } catch (error) {
      console.error('Error removing favorite:', error)
      alert('Error al quitar de favoritos. Inténtalo de nuevo.')
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(businessId)
        return newSet
      })
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Heart className="h-16 w-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Acceso Requerido
          </h2>
          <p className="text-gray-600 mb-6">
            Debes iniciar sesión para ver tus negocios favoritos
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#3ecf8e] text-white rounded-xl hover:bg-[#2dd4bf] transition-colors font-medium"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link
              to="/negocios"
              className="flex items-center gap-2 text-gray-600 hover:text-[#3ecf8e] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Volver a Negocios</span>
            </Link>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Heart className="h-8 w-8 text-red-500 fill-current" />
              <h1 className="text-3xl md:text-4xl font-bold text-[#3ecf8e]">
                Mis Favoritos
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tus negocios favoritos guardados para fácil acceso
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3ecf8e] mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Cargando tus favoritos...</p>
            </div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-20 w-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              No tienes favoritos aún
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Explora negocios y guarda tus favoritos para acceder rápidamente a ellos
            </p>
            <Link
              to="/negocios"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#3ecf8e] text-white rounded-xl hover:bg-[#2dd4bf] transition-colors font-medium"
            >
              <Store className="h-5 w-5" />
              Explorar Negocios
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const negocio = favorite.business
              if (!negocio) return null

              return (
                <div
                  key={favorite.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
                >
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

                    {/* Remove button */}
                    <div className="absolute top-4 right-4">
                      <button
                        onClick={() => handleRemoveFavorite(negocio.id)}
                        disabled={removingIds.has(negocio.id)}
                        className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                        title="Quitar de favoritos"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

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
                      <h3 className="text-xl font-bold text-gray-800 mb-2">
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

                    {/* Botón de acción */}
                    <Link
                      to={`/negocio/${negocio.id}`}
                      className="block bg-gradient-to-r from-[#3ecf8e] to-[#2dd4bf] text-white text-center py-3 rounded-xl font-semibold hover:from-[#2dd4bf] hover:to-[#3ecf8e] transition-all duration-200 shadow-md"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites
