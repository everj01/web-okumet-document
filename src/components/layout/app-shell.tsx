import { Suspense } from 'react'
import { Outlet } from 'react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { useCanalAgenda } from '@/features/agenda/use-canal-agenda'
import { VerificacionGate } from '@/features/auth/verificacion-gate'
import { useCanalUsuario } from '@/features/notificaciones/use-canal-usuario'
import { CompletarDatosAlerta } from '@/features/perfil/completar-datos-alerta'
import { useSidebarColapsado } from '@/hooks/use-sidebar-colapsado'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

function CargandoVista() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export function AppShell() {
  useCanalAgenda()
  useCanalUsuario()
  const { colapsado, alternar } = useSidebarColapsado()

  return (
    <div className="flex min-h-dvh">
      <VerificacionGate />
      <CompletarDatosAlerta />
      <aside
        className={cn(
          'hidden shrink-0 transition-[width] duration-200 lg:block',
          colapsado ? 'w-16' : 'w-64',
        )}
      >
        <div className={cn('fixed inset-y-0 transition-[width] duration-200', colapsado ? 'w-16' : 'w-64')}>
          <Sidebar colapsado={colapsado} onAlternarColapso={alternar} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl flex-1 p-4 lg:p-6">
          <Suspense fallback={<CargandoVista />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
