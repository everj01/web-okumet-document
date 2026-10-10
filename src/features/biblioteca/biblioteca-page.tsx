import { ExternalLink, Gavel, Inbox, Landmark, Newspaper, Scale, ScrollText } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageHeader } from '@/components/common/page-header'

interface Recurso {
  titulo: string
  descripcion: string
  url: string
  icono: LucideIcon
}

const RECURSOS: Recurso[] = [
  {
    titulo: 'SPIJ — Normativa de acceso libre',
    descripcion: 'Base de datos oficial del Minjus con leyes, decretos y demás normas de alcance nacional.',
    url: 'https://spij.minjus.gob.pe/',
    icono: Scale,
  },
  {
    titulo: 'El Peruano — Normas legales',
    descripcion: 'Diario oficial: edicto, decretos y resoluciones publicadas día a día.',
    url: 'https://diariooficial.elperuano.pe/Normas',
    icono: Newspaper,
  },
  {
    titulo: 'Tribunal Constitucional — Jurisprudencia',
    descripcion: 'Buscador de sentencias y resoluciones del Tribunal Constitucional.',
    url: 'https://www.tc.gob.pe/jurisprudencia/',
    icono: Gavel,
  },
  {
    titulo: 'Poder Judicial — Consulta de expedientes (CEJ)',
    descripcion: 'Busca el estado y los movimientos de un expediente judicial por número.',
    url: 'https://cej.pj.gob.pe/cej/forms/busquedaform.html',
    icono: ScrollText,
  },
  {
    titulo: 'Congreso — Normas legales',
    descripcion: 'Leyes y normas con rango de ley aprobadas por el Congreso de la República.',
    url: 'https://leyes.congreso.gob.pe/',
    icono: Landmark,
  },
  {
    titulo: 'SINOE — Casilla judicial electrónica',
    descripcion: 'Ingresa con tu usuario y contraseña del Poder Judicial para ver tus notificaciones (cédulas).',
    url: 'https://casillas.pj.gob.pe/sinoe/',
    icono: Inbox,
  },
]

export default function BibliotecaPage() {
  return (
    <div className="max-w-4xl space-y-5">
      <PageHeader
        titulo="Biblioteca jurídica"
        descripcion="Accesos directos a fuentes oficiales para consultar normas, jurisprudencia y expedientes."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {RECURSOS.map(({ titulo, descripcion, url, icono: Icono }) => (
          <Card key={url} className="aparecer">
            <CardContent className="flex h-full flex-col gap-3 p-5">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent-foreground">
                  <Icono className="size-4.5" />
                </div>
                <h2 className="font-medium">{titulo}</h2>
              </div>
              <p className="flex-1 text-sm text-muted-foreground">{descripcion}</p>
              <Button variant="outline" size="sm" className="w-fit" asChild>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                  Abrir
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
