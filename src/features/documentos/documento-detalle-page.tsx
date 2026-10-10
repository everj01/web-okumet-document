import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import {
  ArrowLeft,
  Download,
  FileWarning,
  Loader2,
  MessageCircleQuestion,
  ScanText,
  Send,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { AvisoIa } from '@/components/common/aviso-ia'
import { EstadoError, EstadoVacio } from '@/components/common/estados'
import { EtiquetaChip } from '@/components/common/etiqueta-chip'
import { PageHeader } from '@/components/common/page-header'
import { SelectorEtiquetas } from '@/components/common/selector-etiquetas'
import { useCatalogos } from '@/features/catalogos/use-catalogos'
import { useBlobUrl } from '@/hooks/use-blob-url'
import { ApiError, mensajeDeError } from '@/lib/api'
import { fechaCorta, pesoLegible } from '@/lib/formato'
import { ExtraccionDialogo } from './extraccion-dialogo'
import { useArchivo, useAsistente, useCrearEtiqueta, useDocumento, useSincronizarEtiquetasDocumento } from './hooks'

export default function DocumentoDetallePage() {
  const { uuid } = useParams()

  const { data: documento, isPending, error, refetch } = useDocumento(uuid)
  const { data: blob } = useArchivo(uuid)
  const urlArchivo = useBlobUrl(blob)
  const { resumen, preguntar } = useAsistente(uuid)
  const { data: catalogos } = useCatalogos()
  const sincronizarEtiquetas = useSincronizarEtiquetasDocumento(uuid ?? '')
  const crearEtiqueta = useCrearEtiqueta()

  const [pagina, setPagina] = useState<number | null>(null)
  const [pregunta, setPregunta] = useState('')
  const [extrayendo, setExtrayendo] = useState(false)

  const urlVisor = useMemo(
    () => (urlArchivo ? `${urlArchivo}#page=${pagina ?? 1}&view=FitH` : undefined),
    [urlArchivo, pagina],
  )

  if (error) {
    // Un 403 no se arregla reintentando: el abogado no tiene este expediente asignado.
    if (error instanceof ApiError && error.status === 403) {
      return (
        <EstadoVacio
          icono={ShieldAlert}
          titulo="No tienes acceso a este documento"
          descripcion={mensajeDeError(error)}
          accion={
            <Button variant="outline" size="sm" asChild>
              <Link to="/documentos">
                <ArrowLeft className="size-4" />
                Volver a Documentos
              </Link>
            </Button>
          }
        />
      )
    }

    return <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => refetch()} />
  }

  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-24" />
        <Skeleton className="h-[32rem]" />
      </div>
    )
  }

  const sinTexto = documento.paginas === 0
  const consultas = documento.consultas ?? []

  const descargar = () => {
    if (!urlArchivo) return

    const enlace = document.createElement('a')
    enlace.href = urlArchivo
    enlace.download = `${documento.nombre}.pdf`
    enlace.click()
  }

  const enviarPregunta = (evento: React.FormEvent) => {
    evento.preventDefault()

    const texto = pregunta.trim()

    if (texto.length < 5) return

    preguntar.mutate(texto, { onSuccess: () => setPregunta('') })
  }

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
        <Link to="/documentos">
          <ArrowLeft className="size-4" />
          Documentos
        </Link>
      </Button>

      <PageHeader
        titulo={documento.nombre}
        descripcion={
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>
              {documento.paginas || '—'} páginas · {pesoLegible(documento.tamano)} · {fechaCorta(documento.creado_en)}
            </span>
            {documento.expediente ? (
              <Link to={`/expedientes/${documento.expediente.uuid}`} className="hover:underline">
                {documento.expediente.codigo} — {documento.expediente.titulo}
              </Link>
            ) : null}
          </span>
        }
        acciones={
          <>
            <SelectorEtiquetas
              disponibles={catalogos?.etiquetas ?? []}
              seleccionadas={documento.etiquetas ?? []}
              guardando={sincronizarEtiquetas.isPending}
              onCambiar={(ids) => sincronizarEtiquetas.mutate(ids)}
              onCrear={(datos) => crearEtiqueta.mutateAsync(datos)}
            />
            <Button variant="outline" onClick={() => setExtrayendo(true)} disabled={sinTexto}>
              <ScanText className="size-4" />
              Datos detectados
            </Button>
            <Button variant="outline" onClick={descargar} disabled={!urlArchivo}>
              <Download className="size-4" />
              Descargar
            </Button>
          </>
        }
      />

      {documento.etiquetas?.length ? (
        <div className="flex flex-wrap gap-1.5">
          {documento.etiquetas.map((etiqueta) => (
            <EtiquetaChip
              key={etiqueta.id}
              etiqueta={etiqueta}
              onQuitar={() =>
                sincronizarEtiquetas.mutate(
                  (documento.etiquetas ?? []).filter((e) => e.id !== etiqueta.id).map((e) => e.id),
                )
              }
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-5">
        <Card className="aparecer overflow-hidden xl:col-span-3">
          <div className="h-[34rem] bg-muted">
            {urlVisor ? (
              <iframe src={urlVisor} title="Vista previa del documento" className="size-full" />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <p className="text-sm">Cargando el PDF...</p>
              </div>
            )}
          </div>
        </Card>

        <div className="space-y-5 xl:col-span-2">
          <Card className="aparecer">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-accent" />
                <h2 className="font-medium">Resumen</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={sinTexto || resumen.isPending}
                onClick={() => resumen.mutate()}
              >
                {resumen.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                {documento.resumen ? 'Regenerar' : 'Generar'}
              </Button>
            </div>

            <CardContent className="p-5">
              {sinTexto ? (
                <p className="flex items-start gap-2 text-sm text-muted-foreground">
                  <FileWarning className="mt-0.5 size-4 shrink-0" />
                  No se pudo leer el texto de este PDF. Puede ser un documento escaneado sin OCR.
                </p>
              ) : resumen.isPending ? (
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-11/12" />
                  <Skeleton className="h-3.5 w-9/12" />
                </div>
              ) : documento.resumen ? (
                <div className="space-y-3">
                  <AvisoIa />
                  <p className="text-sm whitespace-pre-line">{documento.resumen}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Genera un resumen para saber de qué trata el documento sin abrirlo completo.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="aparecer flex flex-col">
            <div className="space-y-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="font-medium">Preguntas sobre el documento</h2>
                <p className="text-sm text-muted-foreground">Las respuestas citan las páginas usadas.</p>
              </div>

              <form onSubmit={enviarPregunta} className="flex gap-2">
                <Input
                  value={pregunta}
                  onChange={(evento) => setPregunta(evento.target.value)}
                  placeholder="¿Qué monto se reclama?"
                  disabled={sinTexto}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={sinTexto || preguntar.isPending}
                  title="Preguntar"
                  aria-label="Preguntar"
                >
                  {preguntar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                </Button>
              </form>
            </div>

            <div className="max-h-[22rem] space-y-4 overflow-y-auto p-5">
              {consultas.length ? <AvisoIa /> : null}

              {preguntar.isPending ? (
                <div className="space-y-2 rounded-lg bg-secondary/60 p-4">
                  <Skeleton className="h-3.5 w-1/2" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-10/12" />
                </div>
              ) : null}

              {consultas.length ? (
                consultas.map((consulta) => (
                  <div key={consulta.id} className="aparecer space-y-2 rounded-lg bg-secondary/60 p-4">
                    <p className="text-sm font-medium">{consulta.pregunta}</p>
                    <p className="text-sm whitespace-pre-line text-muted-foreground">{consulta.respuesta}</p>

                    {consulta.paginas.length ? (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-xs text-muted-foreground">Páginas:</span>
                        {consulta.paginas.map((numero) => (
                          <button
                            key={numero}
                            type="button"
                            onClick={() => setPagina(numero)}
                            title={`Ver página ${numero}`}
                            className="rounded-full border border-border bg-card px-2 py-0.5 text-xs transition-colors hover:border-ring hover:bg-secondary"
                          >
                            {numero}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))
              ) : preguntar.isPending ? null : (
                <EstadoVacio
                  icono={MessageCircleQuestion}
                  titulo="Sin preguntas todavía"
                  descripcion="Pregunta en lenguaje natural y te respondemos con la página exacta."
                  className="py-8"
                />
              )}
            </div>

            {pagina ? (
              <div className="border-t border-border px-5 py-3">
                <Badge variant="info">Visor en la página {pagina}</Badge>
              </div>
            ) : null}
          </Card>
        </div>
      </div>

      {documento.expediente?.uuid ? (
        <ExtraccionDialogo
          abierto={extrayendo}
          onAbierto={setExtrayendo}
          documentoUuid={documento.uuid}
          expedienteUuid={documento.expediente.uuid}
        />
      ) : null}
    </div>
  )
}
