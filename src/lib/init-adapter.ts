import { setDataAdapter } from './data-adapter'
import { MockDataAdapter } from './mock-data/mock-adapter'

// Initialize the data adapter with mock implementation
// In production, this would be replaced with the real API adapter
export function initializeDataAdapter() {
  setDataAdapter(new MockDataAdapter())
}

// Auto-initialize for both client and server
initializeDataAdapter()