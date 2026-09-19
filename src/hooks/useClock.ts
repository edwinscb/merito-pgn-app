import { useEffect, useState } from 'react'

// Reloj de pared para el simulacro: avanza cada segundo y se sincroniza al
// volver a la pestana, porque los temporizadores se frenan en segundo plano.
//
// Devuelve tambien el emisor porque al crear una sesion hay que sembrar el
// reloj con su instante de inicio: sin eso la cuenta atras arrancaria hasta un
// segundo desfasada.
//
// OJO: el intervalo se programa siempre, no solo cuando hay una sesion en
// curso. Ese comportamiento se conserva tal cual en este movimiento; corregirlo
// cambiaria la frecuencia de renders y no es parte de un refactor.
export function useClock(): [number, (now: number) => void] {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    const refresh = () => setNow(Date.now())
    window.addEventListener('focus', refresh)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', refresh)
    }
  }, [])
  return [now, setNow]
}
