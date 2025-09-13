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

// Function to get appropriate image for each category
const getCategoryImage = (categoryName) => {
  const categoryImages = {
    'Restaurante': 'https://i.pinimg.com/1200x/a1/34/22/a13422ec6437ea3b036875cd7880c65c.jpg', // Imagen personalizada de comida
    'Café': 'https://i.pinimg.com/1200x/a1/34/22/a13422ec6437ea3b036875cd7880c65c.jpg', // Imagen personalizada de comida
    'Tienda': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Imagen personalizada de tienda
    'Servicio': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Imagen personalizada de servicio
    'Entretenimiento': 'https://i.pinimg.com/1200x/2a/b7/d4/2ab7d413230af01e379488186e03a2fe.jpg', // Imagen personalizada de entretenimiento
    'Salud y Belleza': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Imagen personalizada de salud y belleza
    'Educación': 'https://i.pinimg.com/736x/6a/b0/4d/6ab04d7cee29ee80a53b84bc6ecd8d6d.jpg', // Imagen personalizada de educación
    'Transporte': 'https://i.pinimg.com/736x/c3/c4/03/c3c403673f9e4ab5ec3c5b5d6e0a1279.jpg', // Imagen personalizada de transporte
    'Librería': 'https://i.pinimg.com/736x/6a/b0/4d/6ab04d7cee29ee80a53b84bc6ecd8d6d.jpg', // Usar imagen de educación
    'Peluquería': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Bar': 'https://i.pinimg.com/1200x/a1/34/22/a13422ec6437ea3b036875cd7880c65c.jpg', // Usar imagen de comida
    'Hotel': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Gimnasio': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Consultoría': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Tecnología': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Arte': 'https://i.pinimg.com/1200x/2a/b7/d4/2ab7d413230af01e379488186e03a2fe.jpg', // Usar imagen de entretenimiento
    'Deporte': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Viajes': 'https://i.pinimg.com/736x/c3/c4/03/c3c403673f9e4ab5ec3c5b5d6e0a1279.jpg', // Usar imagen de transporte
    'Música': 'https://i.pinimg.com/1200x/2a/b7/d4/2ab7d413230af01e379488186e03a2fe.jpg', // Usar imagen de entretenimiento
    'Fotografía': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Farmacia': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Automotriz': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Construcción': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Inmobiliaria': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Financiero': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Legal': 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg', // Usar imagen de servicio
    'Veterinaria': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Florería': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Joyería': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Panadería': 'https://i.pinimg.com/1200x/a1/34/22/a13422ec6437ea3b036875cd7880c65c.jpg', // Usar imagen de comida
    'Supermercado': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Ropa': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Electrónicos': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Muebles': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Jardín': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Mascotas': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Libros': 'https://i.pinimg.com/736x/6a/b0/4d/6ab04d7cee29ee80a53b84bc6ecd8d6d.jpg', // Usar imagen de educación
    'Zapatos': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Juguetes': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Deportes': 'https://i.pinimg.com/736x/65/6e/f2/656ef2cb9e82a5c102e723bf997a4cb2.jpg', // Usar imagen de salud y belleza
    'Cocina': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg', // Usar imagen de tienda
    'Limpieza': 'https://i.pinimg.com/1200x/e6/43/8f/e6438f55e171e284e97d19f05704a990.jpg' // Usar imagen de tienda
  }
  
  return categoryImages[categoryName] || 'https://i.pinimg.com/1200x/96/90/8b/96908bfa7ba5e90d235f4bbf4ed85493.jpg' // Imagen por defecto de servicio
}

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
                        getCategoryImage(negocio.business_categories?.name || negocio.category || 'Servicio')
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
