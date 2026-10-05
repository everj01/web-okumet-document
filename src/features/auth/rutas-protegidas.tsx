import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from './auth-context'

export function RutaPrivada() {
  const { autenticado } = useAuth()
  const ubicacion = useLocation()

  if (!autenticado) {
    return <Navigate to="/login" state={{ desde: ubicacion.pathname }} replace />
  }

  return <Outlet />
}

export function RutaSoloAdmin() {
  const { esAdmin } = useAuth()

  return esAdmin ? <Outlet /> : <Navigate to="/panel" replace />
}

export function RutaInvitado() {
  const { autenticado } = useAuth()

  return autenticado ? <Navigate to="/panel" replace /> : <Outlet />
}
