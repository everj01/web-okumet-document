interface Segmento {
  etiqueta: string
  valor: number
  color: string
}

interface Arco extends Segmento {
  d: string
  porcentaje: number
  anguloFin: number
}

interface Props {
  segmentos: Segmento[]
  tamano?: number
}

function construirArco(segmento: Segmento, anguloInicio: number, total: number, radio: number, radioInterno: number): Arco {
  const porcentaje = segmento.valor / total
  // un segmento del 100% produce un arco con inicio y fin matemáticamente idénticos (no dibuja nada);
  // se recorta una fracción mínima para que quede un círculo casi completo, invisible al ojo
  const anguloFin = anguloInicio + Math.min(porcentaje * 360, 359.99)

  const punto = (angulo: number, r: number) => {
    const rad = (angulo * Math.PI) / 180
    return [radio + r * Math.cos(rad), radio + r * Math.sin(rad)]
  }

  const [x1, y1] = punto(anguloInicio, radio)
  const [x2, y2] = punto(anguloFin, radio)
  const [x3, y3] = punto(anguloFin, radioInterno)
  const [x4, y4] = punto(anguloInicio, radioInterno)
  const granArco = anguloFin - anguloInicio > 180 ? 1 : 0

  const d = `M ${x1} ${y1} A ${radio} ${radio} 0 ${granArco} 1 ${x2} ${y2} L ${x3} ${y3} A ${radioInterno} ${radioInterno} 0 ${granArco} 0 ${x4} ${y4} Z`

  return { ...segmento, d, porcentaje, anguloFin }
}

// Dona con hasta 4 segmentos: identidad por color + etiqueta directa (nunca solo color).
export function Donut({ segmentos, tamano = 160 }: Props) {
  const total = segmentos.reduce((suma, s) => suma + s.valor, 0) || 1
  const radio = tamano / 2
  const grosor = radio * 0.38
  const radioInterno = radio - grosor

  const arcos = segmentos.reduce<Arco[]>((acumulado, segmento) => {
    const anguloInicio = acumulado.length ? acumulado[acumulado.length - 1]!.anguloFin : -90

    return [...acumulado, construirArco(segmento, anguloInicio, total, radio, radioInterno)]
  }, [])

  return (
    <div className="flex items-center gap-5">
      <svg width={tamano} height={tamano} viewBox={`0 0 ${tamano} ${tamano}`} role="img" aria-label="Gráfico de distribución">
        {arcos.map((arco) => (
          <path key={arco.etiqueta} d={arco.d} fill={arco.color} stroke="var(--card)" strokeWidth={2}>
            <title>
              {arco.etiqueta}: {arco.valor} ({Math.round(arco.porcentaje * 100)}%)
            </title>
          </path>
        ))}
      </svg>

      <ul className="space-y-1.5">
        {arcos.map((arco) => (
          <li key={arco.etiqueta} className="flex items-center gap-2 text-xs">
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: arco.color }} />
            <span className="text-muted-foreground">{arco.etiqueta}</span>
            <span className="font-medium">{arco.valor}</span>
            <span className="text-muted-foreground">({Math.round(arco.porcentaje * 100)}%)</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
