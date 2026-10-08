import { Building2, FolderClock, ShieldAlert, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarrasMensual } from '@/components/common/charts/barras-mensual'
import { Donut } from '@/components/common/charts/donut'
import { LineaMensual } from '@/components/common/charts/linea-mensual'
import { EstadoError } from '@/components/common/estados'
import { PageHeader } from '@/components/common/page-header'
import { mensajeDeError } from '@/lib/api'
import { useDashboardSA } from './hooks'

const COLOR_SERIE_1 = 'var(--chart-series-1)'
const COLOR_SERIE_2 = 'var(--chart-series-2)'
const COLOR_SERIE_3 = 'var(--chart-series-3)'
const COLOR_SERIE_4 = 'var(--chart-series-4)'

function TarjetaGrafico({ titulo, icono: Icono, children }: { titulo: string; icono: typeof Building2; children: React.ReactNode }) {
  return (
    <Card>
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Icono className="size-4 text-muted-foreground" />
        <h2 className="font-medium">{titulo}</h2>
      </div>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  )
}

export default function DashboardSaPage() {
  const { data, isPending, error, refetch } = useDashboardSA()

  return (
    <div className="space-y-5">
      <PageHeader titulo="Dashboard" descripcion="Información relevante de toda la plataforma." />

      {error ? (
        <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => refetch()} />
      ) : isPending ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          <TarjetaGrafico titulo="Crecimiento de negocios y usuarios" icono={Building2}>
            <LineaMensual
              meses={data.crecimiento.map((d) => d.mes)}
              series={[
                { etiqueta: 'Negocios nuevos', color: COLOR_SERIE_1, valores: data.crecimiento.map((d) => d.tenants_nuevos) },
                { etiqueta: 'Usuarios nuevos', color: COLOR_SERIE_2, valores: data.crecimiento.map((d) => d.usuarios_nuevos) },
              ]}
            />
          </TarjetaGrafico>

          <TarjetaGrafico titulo="Actividad de casos" icono={FolderClock}>
            <BarrasMensual
              meses={data.actividad_casos.map((d) => d.mes)}
              series={[
                { etiqueta: 'Expedientes abiertos', color: COLOR_SERIE_1, valores: data.actividad_casos.map((d) => d.expedientes_abiertos) },
                { etiqueta: 'Expedientes cerrados', color: COLOR_SERIE_2, valores: data.actividad_casos.map((d) => d.expedientes_cerrados) },
                { etiqueta: 'Documentos subidos', color: COLOR_SERIE_3, valores: data.actividad_casos.map((d) => d.documentos_subidos) },
              ]}
            />
          </TarjetaGrafico>

          <TarjetaGrafico titulo="Uso de asistente IA" icono={Sparkles}>
            <div className="space-y-4">
              <BarrasMensual
                meses={data.uso_ia.map((d) => d.mes)}
                series={[{ etiqueta: 'Llamadas a Claude', color: COLOR_SERIE_4, valores: data.uso_ia.map((d) => d.llamadas) }]}
              />

              {data.tenants_cerca_limite.length ? (
                <div className="space-y-1.5 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Negocios cerca de su límite mensual</p>
                  {data.tenants_cerca_limite.map((t) => (
                    <div key={t.tenant} className="flex items-center justify-between text-sm">
                      <span>{t.tenant}</span>
                      <span className="text-muted-foreground">
                        {t.usado}/{t.limite}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </TarjetaGrafico>

          <TarjetaGrafico titulo="Estado general de negocios" icono={ShieldAlert}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Donut
                segmentos={[
                  { etiqueta: 'Negocios activos', valor: data.estado_negocios.tenants_activos, color: 'var(--success)' },
                  { etiqueta: 'Negocios inactivos', valor: data.estado_negocios.tenants_inactivos, color: 'var(--destructive)' },
                ]}
              />
              <Donut
                segmentos={data.expedientes_por_estado.map((e, i) => ({
                  etiqueta: e.estado,
                  valor: e.total,
                  color: [COLOR_SERIE_1, COLOR_SERIE_2, COLOR_SERIE_3, COLOR_SERIE_4][i % 4],
                }))}
              />
            </div>
          </TarjetaGrafico>
        </div>
      )}
    </div>
  )
}
