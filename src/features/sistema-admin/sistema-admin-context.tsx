import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import {
  cerrarSesionSA,
  compuertaValidada,
  leerTokenSA,
  marcarCompuerta,
  sistemaAdminApi,
  superAdminGuardado,
  type SuperAdmin,
} from './api'

interface ValorSistemaAdmin {
  compuertaAbierta: boolean
  autenticado: boolean
  superAdmin: SuperAdmin | null
  abrirCompuerta: (clave: string) => Promise<void>
  iniciarSesion: (email: string, password: string) => Promise<void>
  cerrarSesion: () => void
}

const SistemaAdminContext = createContext<ValorSistemaAdmin | null>(null)

export function SistemaAdminProvider({ children }: { children: React.ReactNode }) {
  const [compuertaAbierta, setCompuertaAbierta] = useState(compuertaValidada)
  const [superAdmin, setSuperAdmin] = useState<SuperAdmin | null>(() => (leerTokenSA() ? superAdminGuardado() : null))

  const abrirCompuerta = useCallback(async (clave: string) => {
    await sistemaAdminApi.validarClave(clave)
    marcarCompuerta()
    setCompuertaAbierta(true)
  }, [])

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const usuario = await sistemaAdminApi.login(email, password)
    setSuperAdmin(usuario)
  }, [])

  const cerrarSesion = useCallback(() => {
    sistemaAdminApi.logout()
    cerrarSesionSA()
    setSuperAdmin(null)
    setCompuertaAbierta(false)
  }, [])

  const valor = useMemo<ValorSistemaAdmin>(
    () => ({
      compuertaAbierta,
      autenticado: Boolean(superAdmin),
      superAdmin,
      abrirCompuerta,
      iniciarSesion,
      cerrarSesion,
    }),
    [compuertaAbierta, superAdmin, abrirCompuerta, iniciarSesion, cerrarSesion],
  )

  return <SistemaAdminContext.Provider value={valor}>{children}</SistemaAdminContext.Provider>
}

export function useSistemaAdmin() {
  const contexto = useContext(SistemaAdminContext)

  if (!contexto) {
    throw new Error('useSistemaAdmin debe usarse dentro de SistemaAdminProvider')
  }

  return contexto
}
