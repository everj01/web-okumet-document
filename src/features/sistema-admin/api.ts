import { api, apiBlob } from '@/lib/api'
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
  fechaInicio?: string
  fechaFin?: string
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

export interface DashboardSA {
  crecimiento: { mes: string; tenants_nuevos: number; usuarios_nuevos: number }[]
  actividad_casos: { mes: string; expedientes_abiertos: number; expedientes_cerrados: number; documentos_subidos: number }[]
  uso_ia: { mes: string; llamadas: number }[]
  tenants_cerca_limite: { tenant: string; usado: number; limite: number }[]
  estado_negocios: { tenants_activos: number; tenants_inactivos: number }
  expedientes_por_estado: { estado: string; total: number }[]
}

export type AccionLog = 'login' | 'login_fallido' | 'logout' | 'creado' | 'actualizado' | 'eliminado' | 'exportacion' | 'reporte' | 'super_admin'
export type ModuloLog = 'auth' | 'clientes' | 'expedientes' | 'documentos' | 'usuarios' | 'eventos' | 'exportaciones' | 'reportes' | 'sistema_admin'

export interface LogAuditoria {
  id: number
  uuid: string
  actor_nombre: string
  actor_email: string | null
  tenant?: { id: number; nombre_comercial: string } | null
  accion: AccionLog
  modulo: ModuloLog
  descripcion: string
  ip: string | null
  creado_en: string
}

export interface FiltroLogs extends FiltroRecurso {
  accion?: AccionLog
  modulo?: ModuloLog
}

export interface UsuarioEnLinea {
  id: number
  name: string
  email: string
  tenant?: { id: number; nombre_comercial: string } | null
  rol?: string | null
  conectado_desde: string
}

export type NombreModuloReporte = 'tenants' | 'usuarios' | 'clientes' | 'expedientes' | 'eventos' | 'logs'

export interface ColumnaReporte {
  clave: string
  etiqueta: string
}

export type EstadoReporte = 'pendiente' | 'procesando' | 'completado' | 'fallido'

export interface ReporteSA {
  id: number
  uuid: string
  modulo: NombreModuloReporte
  estado: EstadoReporte
  total_filas: number
  error_mensaje: string | null
  creado_en: string
  completado_en: string | null
}

export interface ReportePayloadSA {
  modulo: NombreModuloReporte
  fecha_inicio: string | null
  fecha_fin: string | null
  columnas: string[]
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

  dashboard: () => api<DashboardSA>('/sistema-admin/dashboard', { token: leerTokenSA() }),

  listar: <R extends NombreRecurso>(recurso: R, filtro: FiltroRecurso) =>
    api<Paginado<RecursosSA[R]>>(`/sistema-admin/${recurso}`, {
      params: {
        page: filtro.pagina,
        buscar: filtro.buscar,
        orden: filtro.orden,
        direccion: filtro.direccion,
        fecha_inicio: filtro.fechaInicio,
        fecha_fin: filtro.fechaFin,
      },
      token: leerTokenSA(),
    }),

  logs: (filtro: FiltroLogs) =>
    api<Paginado<LogAuditoria>>('/sistema-admin/logs', {
      params: {
        page: filtro.pagina,
        buscar: filtro.buscar,
        orden: filtro.orden,
        direccion: filtro.direccion,
        fecha_inicio: filtro.fechaInicio,
        fecha_fin: filtro.fechaFin,
        accion: filtro.accion,
        modulo: filtro.modulo,
      },
      token: leerTokenSA(),
    }),

  usuariosEnLinea: () => api<UsuarioEnLinea[]>('/sistema-admin/usuarios-en-linea', { token: leerTokenSA() }),

  columnasReporte: (modulo: NombreModuloReporte) =>
    api<ColumnaReporte[]>(`/sistema-admin/reportes/${modulo}/columnas`, { token: leerTokenSA() }),

  crearReporte: (datos: ReportePayloadSA) =>
    api<{ data: ReporteSA }>('/sistema-admin/reportes', { method: 'POST', body: datos, token: leerTokenSA() }).then(
      (r) => r.data,
    ),

  obtenerReporte: (uuid: string) =>
    api<{ data: ReporteSA }>(`/sistema-admin/reportes/${uuid}`, { token: leerTokenSA() }).then((r) => r.data),

  descargarReporte: (uuid: string) => apiBlob(`/sistema-admin/reportes/${uuid}/descargar`, leerTokenSA()),
}
