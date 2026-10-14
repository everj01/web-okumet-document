import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Resumen corto a mano; actualízalo cuando se agregue algo nuevo que valga la pena contar.
const NOVEDADES = [
  'Sube documentos sin ligarlos a un expediente todavía y asígnalos después con IA, uno por uno, desde Documentos.',
  'Límite de almacenamiento por negocio, con aviso en tu perfil cuando se acerca al tope.',
  'Reporta fallas directo desde la app (el ícono de bicho junto a notificaciones): incluye una captura y lo revisa soporte.',
  'El panel de soporte técnico ahora muestra más detalle en sus tablas y un resumen numérico en el dashboard.',
]

interface Props {
  abierto: boolean
  onAbierto: (abierto: boolean) => void
}

export function NovedadesModal({ abierto, onAbierto }: Props) {
  return (
    <Dialog open={abierto} onOpenChange={onAbierto}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-4.5 text-accent" />
            Novedades
          </DialogTitle>
          <DialogDescription>Lo último que agregamos a Okumet Document.</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5 text-sm">
          {NOVEDADES.map((texto, indice) => (
            <li key={indice} className="flex gap-2">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
              <span className="text-muted-foreground">{texto}</span>
            </li>
          ))}
        </ul>

        <Button variant="outline" onClick={() => onAbierto(false)}>
          Entendido
        </Button>
      </DialogContent>
    </Dialog>
  )
}
