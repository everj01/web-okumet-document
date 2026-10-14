import { Wifi } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { EstadoError, EstadoVacio, FilasCargando } from '@/components/common/estados'
import { PageHeader } from '@/components/common/page-header'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { mensajeDeError } from '@/lib/api'
import { desdeAhora, fechaHora } from '@/lib/formato'
import { useUsuariosEnLineaSA } from './hooks'

export default function EnLineaSaPage() {
  const { data, isPending, error, refetch } = useUsuariosEnLineaSA()

  return (
    <div className="space-y-5">
      <PageHeader
        titulo="Usuarios en línea"
        descripcion={`Conectados ahora mismo${data ? `: ${data.length}` : ''}. Se actualiza cada 15 segundos.`}
      />

      <Card className="overflow-hidden">
        {error ? (
          <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => refetch()} />
        ) : isPending ? (
          <FilasCargando columnas={4} />
        ) : !data.length ? (
          <EstadoVacio icono={Wifi} titulo="Nadie conectado ahora mismo" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Usuario</TableHead>
                <TableHead>Negocio</TableHead>
                <TableHead className="hidden sm:table-cell">Rol</TableHead>
                <TableHead className="text-right">Conectado desde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((usuario) => (
                <TableRow key={usuario.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="size-2 shrink-0 rounded-full bg-success" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{usuario.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{usuario.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{usuario.tenant?.nombre_comercial || '—'}</TableCell>
                  <TableCell className="hidden capitalize sm:table-cell">{usuario.rol || '—'}</TableCell>
                  <TableCell className="text-right text-muted-foreground" title={fechaHora(usuario.conectado_desde)}>
                    {desdeAhora(usuario.conectado_desde)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
