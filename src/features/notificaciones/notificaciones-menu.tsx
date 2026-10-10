import { Bell, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { EstadoVacio } from '@/components/common/estados'
import { desdeAhora } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { estiloNotificacion } from './tipos'
import { useMarcarLeida, useMarcarTodasLeidas, useNotificaciones, useResumenNotificaciones } from './hooks'

export function NotificacionesMenu() {
  const { data: resumen } = useResumenNotificaciones()
  const { data: pagina, isPending } = useNotificaciones(1)
  const marcarLeida = useMarcarLeida()
  const marcarTodas = useMarcarTodasLeidas()

  const notificaciones = pagina?.data ?? []
  const noLeidas = resumen?.no_leidas ?? 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" title="Notificaciones" aria-label="Notificaciones">
          <Bell className="size-4.5" />
          {noLeidas > 0 ? (
            <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground">
              {noLeidas > 9 ? '9+' : noLeidas}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
          <span className="text-sm font-medium">Notificaciones</span>
          {noLeidas > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              disabled={marcarTodas.isPending}
              onClick={() => marcarTodas.mutate()}
            >
              <CheckCheck className="size-3.5" />
              Marcar todas
            </Button>
          ) : null}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isPending ? (
            <p className="p-4 text-sm text-muted-foreground">Cargando...</p>
          ) : notificaciones.length ? (
            notificaciones.map((notificacion) => {
              const { icono: Icono, clase } = estiloNotificacion(notificacion.tipo)

              return (
                <div
                  key={notificacion.uuid}
                  className={cn(
                    'flex gap-3 border-b border-border px-3 py-2.5 last:border-0',
                    !notificacion.leida && 'bg-accent/5',
                  )}
                >
                  <span className={cn('grid size-8 shrink-0 place-items-center rounded-full', clase)}>
                    <Icono className="size-4" />
                  </span>

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-sm font-medium">{notificacion.titulo}</p>
                    <p className="text-xs text-muted-foreground">{notificacion.mensaje}</p>
                    <p className="text-[11px] text-muted-foreground">{desdeAhora(notificacion.creado_en)}</p>
                  </div>

                  {!notificacion.leida ? (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="shrink-0 self-start"
                      title="Marcar como visto"
                      aria-label="Marcar como visto"
                      disabled={marcarLeida.isPending}
                      onClick={() => marcarLeida.mutate(notificacion.uuid)}
                    >
                      <Check className="size-4" />
                    </Button>
                  ) : null}
                </div>
              )
            })
          ) : (
            <EstadoVacio icono={Bell} titulo="Sin notificaciones" className="py-8" />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
