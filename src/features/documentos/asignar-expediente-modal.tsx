import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles, UserPlus } from 'lucide-react'
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
import { ClienteDialogo } from '@/features/clientes/cliente-dialogo'
import { useGuardarExpediente } from '@/features/expedientes/hooks'
import { mensajeDeError } from '@/lib/api'
import { ESTADOS_EXPEDIENTE, opciones } from '@/lib/etiquetas'
import { aInputFecha } from '@/lib/formato'
import { cn } from '@/lib/utils'
import type { Documento, EstadoExpediente, ParteExtraida } from '@/types'
import { useAsignarExpediente, useExtraccion } from './hooks'

// sin tildes, sin mayúsculas ni espacios de más: evita que un acento o un espacio extra rompa la coincidencia
function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

// la IA siempre manda solo dígitos; el cliente pudo registrarse con espacios o guiones en el número
function soloDigitos(texto: string) {
  return texto.replace(/\D/g, '')
}

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
  documentos: Documento[]
}

// Carrusel para convertir varios documentos huérfanos en expedientes (con su cliente), uno a la
// vez: la misma lógica de "crear expediente desde un PDF con IA" que ya existe en
// ExpedienteDialogo, pero sobre un documento que ya está subido en vez de un archivo local.
export function AsignarExpedienteModal({ abierto, onAbierto, documentos }: Props) {
  const { data: catalogos } = useCatalogos()
  const guardarExpediente = useGuardarExpediente()
  const asignar = useAsignarExpediente()
  const [indice, setIndice] = useState(0)
  const [registrados, setRegistrados] = useState<Set<string>>(new Set())
  const [partesDetectadas, setPartesDetectadas] = useState<ParteExtraida[]>([])
  const [nuevoCliente, setNuevoCliente] = useState<{ nombre: string; numero_documento?: string } | null>(null)

  const documento = documentos[indice] as Documento | undefined
  const yaRegistrado = documento ? registrados.has(documento.uuid) : false
  const { consulta: extraccion } = useExtraccion(documento?.uuid ?? '', abierto && Boolean(documento) && !yaRegistrado)

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<Formulario>({
    resolver: zodResolver(esquema),
  })

  useEffect(() => {
    if (!abierto) {
      setIndice(0)
      setRegistrados(new Set())
    }
  }, [abierto])

  // al cambiar de documento, limpia el formulario; si ya hay extracción en caché la precarga el efecto de abajo
  useEffect(() => {
    setPartesDetectadas([])
    reset({
      codigo: '',
      titulo: '',
      cliente_id: 0,
      abogado_id: null,
      materia: '',
      juzgado: '',
      estado: 'abierto',
      anio: new Date().getFullYear(),
      fecha_inicio: aInputFecha(new Date().toISOString()),
      fecha_cierre: '',
      descripcion: '',
    })
  }, [documento?.uuid, reset])

  useEffect(() => {
    if (!extraccion.data) return

    const campos = extraccion.data.campos
    const partesUnicas = new Map(extraccion.data.partes.map((parte) => [normalizar(parte.nombre), parte]))
    setPartesDetectadas(Array.from(partesUnicas.values()))

    if (campos.codigo) setValue('codigo', campos.codigo.valor, { shouldValidate: true })
    if (campos.titulo) setValue('titulo', campos.titulo.valor, { shouldValidate: true })
    if (campos.materia) setValue('materia', campos.materia.valor)
    if (campos.juzgado) setValue('juzgado', campos.juzgado.valor)
    if (campos.fecha_inicio) setValue('fecha_inicio', campos.fecha_inicio.valor, { shouldValidate: true })
  }, [extraccion.data, setValue])

  const elegirParte = (parte: ParteExtraida) => {
    const clientes = catalogos?.clientes ?? []

    const match = parte.numero_documento
      ? clientes.find((c) => soloDigitos(c.numero_documento) === parte.numero_documento)
      : undefined

    const encontrado = match ?? clientes.find((c) => normalizar(c.nombre) === normalizar(parte.nombre))

    if (encontrado) {
      setValue('cliente_id', encontrado.id, { shouldValidate: true })
      toast.success('Cliente seleccionado', { description: encontrado.nombre })
      return
    }

    setNuevoCliente({ nombre: parte.nombre, numero_documento: parte.numero_documento ?? undefined })
  }

  const avanzar = (paso: 1 | -1) => setIndice((actual) => Math.min(Math.max(actual + paso, 0), documentos.length - 1))

  const enviar = handleSubmit(async (valores) => {
    if (!documento) return

    const nuevoExpediente = await guardarExpediente.mutateAsync({
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

    try {
      await asignar.mutateAsync({ uuid: documento.uuid, expedienteId: nuevoExpediente.id })
      setRegistrados((actual) => new Set(actual).add(documento.uuid))

      if (indice < documentos.length - 1) {
        avanzar(1)
      } else {
        onAbierto(false)
      }
    } catch (error) {
      toast.error('El expediente se creó, pero no se pudo asignar el documento', {
        description: mensajeDeError(error),
      })
    }
  })

  const errores = formState.errors
  const cargandoExtraccion = extraccion.isFetching && !yaRegistrado
  const enviando = guardarExpediente.isPending || asignar.isPending

  return (
    <>
      <Dialog open={abierto} onOpenChange={onAbierto}>
        <DialogContent className="flex max-h-[85dvh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
          <DialogHeader className="shrink-0 gap-1.5 p-6 pb-4">
            {/* pr-8: dejar espacio para que las flechas no choquen con el botón de cerrar (X) del modal */}
            <div className="flex items-center justify-between gap-2 pr-8">
              <DialogTitle>Agregar expediente (IA)</DialogTitle>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={indice === 0}
                  onClick={() => avanzar(-1)}
                  title="Documento anterior"
                  aria-label="Documento anterior"
                >
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="px-1 text-sm tabular-nums text-muted-foreground">
                  {indice + 1} / {documentos.length}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  disabled={indice === documentos.length - 1}
                  onClick={() => avanzar(1)}
                  title="Siguiente documento"
                  aria-label="Siguiente documento"
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
            <DialogDescription>{documento?.nombre}</DialogDescription>
          </DialogHeader>

          {yaRegistrado ? (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-2">
                <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
                  <Check className="size-4 shrink-0" />
                  Este documento ya quedó asignado a un expediente.
                </div>
              </div>

              <DialogFooter className="shrink-0 border-t border-border p-6 pt-4">
                <Button type="button" variant="outline" onClick={() => onAbierto(false)}>
                  Cerrar
                </Button>
                {indice < documentos.length - 1 ? (
                  <Button type="button" onClick={() => avanzar(1)}>
                    Siguiente documento
                    <ChevronRight className="size-4" />
                  </Button>
                ) : null}
              </DialogFooter>
            </>
          ) : (
          <form onSubmit={enviar} className="flex min-h-0 flex-1 flex-col" noValidate>
            <div
              className={cn(
                'min-h-0 flex-1 overflow-y-auto px-6 pb-2',
                '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
                '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border',
              )}
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'var(--border) transparent' }}
            >
            <div className="grid gap-4 sm:grid-cols-2">
            {cargandoExtraccion ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
                <Loader2 className="size-4 animate-spin" />
                Analizando el PDF con IA...
              </div>
            ) : null}

            <Campo etiqueta="Código" obligatorio error={errores.codigo?.message}>
              <Input
                placeholder="EXP-2026-001"
                {...register('codigo')}
                aria-invalid={Boolean(errores.codigo)}
              />
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

            {partesDetectadas.length ? (
              <Campo etiqueta="¿Quién es tu cliente?" className="sm:col-span-2" ayuda="Detectado en el PDF">
                <div className="flex flex-wrap gap-2">
                  {partesDetectadas.map((parte) => {
                    const esCliente = (catalogos?.clientes ?? []).some(
                      (c) =>
                        c.id === watch('cliente_id') &&
                        (soloDigitos(c.numero_documento) === parte.numero_documento ||
                          normalizar(c.nombre) === normalizar(parte.nombre)),
                    )

                    return (
                      <button
                        key={parte.nombre}
                        type="button"
                        onClick={() => elegirParte(parte)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-left text-sm transition-colors',
                          esCliente
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-ring hover:bg-secondary/50',
                        )}
                      >
                        {esCliente ? <Check className="size-3.5 shrink-0" /> : null}
                        <span className="font-medium">{parte.nombre}</span>
                        <span className="text-xs text-muted-foreground capitalize">{parte.rol}</span>
                      </button>
                    )
                  })}
                </div>
              </Campo>
            ) : null}

            <Campo etiqueta="Cliente" obligatorio className="sm:col-span-2" error={errores.cliente_id?.message}>
              <div className="flex gap-2">
                <Combobox
                  className="flex-1"
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setNuevoCliente({ nombre: '' })}
                  title="Registrar cliente nuevo"
                  aria-label="Registrar cliente nuevo"
                >
                  <UserPlus className="size-4" />
                </Button>
              </div>
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
              <Input type="date" {...register('fecha_cierre')} />
            </Campo>

            <Campo etiqueta="Descripción" className="sm:col-span-2">
              <Textarea rows={3} {...register('descripcion')} />
            </Campo>
            </div>
            </div>

            <DialogFooter className="shrink-0 border-t border-border p-6 pt-4">
              <Button type="button" variant="outline" onClick={() => onAbierto(false)}>
                Cerrar
              </Button>
              <Button type="submit" disabled={enviando}>
                {enviando ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Registrar y continuar
              </Button>
            </DialogFooter>
          </form>
          )}
        </DialogContent>
      </Dialog>

      <ClienteDialogo
        abierto={nuevoCliente !== null}
        onAbierto={(valor) => !valor && setNuevoCliente(null)}
        datosIniciales={nuevoCliente ?? undefined}
        onGuardado={(cliente) => setValue('cliente_id', cliente.id, { shouldValidate: true })}
      />
    </>
  )
}
