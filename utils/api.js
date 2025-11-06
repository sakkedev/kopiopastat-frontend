const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'https://kopiopastat.org/api'
export { API_BASE }
import { getToken, clearToken } from './auth'

function getAuthHeaders() {
  const token = getToken()
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

function getCaptchaHeaders() {
  const captchaToken = typeof window !== 'undefined' ? localStorage.getItem('captcha_token') : null
  return captchaToken ? { 'X-Captcha': captchaToken } : {}
}

function getErrorMessage(errorData, res) {
  if (errorData.detail) {
    if (Array.isArray(errorData.detail)) {
      return errorData.detail.map(d => d.msg || JSON.stringify(d)).join(', ')
    } else {
      return errorData.detail
    }
  } else {
    return `Error ${res.status}: ${res.statusText}`
  }
}

export async function fetchBrowse(start, end) {
  const res = await fetch(`${API_BASE}/browse?start=${start}&end=${end}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  const data = await res.json()
  return data
}

export async function fetchEntry(id) {
  const res = await fetch(`${API_BASE}/pasta?id=${id}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function fetchRandom() {
  const res = await fetch(`${API_BASE}/random`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function fetchHistory(id) {
  const res = await fetch(`${API_BASE}/history?id=${id}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function fetchSearch(q) {
  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function fetchRecent(start, end) {
  const res = await fetch(`${API_BASE}/recent_edits?start=${start}&end=${end}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function fetchDataVersion() {
  const res = await fetch(`${API_BASE}/data_version`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function fetchCaptchaQuestion() {
  const res = await fetch(`${API_BASE}/captcha_question`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function postCaptchaAnswer(answer, index) {
  const res = await fetch(`${API_BASE}/captcha_answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer, index })
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  const data = await res.json()
  if (typeof window !== 'undefined') {
    localStorage.setItem('captcha_token', data.token)
  }
  return data
}

export async function fetchVerifyCaptcha() {
  const res = await fetch(`${API_BASE}/verify_captcha`, {
    headers: getCaptchaHeaders()
  })
  if (!res.ok) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('captcha_token')
    }
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function postEdit(id, content, title = null, foundInGoogle = null) {
  const body = { id, content }
  if (title !== null) body.title = title
  if (foundInGoogle !== null) body.found_in_google = foundInGoogle
  const res = await fetch(`${API_BASE}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(body)
  })
  if (res.status === 401) {
    clearToken()
    window.location.reload()
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function postNew(title, content, file = null, foundInGoogle = false) {
  const formData = new FormData()
  formData.append('title', title)
  formData.append('content', content)
  formData.append('found_in_google', foundInGoogle)
  if (file) {
    formData.append('filename', file.name)
    formData.append('file', file)
  }
  const headers = { ...getAuthHeaders(), ...getCaptchaHeaders() }
  const res = await fetch(`${API_BASE}/new`, {
    method: 'POST',
    headers,
    body: formData
  })
  if (res.status === 401) {
    clearToken()
    window.location.reload()
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function fetchGetByOrder(order) {
  const res = await fetch(`${API_BASE}/get_by_order?order=${order}`)
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function postLogin(code) {

  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  const data = await res.json()
  return data.token
}

export async function postLogout() {
  const res = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    headers: getAuthHeaders()
  })
  clearToken()
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res
}

export async function postDelete(id, timestamp) {
  const res = await fetch(`${API_BASE}/delete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ id, timestamp })
  })
  if (res.status === 401) {
    clearToken()
    window.location.reload()
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function postUploadImage(id, filename, file) {
  const formData = new FormData()
  formData.append('id', id)
  formData.append('filename', filename)
  formData.append('file', file)
  const headers = { ...getAuthHeaders(), ...getCaptchaHeaders() }
  const res = await fetch(`${API_BASE}/upload_image`, {
    method: 'POST',
    headers,
    body: formData
  })
  if (res.status === 401) {
    clearToken()
    window.location.reload()
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}

export async function postDeleteImage(id) {
  const res = await fetch(`${API_BASE}/delete_image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ id })
  })
  if (res.status === 401) {
    clearToken()
    window.location.reload()
  }
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}))
    const message = getErrorMessage(errorData, res)
    throw new Error(message)
  }
  return res.json()
}
