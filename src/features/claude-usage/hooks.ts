import { useQuery } from '@tanstack/react-query'
import { claudeUsoApi } from './api'

export function useClaudeUso() {
  return useQuery({
    queryKey: ['claude-uso'],
    queryFn: claudeUsoApi.obtener,
    staleTime: 60_000,
  })
}
