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
import { Switch } from '@/components/ui/switch'
import { Campo } from '@/components/common/campo'
import { useCatalogos } from '@/features/catalogos/use-catalogos'
import type { Usuario } from '@/types'
import { useGuardarUsuario } from './hooks'

function crearEsquema(editando: boolean) {
  return z.object({
    name: z.string().min(1, 'Ingresa el nombre').max(150),
    email: z.string().min(1, 'Ingresa el correo').email('Correo no válido'),
    password: editando
      ? z.string().min(8, 'Mínimo 8 caracteres').or(z.literal(''))
      : z.string().min(8, 'Mínimo 8 caracteres'),
    rol_id: z.number().int().positive('Selecciona un rol'),
    telefono: z.string().max(30),
    dni: z.string().max(20),
    colegiatura: z.string().max(20),
    activo: z.boolean(),
  })
}

type Formulario = z.infer<ReturnType<typeof crearEsquema>>

interface Props {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
  usuario?: Usuario | null
}

export function UsuarioDialogo({ abierto, onAbierto, usuario }: Props) {
  const { data: catalogos } = useCatalogos()
  const guardar = useGuardarUsuario(usuario?.uuid)

  const { register, handleSubmit, reset, setValue, watch, formState } = useForm<Formulario>({
    resolver: zodResolver(crearEsquema(Boolean(usuario))),
  })

  useEffect(() => {
    if (!abierto) return

    reset({
      name: usuario?.name ?? '',
      email: usuario?.email ?? '',
      password: '',
      rol_id: usuario?.rol_id ?? 0,
      telefono: usuario?.telefono ?? '',
      dni: usuario?.dni ?? '',
      colegiatura: usuario?.colegiatura ?? '',
      activo: usuario?.activo ?? true,
    })
  }, [abierto, usuario, reset])

  const enviar = handleSubmit(async (valores) => {
    await guardar.mutateAsync({
      name: valores.name,
      email: valores.email,
      rol_id: valores.rol_id,
      telefono: valores.telefono || null,
      dni: valores.dni || null,
      colegiatura: valores.colegiatura || null,
      activo: valores.activo,
      ...(valores.password ? { password: valores.password } : {}),
    })

    onAbierto(false)
  })

  const errores = formState.errors

  return (
    <Dialog open={abierto} onOpenChange={onAbierto}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>El rol define qué puede ver y eliminar dentro del sistema.</DialogDescription>
        </DialogHeader>

        <form onSubmit={enviar} className="space-y-4" noValidate>
          <Campo etiqueta="Nombre" obligatorio error={errores.name?.message}>
            <Input {...register('name')} aria-invalid={Boolean(errores.name)} />
          </Campo>

          <Campo etiqueta="Correo" obligatorio error={errores.email?.message}>
            <Input type="email" {...register('email')} aria-invalid={Boolean(errores.email)} />
          </Campo>

          <Campo
            etiqueta="Contraseña"
            obligatorio={!usuario}
            error={errores.password?.message}
            ayuda={usuario ? 'Déjala vacía para no cambiarla' : 'Mínimo 8 caracteres'}
          >
            <Input type="password" autoComplete="new-password" {...register('password')} />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Rol" obligatorio error={errores.rol_id?.message}>
              <Select
                value={watch('rol_id') ? String(watch('rol_id')) : ''}
                onValueChange={(valor) => setValue('rol_id', Number(valor), { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {(catalogos?.roles ?? []).map((rol) => (
                    <SelectItem key={rol.id} value={String(rol.id)} className="capitalize">
                      {rol.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Campo>

            <Campo etiqueta="Teléfono">
              <Input {...register('telefono')} />
            </Campo>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="DNI" error={errores.dni?.message}>
              <Input {...register('dni')} />
            </Campo>

            <Campo etiqueta="Colegiatura" error={errores.colegiatura?.message}>
              <Input {...register('colegiatura')} />
            </Campo>
          </div>

          <label className="flex items-center gap-3">
            <Switch checked={watch('activo')} onCheckedChange={(valor) => setValue('activo', valor)} />
            <span className="text-sm">Puede iniciar sesión</span>
          </label>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <label className="flex items-center gap-3">
              <Switch checked={usuario?.abogado_habilitado ?? false} disabled />
              <span className="text-sm text-muted-foreground">Abogado habilitado</span>
            </label>
            <Button type="button" variant="outline" size="sm" disabled title="Validación automática en proceso">
              Validar
            </Button>
          </div>

          <DialogFooter>
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
