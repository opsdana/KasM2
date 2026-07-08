import { supabase } from '@/lib/supabase'

const FUNCTION_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

async function getToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

export async function callApi(endpoint, method = 'GET', body = null) {
  const url = `${FUNCTION_BASE}${endpoint}`
  const token = await getToken()
  const headers = {
    'Content-Type': 'application/json',
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const options = { method, headers }
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body)
  }

  const res = await fetch(url, options)

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(errData.error || `HTTP Error ${res.status}`)
  }

  const json = await res.json()

  if (!json.success) {
    throw new Error(json.error || 'Unknown API error')
  }

  return json.data
}

export async function callApiGet(endpoint, params = null) {
  let url = endpoint
  if (params) {
    const searchParams = new URLSearchParams(params)
    url += `?${searchParams.toString()}`
  }
  return callApi(url, 'GET')
}

export async function callApiPost(endpoint, body = null) {
  return callApi(endpoint, 'POST', body)
}

export async function callApiDelete(endpoint) {
  return callApi(endpoint, 'DELETE')
}
