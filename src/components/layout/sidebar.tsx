import { NavLink } from 'react-router'
import { ChevronsLeft, ChevronsRight, Scale } from 'lucide-react'
import { useAuth } from '@/features/auth/auth-context'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { GRUPOS } from './navegacion'
import { cn } from '@/lib/utils'

interface Props {
  onNavegar?: () => void
  // Solo aplica en la versión fija de escritorio; el panel móvil siempre va expandido.
  colapsado?: boolean
  onAlternarColapso?: () => void
}

export function Sidebar({ onNavegar, colapsado = false, onAlternarColapso }: Props) {
  const { esAdmin, usuario } = useAuth()
  const tenant = usuario?.tenant
  const nombreNegocio = tenant?.nombre_comercial

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
        <div className={cn('flex h-16 items-center gap-2.5 px-5', colapsado && 'justify-center px-0')}>
          <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-accent text-accent-foreground">
            {tenant?.logo_url ? (
              <img src={tenant.logo_url} alt={nombreNegocio} className="size-full object-cover" />
            ) : (
              <Scale className="size-4.5" />
            )}
          </div>
          {colapsado ? null : (
            <div className="min-w-0 leading-tight">
              <p className="truncate font-semibold text-white">{nombreNegocio || 'Okumet Document'}</p>
              <p className="text-[11px] tracking-wide text-sidebar-foreground/60 uppercase">Gestión de estudio</p>
            </div>
          )}
        </div>

        <nav className={cn('flex-1 space-y-6 overflow-y-auto py-4', colapsado ? 'px-2' : 'px-3')}>
          {GRUPOS.map((grupo) => {
            const items = grupo.items.filter((item) => !item.soloAdmin || esAdmin)

            if (!items.length) return null

            return (
              <div key={grupo.titulo}>
                {colapsado ? null : (
                  <p className="px-3 pb-2 text-[11px] font-medium tracking-wider text-sidebar-foreground/45 uppercase">
                    {grupo.titulo}
                  </p>
                )}
                <div className="space-y-0.5">
                  {items.map(({ etiqueta, ruta, icono: Icono }) => {
                    const enlace = (
                      <NavLink
                        key={ruta}
                        to={ruta}
                        onClick={onNavegar}
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                            colapsado && 'justify-center px-0 py-2.5',
                            isActive
                              ? 'bg-sidebar-accent font-medium text-white'
                              : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white',
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <span
                              className={cn(
                                'absolute top-1/2 left-0 h-5 w-0.5 -translate-y-1/2 rounded-r bg-accent transition-opacity',
                                isActive ? 'opacity-100' : 'opacity-0',
                              )}
                            />
                            <Icono className="size-4.5 shrink-0" />
                            {colapsado ? null : etiqueta}
                          </>
                        )}
                      </NavLink>
                    )

                    if (!colapsado) return enlace

                    return (
                      <Tooltip key={ruta}>
                        <TooltipTrigger asChild>{enlace}</TooltipTrigger>
                        <TooltipContent side="right">{etiqueta}</TooltipContent>
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {onAlternarColapso ? (
          <button
            type="button"
            onClick={onAlternarColapso}
            className="flex items-center gap-2 px-5 py-3 text-xs text-sidebar-foreground/60 transition-colors hover:text-white"
            aria-label={colapsado ? 'Expandir menú' : 'Reducir menú'}
          >
            {colapsado ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
           
          </button>
        ) : (
          <p className="px-5 py-4 text-[11px] text-sidebar-foreground/40">v1.0 · {new Date().getFullYear()}</p>
        )}
      </div>
    </TooltipProvider>
  )
}
