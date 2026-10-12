import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAuth } from '@/features/auth/auth-context'

const CLAVE_VISTA = 'okd_alerta_datos_abogado_vista'

export function CompletarDatosAlerta() {
  const { usuario } = useAuth()
  const navegar = useNavigate()
  const [abierto, setAbierto] = useState(false)

  const faltanDatos = Boolean(usuario) && !usuario?.dni && !usuario?.colegiatura

  useEffect(() => {
    if (!faltanDatos) return
    if (sessionStorage.getItem(CLAVE_VISTA) === '1') return

    setAbierto(true)
  }, [faltanDatos])

  const cerrar = (abierto: boolean) => {
    if (!abierto) sessionStorage.setItem(CLAVE_VISTA, '1')
    setAbierto(abierto)
  }

  return (
    <Dialog open={abierto} onOpenChange={cerrar}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
            <BadgeCheck className="size-5" />
          </div>
          <DialogTitle>Completa tus datos</DialogTitle>
          <DialogDescription>
            Agrega tu DNI y número de colegiatura en tu perfil. Más adelante usaremos estos datos para validar si
            estás habilitado como abogado. Es opcional, puedes hacerlo cuando quieras.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="outline" onClick={() => cerrar(false)}>
            Ahora no
          </Button>
          <Button
            onClick={() => {
              cerrar(false)
              navegar('/perfil')
            }}
          >
            Completar ahora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
