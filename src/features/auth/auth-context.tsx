import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, borrarToken, guardarToken, leerToken } from '@/lib/api'
import { conectarEcho, desconectarEcho } from '@/lib/echo'
import { queryClient } from '@/lib/query-client'
import type { Usuario } from '@/types'

const CLAVE_USUARIO = 'okd_usuario'

export interface RegistroPayload {
  nombre_comercial: string
  ruc: string
  name: string
  email: string
  password: string
  password_confirmation: string
}

interface ValorAuth {
  usuario: Usuario | null
  autenticado: boolean
  rol: string
  esAdmin: boolean
  puedeEliminar: boolean
  iniciarSesion: (email: string, password: string) => Promise<void>
  registrar: (datos: RegistroPayload) => Promise<void>
  cerrarSesion: () => void
  actualizarUsuario: (usuario: Usuario) => void
}

const AuthContext = createContext<ValorAuth | null>(null)

function usuarioGuardado(): Usuario | null {
  try {
    const dato = localStorage.getItem(CLAVE_USUARIO)

    return dato ? (JSON.parse(dato) as Usuario) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => (leerToken() ? usuarioGuardado() : null))

  const cerrarSesion = useCallback(() => {
    borrarToken()
    localStorage.removeItem(CLAVE_USUARIO)
    setUsuario(null)
    // Evita que el siguiente usuario en esta máquina vea caché de esta sesión
    queryClient.clear()
  }, [])

  // api.ts avisa si el token caducó en el servidor; aquí se limpia la sesión
  useEffect(() => {
    const manejar = () => cerrarSesion()
    window.addEventListener('okd:sesion-expirada', manejar)

    return () => window.removeEventListener('okd:sesion-expirada', manejar)
  }, [cerrarSesion])

  // El usuario queda cacheado en localStorage desde el login; esto lo refresca con lo
  // que haya en la BD (p. ej. si lo editaron desde "Usuarios" en vez de "Mi perfil").
  useEffect(() => {
    if (!leerToken()) return

    api<{ usuario: Usuario }>('/yo')
      .then(({ usuario: fresco }) => {
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(fresco))
        setUsuario(fresco)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (usuario) {
      conectarEcho()
    } else {
      desconectarEcho()
    }
  }, [usuario])

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const respuesta = await api<{ token: string; usuario: Usuario }>('/login', {
      method: 'POST',
      body: { email, password },
    })

    guardarToken(respuesta.token)
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario))
    setUsuario(respuesta.usuario)
  }, [])

  const actualizarUsuario = useCallback((actualizado: Usuario) => {
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(actualizado))
    setUsuario(actualizado)
  }, [])

  const registrar = useCallback(async (datos: RegistroPayload) => {
    const respuesta = await api<{ token: string; usuario: Usuario }>('/registro', {
      method: 'POST',
      body: datos,
    })

    guardarToken(respuesta.token)
    localStorage.setItem(CLAVE_USUARIO, JSON.stringify(respuesta.usuario))
    setUsuario(respuesta.usuario)
  }, [])

  const valor = useMemo<ValorAuth>(() => {
    const rol = usuario?.rol?.nombre ?? ''

    return {
      usuario,
      autenticado: Boolean(usuario),
      rol,
      esAdmin: rol === 'admin',
      puedeEliminar: rol === 'admin' || rol === 'abogado',
      iniciarSesion,
      registrar,
      cerrarSesion: () => {
        // si el logout en el backend falla, igual se cierra la sesión local
        api('/logout', { method: 'POST' }).catch(() => undefined)
        cerrarSesion()
      },
      actualizarUsuario,
    }
  }, [usuario, iniciarSesion, registrar, cerrarSesion, actualizarUsuario])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const contexto = useContext(AuthContext)

  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return contexto
}
