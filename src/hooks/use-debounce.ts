import { useEffect, useState } from 'react'

export function useDebounce<T>(valor: T, milisegundos = 350) {
  const [retrasado, setRetrasado] = useState(valor)

  useEffect(() => {
    const id = setTimeout(() => setRetrasado(valor), milisegundos)

    return () => clearTimeout(id)
  }, [valor, milisegundos])

  return retrasado
}
