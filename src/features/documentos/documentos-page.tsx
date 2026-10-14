import { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight, FileText, Sparkles, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Buscador } from '@/components/common/buscador'
import { DataTable, type Columna } from '@/components/common/data-table'
import { EtiquetaChip } from '@/components/common/etiqueta-chip'
import { PageHeader } from '@/components/common/page-header'
import { useCatalogos } from '@/features/catalogos/use-catalogos'
import { useDebounce } from '@/hooks/use-debounce'
import { mensajeDeError } from '@/lib/api'
import { fechaCorta, pesoLegible } from '@/lib/formato'
import type { Documento } from '@/types'
import { AsignarExpedienteModal } from './asignar-expediente-modal'
import { documentosApi, documentosKeys } from './api'
import { useDocumentos, useSubirDocumentosSinExpediente } from './hooks'

const TODAS = 'todas'

export default function DocumentosPage() {
  const queryClient = useQueryClient()
  const { data: catalogos } = useCatalogos()
  const [buscar, setBuscar] = useState('')
  const [etiquetaId, setEtiquetaId] = useState<string>(TODAS)
  const [pagina, setPagina] = useState(1)
  const [soloHuerfanos, setSoloHuerfanos] = useState(false)
  const [seleccionados, setSeleccionados] = useState<Documento[]>([])
  const [modalAbierto, setModalAbierto] = useState(false)
  const inputArchivos = useRef<HTMLInputElement>(null)
  const subirSinExpediente = useSubirDocumentosSinExpediente()

  const busqueda = useDebounce(buscar)
  const filtro = useMemo(
    () => ({
      pagina,
      buscar: busqueda,
      etiquetaId: etiquetaId === TODAS ? null : Number(etiquetaId),
      soloHuerfanos,
    }),
    [pagina, busqueda, etiquetaId, soloHuerfanos],
  )
  const { data, isPending, isFetching, error, refetch } = useDocumentos(filtro)

  const alternarSeleccion = (documento: Documento, marcado: boolean) => {
    setSeleccionados((actual) =>
      marcado ? [...actual, documento] : actual.filter((d) => d.id !== documento.id),
    )
  }

  const subirArchivos = (lista: FileList | null) => {
    if (!lista || !lista.length) return

    subirSinExpediente.mutate(Array.from(lista))
    if (inputArchivos.current) inputArchivos.current.value = ''
  }

  const columnas: Columna<Documento>[] = [
    {
      id: 'seleccion',
      encabezado: '',
      className: 'w-10',
      celda: (documento) =>
        documento.expediente_id === null ? (
          <input
            type="checkbox"
            className="size-4 rounded border-border accent-primary"
            checked={seleccionados.some((d) => d.id === documento.id)}
            onChange={(evento) => alternarSeleccion(documento, evento.target.checked)}
            aria-label={`Seleccionar ${documento.nombre}`}
          />
        ) : null,
    },
    {
      id: 'nombre',
      encabezado: 'Documento',
      celda: (documento) => (
        <div className="flex min-w-0 items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
            <FileText className="size-4" />
          </div>
          <div className="min-w-0">
            <Link to={`/documentos/${documento.uuid}`} className="font-medium hover:underline">
              {documento.nombre}
            </Link>
            <div className="mt-1 flex flex-wrap items-center gap-1">
              {documento.resumen ? (
                <Badge variant="success">
                  <Sparkles />
                  Resumen listo
                </Badge>
              ) : null}
              {documento.etiquetas?.map((etiqueta) => <EtiquetaChip key={etiqueta.id} etiqueta={etiqueta} />)}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'expediente',
      encabezado: 'Expediente',
      desde: 'md',
      celda: (documento) =>
        documento.expediente ? (
          <Link to={`/expedientes/${documento.expediente.uuid}`} className="hover:underline">
            {documento.expediente.codigo}
          </Link>
        ) : (
          <Badge variant="warning">Huérfano</Badge>
        ),
    },
    {
      id: 'paginas',
      encabezado: 'Páginas',
      desde: 'sm',
      className: 'text-center',
      celda: (documento) => <span className="tabular-nums">{documento.paginas || '—'}</span>,
    },
    {
      id: 'peso',
      encabezado: 'Peso',
      desde: 'sm',
      className: 'text-center',
      celda: (documento) => pesoLegible(documento.tamano),
    },
    {
      id: 'fecha',
      encabezado: 'Subido',
      desde: 'lg',
      celda: (documento) => fechaCorta(documento.creado_en),
    },
    {
      id: 'acciones',
      encabezado: '',
      className: 'w-auto text-right',
      celda: (documento) => (
        <div className="flex items-center justify-end gap-1">
          {documento.expediente_id === null ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSeleccionados([documento])
                setModalAbierto(true)
              }}
            >
              <Sparkles className="size-3.5" />
              Agregar expediente IA
            </Button>
          ) : null}
          <Button variant="ghost" size="icon-sm" asChild title="Abrir documento" aria-label="Abrir documento">
            <Link to={`/documentos/${documento.uuid}`}>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Documentos"
        descripcion="Busca por nombre o por lo que dice el PDF por dentro."
        acciones={
          <>
            <input
              ref={inputArchivos}
              type="file"
              accept="application/pdf"
              multiple
              className="sr-only"
              onChange={(evento) => subirArchivos(evento.target.files)}
            />
            <Button
              variant="outline"
              disabled={subirSinExpediente.isPending}
              onClick={() => inputArchivos.current?.click()}
            >
              <Upload className="size-4" />
              Subir documentos
            </Button>
            {seleccionados.length ? (
              <Button onClick={() => setModalAbierto(true)}>
                <Sparkles className="size-4" />
                Agregar expediente IA ({seleccionados.length})
              </Button>
            ) : null}
          </>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <Buscador
            valor={buscar}
            onCambiar={(valor) => {
              setBuscar(valor)
              setPagina(1)
            }}
            placeholder="Ejemplo: medida cautelar, nombre de una parte, número de resolución..."
            className="w-full sm:max-w-xl"
          />

          <Select
            value={etiquetaId}
            onValueChange={(valor) => {
              setEtiquetaId(valor)
              setPagina(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TODAS}>Todas las etiquetas</SelectItem>
              {(catalogos?.etiquetas ?? []).map((etiqueta) => (
                <SelectItem key={etiqueta.id} value={String(etiqueta.id)}>
                  {etiqueta.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant={soloHuerfanos ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSoloHuerfanos((actual) => !actual)
              setPagina(1)
            }}
          >
            Solo huérfanos
          </Button>
        </div>

        <div className={isFetching && !isPending ? 'opacity-60 transition-opacity' : undefined}>
          <DataTable
            columnas={columnas}
            filas={data?.data ?? []}
            claveFila={(documento) => documento.id}
            cargando={isPending}
            error={error ? mensajeDeError(error) : null}
            onReintentar={() => refetch()}
            onFilaHover={(documento) =>
              queryClient.prefetchQuery({
                queryKey: documentosKeys.detalle(documento.uuid),
                queryFn: () => documentosApi.obtener(documento.uuid),
              })
            }
            vacio={{
              icono: FileText,
              titulo: busqueda ? 'Sin coincidencias' : 'Todavía no hay documentos',
              descripcion: busqueda
                ? 'La búsqueda revisa el nombre y el texto del PDF. Prueba con otras palabras.'
                : 'Sube un PDF desde "Subir documentos" o desde cada expediente.',
            }}
            paginacion={
              data
                ? {
                    pagina: data.meta.current_page,
                    porPagina: data.meta.per_page,
                    total: data.meta.total,
                    onCambiar: setPagina,
                  }
                : undefined
            }
          />
        </div>
      </Card>

      <AsignarExpedienteModal
        abierto={modalAbierto}
        onAbierto={(abierto) => {
          setModalAbierto(abierto)
          if (!abierto) setSeleccionados([])
        }}
        documentos={seleccionados}
      />
    </div>
  )
}
