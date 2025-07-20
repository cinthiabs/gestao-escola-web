const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5261/v1'

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('jwt_token')
  const headers = options.headers ? { ...options.headers } : {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  return fetch(url, { ...options, headers })
} 