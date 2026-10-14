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

export interface Configuracion {
  correos_cc: string[]
}

export interface DniResultado {
  numero_documento: string
  nombres: string
  apellido_paterno: string
  apellido_materno: string
  nombre_completo: string
}

export interface RucResultado {
  numero_documento: string
  razon_social: string
  nombre_comercial: string | null
  direccion: string | null
  estado: string | null
  condicion: string | null
  departamento: string | null
  provincia: string | null
  distrito: string | null
}

export interface Usuario {
  id: number
  uuid: string
  name: string
  email: string
  telefono: string | null
  dni: string | null
  colegiatura: string | null
  abogado_habilitado: boolean | null
  foto_url: string | null
  activo: boolean
  rol_id: number | null
  rol?: Rol
  tenant?: { id: number; uuid: string; nombre_comercial: string; logo_url: string | null } | null
  email_verificado: boolean
  creado_en?: string
}

export interface UsuarioPayload {
  name: string
  email: string
  password?: string
  rol_id: number
  telefono: string | null
  dni: string | null
  colegiatura: string | null
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
  anio: number
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
  anio: number
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

export interface Etiqueta {
  id: number
  uuid: string
  nombre: string
  color: string
}

export type EtiquetaPayload = Omit<Etiqueta, 'id' | 'uuid'>

export type EventoHistorialDocumento = 'subido_huerfano' | 'asignado_a_expediente'

export interface HistorialDocumento {
  id: number
  evento: EventoHistorialDocumento
  expediente?: { uuid: string; codigo: string; titulo: string } | null
  usuario?: string | null
  creado_en?: string
}

export interface Documento {
  id: number
  uuid: string
  // null = huérfano: todavía no está ligado a ningún expediente
  expediente_id: number | null
  nombre: string
  tamano: number
  paginas: number
  resumen: string | null
  expediente?: { id: number; uuid: string; codigo: string; titulo: string } | null
  subido_por?: string | null
  consultas?: Consulta[]
  etiquetas?: Etiqueta[]
  historial?: HistorialDocumento[]
  creado_en?: string
}

export type TipoEvento =
  | 'audiencia'
  | 'vencimiento'
  | 'reunion'
  | 'otro'
  | 'plazo_absolver'
  | 'plazo_apelar'
  | 'actuacion_prueba'
  | 'sentencia_1_instancia'
  | 'sentencia_2_instancia'
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
  tipos_evento: string[]
  etiquetas: Etiqueta[]
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
  numero_documento: string | null
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

// Igual que Extraccion pero del análisis de un PDF que todavía no se guardó como Documento
export type ExtraccionPrevia = Omit<Extraccion, 'documento_id' | 'creado_en'>

export interface ClaudeUso {
  usado: number
  limite: number
  restante: number
  advertencia: boolean
  periodo: string
}

// limite_mb y restante_mb son null cuando el tenant no tiene tope de almacenamiento configurado
export interface AlmacenamientoUso {
  usado_mb: number
  limite_mb: number | null
  restante_mb: number | null
}

export interface Notificacion {
  id: number
  uuid: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  creado_en: string
}

export interface ResumenNotificaciones {
  no_leidas: number
}

export type EstadoExportacion = 'pendiente' | 'procesando' | 'completado' | 'fallido'

export interface Exportacion {
  id: number
  uuid: string
  estado: EstadoExportacion
  total_expedientes: number
  error_mensaje: string | null
  creado_en: string
  completado_en: string | null
}

export interface ExportacionPayload {
  fecha_inicio: string | null
  fecha_fin: string | null
  expediente_ids: number[]
}
