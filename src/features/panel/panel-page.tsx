import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router'
import { AlertTriangle, ArrowRight, CalendarClock, FileText, FolderOpen, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EstadoError, EstadoVacio } from '@/components/common/estados'
import { EstadoExpedienteBadge, TipoEventoBadge } from '@/components/common/etiquetas-estado'
import { PageHeader } from '@/components/common/page-header'
import { useAuth } from '@/features/auth/auth-context'
import { api, mensajeDeError } from '@/lib/api'
import { desdeAhora, fechaHora } from '@/lib/formato'
import type { ResumenPanel } from '@/types'

function Contador({
  icono: Icono,
  etiqueta,
  valor,
  destacado,
}: {
  icono: LucideIcon
  etiqueta: string
  valor: number
  destacado?: boolean
}) {
  return (
    <Card className="aparecer overflow-hidden">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={
            destacado
              ? 'grid size-11 place-items-center rounded-lg bg-accent/20 text-accent-foreground'
              : 'grid size-11 place-items-center rounded-lg bg-secondary text-muted-foreground'
          }
        >
          <Icono className="size-5" />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{valor}</p>
          <p className="text-sm text-muted-foreground">{etiqueta}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default function PanelPage() {
  const { usuario } = useAuth()
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ['panel'],
    queryFn: () => api<ResumenPanel>('/panel'),
  })

  if (error) {
    return <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => refetch()} />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        titulo={`Hola, ${usuario?.name?.split(' ')[0] ?? ''}`}
        descripcion="Así está el estudio hoy."
      />

      {isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, indice) => (
            <Skeleton key={indice} className="h-[86px]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Contador icono={Users} etiqueta="Clientes activos" valor={data.contadores.clientes} />
          <Contador icono={FolderOpen} etiqueta="Expedientes en curso" valor={data.contadores.expedientes_abiertos} />
          <Contador icono={FileText} etiqueta="Documentos" valor={data.contadores.documentos} />
          <Contador
            icono={CalendarClock}
            etiqueta="Fechas pendientes"
            valor={data.contadores.eventos_pendientes}
            destacado
          />
        </div>
      )}

      {data?.vencidos.length ? (
        <Card className="aparecer border-destructive/30 bg-destructive/5">
          <CardContent className="space-y-3 p-5">
            <p className="flex items-center gap-2 font-medium text-destructive">
              <AlertTriangle className="size-4" />
              Fechas vencidas sin cerrar
            </p>
            <ul className="space-y-2">
              {data.vencidos.map((evento) => (
                <li key={evento.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <Link to="/agenda" className="font-medium hover:underline">
                    {evento.titulo}
                  </Link>
                  <span className="text-muted-foreground">{fechaHora(evento.inicio)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="aparecer">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-medium">Próximas audiencias y vencimientos</h2>
            <Link to="/agenda" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              Agenda <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {isPending ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, indice) => (
                <Skeleton key={indice} className="h-10" />
              ))}
            </div>
          ) : data.proximos_eventos.length ? (
            <ul className="divide-y divide-border">
              {data.proximos_eventos.map((evento) => (
                <li key={evento.id} className="flex items-start justify-between gap-4 px-5 py-3">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium">{evento.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {fechaHora(evento.inicio)}
                      {evento.expediente?.codigo ? ` · ${evento.expediente.codigo}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <TipoEventoBadge tipo={evento.tipo} />
                    <span className="text-xs text-muted-foreground">{desdeAhora(evento.inicio)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EstadoVacio
              icono={CalendarClock}
              titulo="Sin fechas próximas"
              descripcion="No hay audiencias ni vencimientos en los siguientes 15 días."
            />
          )}
        </Card>

        <Card className="aparecer">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-medium">Expedientes con movimiento reciente</h2>
            <Link
              to="/expedientes"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              Ver todos <ArrowRight className="size-3.5" />
            </Link>
          </div>

          {isPending ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 4 }).map((_, indice) => (
                <Skeleton key={indice} className="h-10" />
              ))}
            </div>
          ) : data.expedientes_recientes.length ? (
            <ul className="divide-y divide-border">
              {data.expedientes_recientes.map((expediente) => (
                <li key={expediente.id}>
                  <Link
                    to={`/expedientes/${expediente.uuid}`}
                    className="flex items-start justify-between gap-4 px-5 py-3 transition-colors hover:bg-secondary/60"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">{expediente.titulo}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {expediente.codigo} · {expediente.cliente?.nombre}
                      </p>
                    </div>
                    <EstadoExpedienteBadge estado={expediente.estado} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EstadoVacio icono={FolderOpen} titulo="Todavía no hay expedientes" />
          )}
        </Card>
      </div>
    </div>
  )
}
