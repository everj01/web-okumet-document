import { useEffect, useMemo, useState } from 'react'
import { CalendarClock, Loader2, RefreshCw, ScanText, TriangleAlert, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { AvisoIa } from '@/components/common/aviso-ia'
import { EstadoVacio } from '@/components/common/estados'
import { useExpediente, useGuardarExpediente } from '@/features/expedientes/hooks'
import { mensajeDeError } from '@/lib/api'
import { aInputFecha, fechaCorta } from '@/lib/formato'
import type {
  CampoExtraible,
  ConfianzaExtraccion,
  Expediente,
  ExpedientePayload,
} from '@/types'
import { useExtraccion } from './hooks'

const ETIQUETAS: Record<CampoExtraible, string> = {
  codigo: 'Código',
  titulo: 'Asunto',
  materia: 'Materia',
  juzgado: 'Juzgado',
  fecha_inicio: 'Fecha de inicio',
}

// Mismos topes que el formulario de expediente, para no marcar como aplicable algo que fallaría al guardar
const LIMITES: Record<CampoExtraible, number> = {
  codigo: 60,
  titulo: 180,
  materia: 100,
  juzgado: 150,
  fecha_inicio: 10,
}

const ORDEN: CampoExtraible[] = ['codigo', 'titulo', 'materia', 'juzgado', 'fecha_inicio']

const CONFIANZA: Record<ConfianzaExtraccion, { texto: string; variante: 'success' | 'warning' | 'neutral' }> = {
  alta: { texto: 'Confianza alta', variante: 'success' },
  media: { texto: 'Confianza media', variante: 'warning' },
  baja: { texto: 'Confianza baja', variante: 'neutral' },
}

type Situacion = 'vacio' | 'difiere' | 'igual' | 'invalido'

interface Fila {
  campo: CampoExtraible
  detectado: string
  actual: string
  confianza: ConfianzaExtraccion
  pagina: number | null
  situacion: Situacion
}

function leerActual(expediente: Expediente, campo: CampoExtraible) {
  switch (campo) {
    case 'codigo':
      return expediente.codigo
    case 'titulo':
      return expediente.titulo
    case 'materia':
      return expediente.materia ?? ''
    case 'juzgado':
      return expediente.juzgado ?? ''
    case 'fecha_inicio':
      return aInputFecha(expediente.fecha_inicio)
  }
}

function mostrar(campo: CampoExtraible, valor: string) {
  if (!valor) return '—'

  return campo === 'fecha_inicio' ? fechaCorta(valor) : valor
}

interface Props {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
  documentoUuid: string
  expedienteUuid: string
}

export function ExtraccionDialogo({ abierto, onAbierto, documentoUuid, expedienteUuid }: Props) {
  const { consulta, regenerar } = useExtraccion(documentoUuid, abierto)
  const { data: expediente } = useExpediente(expedienteUuid)
  const guardar = useGuardarExpediente(expedienteUuid)

  // null = aún no tocado, se usa la sugerencia derivada de las filas
  const [marcados, setMarcados] = useState<CampoExtraible[] | null>(null)

  const extraccion = consulta.data

  const filas = useMemo<Fila[]>(() => {
    if (!extraccion || !expediente) return []

    return ORDEN.flatMap((campo) => {
      const detectado = extraccion.campos[campo]

      if (!detectado) return []

      const valor = campo === 'fecha_inicio' ? aInputFecha(detectado.valor) : detectado.valor.trim()
      const actual = leerActual(expediente, campo)

      const situacion: Situacion = !valor || valor.length > LIMITES[campo]
        ? 'invalido'
        : valor === actual
          ? 'igual'
          : actual
            ? 'difiere'
            : 'vacio'

      return [{ campo, detectado: valor, actual, confianza: detectado.confianza, pagina: detectado.pagina, situacion }]
    })
  }, [extraccion, expediente])

  // Solo se marca por defecto lo que rellena un hueco y no es confianza baja; sobrescribir un dato existente es decisión del abogado
  const sugeridos = useMemo(
    () => filas.filter((fila) => fila.situacion === 'vacio' && fila.confianza !== 'baja').map((f) => f.campo),
    [filas],
  )

  const elegidos = marcados ?? sugeridos

  useEffect(() => {
    if (!abierto) setMarcados(null)
  }, [abierto])

  const alternar = (campo: CampoExtraible) => {
    setMarcados((previos) => {
      const base = previos ?? sugeridos

      return base.includes(campo) ? base.filter((c) => c !== campo) : [...base, campo]
    })
  }

  const aplicar = async () => {
    if (!expediente || !elegidos.length) return

    const valores = new Map(filas.map((fila) => [fila.campo, fila.detectado]))
    const elegido = (campo: CampoExtraible) => (elegidos.includes(campo) ? valores.get(campo) : undefined)

    const payload: ExpedientePayload = {
      codigo: elegido('codigo') ?? expediente.codigo,
      titulo: elegido('titulo') ?? expediente.titulo,
      cliente_id: expediente.cliente_id,
      abogado_id: expediente.abogado_id,
      materia: elegido('materia') ?? expediente.materia,
      juzgado: elegido('juzgado') ?? expediente.juzgado,
      estado: expediente.estado,
      anio: expediente.anio,
      fecha_inicio: elegido('fecha_inicio') ?? aInputFecha(expediente.fecha_inicio),
      fecha_cierre: aInputFecha(expediente.fecha_cierre) || null,
      descripcion: expediente.descripcion,
    }

    await guardar.mutateAsync(payload)
    onAbierto(false)
  }

  const cargando = consulta.isPending || regenerar.isPending
  const partes = extraccion?.partes ?? []
  const fechas = extraccion?.fechas_clave ?? []

  return (
    <Dialog open={abierto} onOpenChange={onAbierto}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanText className="size-4 text-accent" />
            Datos detectados
          </DialogTitle>
          <DialogDescription>
            Lo que la IA leyó en el documento. Revisa cada campo antes de aplicarlo al expediente: nada se
            guarda sin que lo marques.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[26rem] space-y-5 overflow-y-auto">
          {!cargando && !consulta.error ? <AvisoIa /> : null}

          {cargando ? (
            <div className="space-y-2">
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
              <Skeleton className="h-14" />
            </div>
          ) : consulta.error ? (
            <p className="flex items-start gap-2 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              {mensajeDeError(consulta.error)}
            </p>
          ) : !filas.length ? (
            <EstadoVacio
              icono={ScanText}
              titulo="No se detectaron datos del expediente"
              descripcion="El documento no contiene código, asunto, materia, juzgado ni fecha de inicio reconocibles."
              className="py-10"
            />
          ) : (
            <div className="space-y-2">
              {filas.map((fila) => {
                const aplicable = fila.situacion !== 'igual' && fila.situacion !== 'invalido'
                const marcado = elegidos.includes(fila.campo)

                return (
                  <label
                    key={fila.campo}
                    className={[
                      'flex gap-3 rounded-lg border p-3 transition-colors',
                      aplicable
                        ? marcado
                          ? 'cursor-pointer border-ring bg-secondary/60'
                          : 'cursor-pointer border-border hover:bg-secondary/40'
                        : 'border-border opacity-60',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 size-4 shrink-0 accent-primary"
                      checked={marcado}
                      disabled={!aplicable}
                      onChange={() => alternar(fila.campo)}
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-sm font-medium">{ETIQUETAS[fila.campo]}</span>
                        <Badge variant={CONFIANZA[fila.confianza].variante}>{CONFIANZA[fila.confianza].texto}</Badge>
                        {fila.pagina ? (
                          <span className="text-xs text-muted-foreground">pág. {fila.pagina}</span>
                        ) : null}
                      </div>

                      <p className="text-sm break-words">{mostrar(fila.campo, fila.detectado)}</p>

                      {fila.situacion === 'difiere' ? (
                        <p className="text-xs text-warning">
                          Reemplazaría lo registrado: {mostrar(fila.campo, fila.actual)}
                        </p>
                      ) : fila.situacion === 'igual' ? (
                        <p className="text-xs text-muted-foreground">Ya coincide con el expediente.</p>
                      ) : fila.situacion === 'invalido' ? (
                        <p className="text-xs text-destructive">
                          Supera los {LIMITES[fila.campo]} caracteres que admite el campo.
                        </p>
                      ) : null}
                    </div>
                  </label>
                )
              })}
            </div>
          )}

          {partes.length ? (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <Users className="size-4 text-muted-foreground" />
                Partes mencionadas
              </h3>
              <ul className="space-y-1">
                {partes.map((parte, indice) => (
                  <li key={`${parte.nombre}-${indice}`} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span>{parte.nombre}</span>
                    <span className="text-xs text-muted-foreground">
                      {parte.rol}
                      {parte.pagina ? ` · pág. ${parte.pagina}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {fechas.length ? (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-medium">
                <CalendarClock className="size-4 text-muted-foreground" />
                Fechas encontradas
              </h3>
              <ul className="space-y-1">
                {fechas.map((fecha, indice) => (
                  <li key={`${fecha.fecha}-${indice}`} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                    <span className="font-medium">{fechaCorta(fecha.fecha)}</span>
                    <span className="text-muted-foreground">{fecha.descripcion}</span>
                    {fecha.pagina ? <span className="text-xs text-muted-foreground">pág. {fecha.pagina}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={cargando}
            onClick={() => {
              setMarcados(null)
              regenerar.mutate()
            }}
          >
            {regenerar.isPending ? <RefreshCw className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Volver a analizar
          </Button>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onAbierto(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={!elegidos.length || guardar.isPending} onClick={aplicar}>
              {guardar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              {elegidos.length > 1 ? `Aplicar ${elegidos.length} campos` : 'Aplicar al expediente'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
