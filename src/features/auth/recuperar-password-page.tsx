import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, MailCheck, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/common/campo'
import { useSolicitarRecuperacion } from './hooks'

const esquema = z.object({
  email: z.string().min(1, 'Escribe tu correo').email('El correo no es válido'),
})

type Formulario = z.infer<typeof esquema>

export default function RecuperarPasswordPage() {
  const solicitar = useSolicitarRecuperacion()
  const [enviado, setEnviado] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Formulario>({ resolver: zodResolver(esquema), defaultValues: { email: '' } })

  const enviar = handleSubmit(({ email }) => {
    solicitar.mutate(email, { onSuccess: () => setEnviado(true) })
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm rounded-xl p-0 shadow-xl">
        <CardContent className="space-y-6 p-7">
          <div className="flex items-center gap-2">
            <Scale className="size-5 text-accent" />
            <span className="font-semibold tracking-tight">Okumet Document</span>
          </div>

          {enviado ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                <MailCheck className="size-6" />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-semibold">Revisa tu correo</h1>
                <p className="text-sm text-muted-foreground">
                  Si ese correo está registrado, te enviamos un enlace para restablecer tu contraseña. Vence en 60
                  minutos.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h1 className="text-xl font-semibold">¿Olvidaste tu contraseña?</h1>
                <p className="text-sm text-muted-foreground">
                  Escribe tu correo y te enviamos un enlace para elegir una nueva.
                </p>
              </div>

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

                <Button type="submit" className="w-full" disabled={solicitar.isPending}>
                  {solicitar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Enviar enlace
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
