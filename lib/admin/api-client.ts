import { getErrorMessage, http, isHttpError } from '@/lib/http'

type AdminRequest = { method?: string; body?: string | FormData; timeout?: number }

// Client-side helper for calling /api/admin/* routes (Axios).
// Redirects to the login page when the session has expired.
export async function adminFetch<T = any>(url: string, { method = 'GET', body, timeout }: AdminRequest = {}): Promise<T> {
  try {
    const res = await http.request<T>({
      url,
      method,
      data: body,
      timeout,
      // JSON bodies are passed pre-stringified; FormData sets its own multipart header
      headers: typeof body === 'string' ? { 'Content-Type': 'application/json' } : undefined,
    })
    return res.data
  } catch (err) {
    if (isHttpError(err) && err.response?.status === 401) {
      window.location.href = '/admin/login'
      throw new Error('Your session has expired. Please log in again.')
    }
    throw new Error(getErrorMessage(err))
  }
}

// Uploads a file to Cloudinary through the server.
export async function uploadAdminFile(file: File) {
  const form = new FormData()
  form.append('file', file)
  return adminFetch<{ fileName: string; publicUrl: string }>('/api/admin/media/upload', {
    method: 'POST',
    body: form,
    timeout: 0, // large videos can take a while
  })
}
