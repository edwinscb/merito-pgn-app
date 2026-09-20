import { useEffect } from 'react'
import { settleExpired, type LearningProgress } from '../domain/learning'

// Cierra las sesiones cuyo tiempo ya vencio. Depende del reloj y no del
// progreso: el vencimiento lo decide el paso del tiempo, no un cambio del
// usuario.
//
// Lee el progreso por referencia porque el efecto solo debe reaccionar al
// reloj; con el progreso en las dependencias se volveria a ejecutar en cada
// respuesta registrada.
export function useExpiredSessions(
  now: number,
  progressRef: { current: LearningProgress },
  commit: (next: LearningProgress) => void,
  onExpiredDuringExam: () => void,
) {
  useEffect(() => {
    const p = progressRef.current
    if (p.sessions.some((s) => !s.finishedAt && s.endsAt <= now)) {
      commit(settleExpired(p, now))
      onExpiredDuringExam()
    }
    // Dependencias identicas al bloque original: solo el reloj.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now])
}
