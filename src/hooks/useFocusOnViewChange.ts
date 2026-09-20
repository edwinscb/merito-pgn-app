import { useEffect, useRef } from 'react'

// Al cambiar de vista devuelve el foco al contenido principal y sube el scroll,
// para que quien navegue por teclado o lector de pantalla no quede perdido en
// la posicion de la vista anterior. Devuelve la ref que el <main> debe recibir.
export function useFocusOnViewChange(view: string) {
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    mainRef.current?.focus({ preventScroll: true })
    window.scrollTo(0, 0)
  }, [view])
  return mainRef
}
