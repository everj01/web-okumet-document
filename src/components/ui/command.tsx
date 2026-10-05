import * as React from 'react'
import { Command as CommandPrimitive } from 'cmdk'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn('flex size-full flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground', className)}
      {...props}
    />
  )
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-3">
      <Search className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className={cn(
          'flex h-9 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground',
          className,
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return <CommandPrimitive.List className={cn('max-h-60 overflow-y-auto overflow-x-hidden p-1', className)} {...props} />
}

function CommandEmpty(props: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground" {...props} />
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return <CommandPrimitive.Group className={cn('overflow-hidden', className)} {...props} />
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        'relative flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none select-none data-[selected=true]:bg-secondary data-[disabled=true]:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList }
