import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError() {
    // Actualiza el state para mostrar la UI de error
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Ignora errores específicos de extensiones del navegador
    if (error.message && (
      error.message.includes('Extension context invalidated') ||
      error.message.includes('message channel closed') ||
      error.message.includes('listener indicated an asynchronous response')
    )) {
      console.warn('🔌 Browser extension error caught and ignored:', error.message)
      // Reset el estado de error para continuar
      this.setState({ hasError: false, error: null, errorInfo: null })
      return
    }

    console.error('💥 Error capturado por ErrorBoundary:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <div className="max-w-md mx-auto text-center p-8 bg-white rounded-xl shadow-sm border">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Oops! Algo salió mal
            </h2>
            <p className="text-gray-600 mb-6">
              Ha ocurrido un error inesperado. Por favor, recarga la página.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#3ecf8e] text-white px-6 py-3 rounded-lg hover:bg-[#2dd4bf] transition-colors font-semibold"
              >
                Recargar Página
              </button>
              <button
                onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Intentar de Nuevo
              </button>
            </div>
            
            {/* Mostrar detalles del error en modo desarrollo */}
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40 text-red-600">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
