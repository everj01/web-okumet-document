import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Search } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Campo } from '@/components/common/campo'
import { TIPOS_DOCUMENTO, TIPOS_PERSONA } from '@/lib/etiquetas'
import type { Cliente, TipoDocumento, TipoPersona } from '@/types'
import { useBuscarDniRuc, useGuardarCliente } from './hooks'

const esquema = z
  .object({
    tipo_persona: z.enum(['natural', 'juridica']),
    tipo_documento: z.enum(['DNI', 'RUC', 'CE', 'PASAPORTE']),
    numero_documento: z.string().min(1, 'Ingresa el número de documento').max(20),
    nombre: z.string().min(1, 'Ingresa el nombre o razón social').max(180),
    email: z.string().email('Correo no válido').or(z.literal('')),
    telefono: z.string().max(30),
    direccion: z.string().max(200),
    notas: z.string().max(2000),
    activo: z.boolean(),
  })
  .superRefine((valores, ctx) => {
    if (valores.tipo_persona === 'juridica' && valores.tipo_documento !== 'RUC') {
      ctx.addIssue({
        code: 'custom',
        path: ['tipo_documento'],
        message: 'Una persona jurídica solo puede usar RUC',
      })
    }
  })

type Formulario = z.infer<typeof esquema>

const VACIO: Formulario = {
  tipo_persona: 'natural',
  tipo_documento: 'DNI',
  numero_documento: '',
  nombre: '',
  email: '',
  telefono: '',
  direccion: '',
  notas: '',
  activo: true,
}

interface Props {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
  cliente?: Cliente | null
  // solo aplica al crear: prellena el formulario (ej. datos detectados de un PDF)
  datosIniciales?: { nombre?: string; numero_documento?: string }
  onGuardado?: (cliente: Cliente) => void
}

export function ClienteDialogo({ abierto, onAbierto, cliente, datosIniciales, onGuardado }: Props) {
  const guardar = useGuardarCliente(cliente?.uuid)
  const buscar = useBuscarDniRuc()

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: VACIO,
  })

  const tipoPersona = watch('tipo_persona')
  const tipoDocumento = watch('tipo_documento')
  const numeroDocumento = watch('numero_documento')

  const largoValido =
    (tipoDocumento === 'DNI' && numeroDocumento?.length === 8) ||
    (tipoDocumento === 'RUC' && numeroDocumento?.length === 11)

  const buscarDatos = () => {
    if (!largoValido) return

    buscar.mutate(
      { tipo: tipoDocumento as 'DNI' | 'RUC', numero: numeroDocumento },
      {
        onSuccess: (resultado) => {
          if ('nombre_completo' in resultado) {
            setValue('nombre', resultado.nombre_completo)
          } else {
            setValue('nombre', resultado.razon_social)
            if (resultado.direccion) setValue('direccion', resultado.direccion)
          }
        },
      },
    )
  }

  // Persona jurídica solo puede documentarse con RUC: se fuerza al cambiar el tipo de persona
  useEffect(() => {
    if (tipoPersona === 'juridica' && watch('tipo_documento') !== 'RUC') {
      setValue('tipo_documento', 'RUC', { shouldValidate: true })
    }
  }, [tipoPersona, setValue, watch])

  useEffect(() => {
    if (!abierto) return

    reset(
      cliente
        ? {
            tipo_persona: cliente.tipo_persona,
            tipo_documento: cliente.tipo_documento,
            numero_documento: cliente.numero_documento,
            nombre: cliente.nombre,
            email: cliente.email ?? '',
            telefono: cliente.telefono ?? '',
            direccion: cliente.direccion ?? '',
            notas: cliente.notas ?? '',
            activo: cliente.activo,
          }
        : {
            ...VACIO,
            nombre: datosIniciales?.nombre ?? '',
            numero_documento: datosIniciales?.numero_documento ?? '',
          },
    )
  }, [abierto, cliente, datosIniciales, reset])

  const enviar = handleSubmit(async (valores) => {
    const guardado = await guardar.mutateAsync({
      ...valores,
      email: valores.email || null,
      telefono: valores.telefono || null,
      direccion: valores.direccion || null,
      notas: valores.notas || null,
    })

    onGuardado?.(guardado)
    onAbierto(false)
  })

  const errores = formState.errors

  return (
    <Dialog open={abierto} onOpenChange={onAbierto}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{cliente ? 'Editar cliente' : 'Nuevo cliente'}</DialogTitle>
          <DialogDescription>Los datos de contacto ayudan a ubicar rápido a la persona o empresa.</DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Campo etiqueta="Tipo de persona">
            <Select
              value={watch('tipo_persona')}
              onValueChange={(valor) => setValue('tipo_persona', valor as TipoPersona)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_PERSONA.map((tipo) => (
                  <SelectItem key={tipo.valor} value={tipo.valor}>
                    {tipo.texto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo etiqueta="Tipo de documento" error={errores.tipo_documento?.message}>
            <Select
              value={watch('tipo_documento')}
              onValueChange={(valor) => setValue('tipo_documento', valor as TipoDocumento, { shouldValidate: true })}
              disabled={tipoPersona === 'juridica'}
            >
              <SelectTrigger aria-invalid={Boolean(errores.tipo_documento)}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(tipoPersona === 'juridica' ? (['RUC'] as const) : TIPOS_DOCUMENTO).map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Campo>

          <Campo
            etiqueta="Número de documento"
            obligatorio
            error={errores.numero_documento?.message}
            ayuda={
              tipoDocumento === 'DNI' || tipoDocumento === 'RUC'
                ? 'Busca para completar el nombre con datos de RENIEC/SUNAT'
                : undefined
            }
          >
            <div className="flex gap-2">
              <Input {...register('numero_documento')} aria-invalid={Boolean(errores.numero_documento)} />
              {tipoDocumento === 'DNI' || tipoDocumento === 'RUC' ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={!largoValido || buscar.isPending}
                  onClick={buscarDatos}
                  title="Buscar en RENIEC/SUNAT"
                  aria-label="Buscar en RENIEC/SUNAT"
                >
                  {buscar.isPending ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                </Button>
              ) : null}
            </div>
          </Campo>

          <Campo etiqueta="Teléfono" error={errores.telefono?.message}>
            <Input {...register('telefono')} />
          </Campo>

          <Campo
            etiqueta="Nombre o razón social"
            obligatorio
            className="sm:col-span-2"
            error={errores.nombre?.message}
          >
            <Input {...register('nombre')} aria-invalid={Boolean(errores.nombre)} />
          </Campo>

          <Campo etiqueta="Correo" error={errores.email?.message}>
            <Input type="email" {...register('email')} aria-invalid={Boolean(errores.email)} />
          </Campo>

          <Campo etiqueta="Dirección" error={errores.direccion?.message}>
            <Input {...register('direccion')} />
          </Campo>

          <Campo etiqueta="Notas" className="sm:col-span-2" error={errores.notas?.message}>
            <Textarea rows={3} {...register('notas')} />
          </Campo>

          <label className="flex items-center gap-3 sm:col-span-2">
            <Switch checked={watch('activo')} onCheckedChange={(valor) => setValue('activo', valor)} />
            <span className="text-sm">Cliente activo</span>
          </label>

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
