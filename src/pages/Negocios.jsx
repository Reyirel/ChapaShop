import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../services/supabase'

const Negocios = () => {
  const [negocios, setNegocios] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNegocios()
  }, [])

  const fetchNegocios = async () => {
    try {
      // Aquí cargaremos los negocios desde Supabase
      // Por ahora mostraremos datos de ejemplo
      const negociosEjemplo = [
        { id: 1, nombre: 'Restaurante El Sabor', categoria: 'Restaurante', imagen: 'https://via.placeholder.com/300x200' },
        { id: 2, nombre: 'Tienda de Ropa Fashion', categoria: 'Moda', imagen: 'https://via.placeholder.com/300x200' },
        { id: 3, nombre: 'Cafetería Central', categoria: 'Café', imagen: 'https://via.placeholder.com/300x200' },
        { id: 4, nombre: 'Ferretería Los Tornillos', categoria: 'Ferretería', imagen: 'https://via.placeholder.com/300x200' },
      ]
      setNegocios(negociosEjemplo)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching negocios:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando negocios...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Negocios Disponibles
        </h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {negocios.map((negocio) => (
            <Link
              key={negocio.id}
              to={`/negocio/${negocio.id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img 
                src={negocio.imagen} 
                alt={negocio.nombre}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{negocio.nombre}</h3>
                <p className="text-gray-600">{negocio.categoria}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Negocios
