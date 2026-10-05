import * as React from 'react'
import * as SheetPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close

function SheetContent({
  className,
  children,
  side = 'left',
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: 'left' | 'right' }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-black/45 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          'fixed inset-y-0 z-50 flex h-full w-72 flex-col gap-4 bg-sidebar text-sidebar-foreground shadow-lg transition ease-in-out data-[state=closed]:duration-200 data-[state=open]:duration-300',
          side === 'left'
            ? 'left-0 data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left'
            : 'right-0 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="absolute top-4 right-4 rounded-md p-1 opacity-70 transition hover:opacity-100 focus-visible:outline-none">
          <X className="size-4" />
          <span className="sr-only">Cerrar</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  )
}

function SheetTitle({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return <SheetPrimitive.Title className={cn('text-base font-semibold', className)} {...props} />
}

function SheetDescription({ className, ...props }: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return <SheetPrimitive.Description className={cn('text-sm opacity-80', className)} {...props} />
}

export { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger }
