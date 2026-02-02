'use client'

export async function fetchClient(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers)

  headers.set('Accept', 'application/json')

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // remove this too if you don’t need cookies
  })

  if (!response.ok) {
    let message = 'Request failed'

    try {
      const error = await response.json()
      message = error?.message || message
    } catch {
      // ignore JSON parse errors
    }

    throw new Error(message)
  }

  return response
}
