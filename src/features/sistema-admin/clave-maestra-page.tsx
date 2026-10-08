import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, ShieldQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Campo } from '@/components/common/campo'
import { mensajeDeError } from '@/lib/api'
import { useSistemaAdmin } from './sistema-admin-context'

const esquema = z.object({ clave: z.string().min(1, 'Ingresa la clave') })
type Formulario = z.infer<typeof esquema>

export default function ClaveMaestraPage() {
  const { abrirCompuerta } = useSistemaAdmin()
  const navegar = useNavigate()
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Formulario>({ resolver: zodResolver(esquema), defaultValues: { clave: '' } })

  const enviar = handleSubmit(async ({ clave }) => {
    setError('')

    try {
      await abrirCompuerta(clave)
      navegar('/sistema_admin/login', { replace: true })
    } catch (e) {
      setError(mensajeDeError(e, 'Clave incorrecta.'))
    }
  })

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm rounded-lg">
        <CardContent className="space-y-6 p-7">
          <div className="space-y-3 text-center">
            <ShieldQuestion className="mx-auto size-8 text-primary" />
            <div className="space-y-1">
              <h1 className="text-xl font-semibold">Acceso restringido</h1>
              <p className="text-sm text-muted-foreground">Área de soporte técnico. Ingresa la clave maestra.</p>
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <form onSubmit={enviar} className="space-y-4" noValidate>
            <Campo etiqueta="Clave maestra" error={errors.clave?.message}>
              <Input type="password" autoComplete="off" aria-invalid={Boolean(errors.clave)} {...register('clave')} />
            </Campo>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
              Continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
