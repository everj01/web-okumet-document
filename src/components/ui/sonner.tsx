import { Toaster as Sonner } from 'sonner'
import { useTema } from '@/hooks/use-tema'

export function Toaster() {
  const { tema } = useTema()

  return (
    <Sonner
      theme={tema}
      position="top-right"
      richColors
      closeButton
      toastOptions={{ classNames: { toast: 'rounded-xl' } }}
    />
  )
}
