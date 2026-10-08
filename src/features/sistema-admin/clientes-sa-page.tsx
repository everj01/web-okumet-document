import { ActivoBadge } from '@/components/common/etiquetas-estado'
import { PageHeader } from '@/components/common/page-header'
import { RecursoTabla } from './recurso-tabla'

export default function ClientesSaPage() {
  return (
    <div className="space-y-5">
      <PageHeader titulo="Clientes" descripcion="Clientes registrados en todos los negocios." />
      <RecursoTabla
        recurso="clientes"
        placeholder="Buscar por nombre o documento"
        columnas={[
          { id: 'nombre', encabezado: 'Cliente', ordenable: true, celda: (c) => c.nombre },
          {
            id: 'documento',
            encabezado: 'Documento',
            desde: 'sm',
            celda: (c) => `${c.tipo_documento} ${c.numero_documento}`,
          },
          { id: 'tenant', encabezado: 'Negocio', desde: 'md', celda: (c) => c.tenant?.nombre_comercial || '—' },
          {
            id: 'activo',
            encabezado: 'Estado',
            className: 'text-center',
            celda: (c) => <ActivoBadge activo={c.activo} />,
          },
        ]}
      />
    </div>
  )
}
