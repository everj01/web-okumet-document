import { useState } from 'react'
import { Link } from 'react-router'
import { LogOut, Menu, Moon, Settings, Sparkles, Sun, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/features/auth/auth-context'
import { useClaudeUso } from '@/features/claude-usage/hooks'
import { NotificacionesMenu } from '@/features/notificaciones/notificaciones-menu'
import { useTema } from '@/hooks/use-tema'
import { iniciales } from '@/lib/formato'
import { cn } from '@/lib/utils'
import { Sidebar } from './sidebar'

export function Topbar() {
  const { usuario, rol, esAdmin, cerrarSesion } = useAuth()
  const { tema, alternar } = useTema()
  const { data: claudeUso } = useClaudeUso()
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur lg:px-6">
      <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" title="Abrir menú" aria-label="Abrir menú">
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Navegación</SheetTitle>
          <Sidebar onNavegar={() => setMenuAbierto(false)} />
        </SheetContent>
      </Sheet>

      <div className="ml-auto flex items-center gap-2">
        {claudeUso ? (
          <Link
            to="/perfil"
            title="Uso de asistente IA este mes"
            className={cn(
              'hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:flex',
              claudeUso.usado >= claudeUso.limite
                ? 'border-destructive/30 bg-destructive/10 text-destructive'
                : claudeUso.advertencia
                  ? 'border-warning/30 bg-warning/10 text-warning'
                  : 'border-border bg-secondary/60 text-muted-foreground hover:bg-secondary',
            )}
          >
            <Sparkles className="size-3.5" />
            {claudeUso.usado}/{claudeUso.limite}
          </Link>
        ) : null}

        <NotificacionesMenu />

        <Button variant="ghost" size="icon" onClick={alternar} title="Cambiar tema" aria-label="Cambiar tema">
          {tema === 'dark' ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-full p-1 pr-2 transition-colors hover:bg-secondary">
              <Avatar>
                <AvatarFallback>{iniciales(usuario?.name)}</AvatarFallback>
              </Avatar>
              <span className="hidden text-left leading-tight sm:block">
                <span className="block text-sm font-medium">{usuario?.name}</span>
                <span className="block text-xs text-muted-foreground capitalize">{rol}</span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              {usuario?.email}
              {usuario?.tenant ? (
                <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                  {usuario.tenant.nombre_comercial}
                </span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/perfil">
                <User />
                Mi perfil
              </Link>
            </DropdownMenuItem>
            {esAdmin ? (
              <DropdownMenuItem asChild>
                <Link to="/configuracion">
                  <Settings />
                  Configuración
                </Link>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem variant="destructive" onSelect={cerrarSesion}>
              <LogOut />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
