import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/common/campo'
import { mensajeDeError } from '@/lib/api'
import { useSistemaAdmin } from './sistema-admin-context'

const esquema = z.object({
  email: z.string().min(1, 'Escribe tu correo').email('El correo no es válido'),
  password: z.string().min(1, 'Escribe tu contraseña'),
})

type Formulario = z.infer<typeof esquema>

export default function SistemaAdminLoginPage() {
  const { iniciarSesion } = useSistemaAdmin()
  const navegar = useNavigate()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(esquema), defaultValues: { email: '', password: '' } })

  const enviar = handleSubmit(async ({ email, password }) => {
    setError('')

    try {
      await iniciarSesion(email, password)
      navegar('/sistema_admin/panel', { replace: true })
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo iniciar sesión.'))
    }
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm rounded-lg">
        <CardContent className="space-y-6 p-7">
          <div className="space-y-3 text-center">
            <ShieldAlert className="mx-auto size-8 text-primary" />
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">Sistema · Soporte</h1>
              <p className="text-sm text-muted-foreground">Cuenta de super administrador.</p>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <form onSubmit={enviar} className="space-y-4" noValidate>
            <Campo etiqueta="Correo" error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="username"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </Campo>

            <Campo etiqueta="Contraseña" error={errors.password?.message}>
              <Input
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                {...register('password')}
              />
            </Campo>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Ingresar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
