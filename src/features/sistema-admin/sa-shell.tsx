import { Suspense } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { LogOut, Moon, ShieldAlert, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTema } from '@/hooks/use-tema'
import { cn } from '@/lib/utils'
import { NAV_SA } from './sa-navegacion'
import { useSistemaAdmin } from './sistema-admin-context'

function CargandoVista() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function SaShell() {
  const { superAdmin, cerrarSesion } = useSistemaAdmin()
  const { tema, alternar } = useTema()
  const navegar = useNavigate()

  const salir = () => {
    cerrarSesion()
    navegar('/sistema_admin', { replace: true })
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="fixed inset-y-0 w-64 border-r border-border bg-sidebar text-sidebar-foreground">
          <div className="flex h-16 items-center gap-2.5 px-5">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
              <ShieldAlert className="size-4.5" />
            </div>
            <div className="min-w-0 leading-tight">
              <p className="truncate font-semibold text-white">Sistema · Soporte</p>
              <p className="text-[11px] tracking-wide text-sidebar-foreground/60 uppercase">Super admin</p>
            </div>
          </div>

          <nav className="space-y-0.5 px-3 py-4">
            {NAV_SA.map(({ etiqueta, ruta, icono: Icono }) => (
              <NavLink
                key={ruta}
                to={ruta}
                end={ruta === ''}
                className={({ isActive }) =>
                  cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-sidebar-accent font-medium text-white'
                      : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-white',
                  )
                }
              >
                <Icono className="size-4.5 shrink-0" />
                {etiqueta}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur lg:px-6">
          <p className="truncate text-sm text-muted-foreground lg:hidden">Sistema · Soporte</p>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={alternar} aria-label="Cambiar tema">
              {tema === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
            </Button>
            <span className="hidden text-sm text-muted-foreground sm:inline">{superAdmin?.email}</span>
            <Button variant="outline" size="sm" onClick={salir}>
              <LogOut className="size-4" />
              Salir
            </Button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 lg:p-6">
          <Suspense fallback={<CargandoVista />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
