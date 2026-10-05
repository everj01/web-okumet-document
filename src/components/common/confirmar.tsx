import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Opciones {
  titulo: string
  descripcion?: string
  confirmar?: string
  cancelar?: string
  peligroso?: boolean
}

const ConfirmarContext = createContext<((opciones: Opciones) => Promise<boolean>) | null>(null)

export function ConfirmarProvider({ children }: { children: React.ReactNode }) {
  const [opciones, setOpciones] = useState<Opciones | null>(null)
  const resolver = useRef<(valor: boolean) => void>(null)

  const confirmar = useCallback((nuevas: Opciones) => {
    setOpciones(nuevas)

    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const responder = (valor: boolean) => {
    resolver.current?.(valor)
    resolver.current = null
    setOpciones(null)
  }

  const valor = useMemo(() => confirmar, [confirmar])

  return (
    <ConfirmarContext.Provider value={valor}>
      {children}
      <AlertDialog open={opciones !== null} onOpenChange={(abierto) => !abierto && responder(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{opciones?.titulo}</AlertDialogTitle>
            {opciones?.descripcion ? <AlertDialogDescription>{opciones.descripcion}</AlertDialogDescription> : null}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => responder(false)}>{opciones?.cancelar ?? 'Cancelar'}</AlertDialogCancel>
            <AlertDialogAction
              className={cn(opciones?.peligroso && buttonVariants({ variant: 'destructive' }))}
              onClick={() => responder(true)}
            >
              {opciones?.confirmar ?? 'Confirmar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmarContext.Provider>
  )
}

export function useConfirmar() {
  const contexto = useContext(ConfirmarContext)

  if (!contexto) {
    throw new Error('useConfirmar debe usarse dentro de ConfirmarProvider')
  }

  return contexto
}
