import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Campo } from '@/components/common/campo'
import { Combobox } from '@/components/common/combobox'
import { useCatalogos } from '@/features/catalogos/use-catalogos'
import { ESTADOS_EVENTO, TIPOS_EVENTO, opciones } from '@/lib/etiquetas'
import { aFechaHoraApi, aInputFechaHora } from '@/lib/formato'
import type { EstadoEvento, Evento, TipoEvento } from '@/types'
import { useGuardarEvento } from './hooks'

const esquema = z
  .object({
    tipo: z.enum([
      'audiencia',
      'vencimiento',
      'reunion',
      'otro',
      'plazo_absolver',
      'plazo_apelar',
      'actuacion_prueba',
      'sentencia_1_instancia',
      'sentencia_2_instancia',
    ]),
    titulo: z.string().min(1, 'Ingresa un título').max(180),
    inicio: z.string().min(1, 'Elige la fecha y hora'),
    fin: z.string(),
    lugar: z.string().max(180),
    expediente_id: z.number().int().nullable(),
    responsable_id: z.number().int().nullable(),
    recordatorio_dias: z.coerce.number().int().min(0).max(60),
    estado: z.enum(['pendiente', 'realizado', 'cancelado']),
    notas: z.string().max(2000),
  })
  .refine((datos) => !datos.fin || datos.fin > datos.inicio, {
    path: ['fin'],
    message: 'El fin debe ser posterior al inicio',
  })

type Formulario = z.input<typeof esquema>

const TIPOS = opciones(TIPOS_EVENTO)
const ESTADOS = opciones(ESTADOS_EVENTO)

interface Props {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
  evento?: Evento | null
  expedienteFijo?: number | null
}

export function EventoDialogo({ abierto, onAbierto, evento, expedienteFijo }: Props) {
  const { data: catalogos } = useCatalogos()
  const guardar = useGuardarEvento(evento?.uuid)

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<Formulario>({
    resolver: zodResolver(esquema),
  })

  useEffect(() => {
    if (!abierto) return

    reset({
      tipo: evento?.tipo ?? 'audiencia',
      titulo: evento?.titulo ?? '',
      inicio: aInputFechaHora(evento?.inicio) || aInputFechaHora(new Date().toISOString()),
      fin: aInputFechaHora(evento?.fin),
      lugar: evento?.lugar ?? '',
      expediente_id: evento?.expediente_id ?? expedienteFijo ?? null,
      responsable_id: evento?.responsable_id ?? null,
      recordatorio_dias: evento?.recordatorio_dias ?? 1,
      estado: evento?.estado ?? 'pendiente',
      notas: evento?.notas ?? '',
    })
  }, [abierto, evento, expedienteFijo, reset])

  const enviar = handleSubmit(async (valores) => {
    await guardar.mutateAsync({
      tipo: valores.tipo,
      titulo: valores.titulo,
      inicio: aFechaHoraApi(valores.inicio),
      fin: valores.fin ? aFechaHoraApi(valores.fin) : null,
      lugar: valores.lugar || null,
      expediente_id: valores.expediente_id,
      responsable_id: valores.responsable_id,
      recordatorio_dias: Number(valores.recordatorio_dias),
      estado: valores.estado,
      notas: valores.notas || null,
    })

    onAbierto(false)
  })

  const errores = formState.errors

  return (
    <Dialog open={abierto} onOpenChange={onAbierto}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{evento ? 'Editar fecha' : 'Nueva fecha'}</DialogTitle>
          <DialogDescription>
            Audiencias, vencimientos y reuniones. El recordatorio se envía al responsable por correo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Campo etiqueta="Tipo">
            <Select value={watch('tipo')} onValueChange={(valor) => setValue('tipo', valor as TipoEvento)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((tipo) => (
                  <SelectItem key={tipo.valor} value={tipo.valor}>
                    {tipo.texto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Estado">
            <Select value={watch('estado')} onValueChange={(valor) => setValue('estado', valor as EstadoEvento)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS.map((estado) => (
                  <SelectItem key={estado.valor} value={estado.valor}>
                    {estado.texto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Título" obligatorio className="sm:col-span-2" error={errores.titulo?.message}>
            <Input
              placeholder="Audiencia única, vence plazo para contestar..."
              {...register('titulo')}
              aria-invalid={Boolean(errores.titulo)}
            />
          </Campo>

          <Campo etiqueta="Inicio" obligatorio error={errores.inicio?.message}>
            <Input type="datetime-local" {...register('inicio')} aria-invalid={Boolean(errores.inicio)} />
          </Campo>

          <Campo etiqueta="Fin (opcional)" error={errores.fin?.message}>
            <Input type="datetime-local" {...register('fin')} aria-invalid={Boolean(errores.fin)} />
          </Campo>

          <Campo etiqueta="Expediente">
            <Combobox
              opciones={(catalogos?.expedientes ?? []).map((expediente) => ({
                valor: expediente.id,
                texto: expediente.codigo,
                detalle: expediente.titulo,
              }))}
              valor={watch('expediente_id') ?? null}
              onCambiar={(valor) => setValue('expediente_id', valor === null ? null : Number(valor))}
              placeholder="Sin expediente"
              permitirVacio
            />
          </Campo>

          <Campo etiqueta="Responsable">
            <Combobox
              opciones={(catalogos?.responsables ?? []).map((usuario) => ({ valor: usuario.id, texto: usuario.name }))}
              valor={watch('responsable_id') ?? null}
              onCambiar={(valor) => setValue('responsable_id', valor === null ? null : Number(valor))}
              placeholder="Sin responsable"
              permitirVacio
            />
          </Campo>

          <Campo etiqueta="Lugar">
            <Input {...register('lugar')} />
          </Campo>

          <Campo etiqueta="Avisar días antes" ayuda="0 = el mismo día">
            <Input type="number" min={0} max={60} {...register('recordatorio_dias')} />
          </Campo>

          <Campo etiqueta="Notas" className="sm:col-span-2">
            <Textarea rows={3} {...register('notas')} />
          </Campo>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardar.isPending}>
              {guardar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
