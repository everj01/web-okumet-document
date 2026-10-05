import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensajeDeError } from '@/lib/api'
import type { Evento, EventoPayload } from '@/types'
import { eventosApi, eventosKeys, type FiltroEventos } from './api'

export function useEventos(filtro: FiltroEventos) {
  return useQuery({
    queryKey: eventosKeys.lista(filtro),
    queryFn: () => eventosApi.listar(filtro),
    placeholderData: keepPreviousData,
  })
}

function useRefrescarAgenda() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: ['eventos'] })
    queryClient.invalidateQueries({ queryKey: ['panel'] })
    queryClient.invalidateQueries({ queryKey: ['expedientes', 'detalle'] })
  }
}

export function useGuardarEvento(uuid?: string) {
  const refrescar = useRefrescarAgenda()

  return useMutation({
    mutationFn: (datos: EventoPayload) => (uuid ? eventosApi.actualizar(uuid, datos) : eventosApi.crear(datos)),
    onSuccess: (evento) => {
      refrescar()
      toast.success(uuid ? 'Fecha actualizada' : 'Fecha registrada', { description: evento.titulo })
    },
    onError: (error) => toast.error('No se pudo guardar', { description: mensajeDeError(error) }),
  })
}

export function useMarcarRealizado() {
  const refrescar = useRefrescarAgenda()

  return useMutation({
    mutationFn: (evento: Evento) =>
      eventosApi.actualizar(evento.uuid, {
        tipo: evento.tipo,
        titulo: evento.titulo,
        inicio: evento.inicio,
        fin: evento.fin,
        lugar: evento.lugar,
        notas: evento.notas,
        expediente_id: evento.expediente_id,
        responsable_id: evento.responsable_id,
        recordatorio_dias: evento.recordatorio_dias,
        estado: 'realizado',
      }),
    onSuccess: (evento) => {
      refrescar()
      toast.success('Marcada como realizada', { description: evento.titulo })
    },
    onError: (error) => toast.error('No se pudo actualizar', { description: mensajeDeError(error) }),
  })
}

export function useEliminarEvento() {
  const refrescar = useRefrescarAgenda()

  return useMutation({
    mutationFn: (uuid: string) => eventosApi.eliminar(uuid),
    onSuccess: () => {
      refrescar()
      toast.success('Fecha eliminada')
    },
    onError: (error) => toast.error('No se pudo eliminar', { description: mensajeDeError(error) }),
  })
}
