import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { BadgeCheck, Info, KeyRound, Loader2, Sparkles, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { AvatarUsuario } from '@/components/common/avatar-usuario'
import { Campo } from '@/components/common/campo'
import { PageHeader } from '@/components/common/page-header'
import { useAuth } from '@/features/auth/auth-context'
import { useClaudeUso } from '@/features/claude-usage/hooks'
import { api, mensajeDeError } from '@/lib/api'
import { cn } from '@/lib/utils'
import { useActualizarDatosPerfil, useQuitarFotoPerfil, useSubirFotoPerfil } from './hooks'

const esquemaDatos = z.object({
  dni: z.string().max(20),
  colegiatura: z.string().max(20),
})

type FormularioDatos = z.infer<typeof esquemaDatos>

const esquema = z
  .object({
    password_actual: z.string().min(1, 'Ingresa tu contraseña actual'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().min(1, 'Repite la nueva contraseña'),
  })
  .refine((datos) => datos.password === datos.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Las contraseñas no coinciden',
  })

type Formulario = z.infer<typeof esquema>

export default function PerfilPage() {
  const { usuario, rol } = useAuth()
  const { data: claudeUso } = useClaudeUso()
  const subirFoto = useSubirFotoPerfil()
  const quitarFoto = useQuitarFotoPerfil()
  const actualizarDatos = useActualizarDatosPerfil()
  const inputFotoRef = useRef<HTMLInputElement>(null)

  const {
    register: registerDatos,
    handleSubmit: handleSubmitDatos,
    reset: resetDatos,
    formState: { errors: erroresDatos },
  } = useForm<FormularioDatos>({
    resolver: zodResolver(esquemaDatos),
    defaultValues: { dni: '', colegiatura: '' },
  })

  useEffect(() => {
    resetDatos({ dni: usuario?.dni ?? '', colegiatura: usuario?.colegiatura ?? '' })
  }, [usuario, resetDatos])

  const enviarDatos = handleSubmitDatos((valores) =>
    actualizarDatos.mutate({ dni: valores.dni || null, colegiatura: valores.colegiatura || null }),
  )

  const elegirFoto = (archivo: File | null) => {
    if (archivo) subirFoto.mutate(archivo)
  }

  const { register, handleSubmit, reset, formState } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { password_actual: '', password: '', password_confirmation: '' },
  })

  const cambiar = useMutation({
    mutationFn: (datos: Formulario) => api<void>('/perfil/password', { method: 'PUT', body: datos }),
    onSuccess: () => {
      reset()
      toast.success('Contraseña actualizada')
    },
    onError: (error) => toast.error('No se pudo actualizar', { description: mensajeDeError(error) }),
  })

  const enviar = handleSubmit((valores) => cambiar.mutate(valores))
  const errores = formState.errors

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader titulo="Mi perfil" descripcion="Datos de tu cuenta y seguridad." />

      <Card className="aparecer">
        <CardContent className="flex flex-wrap items-center gap-5 p-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => inputFotoRef.current?.click()}
              className="group relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl"
              title="Cambiar foto"
              aria-label="Cambiar foto"
            >
              <AvatarUsuario fotoUrl={usuario?.foto_url} nombre={usuario?.name} className="size-16 rounded-2xl" />
              <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-white group-hover:flex">
                {subirFoto.isPending ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
              </span>
            </button>
            <input
              ref={inputFotoRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(evento) => elegirFoto(evento.target.files?.[0] ?? null)}
            />
            {usuario?.foto_url ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => quitarFoto.mutate()}
                disabled={quitarFoto.isPending}
                title="Quitar foto"
                aria-label="Quitar foto"
              >
                {quitarFoto.isPending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              </Button>
            ) : null}
          </div>

          <div className="grid flex-1 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Nombre</p>
              <p className="text-sm">{usuario?.name}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Correo</p>
              <p className="truncate text-sm">{usuario?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rol</p>
              <p className="text-sm capitalize">{rol}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {claudeUso ? (
        <Card className="aparecer">
          <div className="flex items-center gap-2 border-b border-border px-6 py-4">
            <Sparkles className="size-4 text-muted-foreground" />
            <h2 className="font-medium">Uso de asistente IA este mes</h2>
          </div>

          <CardContent className="space-y-2 p-6">
            <div className="flex items-baseline justify-between text-sm">
              <span>
                {claudeUso.usado} de {claudeUso.limite} llamadas usadas
              </span>
              <span className="text-xs text-muted-foreground">Periodo {claudeUso.periodo}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  claudeUso.usado >= claudeUso.limite
                    ? 'bg-destructive'
                    : claudeUso.advertencia
                      ? 'bg-warning'
                      : 'bg-primary',
                )}
                style={{ width: `${Math.min(100, (claudeUso.usado / claudeUso.limite) * 100)}%` }}
              />
            </div>
            {claudeUso.usado >= claudeUso.limite ? (
              <p className="text-xs text-destructive">
                Alcanzaste el límite mensual. Se restablece al iniciar el próximo mes.
              </p>
            ) : claudeUso.advertencia ? (
              <p className="flex items-center gap-1.5 text-xs text-warning">
                <Info className="size-3.5 shrink-0" />
                Te quedan pocos créditos de IA este mes (quedan {claudeUso.restante}).
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card className="aparecer">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <BadgeCheck className="size-4 text-muted-foreground" />
          <h2 className="font-medium">Datos de abogado</h2>
        </div>

        <CardContent className="space-y-4 p-6">
          <form onSubmit={enviarDatos} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="DNI" error={erroresDatos.dni?.message}>
                <Input {...registerDatos('dni')} />
              </Campo>

              <Campo etiqueta="Colegiatura" error={erroresDatos.colegiatura?.message}>
                <Input {...registerDatos('colegiatura')} />
              </Campo>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={actualizarDatos.isPending}>
                {actualizarDatos.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Guardar datos
              </Button>
            </div>
          </form>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <label className="flex items-center gap-3">
              <Switch checked={usuario?.abogado_habilitado ?? false} disabled />
              <span className="text-sm text-muted-foreground">Abogado habilitado</span>
            </label>
            <Button type="button" variant="outline" size="sm" disabled title="Validación automática en proceso">
              Validar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="aparecer">
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          <KeyRound className="size-4 text-muted-foreground" />
          <h2 className="font-medium">Cambiar contraseña</h2>
        </div>

        <CardContent className="p-6">
          <form onSubmit={enviar} className="space-y-4" noValidate>
            <Campo etiqueta="Contraseña actual" obligatorio error={errores.password_actual?.message}>
              <Input type="password" autoComplete="current-password" {...register('password_actual')} />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Nueva contraseña" obligatorio error={errores.password?.message}>
                <Input type="password" autoComplete="new-password" {...register('password')} />
              </Campo>

              <Campo etiqueta="Repite la nueva" obligatorio error={errores.password_confirmation?.message}>
                <Input type="password" autoComplete="new-password" {...register('password_confirmation')} />
              </Campo>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={cambiar.isPending}>
                {cambiar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Actualizar contraseña
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
