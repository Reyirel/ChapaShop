import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'

const NegocioDetail = () => {
  const { id } = useParams()
  const [negocio, setNegocio] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNegocio()
  }, [id])

  const fetchNegocio = async () => {
    try {
      // Aquí cargaremos el negocio específico desde Supabase
      // Por ahora mostraremos datos de ejemplo
      const negociosEjemplo = {
        1: { 
          id: 1, 
          nombre: 'Restaurante El Sabor', 
          categoria: 'Restaurante', 
          descripcion: 'El mejor restaurante de comida tradicional en la ciudad.',
          telefono: '+1234567890',
          direccion: 'Calle Principal 123',
          horario: 'Lunes a Domingo: 11:00 AM - 10:00 PM',
          imagen: 'https://via.placeholder.com/600x400'
        },
        2: { 
          id: 2, 
          nombre: 'Tienda de Ropa Fashion', 
          categoria: 'Moda', 
          descripcion: 'Las últimas tendencias en moda para toda la familia.',
          telefono: '+1234567891',
          direccion: 'Avenida Central 456',
          horario: 'Lunes a Sábado: 9:00 AM - 7:00 PM',
          imagen: 'https://via.placeholder.com/600x400'
        }
      }
      
      setNegocio(negociosEjemplo[id] || null)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching negocio:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Cargando negocio...</div>
      </div>
    )
  }

  if (!negocio) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Negocio no encontrado</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="w-full px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
          <img 
            src={negocio.imagen} 
            alt={negocio.nombre}
            className="w-full h-64 object-cover"
          />
          
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {negocio.nombre}
            </h1>
            
            <div className="mb-4">
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                {negocio.categoria}
              </span>
            </div>
            
            <p className="text-gray-600 mb-6">{negocio.descripcion}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Información de Contacto</h3>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Teléfono: </span>
                    <span>{negocio.telefono}</span>
                  </div>
                  <div>
                    <span className="font-medium">Dirección: </span>
                    <span>{negocio.direccion}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Horarios</h3>
                <p>{negocio.horario}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors mr-4">
                Contactar
              </button>
              <button className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors">
                Compartir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NegocioDetail
