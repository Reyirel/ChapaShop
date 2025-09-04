import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-black text-white p-4 w-full border-b border-gray-800">
      <div className="max-w-full px-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-[#3ecf8e] hover:text-white transition-colors">
          ChapaShop
        </Link>
        <div className="space-x-4">
          <Link to="/" className="hover:text-[#3ecf8e] transition-colors">
            Inicio
          </Link>
          <Link to="/negocios" className="hover:text-[#3ecf8e] transition-colors">
            Negocios
          </Link>
          <Link to="/login" className="hover:text-[#3ecf8e] transition-colors">
            Login
          </Link>
          <Link to="/register" className="hover:text-[#3ecf8e] transition-colors">
            Registro
          </Link>
          <Link to="/admin" className="hover:text-[#3ecf8e] transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
