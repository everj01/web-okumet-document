import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { CalendarClock, Check, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useConfirmar } from '@/components/common/confirmar'
import { EstadoError, EstadoVacio } from '@/components/common/estados'
import { EstadoEventoBadge, TipoEventoBadge } from '@/components/common/etiquetas-estado'
import { PageHeader } from '@/components/common/page-header'
import { useAuth } from '@/features/auth/auth-context'
import { mensajeDeError } from '@/lib/api'
import { ESTADOS_EVENTO, TIPOS_EVENTO, opciones } from '@/lib/etiquetas'
import { aInputFecha, fechaLarga, hora } from '@/lib/formato'
import { cn } from '@/lib/utils'
import type { Evento } from '@/types'
import { EventoDialogo } from './evento-dialogo'
import { useEliminarEvento, useEventos, useMarcarRealizado } from './hooks'

const TIPOS = opciones(TIPOS_EVENTO)
const ESTADOS = opciones(ESTADOS_EVENTO)
const TODOS = 'todos'

function inicioDeMes() {
  const hoy = new Date()

  return aInputFecha(new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString())
}

function finDelSiguienteMes() {
  const hoy = new Date()

  return aInputFecha(new Date(hoy.getFullYear(), hoy.getMonth() + 2, 0).toISOString())
}

export default function AgendaPage() {
  const { puedeEliminar } = useAuth()
  const confirmar = useConfirmar()

  const [desde, setDesde] = useState(inicioDeMes)
  const [hasta, setHasta] = useState(finDelSiguienteMes)
  const [estado, setEstado] = useState('pendiente')
  const [tipo, setTipo] = useState(TODOS)
  const [editando, setEditando] = useState<Evento | null>(null)
  const [dialogoAbierto, setDialogoAbierto] = useState(false)

  const filtro = useMemo(
    () => ({
      desde,
      hasta,
      estado: estado === TODOS ? null : estado,
      tipo: tipo === TODOS ? null : tipo,
    }),
    [desde, hasta, estado, tipo],
  )

  const { data: eventos, isPending, error, refetch } = useEventos(filtro)
  const marcarRealizado = useMarcarRealizado()
  const eliminarEvento = useEliminarEvento()

  const dias = useMemo(() => {
    const grupos = new Map<string, Evento[]>()

    for (const evento of eventos ?? []) {
      const dia = evento.inicio.slice(0, 10)
      grupos.set(dia, [...(grupos.get(dia) ?? []), evento])
    }

    return [...grupos.entries()]
  }, [eventos])

  const abrirNuevo = () => {
    setEditando(null)
    setDialogoAbierto(true)
  }

  const pedirEliminar = async (evento: Evento) => {
    const confirmado = await confirmar({
      titulo: 'Eliminar fecha',
      descripcion: `Se quitará "${evento.titulo}" de la agenda.`,
      confirmar: 'Eliminar',
      peligroso: true,
    })

    if (confirmado) {
      eliminarEvento.mutate(evento.uuid)
    }
  }

  const estaVencido = (evento: Evento) =>
    evento.estado === 'pendiente' && new Date(evento.inicio.replace(' ', 'T')) < new Date()

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Agenda"
        descripcion="Audiencias, vencimientos y reuniones del estudio."
        acciones={
          <Button onClick={abrirNuevo}>
            <Plus className="size-4" />
            Nueva fecha
          </Button>
        }
      />

      <Card className="flex flex-wrap items-end gap-3 p-4">
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Desde</label>
            <Input type="date" value={desde} onChange={(evento) => setDesde(evento.target.value)} className="w-40" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Hasta</label>
            <Input type="date" value={hasta} onChange={(evento) => setHasta(evento.target.value)} className="w-40" />
          </div>
        </div>

        <Select value={estado} onValueChange={setEstado}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los estados</SelectItem>
            {ESTADOS.map((item) => (
              <SelectItem key={item.valor} value={item.valor}>
                {item.texto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TODOS}>Todos los tipos</SelectItem>
            {TIPOS.map((item) => (
              <SelectItem key={item.valor} value={item.valor}>
                {item.texto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {error ? (
        <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => refetch()} />
      ) : isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, indice) => (
            <Skeleton key={indice} className="h-20" />
          ))}
        </div>
      ) : dias.length ? (
        <div className="space-y-6">
          {dias.map(([dia, eventosDelDia]) => (
            <section key={dia} className="space-y-2">
              <h2 className="text-sm font-medium tracking-wide text-muted-foreground uppercase">{fechaLarga(dia)}</h2>

              <div className="space-y-2">
                {eventosDelDia.map((evento) => (
                  <Card
                    key={evento.id}
                    className={cn(
                      'aparecer flex flex-wrap items-center justify-between gap-3 p-4 transition-shadow hover:shadow-sm',
                      estaVencido(evento) && 'border-destructive/40 bg-destructive/5',
                    )}
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="w-14 shrink-0 text-center">
                        <p className="text-sm font-semibold tabular-nums">{hora(evento.inicio)}</p>
                        {estaVencido(evento) ? <p className="text-xs text-destructive">vencida</p> : null}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <p className="font-medium">{evento.titulo}</p>
                        <p className="text-sm text-muted-foreground">
                          {[evento.lugar, evento.responsable].filter(Boolean).join(' · ') || 'Sin lugar asignado'}
                        </p>
                        {evento.expediente?.codigo ? (
                          <Link
                            to={`/expedientes/${evento.expediente.uuid}`}
                            className="text-sm text-muted-foreground hover:text-foreground hover:underline"
                          >
                            {evento.expediente.codigo} — {evento.expediente.titulo}
                          </Link>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <TipoEventoBadge tipo={evento.tipo} />
                      <EstadoEventoBadge estado={evento.estado} />

                      {evento.estado === 'pendiente' ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-success hover:bg-success/10"
                          onClick={() => marcarRealizado.mutate(evento)}
                          aria-label="Marcar como realizada"
                        >
                          <Check className="size-4" />
                        </Button>
                      ) : null}

                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          setEditando(evento)
                          setDialogoAbierto(true)
                        }}
                        aria-label="Editar"
                      >
                        <Pencil className="size-4" />
                      </Button>

                      {puedeEliminar ? (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => pedirEliminar(evento)}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <Card>
          <EstadoVacio
            icono={CalendarClock}
            titulo="No hay fechas en este rango"
            descripcion="Cambia el rango o registra la próxima audiencia."
            accion={
              <Button variant="outline" onClick={abrirNuevo}>
                <Plus className="size-4" />
                Nueva fecha
              </Button>
            }
          />
        </Card>
      )}

      <EventoDialogo abierto={dialogoAbierto} onAbierto={setDialogoAbierto} evento={editando} />
    </div>
  )
}
