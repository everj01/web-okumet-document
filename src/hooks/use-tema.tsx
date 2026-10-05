import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

type Tema = 'light' | 'dark'

const TemaContext = createContext<{ tema: Tema; alternar: () => void } | null>(null)
const CLAVE = 'okd_tema'

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const [tema, setTema] = useState<Tema>(() => (localStorage.getItem(CLAVE) as Tema) ?? 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark')
    localStorage.setItem(CLAVE, tema)
  }, [tema])

  const alternar = useCallback(() => setTema((actual) => (actual === 'dark' ? 'light' : 'dark')), [])
  const valor = useMemo(() => ({ tema, alternar }), [tema, alternar])

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>
}

export function useTema() {
  const contexto = useContext(TemaContext)

  if (!contexto) {
    throw new Error('useTema debe usarse dentro de TemaProvider')
  }

  return contexto
}
