import axios from 'axios'

// Shared Axios instance for calling this app's own /api routes from the browser.
// Same-origin requests send the httpOnly admin session cookie automatically.
export const http = axios.create({
  withCredentials: true,
  timeout: 30000,
  headers: { Accept: 'application/json' },
})

export const isHttpError = axios.isAxiosError

// The server's `{ error }` message for a failed request, else a fallback.
export function getErrorMessage(err: unknown, fallback = 'Request failed') {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: string; details?: string } | undefined
    return data?.details || data?.error || (err.response ? `${fallback} (${err.response.status})` : err.message) || fallback
  }
  return (err as Error)?.message || fallback
}
