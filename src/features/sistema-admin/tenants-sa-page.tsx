import { ActivoBadge } from '@/components/common/etiquetas-estado'
import { PageHeader } from '@/components/common/page-header'
import { RecursoTabla } from './recurso-tabla'

export default function TenantsSaPage() {
  return (
    <div className="space-y-5">
      <PageHeader titulo="Negocios" descripcion="Estudios registrados en la plataforma." />
      <RecursoTabla
        recurso="tenants"
        placeholder="Buscar por nombre comercial o RUC"
        columnas={[
          { id: 'nombre_comercial', encabezado: 'Negocio', ordenable: true, celda: (t) => t.nombre_comercial },
          { id: 'ruc', encabezado: 'RUC', desde: 'sm', celda: (t) => t.ruc || '—' },
          {
            id: 'usuarios_count',
            encabezado: 'Usuarios',
            desde: 'md',
            className: 'text-center',
            celda: (t) => t.usuarios_count ?? '—',
          },
          { id: 'activo', encabezado: 'Estado', className: 'text-center', celda: (t) => <ActivoBadge activo={t.activo} /> },
        ]}
      />
    </div>
  )
}
