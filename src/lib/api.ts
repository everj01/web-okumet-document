const BASE = import.meta.env.VITE_API_URL || '/api'
const TOKEN = 'okd_token'

export class ApiError extends Error {
  status: number
  errores: Record<string, string[]>
  code?: string

  constructor(message: string, status: number, errores: Record<string, string[]> = {}, code?: string) {
    super(message)
    this.status = status
    this.errores = errores
    this.code = code
  }
}

export function leerToken() {
  return localStorage.getItem(TOKEN)
}

export function guardarToken(token: string) {
  localStorage.setItem(TOKEN, token)
}

export function borrarToken() {
  localStorage.removeItem(TOKEN)
}

type Opciones = Omit<RequestInit, 'body'> & {
  body?: unknown
  params?: Record<string, unknown>
  // para sesiones separadas (ej. sistema-admin); omitir usa el token de siempre
  token?: string | null
}

export async function api<T>(
  ruta: string,
  { body, params, headers, token: tokenPersonalizado, ...resto }: Opciones = {},
): Promise<T> {
  const url = new URL(`${BASE}${ruta}`, window.location.origin)

  for (const [clave, valor] of Object.entries(params ?? {})) {
    if (valor !== null && valor !== undefined && valor !== '') {
      url.searchParams.set(clave, String(valor))
    }
  }

  const esFormData = body instanceof FormData
  const esTokenPersonalizado = tokenPersonalizado !== undefined
  const token = esTokenPersonalizado ? tokenPersonalizado : leerToken()

  const respuesta = await fetch(url.toString().replace(window.location.origin, ''), {
    ...resto,
    headers: {
      Accept: 'application/json',
      ...(esFormData ? {} : body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: esFormData ? body : body ? JSON.stringify(body) : undefined,
  })

  // la sesión de sistema-admin es independiente: su 401 no debe cerrar la sesión normal
  if (respuesta.status === 401 && token && !esTokenPersonalizado) {
    borrarToken()
    window.dispatchEvent(new CustomEvent('okd:sesion-expirada'))
  }

  if (respuesta.status === 204) {
    return undefined as T
  }

  const tipo = respuesta.headers.get('content-type') ?? ''

  if (!respuesta.ok) {
    const datos = tipo.includes('json') ? await respuesta.json().catch(() => null) : null
    const errores: Record<string, string[]> = datos?.errors ?? {}
    const primero = Object.values(errores).flat()[0]

    throw new ApiError(
      primero ?? datos?.message ?? mensajePorEstado(respuesta.status),
      respuesta.status,
      errores,
      datos?.code,
    )
  }

  return tipo.includes('json') ? ((await respuesta.json()) as T) : (undefined as T)
}

// el archivo necesita el token, así que se descarga como blob
export async function apiBlob(ruta: string, tokenPersonalizado?: string | null): Promise<Blob> {
  const token = tokenPersonalizado !== undefined ? tokenPersonalizado : leerToken()

  const respuesta = await fetch(`${BASE}${ruta}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!respuesta.ok) {
    throw new ApiError(mensajePorEstado(respuesta.status), respuesta.status)
  }

  return respuesta.blob()
}

function mensajePorEstado(estado: number) {
  if (estado === 403) return 'No tienes permiso para realizar esta acción.'
  if (estado === 404) return 'No encontramos lo que buscabas.'
  if (estado >= 500) return 'El servidor tuvo un problema. Inténtalo de nuevo.'

  return 'No se pudo completar la operación.'
}

export function esLimiteClaudeExcedido(error: unknown) {
  return error instanceof ApiError && error.code === 'claude_limit_exceeded'
}

export function mensajeDeError(error: unknown, porDefecto = 'Ocurrió un error inesperado.') {
  if (error instanceof ApiError) return error.message
  if (error instanceof TypeError) return 'No se pudo conectar con el servidor.'

  return porDefecto
}
