import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/common/campo'
import { useAuth } from './auth-context'
import { mensajeDeError } from '@/lib/api'

const esquema = z.object({
  email: z.string().min(1, 'Escribe tu correo').email('El correo no es válido'),
  password: z.string().min(1, 'Escribe tu contraseña'),
})

type Formulario = z.infer<typeof esquema>

export default function LoginPage() {
  const { iniciarSesion } = useAuth()
  const navegar = useNavigate()
  const [error, setError] = useState('')
  const [verClave, setVerClave] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(esquema), defaultValues: { email: '', password: '' } })

  const enviar = handleSubmit(async ({ email, password }) => {
    setError('')

    try {
      await iniciarSesion(email, password)
      navegar('/panel', { replace: true })
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo iniciar sesión.'))
    }
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm rounded-lg">
        <CardContent className="space-y-6 p-7">
          <div className="space-y-3 text-center">
            <Scale className="mx-auto size-8 text-primary" />
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Bienvenido de vuelta</h1>
              <p className="text-sm text-muted-foreground">Ingresa con la cuenta que te asignaron.</p>
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
                placeholder="ejemplo@gmail.com"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </Campo>

            <Campo etiqueta="Contraseña" error={errors.password?.message}>
              <div className="relative">
                <Input
                  type={verClave ? 'text' : 'password'}
                  autoComplete="current-password"
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
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verClave ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>
              </div>
            </Campo>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Ingresar
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿Tu negocio no tiene cuenta todavía?{' '}
            <Link to="/registro" className="font-medium text-foreground hover:underline">
              Regístralo
            </Link>
          </p>

          <p className="text-center text-xs text-muted-foreground">Acceso restringido al personal autorizado</p>
        </CardContent>
      </Card>
    </div>
  )
}
