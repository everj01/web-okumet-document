import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Eye, EyeOff, Loader2, Scale, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/common/campo'
import { mensajeDeError } from '@/lib/api'
import { useRestablecerPassword } from './hooks'

const esquema = z
  .object({
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().min(1, 'Repite la contraseña'),
  })
  .refine((datos) => datos.password === datos.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Las contraseñas no coinciden',
  })

type Formulario = z.infer<typeof esquema>

export default function RestablecerPasswordPage() {
  const [params] = useSearchParams()
  const navegar = useNavigate()
  const restablecer = useRestablecerPassword()
  const [verClave, setVerClave] = useState(false)

  const email = params.get('email') ?? ''
  const token = params.get('token') ?? ''
  const enlaceInvalido = !email || !token

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { password: '', password_confirmation: '' },
  })

  const enviar = handleSubmit((valores) => {
    restablecer.mutate(
      { email, token, ...valores },
      {
        onSuccess: () => {
          toast.success('Contraseña actualizada', { description: 'Ya puedes iniciar sesión.' })
          navegar('/login', { replace: true })
        },
        onError: (error) =>
          toast.error('No se pudo restablecer', {
            description: mensajeDeError(error, 'El enlace ya no es válido. Pide uno nuevo.'),
          }),
      },
    )
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm rounded-xl p-0 shadow-xl">
        <CardContent className="space-y-6 p-7">
          <div className="flex items-center gap-2">
            <Scale className="size-5 text-accent" />
            <span className="font-semibold tracking-tight">Okumet Document</span>
          </div>

          {enlaceInvalido ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
                <ShieldAlert className="size-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-semibold">Enlace inválido</h1>
                <p className="text-sm text-muted-foreground">
                  Este enlace está incompleto o ya no es válido. Pide uno nuevo desde la pantalla de inicio de sesión.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h1 className="text-xl font-semibold">Elige tu nueva contraseña</h1>
                <p className="text-sm text-muted-foreground">Para la cuenta {email}.</p>
              </div>

              <form onSubmit={enviar} className="space-y-4" noValidate>
                <Campo etiqueta="Nueva contraseña" error={errors.password?.message}>
                  <div className="relative">
                    <Input
                      type={verClave ? 'text' : 'password'}
                      autoComplete="new-password"
                      aria-invalid={Boolean(errors.password)}
                      className="pr-10"
                      {...register('password')}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute top-1/2 right-1 -translate-y-1/2"
                      onClick={() => setVerClave((visible) => !visible)}
                      title={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                </Campo>

                <Campo etiqueta="Repite la contraseña" error={errors.password_confirmation?.message}>
                  <Input
                    type={verClave ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password_confirmation)}
                    {...register('password_confirmation')}
                  />
                </Campo>

                <Button type="submit" className="w-full" disabled={restablecer.isPending}>
                  {restablecer.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Restablecer contraseña
                </Button>
              </form>
            </>
          )}

          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-muted-foreground hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Volver a iniciar sesión
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
