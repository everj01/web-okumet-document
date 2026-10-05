import { useCallback, useEffect, useState } from 'react'

const CLAVE = 'okd_sidebar_colapsado'

export function useSidebarColapsado() {
  const [colapsado, setColapsado] = useState(() => localStorage.getItem(CLAVE) === '1')

  useEffect(() => {
    localStorage.setItem(CLAVE, colapsado ? '1' : '0')
  }, [colapsado])

  const alternar = useCallback(() => setColapsado((actual) => !actual), [])

  return { colapsado, alternar }
}
