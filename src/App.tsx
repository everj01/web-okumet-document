import { lazy, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { AppShell } from './components/layout/app-shell'
import { RutaInvitado, RutaPrivada, RutaSoloAdmin } from './features/auth/rutas-protegidas'
import { SistemaAdminProvider } from './features/sistema-admin/sistema-admin-context'
import { RutaCompuertaValidada, RutaSuperAdmin } from './features/sistema-admin/rutas-protegidas'

const LoginPage = lazy(() => import('./features/auth/login-page'))
const RegistroPage = lazy(() => import('./features/auth/registro-page'))
const ClaveMaestraPage = lazy(() => import('./features/sistema-admin/clave-maestra-page'))
const SistemaAdminLoginPage = lazy(() => import('./features/sistema-admin/login-page'))
const SaShell = lazy(() => import('./features/sistema-admin/sa-shell'))
const DashboardSaPage = lazy(() => import('./features/sistema-admin/dashboard-sa-page'))
const TenantsSaPage = lazy(() => import('./features/sistema-admin/tenants-sa-page'))
const UsuariosSaPage = lazy(() => import('./features/sistema-admin/usuarios-sa-page'))
const ClientesSaPage = lazy(() => import('./features/sistema-admin/clientes-sa-page'))
const ExpedientesSaPage = lazy(() => import('./features/sistema-admin/expedientes-sa-page'))
const EventosSaPage = lazy(() => import('./features/sistema-admin/eventos-sa-page'))
const EnLineaSaPage = lazy(() => import('./features/sistema-admin/en-linea-sa-page'))
const AuditoriaSaPage = lazy(() => import('./features/sistema-admin/auditoria-sa-page'))
const ReportesSaPage = lazy(() => import('./features/sistema-admin/reportes-sa-page'))
const PanelPage = lazy(() => import('./features/panel/panel-page'))
const ClientesPage = lazy(() => import('./features/clientes/clientes-page'))
const ClienteDetallePage = lazy(() => import('./features/clientes/cliente-detalle-page'))
const ExpedientesPage = lazy(() => import('./features/expedientes/expedientes-page'))
const ExpedienteDetallePage = lazy(() => import('./features/expedientes/expediente-detalle-page'))
const DocumentosPage = lazy(() => import('./features/documentos/documentos-page'))
const DocumentoDetallePage = lazy(() => import('./features/documentos/documento-detalle-page'))
const AgendaPage = lazy(() => import('./features/agenda/agenda-page'))
const UsuariosPage = lazy(() => import('./features/usuarios/usuarios-page'))
const PerfilPage = lazy(() => import('./features/perfil/perfil-page'))
const TenantPage = lazy(() => import('./features/tenant/tenant-page'))
const ConfiguracionPage = lazy(() => import('./features/configuracion/configuracion-page'))

function usePrecargaVistas() {
  useEffect(() => {
    const precargar = () => {
      void import('./features/panel/panel-page')
      void import('./features/expedientes/expedientes-page')
      void import('./features/clientes/clientes-page')
    }

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(precargar)

      return () => window.cancelIdleCallback(id)
    }

    const id = setTimeout(precargar, 1500)

    return () => clearTimeout(id)
  }, [])
}

export function App() {
  usePrecargaVistas()

  return (
    <Routes>
      <Route
        path="/sistema_admin/*"
        element={
          <SistemaAdminProvider>
            <Routes>
              <Route index element={<ClaveMaestraPage />} />
              <Route element={<RutaCompuertaValidada />}>
                <Route path="login" element={<SistemaAdminLoginPage />} />
              </Route>
              <Route element={<RutaSuperAdmin />}>
                <Route path="panel" element={<SaShell />}>
                  <Route index element={<DashboardSaPage />} />
                  <Route path="tenants" element={<TenantsSaPage />} />
                  <Route path="usuarios" element={<UsuariosSaPage />} />
                  <Route path="clientes" element={<ClientesSaPage />} />
                  <Route path="expedientes" element={<ExpedientesSaPage />} />
                  <Route path="eventos" element={<EventosSaPage />} />
                  <Route path="en-linea" element={<EnLineaSaPage />} />
                  <Route path="auditoria" element={<AuditoriaSaPage />} />
                  <Route path="reportes" element={<ReportesSaPage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/sistema_admin" replace />} />
            </Routes>
          </SistemaAdminProvider>
        }
      />

      <Route element={<RutaInvitado />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegistroPage />} />
      </Route>

      <Route element={<RutaPrivada />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/panel" replace />} />
          <Route path="/panel" element={<PanelPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/clientes/:uuid" element={<ClienteDetallePage />} />
          <Route path="/expedientes" element={<ExpedientesPage />} />
          <Route path="/expedientes/:uuid" element={<ExpedienteDetallePage />} />
          <Route path="/documentos" element={<DocumentosPage />} />
          <Route path="/documentos/:uuid" element={<DocumentoDetallePage />} />
          <Route path="/agenda" element={<AgendaPage />} />
          <Route path="/perfil" element={<PerfilPage />} />

          <Route element={<RutaSoloAdmin />}>
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/negocio" element={<TenantPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/panel" replace />} />
    </Routes>
  )
}
