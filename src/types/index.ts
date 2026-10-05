export interface Paginado<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface Rol {
  id: number
  nombre: string
  descripcion?: string | null
}

export interface Tenant {
  id: number
  uuid: string
  nombre_comercial: string
  razon_social: string | null
  ruc: string | null
  logo_url: string | null
  direccion: string | null
  telefono: string | null
  email: string | null
  activo: boolean
}

export type TenantPayload = Omit<Tenant, 'id' | 'uuid' | 'logo_url' | 'activo'>

export interface Usuario {
  id: number
  uuid: string
  name: string
  email: string
  telefono: string | null
  activo: boolean
  rol_id: number | null
  rol?: Rol
  tenant?: { id: number; uuid: string; nombre_comercial: string; logo_url: string | null } | null
  creado_en?: string
}

export interface UsuarioPayload {
  name: string
  email: string
  password?: string
  rol_id: number
  telefono: string | null
  activo: boolean
}

export type TipoPersona = 'natural' | 'juridica'
export type TipoDocumento = 'DNI' | 'RUC' | 'CE' | 'PASAPORTE'

export interface Cliente {
  id: number
  uuid: string
  tipo_persona: TipoPersona
  tipo_documento: TipoDocumento
  numero_documento: string
  nombre: string
  email: string | null
  telefono: string | null
  direccion: string | null
  notas: string | null
  activo: boolean
  expedientes_count?: number
  expedientes?: Expediente[]
  creado_en?: string
}

export type ClientePayload = Omit<Cliente, 'id' | 'uuid' | 'expedientes_count' | 'expedientes' | 'creado_en'>

export type EstadoExpediente = 'abierto' | 'en_tramite' | 'archivado' | 'cerrado'

export interface Movimiento {
  id: number
  uuid: string
  expediente_id: number
  fecha: string
  titulo: string
  detalle: string | null
  registrado_por?: string | null
}

export interface Expediente {
  id: number
  uuid: string
  codigo: string
  titulo: string
  materia: string | null
  juzgado: string | null
  estado: EstadoExpediente
  fecha_inicio: string
  fecha_cierre: string | null
  descripcion: string | null
  cliente_id: number
  abogado_id: number | null
  cliente?: { id: number; uuid: string; nombre: string; numero_documento: string; activo?: boolean }
  abogado?: { id: number | null; name: string | null }
  documentos_count?: number
  movimientos?: Movimiento[]
  documentos?: Documento[]
  eventos?: Evento[]
  creado_en?: string
}

export interface ExpedientePayload {
  codigo: string
  titulo: string
  cliente_id: number
  abogado_id: number | null
  materia: string | null
  juzgado: string | null
  estado: EstadoExpediente
  fecha_inicio: string
  fecha_cierre: string | null
  descripcion: string | null
}

export interface MovimientoPayload {
  fecha: string
  titulo: string
  detalle: string | null
}

export interface Consulta {
  id: number
  pregunta: string
  respuesta: string
  paginas: number[]
  usuario?: string | null
  creado_en?: string
}

export interface Documento {
  id: number
  uuid: string
  expediente_id: number
  nombre: string
  tamano: number
  paginas: number
  resumen: string | null
  expediente?: { id: number; uuid: string; codigo: string; titulo: string }
  subido_por?: string | null
  consultas?: Consulta[]
  creado_en?: string
}

export type TipoEvento = 'audiencia' | 'vencimiento' | 'reunion' | 'otro'
export type EstadoEvento = 'pendiente' | 'realizado' | 'cancelado'

export interface Evento {
  id: number
  uuid: string
  tipo: TipoEvento
  titulo: string
  inicio: string
  fin: string | null
  lugar: string | null
  notas: string | null
  estado: EstadoEvento
  recordatorio_dias: number
  expediente_id: number | null
  responsable_id: number | null
  expediente?: { id: number | null; uuid: string | null; codigo: string | null; titulo: string | null }
  responsable?: string | null
}

export interface EventoPayload {
  expediente_id: number | null
  responsable_id: number | null
  tipo: TipoEvento
  titulo: string
  inicio: string
  fin: string | null
  lugar: string | null
  notas: string | null
  recordatorio_dias: number
  estado: EstadoEvento
}

export interface Catalogos {
  roles: Rol[]
  responsables: { id: number; name: string }[]
  clientes: { id: number; nombre: string; numero_documento: string }[]
  expedientes: { id: number; codigo: string; titulo: string }[]
  estados_expediente: string[]
}

export interface ResumenPanel {
  contadores: {
    clientes: number
    expedientes_abiertos: number
    documentos: number
    eventos_pendientes: number
  }
  vencidos: Evento[]
  proximos_eventos: Evento[]
  expedientes_recientes: Expediente[]
}

export type ConfianzaExtraccion = 'alta' | 'media' | 'baja'

// Campos extraíbles de un PDF; cliente, abogado y estado son decisiones del estudio, no datos del documento
export type CampoExtraible = 'codigo' | 'titulo' | 'materia' | 'juzgado' | 'fecha_inicio'

export interface CampoExtraido {
  valor: string
  confianza: ConfianzaExtraccion
  pagina: number | null
}

export interface ParteExtraida {
  nombre: string
  rol: string
  pagina: number | null
}

export interface FechaClaveExtraida {
  fecha: string
  descripcion: string
  pagina: number | null
}

export interface Extraccion {
  documento_id: number
  // Solo trae las claves detectadas: un campo que no se encontró viene ausente.
  campos: Partial<Record<CampoExtraible, CampoExtraido>>
  partes: ParteExtraida[]
  fechas_clave: FechaClaveExtraida[]
  creado_en?: string
}
