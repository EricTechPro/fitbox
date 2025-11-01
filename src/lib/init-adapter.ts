import { setDataAdapter } from './data-adapter'
import { MockDataAdapter } from './mock-data/mock-adapter'
import { ApiDataAdapter } from './api-adapter'

// Initialize the data adapter based on environment
export function initializeDataAdapter() {
  // Use real API adapter in production, mock in development
  const useRealApi =
    process.env.NODE_ENV === 'production' ||
    process.env.NEXT_PUBLIC_USE_REAL_API === 'true'

  if (useRealApi) {
    console.log('🔌 Initializing API data adapter (real APIs)')
    setDataAdapter(new ApiDataAdapter())
  } else {
    console.log('🎭 Initializing mock data adapter (development mode)')
    setDataAdapter(new MockDataAdapter())
  }
}

// Auto-initialize for both client and server
initializeDataAdapter()
