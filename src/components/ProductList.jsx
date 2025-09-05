import { useState } from 'react'
import { Package, Plus, X } from 'lucide-react'

const ProductList = ({ onProductsChange, initialProducts = [] }) => {
  const [products, setProducts] = useState(initialProducts)
  const [newProduct, setNewProduct] = useState('')

  const addProduct = () => {
    if (newProduct.trim() && !products.includes(newProduct.trim())) {
      const updatedProducts = [...products, newProduct.trim()]
      setProducts(updatedProducts)
      onProductsChange(updatedProducts)
      setNewProduct('')
    }
  }

  const removeProduct = (index) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    setProducts(updatedProducts)
    onProductsChange(updatedProducts)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addProduct()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Package className="text-[#3ecf8e]" size={20} />
        <h3 className="text-lg font-bold text-white">
          Productos o Servicios 
          <span className="text-sm text-gray-400 font-normal ml-2">(Opcional)</span>
        </h3>
      </div>

      {/* Agregar nuevo producto */}
      <div className="flex gap-3">
        <input
          type="text"
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Nombre del producto o servicio"
          className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3ecf8e]/50 focus:border-[#3ecf8e]/50"
          maxLength={100}
        />
        <button
          type="button"
          onClick={addProduct}
          disabled={!newProduct.trim()}
          className="px-4 py-3 bg-gradient-to-r from-[#3ecf8e] to-[#2fb577] text-black rounded-xl hover:from-[#35d499] hover:to-[#28a866] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Agregar producto"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Lista de productos */}
      {products.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Productos agregados:</p>
          <div className="flex flex-wrap gap-2">
            {products.map((product, index) => (
              <div
                key={index}
                className="bg-gray-800/50 border border-gray-700/50 rounded-xl px-3 py-2 flex items-center gap-2 group hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-sm text-white">{product}</span>
                <button
                  type="button"
                  onClick={() => removeProduct(index)}
                  className="text-gray-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar producto"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {products.length === 0 && (
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6 text-center">
          <Package className="mx-auto text-gray-500 mb-3" size={32} />
          <p className="text-gray-400 text-sm">
            No has agregado productos aún. Puedes agregar los principales productos o servicios que ofreces.
          </p>
        </div>
      )}

      <div className="bg-blue-900/20 border border-blue-700/50 rounded-xl p-3">
        <p className="text-xs text-blue-300">
          💡 <strong>Tip:</strong> Agrega los principales productos o servicios que ofreces. Esto ayudará a los usuarios a encontrar tu negocio más fácilmente.
        </p>
      </div>
    </div>
  )
}

export default ProductList
