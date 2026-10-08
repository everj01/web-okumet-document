import { api } from '@/lib/api'
import type { ClaudeUso } from '@/types'

export const claudeUsoApi = {
  obtener: () => api<ClaudeUso>('/claude-usage'),
}
