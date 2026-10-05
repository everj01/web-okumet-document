import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { sistemaAdminApi, type FiltroRecurso, type NombreRecurso } from './api'

export function useRecursoSA<R extends NombreRecurso>(recurso: R, filtro: FiltroRecurso) {
  return useQuery({
    queryKey: ['sistema-admin', recurso, filtro],
    queryFn: () => sistemaAdminApi.listar(recurso, filtro),
    placeholderData: keepPreviousData,
  })
}
