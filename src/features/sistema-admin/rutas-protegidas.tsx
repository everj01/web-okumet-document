import { Navigate, Outlet } from 'react-router'
import { useSistemaAdmin } from './sistema-admin-context'

export function RutaCompuertaValidada() {
  const { compuertaAbierta } = useSistemaAdmin()

  return compuertaAbierta ? <Outlet /> : <Navigate to="/sistema_admin" replace />
}

export function RutaSuperAdmin() {
  const { autenticado, compuertaAbierta } = useSistemaAdmin()

  if (!compuertaAbierta) return <Navigate to="/sistema_admin" replace />
  if (!autenticado) return <Navigate to="/sistema_admin/login" replace />

  return <Outlet />
}
