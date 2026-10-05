import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/common/campo'
import { mensajeDeError } from '@/lib/api'
import { useAuth } from './auth-context'

const esquema = z
  .object({
    nombre_comercial: z.string().min(1, 'Ingresa el nombre del negocio').max(180),
    ruc: z.string().min(1, 'Ingresa el RUC').max(20),
    name: z.string().min(1, 'Ingresa tu nombre').max(150),
    email: z.string().min(1, 'Escribe tu correo').email('El correo no es válido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    password_confirmation: z.string().min(1, 'Repite la contraseña'),
  })
  .refine((datos) => datos.password === datos.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Las contraseñas no coinciden',
  })

type Formulario = z.infer<typeof esquema>

export default function RegistroPage() {
  const { registrar } = useAuth()
  const navegar = useNavigate()
  const [error, setError] = useState('')
  const [verClave, setVerClave] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({
    resolver: zodResolver(esquema),
    defaultValues: { nombre_comercial: '', ruc: '', name: '', email: '', password: '', password_confirmation: '' },
  })

  const enviar = handleSubmit(async (valores) => {
    setError('')

    try {
      await registrar(valores)
      navegar('/panel', { replace: true })
    } catch (e) {
      setError(mensajeDeError(e, 'No se pudo completar el registro.'))
    }
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md rounded-lg">
        <CardContent className="space-y-6 p-7">
          <div className="space-y-3 text-center">
            <Building2 className="mx-auto size-8 text-primary" />
            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Registra tu negocio</h1>
              <p className="text-sm text-muted-foreground">
                Crea tu cuenta de administrador. Luego podrás invitar a tus abogados.
              </p>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <form onSubmit={enviar} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Nombre del negocio" error={errors.nombre_comercial?.message}>
                <Input aria-invalid={Boolean(errors.nombre_comercial)} {...register('nombre_comercial')} />
              </Campo>

              <Campo etiqueta="RUC" error={errors.ruc?.message}>
                <Input aria-invalid={Boolean(errors.ruc)} {...register('ruc')} />
              </Campo>
            </div>

            <Campo etiqueta="Tu nombre" error={errors.name?.message}>
              <Input aria-invalid={Boolean(errors.name)} {...register('name')} />
            </Campo>

            <Campo etiqueta="Correo" error={errors.email?.message}>
              <Input
                type="email"
                autoComplete="username"
                aria-invalid={Boolean(errors.email)}
                {...register('email')}
              />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo etiqueta="Contraseña" error={errors.password?.message}>
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
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Crear mi negocio
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium text-foreground hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
