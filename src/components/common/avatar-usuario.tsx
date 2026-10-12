import { UserRound } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface Props {
  fotoUrl?: string | null
  nombre?: string | null
  className?: string
}

// Ícono genérico en vez de iniciales: más neutro cuando el usuario todavía no subió una foto.
export function AvatarUsuario({ fotoUrl, nombre, className }: Props) {
  return (
    <Avatar className={className}>
      {fotoUrl ? <AvatarImage src={fotoUrl} alt={nombre ?? 'Usuario'} /> : null}
      <AvatarFallback>
        <UserRound className="size-[55%]" />
      </AvatarFallback>
    </Avatar>
  )
}
