import { lazy, Suspense, useState } from 'react'
import { Bug, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

// El formulario (react-hook-form + zod) y html2canvas solo se cargan si alguien de verdad hace
// clic acá: mantiene el bundle principal liviano para quien nunca reporta una falla.
const ReportarFallaDialogo = lazy(() =>
  import('./reportar-falla-dialogo').then((modulo) => ({ default: modulo.ReportarFallaDialogo })),
)

export function ReportarFallaBoton() {
  const [capturando, setCapturando] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [captura, setCaptura] = useState<Blob | null>(null)

  const abrir = async () => {
    setCapturando(true)

    try {
      // html2canvas (el original) no entiende oklch() —el formato de color que usa Tailwind v4 en
      // todo el tema— y tiraba "unsupported color function" apenas tocaba el primer elemento. Este
      // fork (mismo API, mantenido activamente) sí soporta oklch/lab/lch.
      const { default: html2canvas } = await import('html2canvas-pro')
      // useCORS: evita que el logo/avatar (de otro origen) manchen el canvas.
      const lienzo = await html2canvas(document.body, { logging: false, useCORS: true, allowTaint: false })

      lienzo.toBlob((blob) => {
        setCaptura(blob)
        setAbierto(true)
        setCapturando(false)
      }, 'image/png')
    } catch (error) {
      // si la captura falla igual se puede reportar sin imagen, pero que quede rastro en consola
      console.warn('No se pudo generar la captura de pantalla:', error)
      setCaptura(null)
      setAbierto(true)
      setCapturando(false)
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={abrir}
        disabled={capturando}
        title="Reportar una falla"
        aria-label="Reportar una falla"
      >
        {capturando ? <Loader2 className="size-4.5 animate-spin" /> : <Bug className="size-4.5" />}
      </Button>

      {abierto ? (
        <Suspense fallback={null}>
          <ReportarFallaDialogo abierto={abierto} onAbierto={setAbierto} captura={captura} />
        </Suspense>
      ) : null}
    </>
  )
}
