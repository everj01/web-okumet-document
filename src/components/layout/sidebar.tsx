import { useState } from 'react'
import { NavLink } from 'react-router'
import { ChevronsLeft, ChevronsRight, HardDrive, Scale, Sparkles } from 'lucide-react'
import { useAlmacenamientoUso } from '@/features/almacenamiento/hooks'
import { useAuth } from '@/features/auth/auth-context'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { mbLegible } from '@/lib/formato'
import { GRUPOS } from './navegacion'
import { NovedadesModal } from './novedades-modal'
import { cn } from '@/lib/utils'

// mismo umbral que ya se usa para el aviso de créditos de IA: no molesta hasta que de verdad importa
const UMBRAL_ADVERTENCIA = 0.9

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
  const [novedadesAbierto, setNovedadesAbierto] = useState(false)
  const { data: almacenamiento } = useAlmacenamientoUso()

  const porcentajeAlmacenamiento =
    almacenamiento?.limite_mb ? Math.min(100, (almacenamiento.usado_mb / almacenamiento.limite_mb) * 100) : 0
  const mostrarAvisoAlmacenamiento = Boolean(almacenamiento?.limite_mb) && porcentajeAlmacenamiento >= UMBRAL_ADVERTENCIA * 100

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

        {!colapsado && mostrarAvisoAlmacenamiento && almacenamiento ? (
          <div className="px-5 pb-3">
            <div className="flex items-center justify-between gap-2 text-[11px] text-sidebar-foreground/60">
              <span className="flex items-center gap-1">
                <HardDrive className="size-3" />
                Almacenamiento
              </span>
              <span>
                {mbLegible(almacenamiento.usado_mb)} / {mbLegible(almacenamiento.limite_mb ?? 0)}
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  porcentajeAlmacenamiento >= 100 ? 'bg-destructive' : 'bg-warning',
                )}
                style={{ width: `${porcentajeAlmacenamiento}%` }}
              />
            </div>
          </div>
        ) : null}

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

        <div className={cn('flex items-center justify-between gap-1 px-3 py-2', colapsado && 'flex-col-reverse')}>
          <button
            type="button"
            onClick={() => setNovedadesAbierto(true)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-sidebar-foreground/60 transition-colors hover:text-white"
            title="Ver novedades"
            aria-label="Ver novedades"
          >
            <Sparkles className="size-3.5 shrink-0" />
            {colapsado ? null : 'Novedades'}
          </button>

          {onAlternarColapso ? (
            <button
              type="button"
              onClick={onAlternarColapso}
              className="rounded-lg p-1.5 text-sidebar-foreground/60 transition-colors hover:text-white"
              title={colapsado ? 'Expandir menú' : 'Reducir menú'}
              aria-label={colapsado ? 'Expandir menú' : 'Reducir menú'}
            >
              {colapsado ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
            </button>
          ) : null}
        </div>
      </div>

      <NovedadesModal abierto={novedadesAbierto} onAbierto={setNovedadesAbierto} />
    </TooltipProvider>
  )
}
