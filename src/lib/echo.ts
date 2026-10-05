import Echo from 'laravel-echo'
import Pusher from 'pusher-js'
import { leerToken } from './api'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

const BASE = import.meta.env.VITE_API_URL || '/api'

// /broadcasting/auth vive fuera del prefijo /api, a diferencia del resto de la API
const BASE_RAIZ = BASE.replace(/\/api\/?$/, '')

let echo: Echo<'reverb'> | null = null

// un solo socket por sesión (ver auth-context.tsx)
export function conectarEcho() {
  if (echo) return echo

  const token = leerToken()

  if (!token) return null

  window.Pusher = Pusher

  echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 8080),
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
    enabledTransports: ['ws', 'wss'],
    authEndpoint: `${BASE_RAIZ}/broadcasting/auth`,
    auth: { headers: { Authorization: `Bearer ${token}` } },
  })

  return echo
}

export function desconectarEcho() {
  echo?.disconnect()
  echo = null
}

export function obtenerEcho() {
  return echo
}
