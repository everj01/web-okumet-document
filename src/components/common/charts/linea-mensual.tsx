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

// Línea multi-serie simple: un eje, grilla recesiva, puntos con tooltip nativo.
export function LineaMensual({ meses, series, alto = 220 }: Props) {
  const ancho = 640
  const margen = { top: 16, right: 16, bottom: 28, left: 36 }
  const anchoUtil = ancho - margen.left - margen.right
  const altoUtil = alto - margen.top - margen.bottom

  const maximo = Math.max(1, ...series.flatMap((s) => s.valores))
  const pasoX = meses.length > 1 ? anchoUtil / (meses.length - 1) : 0

  const y = (valor: number) => margen.top + altoUtil - (valor / maximo) * altoUtil
  const x = (indice: number) => margen.left + pasoX * indice

  const ticksY = 4
  const valoresTickY = Array.from({ length: ticksY + 1 }, (_, i) => Math.round((maximo / ticksY) * i))

  return (
    <div className="space-y-3">
      <svg viewBox={`0 0 ${ancho} ${alto}`} className="w-full" role="img" aria-label="Gráfico de líneas mensual">
        {valoresTickY.map((valor) => (
          <g key={valor}>
            <line
              x1={margen.left}
              x2={ancho - margen.right}
              y1={y(valor)}
              y2={y(valor)}
              stroke="var(--chart-grid)"
              strokeWidth={1}
            />
            <text x={margen.left - 8} y={y(valor)} textAnchor="end" dominantBaseline="middle" className="text-[10px] fill-muted-foreground">
              {valor}
            </text>
          </g>
        ))}

        {meses.map((mes, indice) => (
          <text
            key={mes}
            x={x(indice)}
            y={alto - 8}
            textAnchor="middle"
            className="text-[10px] fill-muted-foreground"
          >
            {mes}
          </text>
        ))}

        {series.map((serie) => (
          <g key={serie.etiqueta}>
            <polyline
              fill="none"
              stroke={serie.color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={serie.valores.map((valor, indice) => `${x(indice)},${y(valor)}`).join(' ')}
            />
            {serie.valores.map((valor, indice) => (
              <circle key={indice} cx={x(indice)} cy={y(valor)} r={3.5} fill={serie.color}>
                <title>
                  {serie.etiqueta} · {meses[indice]}: {valor}
                </title>
              </circle>
            ))}
          </g>
        ))}
      </svg>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {series.map((serie) => (
          <span key={serie.etiqueta} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: serie.color }} />
            {serie.etiqueta}
          </span>
        ))}
      </div>
    </div>
  )
}
