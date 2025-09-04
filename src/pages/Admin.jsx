import { useState, useEffect } from 'react'

const Admin = () => {
  const [usuarios, setUsuarios] = useState([])
  const [negocios, setNegocios] = useState([])
  const [activeTab, setActiveTab] = useState('usuarios')

  useEffect(() => {
    // Datos de ejemplo para la demostración
    setUsuarios([
      { id: 1, email: 'usuario1@example.com', created_at: '2024-01-15' },
      { id: 2, email: 'usuario2@example.com', created_at: '2024-01-20' },
    ])
    
    setNegocios([
      { id: 1, nombre: 'Restaurante El Sabor', categoria: 'Restaurante', activo: true },
      { id: 2, nombre: 'Tienda Fashion', categoria: 'Moda', activo: true },
    ])
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="w-full px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Panel de Administración
        </h1>
        
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('usuarios')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'usuarios'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Usuarios
              </button>
              <button
                onClick={() => setActiveTab('negocios')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'negocios'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Negocios
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'usuarios' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Registro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {usuario.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {usuario.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {usuario.created_at}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-red-600 hover:text-red-900">
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'negocios' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Gestión de Negocios</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {negocios.map((negocio) => (
                        <tr key={negocio.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {negocio.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {negocio.nombre}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {negocio.categoria}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              negocio.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {negocio.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button className="text-blue-600 hover:text-blue-900 mr-4">
                              Editar
                            </button>
                            <button className="text-red-600 hover:text-red-900">
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin
