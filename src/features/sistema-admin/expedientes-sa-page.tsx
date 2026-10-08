import { PageHeader } from '@/components/common/page-header'
import { RecursoTabla } from './recurso-tabla'

export default function ExpedientesSaPage() {
  return (
    <div className="space-y-5">
      <PageHeader titulo="Expedientes" descripcion="Expedientes de todos los negocios." />
      <RecursoTabla
        recurso="expedientes"
        placeholder="Buscar por código o asunto"
        columnas={[
          { id: 'codigo', encabezado: 'Expediente', ordenable: true, celda: (e) => `${e.codigo} — ${e.titulo}` },
          { id: 'estado', encabezado: 'Estado', desde: 'sm', celda: (e) => e.estado },
          { id: 'cliente', encabezado: 'Cliente', desde: 'md', celda: (e) => e.cliente?.nombre || '—' },
          { id: 'tenant', encabezado: 'Negocio', desde: 'lg', celda: (e) => e.tenant?.nombre_comercial || '—' },
        ]}
      />
    </div>
  )
}
