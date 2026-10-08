import { useEffect } from 'react'
import { CheckCircle2, Download, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDescargarExportacion, useExportacion } from './hooks'

interface Props {
  uuid: string | null
  onCerrar: () => void
}

export function ProgresoExportacionModal({ uuid, onCerrar }: Props) {
  const { data: exportacion } = useExportacion(uuid ?? undefined)
  const descargar = useDescargarExportacion()

  const estado = exportacion?.estado ?? 'pendiente'
  const enProceso = estado === 'pendiente' || estado === 'procesando'

  // se descarga sola en cuanto el backend la deja lista
  useEffect(() => {
    if (uuid && estado === 'completado') descargar.mutate(uuid)
  }, [uuid, estado]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={Boolean(uuid)} onOpenChange={(abierto) => !abierto && !enProceso && onCerrar()}>
      <DialogContent
        className="max-w-sm"
        ocultarCierre={enProceso}
        onInteractOutside={(e) => enProceso && e.preventDefault()}
        onEscapeKeyDown={(e) => enProceso && e.preventDefault()}
      >
        <DialogHeader className="items-center text-center">
          {enProceso ? (
            <Loader2 className="size-10 animate-spin text-primary" />
          ) : estado === 'completado' ? (
            <CheckCircle2 className="size-10 text-success" />
          ) : (
            <XCircle className="size-10 text-destructive" />
          )}

          <DialogTitle>
            {enProceso ? 'Generando backup...' : estado === 'completado' ? 'Backup listo' : 'No se pudo generar'}
          </DialogTitle>
          <DialogDescription>
            {enProceso
              ? 'Estamos armando el ZIP con los documentos y el Excel. No cierres esta ventana.'
              : estado === 'completado'
                ? 'La descarga debería comenzar automáticamente.'
                : exportacion?.error_mensaje || 'Ocurrió un problema al generar el backup.'}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center">
          {estado === 'completado' ? (
            <Button type="button" onClick={() => uuid && descargar.mutate(uuid)} disabled={descargar.isPending}>
              {descargar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              Descargar de nuevo
            </Button>
          ) : null}
          {!enProceso ? (
            <Button type="button" variant="outline" onClick={onCerrar}>
              Cerrar
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
