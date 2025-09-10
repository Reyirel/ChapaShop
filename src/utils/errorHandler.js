// Utilidad para manejar errores de manera consistente en toda la aplicación

export const handleDatabaseError = (error, context = '') => {
  if (!error) return null;
  
  const errorMessage = error.message || 'Error desconocido';
  const errorCode = error.code || 'UNKNOWN';
  
  // Registrar el error sin bloquearlo
  console.warn(`⚠️ Database Error ${context ? `(${context})` : ''}:`, {
    message: errorMessage,
    code: errorCode,
    details: error
  });
  
  // Para errores comunes de conectividad, no los mostramos al usuario
  const connectivityErrors = [
    'Failed to fetch',
    'NetworkError',
    'TypeError: Failed to fetch',
    'Connection error',
    'Firebase: Error'
  ];
  
  if (connectivityErrors.some(err => errorMessage.includes(err))) {
    return {
      isConnectivityError: true,
      shouldShowToUser: false,
      message: 'Problema de conectividad. Usando datos de ejemplo.'
    };
  }
  
  return {
    isConnectivityError: false,
    shouldShowToUser: true,
    message: errorMessage,
    code: errorCode
  };
};

export const withFallback = async (databaseCall, fallbackData = null, context = '') => {
  try {
    const result = await databaseCall();
    return {
      data: result,
      error: null,
      fromFallback: false
    };
  } catch (error) {
    const handledError = handleDatabaseError(error, context);
    return {
      data: fallbackData,
      error: handledError,
      fromFallback: true
    };
  }
};

// Función para limpiar listeners y conexiones
export const cleanupConnections = () => {
  // Cancelar cualquier listener pendiente
  if (typeof window !== 'undefined') {
    // Limpiar timeouts y intervals si los hay
    const highestTimeoutId = setTimeout(() => {}, 0);
    for (let i = 0; i < highestTimeoutId; i++) {
      clearTimeout(i);
    }
    
    const highestIntervalId = setInterval(() => {}, 0);
    for (let i = 0; i < highestIntervalId; i++) {
      clearInterval(i);
    }
  }
};

// Hook para manejar errores de runtime
export const useErrorHandler = () => {
  const handleError = (error, context = '') => {
    console.error(`💥 Runtime Error ${context ? `(${context})` : ''}:`, error);
    
    // Evitar que errores de extensiones del navegador rompan la app
    if (error.message && error.message.includes('Extension context invalidated')) {
      console.warn('🔌 Browser extension error detected, ignoring...');
      return;
    }
    
    if (error.message && error.message.includes('message channel closed')) {
      console.warn('📡 Message channel error detected, ignoring...');
      return;
    }
    
    // Aquí podrías enviar errores a un servicio de monitoreo
    // como Sentry, LogRocket, etc.
  };
  
  return { handleError };
};
