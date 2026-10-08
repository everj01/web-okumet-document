import { PageHeader } from '@/components/common/page-header'
import { fechaCorta } from '@/lib/formato'
import { RecursoTabla } from './recurso-tabla'

export default function EventosSaPage() {
  return (
    <div className="space-y-5">
      <PageHeader titulo="Agenda" descripcion="Eventos de todos los negocios." />
      <RecursoTabla
        recurso="eventos"
        placeholder="Buscar por título"
        columnas={[
          { id: 'titulo', encabezado: 'Fecha', ordenable: true, celda: (e) => e.titulo },
          { id: 'tipo', encabezado: 'Tipo', desde: 'sm', celda: (e) => e.tipo },
          { id: 'inicio', encabezado: 'Inicio', desde: 'md', celda: (e) => fechaCorta(e.inicio) },
          { id: 'tenant', encabezado: 'Negocio', desde: 'lg', celda: (e) => e.tenant?.nombre_comercial || '—' },
        ]}
      />
    </div>
  )
}
