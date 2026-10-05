import { api } from '@/lib/api'
import type { Cliente, Expediente, Evento, Paginado, Tenant, Usuario } from '@/types'

const CLAVE = 'okd_sa_gate'
const TOKEN = 'okd_sa_token'
const SUPER_ADMIN = 'okd_sa_usuario'

export interface SuperAdmin {
  id: number
  email: string
}

export function compuertaValidada() {
  return sessionStorage.getItem(CLAVE) === '1'
}

export function marcarCompuerta() {
  sessionStorage.setItem(CLAVE, '1')
}

export function leerTokenSA() {
  return localStorage.getItem(TOKEN)
}

function guardarTokenSA(token: string) {
  localStorage.setItem(TOKEN, token)
}

export function superAdminGuardado(): SuperAdmin | null {
  try {
    const dato = localStorage.getItem(SUPER_ADMIN)

    return dato ? (JSON.parse(dato) as SuperAdmin) : null
  } catch {
    return null
  }
}

export function cerrarSesionSA() {
  sessionStorage.removeItem(CLAVE)
  localStorage.removeItem(TOKEN)
  localStorage.removeItem(SUPER_ADMIN)
}

export interface FiltroRecurso {
  pagina: number
  buscar: string
  orden?: string
  direccion?: 'asc' | 'desc'
}

export type NombreRecurso = 'tenants' | 'usuarios' | 'clientes' | 'expedientes' | 'eventos'

interface FilaTenant extends Tenant {
  usuarios_count?: number
}
type FilaUsuario = Usuario
type FilaCliente = Cliente & { tenant?: { id: number; nombre_comercial: string } }
type FilaExpediente = Expediente & { tenant?: { id: number; nombre_comercial: string } }
type FilaEvento = Evento & { tenant?: { id: number; nombre_comercial: string } }

export interface RecursosSA {
  tenants: FilaTenant
  usuarios: FilaUsuario
  clientes: FilaCliente
  expedientes: FilaExpediente
  eventos: FilaEvento
}

export const sistemaAdminApi = {
  validarClave: (clave: string) => api<void>('/sistema-admin/clave', { method: 'POST', body: { clave } }),

  login: async (email: string, password: string) => {
    const respuesta = await api<{ token: string; usuario: SuperAdmin }>('/sistema-admin/login', {
      method: 'POST',
      body: { email, password },
    })

    guardarTokenSA(respuesta.token)
    localStorage.setItem(SUPER_ADMIN, JSON.stringify(respuesta.usuario))

    return respuesta.usuario
  },

  logout: () => api<void>('/sistema-admin/logout', { method: 'POST', token: leerTokenSA() }).catch(() => undefined),

  listar: <R extends NombreRecurso>(recurso: R, filtro: FiltroRecurso) =>
    api<Paginado<RecursosSA[R]>>(`/sistema-admin/${recurso}`, {
      params: { page: filtro.pagina, buscar: filtro.buscar, orden: filtro.orden, direccion: filtro.direccion },
      token: leerTokenSA(),
    }),
}
