import { ActivoBadge } from '@/components/common/etiquetas-estado'
import { PageHeader } from '@/components/common/page-header'
import { fechaCorta } from '@/lib/formato'
import { RecursoTabla } from './recurso-tabla'

export default function UsuariosSaPage() {
  return (
    <div className="space-y-5">
      <PageHeader titulo="Usuarios" descripcion="Todos los usuarios de todos los negocios." />
      <RecursoTabla
        recurso="usuarios"
        placeholder="Buscar por nombre o correo"
        columnas={[
          { id: 'name', encabezado: 'Usuario', ordenable: true, celda: (u) => u.name },
          { id: 'email', encabezado: 'Correo', desde: 'sm', celda: (u) => u.email },
          { id: 'tenant', encabezado: 'Negocio', desde: 'md', celda: (u) => u.tenant?.nombre_comercial || '—' },
          { id: 'rol', encabezado: 'Rol', className: 'text-center capitalize', celda: (u) => u.rol?.nombre || '—' },
          {
            id: 'activo',
            encabezado: 'Estado',
            className: 'text-center',
            celda: (u) => <ActivoBadge activo={u.activo} />,
          },
          {
            id: 'email_verificado',
            encabezado: 'Correo verificado',
            desde: 'lg',
            className: 'text-center',
            celda: (u) => (u.email_verificado ? 'Sí' : 'No'),
          },
          {
            id: 'created_at',
            encabezado: 'Creado',
            desde: 'lg',
            ordenable: true,
            celda: (u) => fechaCorta(u.creado_en),
          },
        ]}
      />
    </div>
  )
}
