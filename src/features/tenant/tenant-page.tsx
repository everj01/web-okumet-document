import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Building2, Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Campo } from '@/components/common/campo'
import { EstadoError } from '@/components/common/estados'
import { PageHeader } from '@/components/common/page-header'
import { mensajeDeError } from '@/lib/api'
import { useGuardarTenant, useSubirLogoTenant, useTenant } from './hooks'

const esquema = z.object({
  nombre_comercial: z.string().min(1, 'Ingresa el nombre comercial').max(180),
  razon_social: z.string().max(180),
  ruc: z.string().max(20),
  direccion: z.string().max(200),
  telefono: z.string().max(30),
  email: z.string().email('Correo no válido').or(z.literal('')),
})

type Formulario = z.infer<typeof esquema>

export default function TenantPage() {
  const { data: tenant, isPending, error, refetch } = useTenant()
  const guardar = useGuardarTenant()
  const subirLogo = useSubirLogoTenant()
  const inputLogoRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, formState } = useForm<Formulario>({
    resolver: zodResolver(esquema),
  })

  useEffect(() => {
    if (!tenant) return

    reset({
      nombre_comercial: tenant.nombre_comercial,
      razon_social: tenant.razon_social ?? '',
      ruc: tenant.ruc ?? '',
      direccion: tenant.direccion ?? '',
      telefono: tenant.telefono ?? '',
      email: tenant.email ?? '',
    })
  }, [tenant, reset])

  const enviar = handleSubmit((valores) => {
    guardar.mutate({
      nombre_comercial: valores.nombre_comercial,
      razon_social: valores.razon_social || null,
      ruc: valores.ruc || null,
      direccion: valores.direccion || null,
      telefono: valores.telefono || null,
      email: valores.email || null,
    })
  })

  const elegirLogo = (archivo: File | null) => {
    if (archivo) subirLogo.mutate(archivo)
  }

  const errores = formState.errors

  if (error) {
    return <EstadoError mensaje={mensajeDeError(error)} onReintentar={() => refetch()} />
  }

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader titulo="Mi negocio" descripcion="Datos del estudio que aparecen en documentos y correos." />

      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-72" />
        </div>
      ) : (
        <>
          <Card className="aparecer">
            <CardContent className="flex flex-wrap items-center gap-5 p-6">
              <button
                type="button"
                onClick={() => inputLogoRef.current?.click()}
                className="group relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl border border-dashed border-border bg-secondary text-muted-foreground transition-colors hover:border-ring"
                title="Cambiar logo"
                aria-label="Cambiar logo"
              >
                {tenant?.logo_url ? (
                  <img src={tenant.logo_url} alt="Logo del negocio" className="size-full object-cover" />
                ) : (
                  <Building2 className="size-7" />
                )}
                <span className="absolute inset-0 hidden items-center justify-center bg-black/50 text-white group-hover:flex">
                  {subirLogo.isPending ? <Loader2 className="size-5 animate-spin" /> : <Upload className="size-5" />}
                </span>
              </button>
              <input
                ref={inputLogoRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="sr-only"
                onChange={(evento) => elegirLogo(evento.target.files?.[0] ?? null)}
              />

              <div className="min-w-0 flex-1">
                <p className="font-medium">{tenant?.nombre_comercial || 'Sin nombre comercial'}</p>
                <p className="text-sm text-muted-foreground">Haz clic en el logo para cambiarlo. PNG, JPG, SVG o WEBP.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="aparecer">
            <div className="flex items-center gap-2 border-b border-border px-6 py-4">
              <Building2 className="size-4 text-muted-foreground" />
              <h2 className="font-medium">Datos del negocio</h2>
            </div>

            <CardContent className="p-6">
              <form onSubmit={enviar} className="grid gap-4 sm:grid-cols-2" noValidate>
                <Campo
                  etiqueta="Nombre comercial"
                  obligatorio
                  className="sm:col-span-2"
                  error={errores.nombre_comercial?.message}
                >
                  <Input {...register('nombre_comercial')} aria-invalid={Boolean(errores.nombre_comercial)} />
                </Campo>

                <Campo etiqueta="Razón social" className="sm:col-span-2" error={errores.razon_social?.message}>
                  <Input {...register('razon_social')} />
                </Campo>

                <Campo etiqueta="RUC" error={errores.ruc?.message}>
                  <Input {...register('ruc')} />
                </Campo>

                <Campo etiqueta="Teléfono" error={errores.telefono?.message}>
                  <Input {...register('telefono')} />
                </Campo>

                <Campo etiqueta="Correo" error={errores.email?.message}>
                  <Input type="email" {...register('email')} aria-invalid={Boolean(errores.email)} />
                </Campo>

                <Campo etiqueta="Dirección" error={errores.direccion?.message}>
                  <Input {...register('direccion')} />
                </Campo>

                <div className="flex justify-end sm:col-span-2">
                  <Button type="submit" disabled={guardar.isPending}>
                    {guardar.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    Guardar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
