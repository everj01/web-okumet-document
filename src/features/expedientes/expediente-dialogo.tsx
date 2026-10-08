import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
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
import { documentosApi } from '@/features/documentos/api'
import { useExtraccionPrevia } from '@/features/documentos/hooks'
import { mensajeDeError } from '@/lib/api'
import { ESTADOS_EXPEDIENTE, opciones } from '@/lib/etiquetas'
import { aInputFecha, pesoLegible } from '@/lib/formato'
import type { EstadoExpediente, Expediente } from '@/types'
import { useGuardarExpediente } from './hooks'

const esquema = z
  .object({
    codigo: z.string().min(1, 'Ingresa el código').max(60),
    titulo: z.string().min(1, 'Ingresa el asunto').max(180),
    cliente_id: z.number({ message: 'Selecciona un cliente' }).int().positive('Selecciona un cliente'),
    abogado_id: z.number().int().nullable(),
    materia: z.string().max(100),
    juzgado: z.string().max(150),
    estado: z.enum(['abierto', 'en_tramite', 'archivado', 'cerrado']),
    anio: z.coerce.number().int().min(1990, 'Año no válido').max(2100, 'Año no válido'),
    fecha_inicio: z.string().min(1, 'Elige la fecha de inicio'),
    fecha_cierre: z.string(),
    descripcion: z.string().max(5000),
  })
  .refine((datos) => !datos.fecha_cierre || datos.fecha_cierre >= datos.fecha_inicio, {
    path: ['fecha_cierre'],
    message: 'El cierre no puede ser anterior al inicio',
  })

type Formulario = z.input<typeof esquema>

const ESTADOS = opciones(ESTADOS_EXPEDIENTE)

interface Props {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
  expediente?: Expediente | null
  clienteFijo?: number
}

export function ExpedienteDialogo({ abierto, onAbierto, expediente, clienteFijo }: Props) {
  const { data: catalogos } = useCatalogos()
  const guardar = useGuardarExpediente(expediente?.uuid)
  const extraerPrevia = useExtraccionPrevia()
  const queryClient = useQueryClient()
  const [archivoPdf, setArchivoPdf] = useState<File | null>(null)
  const [subiendoPdf, setSubiendoPdf] = useState(false)

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<Formulario>({
    resolver: zodResolver(esquema),
  })

  useEffect(() => {
    if (!abierto) return

    setArchivoPdf(null)
    reset({
      codigo: expediente?.codigo ?? '',
      titulo: expediente?.titulo ?? '',
      cliente_id: expediente?.cliente_id ?? clienteFijo ?? 0,
      abogado_id: expediente?.abogado_id ?? null,
      materia: expediente?.materia ?? '',
      juzgado: expediente?.juzgado ?? '',
      estado: expediente?.estado ?? 'abierto',
      anio: expediente?.anio ?? new Date().getFullYear(),
      fecha_inicio: aInputFecha(expediente?.fecha_inicio) || aInputFecha(new Date().toISOString()),
      fecha_cierre: aInputFecha(expediente?.fecha_cierre) ?? '',
      descripcion: expediente?.descripcion ?? '',
    })
  }, [abierto, expediente, clienteFijo, reset])

  const elegirPdf = (archivo: File | null) => {
    setArchivoPdf(archivo)
    if (!archivo) return

    extraerPrevia.mutate(archivo, {
      onSuccess: (extraccion) => {
        const campos = extraccion.campos
        let detectados = 0

        if (campos.codigo) {
          setValue('codigo', campos.codigo.valor, { shouldValidate: true })
          detectados++
        }
        if (campos.titulo) {
          setValue('titulo', campos.titulo.valor, { shouldValidate: true })
          detectados++
        }
        if (campos.materia) {
          setValue('materia', campos.materia.valor)
          detectados++
        }
        if (campos.juzgado) {
          setValue('juzgado', campos.juzgado.valor)
          detectados++
        }
        if (campos.fecha_inicio) {
          setValue('fecha_inicio', campos.fecha_inicio.valor, { shouldValidate: true })
          detectados++
        }

        toast[detectados ? 'success' : 'info'](
          detectados ? `Completamos ${detectados} campo${detectados === 1 ? '' : 's'} desde el PDF` : 'No detectamos datos en el PDF',
          { description: 'Revisa el formulario antes de guardar.' },
        )
      },
    })
  }

  const fechaInicio = watch('fecha_inicio')

  // autocompleta el año desde la fecha de inicio solo al crear; al editar se respeta el valor guardado
  useEffect(() => {
    if (expediente || !fechaInicio || formState.dirtyFields.anio) return

    const anioDerivado = Number(fechaInicio.slice(0, 4))
    if (!Number.isNaN(anioDerivado)) setValue('anio', anioDerivado)
  }, [expediente, fechaInicio, formState.dirtyFields.anio, setValue])

  const enviar = handleSubmit(async (valores) => {
    const nuevoExpediente = await guardar.mutateAsync({
      codigo: valores.codigo,
      titulo: valores.titulo,
      cliente_id: valores.cliente_id,
      abogado_id: valores.abogado_id,
      materia: valores.materia || null,
      juzgado: valores.juzgado || null,
      estado: valores.estado,
      anio: Number(valores.anio),
      fecha_inicio: valores.fecha_inicio,
      fecha_cierre: valores.fecha_cierre || null,
      descripcion: valores.descripcion || null,
    })

    if (archivoPdf && !expediente) {
      setSubiendoPdf(true)
      try {
        await documentosApi.subir(nuevoExpediente.uuid, archivoPdf, archivoPdf.name.replace(/\.pdf$/i, ''))
        queryClient.invalidateQueries({ queryKey: ['documentos'] })
        toast.success('PDF adjuntado al expediente')
      } catch (error) {
        toast.error('El expediente se creó, pero no se pudo adjuntar el PDF', { description: mensajeDeError(error) })
      } finally {
        setSubiendoPdf(false)
      }
    }

    onAbierto(false)
  })

  const errores = formState.errors

  return (
    <Dialog open={abierto} onOpenChange={onAbierto}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{expediente ? 'Editar expediente' : 'Nuevo expediente'}</DialogTitle>
          <DialogDescription>El código identifica el caso dentro del estudio y en el juzgado.</DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2" noValidate>
          {!expediente ? (
            <Campo etiqueta="Autocompletar desde un PDF (opcional)" className="sm:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border px-4 py-3 text-left transition-colors hover:border-ring hover:bg-secondary/50">
                {extraerPrevia.isPending ? (
                  <Loader2 className="size-5 shrink-0 animate-spin text-muted-foreground" />
                ) : (
                  <Sparkles className="size-5 shrink-0 text-accent" />
                )}
                <span className="min-w-0 flex-1 text-sm">
                  {archivoPdf ? (
                    <>
                      <span className="font-medium">{archivoPdf.name}</span>
                      <span className="text-muted-foreground"> · {pesoLegible(archivoPdf.size)}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">
                      Sube el PDF de la demanda y completamos el código, asunto, materia, juzgado y fecha por ti
                    </span>
                  )}
                </span>
                <input
                  type="file"
                  accept="application/pdf"
                  className="sr-only"
                  disabled={extraerPrevia.isPending}
                  onChange={(evento) => elegirPdf(evento.target.files?.[0] ?? null)}
                />
              </label>
            </Campo>
          ) : null}

          <Campo etiqueta="Código" obligatorio error={errores.codigo?.message}>
            <Input placeholder="EXP-2026-001" {...register('codigo')} aria-invalid={Boolean(errores.codigo)} />
          </Campo>

          <Campo etiqueta="Año" obligatorio error={errores.anio?.message}>
            <Input type="number" {...register('anio')} aria-invalid={Boolean(errores.anio)} />
          </Campo>

          <Campo etiqueta="Estado">
            <Select value={watch('estado')} onValueChange={(valor) => setValue('estado', valor as EstadoExpediente)}>
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

          <Campo etiqueta="Asunto" obligatorio className="sm:col-span-2" error={errores.titulo?.message}>
            <Input {...register('titulo')} aria-invalid={Boolean(errores.titulo)} />
          </Campo>

          <Campo etiqueta="Cliente" obligatorio error={errores.cliente_id?.message}>
            <Combobox
              opciones={(catalogos?.clientes ?? []).map((cliente) => ({
                valor: cliente.id,
                texto: cliente.nombre,
                detalle: cliente.numero_documento,
              }))}
              valor={watch('cliente_id') || null}
              onCambiar={(valor) => setValue('cliente_id', Number(valor ?? 0), { shouldValidate: true })}
              placeholder="Selecciona un cliente"
              invalido={Boolean(errores.cliente_id)}
            />
          </Campo>

          <Campo etiqueta="Abogado a cargo">
            <Combobox
              opciones={(catalogos?.responsables ?? []).map((usuario) => ({ valor: usuario.id, texto: usuario.name }))}
              valor={watch('abogado_id')}
              onCambiar={(valor) => setValue('abogado_id', valor === null ? null : Number(valor))}
              placeholder="Sin asignar"
              permitirVacio
            />
          </Campo>

          <Campo etiqueta="Materia">
            <Input placeholder="Civil, Penal, Familia..." {...register('materia')} />
          </Campo>

          <Campo etiqueta="Juzgado">
            <Input {...register('juzgado')} />
          </Campo>

          <Campo etiqueta="Fecha de inicio" obligatorio error={errores.fecha_inicio?.message}>
            <Input type="date" {...register('fecha_inicio')} aria-invalid={Boolean(errores.fecha_inicio)} />
          </Campo>

          <Campo etiqueta="Fecha de cierre" error={errores.fecha_cierre?.message}>
            <Input type="date" {...register('fecha_cierre')} aria-invalid={Boolean(errores.fecha_cierre)} />
          </Campo>

          <Campo etiqueta="Descripción" className="sm:col-span-2">
            <Textarea rows={3} {...register('descripcion')} />
          </Campo>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={guardar.isPending || subiendoPdf}>
              {guardar.isPending || subiendoPdf ? <Loader2 className="size-4 animate-spin" /> : null}
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
