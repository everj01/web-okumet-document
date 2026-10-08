import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Info, KeyRound, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/common/campo'
import { PageHeader } from '@/components/common/page-header'
import { useAuth } from '@/features/auth/auth-context'
import { useClaudeUso } from '@/features/claude-usage/hooks'
import { api, mensajeDeError } from '@/lib/api'
import { iniciales } from '@/lib/formato'
import { cn } from '@/lib/utils'

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
          <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary text-xl font-semibold text-primary-foreground">
            {iniciales(usuario?.name)}
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
