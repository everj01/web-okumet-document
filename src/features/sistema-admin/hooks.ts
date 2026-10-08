import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensajeDeError } from '@/lib/api'
import {
  sistemaAdminApi,
  type FiltroLogs,
  type FiltroRecurso,
  type NombreModuloReporte,
  type NombreRecurso,
  type ReportePayloadSA,
} from './api'

export function useRecursoSA<R extends NombreRecurso>(recurso: R, filtro: FiltroRecurso) {
  return useQuery({
    queryKey: ['sistema-admin', recurso, filtro],
    queryFn: () => sistemaAdminApi.listar(recurso, filtro),
    placeholderData: keepPreviousData,
  })
}

export function useDashboardSA() {
  return useQuery({
    queryKey: ['sistema-admin', 'dashboard'],
    queryFn: sistemaAdminApi.dashboard,
    staleTime: 60_000,
  })
}

export function useLogsSA(filtro: FiltroLogs) {
  return useQuery({
    queryKey: ['sistema-admin', 'logs', filtro],
    queryFn: () => sistemaAdminApi.logs(filtro),
    placeholderData: keepPreviousData,
  })
}

// snapshot con refresco corto: suficiente para "quién está en línea ahora mismo" sin un canal de presencia
export function useUsuariosEnLineaSA() {
  return useQuery({
    queryKey: ['sistema-admin', 'usuarios-en-linea'],
    queryFn: sistemaAdminApi.usuariosEnLinea,
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
  })
}

export function useColumnasReporteSA(modulo: NombreModuloReporte | null) {
  return useQuery({
    queryKey: ['sistema-admin', 'reportes', 'columnas', modulo],
    queryFn: () => sistemaAdminApi.columnasReporte(modulo!),
    enabled: Boolean(modulo),
    staleTime: Infinity,
  })
}

export function useCrearReporteSA() {
  return useMutation({
    mutationFn: (datos: ReportePayloadSA) => sistemaAdminApi.crearReporte(datos),
    onError: (error) => toast.error('No se pudo generar el reporte', { description: mensajeDeError(error) }),
  })
}

export function useReporteSA(uuid: string | undefined) {
  return useQuery({
    queryKey: ['sistema-admin', 'reportes', 'detalle', uuid ?? ''],
    queryFn: () => sistemaAdminApi.obtenerReporte(uuid!),
    enabled: Boolean(uuid),
    refetchInterval: (query) => {
      const estado = query.state.data?.estado
      return estado === 'completado' || estado === 'fallido' ? false : 3000
    },
    refetchIntervalInBackground: true,
  })
}

export function useDescargarReporteSA() {
  return useMutation({
    mutationFn: async (uuid: string) => {
      const blob = await sistemaAdminApi.descargarReporte(uuid)
      const url = URL.createObjectURL(blob)
      const enlace = document.createElement('a')
      enlace.href = url
      enlace.download = `reporte-${uuid}.xlsx`
      enlace.click()
      URL.revokeObjectURL(url)
    },
    onError: (error) => toast.error('No se pudo descargar el reporte', { description: mensajeDeError(error) }),
  })
}
