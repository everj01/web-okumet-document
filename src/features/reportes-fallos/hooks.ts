import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { mensajeDeError } from '@/lib/api'
import { reportesFallosApi, type ReporteFalloPayload } from './api'

export function useEnviarReporteFallo() {
  return useMutation({
    mutationFn: (datos: ReporteFalloPayload) => reportesFallosApi.enviar(datos),
    onSuccess: () => toast.success('Reporte enviado', { description: 'Gracias, soporte técnico lo va a revisar.' }),
    onError: (error) => toast.error('No se pudo enviar el reporte', { description: mensajeDeError(error) }),
  })
}
