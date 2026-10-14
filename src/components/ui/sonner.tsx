import { Toaster as Sonner } from 'sonner'
import { useTema } from '@/hooks/use-tema'

export function Toaster() {
  const { tema } = useTema()

  return (
    <Sonner
      theme={tema}
      position="top-right"
      // debajo del topbar (h-16 = 4rem) para que no choque ni se recorte contra él
      offset={{ top: '4.5rem' }}
      richColors
      closeButton
      toastOptions={{ classNames: { toast: 'rounded-xl' } }}
    />
  )
}
