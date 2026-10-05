import { api } from '@/lib/api'
import type { Tenant, TenantPayload } from '@/types'

export const tenantApi = {
  obtener: () => api<{ data: Tenant }>('/tenant').then((r) => r.data),

  actualizar: (datos: TenantPayload) =>
    api<{ data: Tenant }>('/tenant', { method: 'PUT', body: datos }).then((r) => r.data),

  subirLogo: (archivo: File) => {
    const cuerpo = new FormData()
    cuerpo.append('logo', archivo)

    return api<{ data: Tenant }>('/tenant/logo', { method: 'POST', body: cuerpo }).then((r) => r.data)
  },
}

export const tenantKeys = {
  detalle: () => ['tenant'] as const,
}
