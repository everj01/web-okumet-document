import { keepPreviousData, useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { esLimiteClaudeExcedido, mensajeDeError } from '@/lib/api'
import type { Documento, EtiquetaPayload } from '@/types'
import { documentosApi, documentosKeys, etiquetasApi, type FiltroDocumentos } from './api'

// al tope de llamadas a Claude, refresca el indicador de uso para que se vea bloqueado de inmediato
function onErrorIa(error: unknown, queryClient: QueryClient) {
  if (esLimiteClaudeExcedido(error)) queryClient.invalidateQueries({ queryKey: ['claude-uso'] })
}

export function useDocumentos(filtro: FiltroDocumentos) {
  return useQuery({
    queryKey: documentosKeys.lista(filtro),
    queryFn: () => documentosApi.listar(filtro),
    placeholderData: keepPreviousData,
  })
}

export function useDocumento(uuid: string | undefined) {
  return useQuery({
    queryKey: documentosKeys.detalle(uuid ?? ''),
    queryFn: () => documentosApi.obtener(uuid!),
    enabled: Boolean(uuid),
  })
}

// El PDF se guarda en caché para no volver a descargarlo al regresar a la vista.
export function useArchivo(uuid: string | undefined) {
  return useQuery({
    queryKey: documentosKeys.archivo(uuid ?? ''),
    queryFn: () => documentosApi.archivo(uuid!),
    enabled: Boolean(uuid),
    staleTime: 10 * 60_000,
  })
}

export function useSubirDocumento(expedienteUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ archivo, nombre }: { archivo: File; nombre: string }) =>
      documentosApi.subir(expedienteUuid, archivo, nombre),
    onSuccess: (documento: Documento) => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      queryClient.invalidateQueries({ queryKey: ['expedientes', 'detalle'] })
      queryClient.invalidateQueries({ queryKey: ['almacenamiento-uso'] })
      toast.success('Documento subido', {
        description: documento.paginas
          ? `Se leyeron ${documento.paginas} páginas.`
          : 'No se pudo leer el texto: puede ser un PDF escaneado.',
      })
    },
    onError: (error) => toast.error('No se pudo subir', { description: mensajeDeError(error) }),
  })
}

export function useSubirDocumentosSinExpediente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (archivos: File[]) => documentosApi.subirSinExpediente(archivos),
    onSuccess: (documentos: Documento[]) => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      queryClient.invalidateQueries({ queryKey: ['almacenamiento-uso'] })
      toast.success(
        documentos.length === 1 ? 'Documento subido' : `${documentos.length} documentos subidos`,
        { description: 'Sin expediente todavía: usa "Agregar expediente IA" para completarlos.' },
      )
    },
    onError: (error) => toast.error('No se pudo subir', { description: mensajeDeError(error) }),
  })
}

export function useAsignarExpediente() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ uuid, expedienteId }: { uuid: string; expedienteId: number }) =>
      documentosApi.asignarExpediente(uuid, expedienteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      queryClient.invalidateQueries({ queryKey: ['expedientes'] })
    },
    onError: (error) => toast.error('No se pudo asignar el expediente', { description: mensajeDeError(error) }),
  })
}

export function useEliminarDocumento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => documentosApi.eliminar(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      queryClient.invalidateQueries({ queryKey: ['expedientes'] })
      queryClient.invalidateQueries({ queryKey: ['almacenamiento-uso'] })
      toast.success('Documento eliminado')
    },
    onError: (error) => toast.error('No se pudo eliminar', { description: mensajeDeError(error) }),
  })
}

export function useAsistente(documentoUuid: string | undefined) {
  const queryClient = useQueryClient()
  const clave = documentoUuid ?? ''

  const resumen = useMutation({
    mutationFn: () => documentosApi.resumen(documentoUuid!),
    onSuccess: (texto) => {
      queryClient.setQueryData(documentosKeys.detalle(clave), (actual?: Documento) =>
        actual ? { ...actual, resumen: texto } : actual,
      )
    },
    onError: (error) => {
      toast.error('No se pudo generar el resumen', { description: mensajeDeError(error) })
      onErrorIa(error, queryClient)
    },
  })

  const preguntar = useMutation({
    mutationFn: (pregunta: string) => documentosApi.preguntar(documentoUuid!, pregunta),
    onSuccess: (consulta) => {
      queryClient.setQueryData(documentosKeys.detalle(clave), (actual?: Documento) =>
        actual ? { ...actual, consultas: [consulta, ...(actual.consultas ?? [])] } : actual,
      )
    },
    onError: (error) => {
      toast.error('No se pudo consultar', { description: mensajeDeError(error) })
      onErrorIa(error, queryClient)
    },
  })

  return { resumen, preguntar }
}

export function useExtraccionPrevia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (archivo: File) => documentosApi.extraerPrevia(archivo),
    onError: (error) => {
      toast.error('No se pudo analizar el PDF', { description: mensajeDeError(error) })
      onErrorIa(error, queryClient)
    },
  })
}

export function useSincronizarEtiquetasDocumento(documentoUuid: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (etiquetaIds: number[]) => documentosApi.sincronizarEtiquetas(documentoUuid, etiquetaIds),
    onSuccess: (documento) => {
      queryClient.setQueryData(documentosKeys.detalle(documentoUuid), documento)
      queryClient.invalidateQueries({ queryKey: ['documentos', 'lista'] })
    },
    onError: (error) => toast.error('No se pudieron guardar las etiquetas', { description: mensajeDeError(error) }),
  })
}

export function useCrearEtiqueta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (datos: EtiquetaPayload) => etiquetasApi.crear(datos),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogos'] })
      toast.success('Etiqueta creada')
    },
    onError: (error) => toast.error('No se pudo crear la etiqueta', { description: mensajeDeError(error) }),
  })
}

export function useEliminarEtiqueta() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (uuid: string) => etiquetasApi.eliminar(uuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogos'] })
      queryClient.invalidateQueries({ queryKey: ['documentos'] })
      toast.success('Etiqueta eliminada')
    },
    onError: (error) => toast.error('No se pudo eliminar la etiqueta', { description: mensajeDeError(error) }),
  })
}

// llamada costosa: solo corre con el diálogo abierto y nunca se revalida sola (staleTime: Infinity)
export function useExtraccion(documentoUuid: string, activo: boolean) {
  const queryClient = useQueryClient()

  const consulta = useQuery({
    queryKey: documentosKeys.extraccion(documentoUuid),
    queryFn: () => documentosApi.extraccion(documentoUuid),
    enabled: activo && Boolean(documentoUuid),
    staleTime: Infinity,
    retry: false,
  })

  const regenerar = useMutation({
    mutationFn: () => documentosApi.extraccion(documentoUuid, true),
    onSuccess: (datos) => queryClient.setQueryData(documentosKeys.extraccion(documentoUuid), datos),
    onError: (error) => {
      toast.error('No se pudo volver a analizar', { description: mensajeDeError(error) })
      onErrorIa(error, queryClient)
    },
  })

  return { consulta, regenerar }
}
