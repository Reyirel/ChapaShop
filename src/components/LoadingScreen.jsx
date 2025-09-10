import { Store } from 'lucide-react'

const LoadingScreen = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        {/* Logo animado */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-[#3ecf8e] to-[#2dd4bf] rounded-2xl flex items-center justify-center mx-auto animate-pulse">
            <Store className="h-8 w-8 text-white" />
          </div>
        </div>
        
        {/* Texto de carga */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ChapaShop</h2>
        <p className="text-gray-600 mb-8">Cargando tu experiencia...</p>
        
        {/* Spinner de carga */}
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ecf8e]"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
