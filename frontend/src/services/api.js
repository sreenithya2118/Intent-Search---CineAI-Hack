import axios from 'axios'

// In dev, use Vite proxy (/api -> localhost:8000) to avoid CORS. In prod, use full URL.
const API_BASE_URL = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'http://localhost:8000')

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const videoAPI = {
  // Process video from YouTube URL
  processVideo: async (url) => {
    const response = await api.post('/process-video', { url })
    return response.data
  },

  // Process multiple uploaded video clips (use axios directly - api instance has Content-Type: application/json which breaks FormData)
  processClips: async (files) => {
    const formData = new FormData()
    for (const file of files) {
      formData.append('files', file)
    }
    const response = await axios.post(`${API_BASE_URL}/process-clips`, formData)
    return response.data
  },

  // Get processing status
  getStatus: async () => {
    const response = await api.get('/process-status')
    return response.data
  },

  // Get list of uploaded source clips for display
  getSourceClips: async () => {
    const response = await api.get('/source-clips-list')
    return response.data
  },

  // Basic search
  basicSearch: async (query) => {
    const response = await api.post(`/intent-search?query=${encodeURIComponent(query)}`)
    return response.data
  },

  // RAG search
  ragSearch: async (query) => {
    const response = await api.post(`/rag-search?query=${encodeURIComponent(query)}`)
    return response.data
  },

  // Audio-only search
  audioSearch: async (query) => {
    const response = await api.post(`/audio-search?query=${encodeURIComponent(query)}`)
    return response.data
  },
}

export const productionAPI = {
  // Generate production plan
  generatePlan: async (script, budget) => {
    const response = await api.post('/production-plan', { script, budget })
    return response.data
  },
}

export default api

