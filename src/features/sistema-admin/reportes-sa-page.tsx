import { useEffect, useState } from 'react'
import { Check, CheckCircle2, Download, FileSpreadsheet, Loader2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Campo } from '@/components/common/campo'
import { useConfirmar } from '@/components/common/confirmar'
import { PageHeader } from '@/components/common/page-header'
import { cn } from '@/lib/utils'
import type { NombreModuloReporte } from './api'
import { useColumnasReporteSA, useCrearReporteSA, useDescargarReporteSA, useReporteSA } from './hooks'

const MODULOS: { valor: NombreModuloReporte; texto: string }[] = [
  { valor: 'tenants', texto: 'Negocios' },
  { valor: 'usuarios', texto: 'Usuarios' },
  { valor: 'clientes', texto: 'Clientes' },
  { valor: 'expedientes', texto: 'Expedientes' },
  { valor: 'eventos', texto: 'Agenda' },
  { valor: 'logs', texto: 'Auditoría' },
]

export default function ReportesSaPage() {
  const confirmar = useConfirmar()
  const [modulo, setModulo] = useState<NombreModuloReporte>('tenants')
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [columnas, setColumnas] = useState<Set<string>>(new Set())
  const [reporteUuid, setReporteUuid] = useState<string | null>(null)

  const { data: columnasDisponibles, isPending: cargandoColumnas } = useColumnasReporteSA(modulo)
  const crear = useCrearReporteSA()
  const { data: reporte } = useReporteSA(reporteUuid ?? undefined)
  const descargar = useDescargarReporteSA()

  useEffect(() => {
    setColumnas(new Set((columnasDisponibles ?? []).map((c) => c.clave)))
  }, [columnasDisponibles])

  const alternar = (clave: string) => {
    setColumnas((actual) => {
      const siguiente = new Set(actual)
      if (siguiente.has(clave)) siguiente.delete(clave)
      else siguiente.add(clave)
      return siguiente
    })
  }

  const estado = reporte?.estado
  const enProceso = Boolean(reporteUuid) && (estado === 'pendiente' || estado === 'procesando' || !estado)

  useEffect(() => {
    if (reporteUuid && estado === 'completado') descargar.mutate(reporteUuid)
  }, [reporteUuid, estado]) // eslint-disable-line react-hooks/exhaustive-deps

  const generar = async () => {
    if (!columnas.size) return

    const continuar = await confirmar({
      titulo: 'Generar reporte',
      descripcion: 'La generación puede tardar según la cantidad de información. El Excel se descargará automáticamente al terminar.',
      confirmar: 'Generar',
    })
    if (!continuar) return

    crear.mutate(
      { modulo, fecha_inicio: fechaInicio || null, fecha_fin: fechaFin || null, columnas: Array.from(columnas) },
      { onSuccess: (r) => setReporteUuid(r.uuid) },
    )
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader titulo="Reportes" descripcion="Exporta un Excel simple con la información de un módulo." />

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <Campo etiqueta="Módulo">
              <Select value={modulo} onValueChange={(v) => setModulo(v as NombreModuloReporte)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MODULOS.map((m) => (
                    <SelectItem key={m.valor} value={m.valor}>
                      {m.texto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>
            <Campo etiqueta="Desde">
              <Input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </Campo>
            <Campo etiqueta="Hasta">
              <Input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </Campo>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Columnas a incluir</p>
            {cargandoColumnas ? (
              <p className="text-sm text-muted-foreground">Cargando columnas disponibles...</p>
            ) : (
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
                {(columnasDisponibles ?? []).map((columna) => {
                  const marcado = columnas.has(columna.clave)

                  return (
                    <button
                      key={columna.clave}
                      type="button"
                      onClick={() => alternar(columna.clave)}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-secondary"
                    >
                      <span
                        className={cn(
                          'grid size-4 shrink-0 place-items-center rounded border border-border',
                          marcado && 'border-primary bg-primary text-primary-foreground',
                        )}
                      >
                        {marcado ? <Check className="size-3" /> : null}
                      </span>
                      {columna.etiqueta}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end border-t border-border pt-4">
            <Button type="button" disabled={!columnas.size || crear.isPending} onClick={generar}>
              {crear.isPending ? <Loader2 className="size-4 animate-spin" /> : <FileSpreadsheet className="size-4" />}
              Generar reporte
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={Boolean(reporteUuid)} onOpenChange={(abierto) => !abierto && !enProceso && setReporteUuid(null)}>
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
              {enProceso ? 'Generando reporte...' : estado === 'completado' ? 'Reporte listo' : 'No se pudo generar'}
            </DialogTitle>
            <DialogDescription>
              {enProceso
                ? 'Estamos armando el Excel. No cierres esta ventana.'
                : estado === 'completado'
                  ? 'La descarga debería comenzar automáticamente.'
                  : reporte?.error_mensaje || 'Ocurrió un problema al generar el reporte.'}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-center">
            {estado === 'completado' ? (
              <Button type="button" onClick={() => reporteUuid && descargar.mutate(reporteUuid)} disabled={descargar.isPending}>
                {descargar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                Descargar de nuevo
              </Button>
            ) : null}
            {!enProceso ? (
              <Button type="button" variant="outline" onClick={() => setReporteUuid(null)}>
                Cerrar
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
