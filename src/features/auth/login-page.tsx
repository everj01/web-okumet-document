import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CalendarClock, Eye, EyeOff, FolderSearch, Loader2, Scale, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/common/campo'
import { useAuth } from './auth-context'
import { mensajeDeError } from '@/lib/api'

const esquema = z.object({
  email: z.string().min(1, 'Escribe tu correo').email('El correo no es válido'),
  password: z.string().min(1, 'Escribe tu contraseña'),
})

type Formulario = z.infer<typeof esquema>

const PUNTOS = [
  { icono: FolderSearch, texto: 'Expedientes y documentos organizados por caso' },
  { icono: CalendarClock, texto: 'Plazos y audiencias con recordatorio automático' },
  { icono: ShieldCheck, texto: 'Cada estudio ve solo su propia información' },
]

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
      <Card className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 overflow-hidden rounded-xl border-none py-0 shadow-xl duration-700 ease-out">
        <div className="grid md:grid-cols-2">
          <div className="hidden flex-col justify-between gap-8 bg-primary p-8 text-primary-foreground md:flex">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/10">
                <Scale className="size-4 text-accent" />
              </div>
              <span className="font-semibold tracking-tight">Okumet Document</span>
            </div>

            <div className="space-y-6">
              <p className="text-xl leading-snug font-medium">El estudio, organizado desde un solo lugar.</p>

              <ul className="space-y-4">
                {PUNTOS.map(({ icono: Icono, texto }) => (
                  <li key={texto} className="flex items-start gap-3 text-sm text-primary-foreground/80">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-accent/20 text-accent">
                      <Icono className="size-3.5" />
                    </span>
                    {texto}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-primary-foreground/50">Plataforma para estudios de abogados</p>
          </div>

          <div className="space-y-6 p-7 sm:p-9">
            <div className="flex items-center gap-2 md:hidden">
              <Scale className="size-5 text-accent" />
              <span className="font-semibold tracking-tight">Okumet Document</span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-semibold">Bienvenido de vuelta</h1>
              <p className="text-sm text-muted-foreground">Ingresa con la cuenta que te asignaron.</p>
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

              <Campo
                etiqueta="Contraseña"
                error={errors.password?.message}
                extra={
                  <Link to="/recuperar" className="text-xs font-medium text-muted-foreground hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                }
              >
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
                    title={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
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
          </div>
        </div>
      </Card>
    </div>
  )
}
