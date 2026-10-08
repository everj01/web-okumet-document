interface Serie {
  etiqueta: string
  color: string
  valores: number[]
}

interface Props {
  meses: string[]
  series: Serie[]
  alto?: number
}

// Barras agrupadas por mes, un eje, gap de 2px entre barras del mismo grupo.
export function BarrasMensual({ meses, series, alto = 220 }: Props) {
  const ancho = 640
  const margen = { top: 16, right: 16, bottom: 28, left: 36 }
  const anchoUtil = ancho - margen.left - margen.right
  const altoUtil = alto - margen.top - margen.bottom

  const maximo = Math.max(1, ...series.flatMap((s) => s.valores))
  const anchoGrupo = anchoUtil / meses.length
  const gap = 2
  const anchoBarra = Math.max(3, (anchoGrupo - gap * (series.length + 1)) / series.length)

  const alturaBarra = (valor: number) => (valor / maximo) * altoUtil
  const baseY = margen.top + altoUtil

  const ticksY = 4
  const valoresTickY = Array.from({ length: ticksY + 1 }, (_, i) => Math.round((maximo / ticksY) * i))

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="w-full" role="img" aria-label="Gráfico de barras mensual">
        {valoresTickY.map((valor) => (
          <g key={valor}>
            <line
              x1={margen.left}
              x2={ancho - margen.right}
              y1={baseY - (valor / maximo) * altoUtil}
              y2={baseY - (valor / maximo) * altoUtil}
              stroke="var(--chart-grid)"
              strokeWidth={1}
            />
            <text
              x={margen.left - 8}
              y={baseY - (valor / maximo) * altoUtil}
              textAnchor="end"
              dominantBaseline="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {valor}
            </text>
          </g>
        ))}

        {meses.map((mes, indiceMes) => {
          const xGrupo = margen.left + anchoGrupo * indiceMes

          return (
            <g key={mes}>
              {series.map((serie, indiceSerie) => {
                const h = alturaBarra(serie.valores[indiceMes] ?? 0)
                const xBarra = xGrupo + gap + indiceSerie * (anchoBarra + gap)

                return (
                  <rect
                    key={serie.etiqueta}
                    x={xBarra}
                    y={baseY - h}
                    width={anchoBarra}
                    height={h}
                    rx={2}
                    fill={serie.color}
                  >
                    <title>
                      {serie.etiqueta} · {mes}: {serie.valores[indiceMes] ?? 0}
                    </title>
                  </rect>
                )
              })}
              <text x={xGrupo + anchoGrupo / 2} y={alto - 8} textAnchor="middle" className="text-[10px] fill-muted-foreground">
                {mes}
              </text>
            </g>
          )
        })}
      </svg>

      {series.length > 1 ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {series.map((serie) => (
            <span key={serie.etiqueta} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: serie.color }} />
              {serie.etiqueta}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
