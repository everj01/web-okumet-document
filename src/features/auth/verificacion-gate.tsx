import { useEffect, useState } from 'react'
import { Loader2, MailCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from './auth-context'
import { useConfirmarCodigo, useReenviarCodigo } from './hooks'

const SEGUNDOS_ESPERA = 60

export function VerificacionGate() {
  const { usuario } = useAuth()
  const confirmar = useConfirmarCodigo()
  const reenviar = useReenviarCodigo()
  const [codigo, setCodigo] = useState('')
  const [espera, setEspera] = useState(0)

  useEffect(() => {
    if (espera <= 0) return

    const id = setInterval(() => setEspera((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [espera])

  if (!usuario || usuario.email_verificado) return null

  const enviar = (evento: React.FormEvent) => {
    evento.preventDefault()
    if (codigo.length !== 6) return
    confirmar.mutate(codigo, { onError: () => setCodigo('') })
  }

  const pedirReenvio = () => {
    reenviar.mutate(undefined, { onSuccess: () => setEspera(SEGUNDOS_ESPERA) })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/95 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-lg aparecer">
        <div className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <MailCheck className="size-6" />
        </div>

        <h1 className="text-lg font-semibold">Verifica tu correo</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enviamos un código de 6 caracteres a <span className="font-medium text-foreground">{usuario.email}</span>.
          Ingrésalo para continuar.
        </p>

        <form onSubmit={enviar} className="mt-5 space-y-3">
          <Input
            value={codigo}
            onChange={(evento) => setCodigo(evento.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="A3F9K2"
            autoFocus
            className="text-center text-xl font-mono tracking-[0.4em]"
            aria-label="Código de verificación"
          />

          <Button type="submit" className="w-full" disabled={codigo.length !== 6 || confirmar.isPending}>
            {confirmar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
            Confirmar
          </Button>
        </form>

        <button
          type="button"
          onClick={pedirReenvio}
          disabled={espera > 0 || reenviar.isPending}
          className="mt-4 text-sm text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {espera > 0 ? `Reenviar código (${espera}s)` : 'Reenviar código'}
        </button>
      </div>
    </div>
  )
}
