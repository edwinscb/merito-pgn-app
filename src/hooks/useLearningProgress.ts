import { useEffect, useRef, useState } from 'react'
import {
  emptyProgress,
  settleExpired,
  type LearningProgress,
} from '../domain/learning'
import {
  isPersistent,
  loadLearning,
  saveLearning,
} from '../domain/progress/learning-store'

export type LearningProgressState = {
  progress: LearningProgress
  /** Espejo sincrono del progreso. Lo leen los manejadores que encadenan varias
   *  escrituras en un mismo gesto, donde el estado de React aun no se actualizo. */
  progressRef: { current: LearningProgress }
  /** true cuando el progreso no se pudo persistir y solo vive en memoria. */
  temporary: boolean
  commit: (next: LearningProgress) => void
}

// Dueno del progreso de aprendizaje: lo carga, cierra al arrancar las sesiones
// cuyo tiempo vencio mientras la aplicacion estaba cerrada, y lo persiste.
//
// La carga vive aqui y no en el arranque de App porque `loadLearning` nunca
// rechaza: ante cualquier fallo devuelve la copia en memoria y marca el
// almacenamiento como no persistente. Por eso separarla de la carga del banco no
// cambia la ruta de error, que sigue siendo exclusiva del banco.
export function useLearningProgress(): LearningProgressState {
  const [progress, setProgress] = useState<LearningProgress>(emptyProgress)
  const [temporary, setTemporary] = useState(false)
  const progressRef = useRef(progress)

  const commit = (next: LearningProgress) => {
    progressRef.current = next
    setProgress(next)
    void saveLearning(next).then((ok) => setTemporary(!ok))
  }

  useEffect(() => {
    let mounted = true
    void loadLearning().then((p) => {
      if (!mounted) return
      const settled = settleExpired(p)
      progressRef.current = settled
      setProgress(settled)
      setTemporary(!isPersistent())
      // Si el cierre por vencimiento cambio algo, hay que guardarlo: de otro
      // modo se recalcularia en cada arranque.
      if (
        settled.sessions.some(
          (s, i) => s.finishedAt !== p.sessions[i].finishedAt,
        )
      )
        void saveLearning(settled)
    })
    return () => {
      mounted = false
    }
  }, [])

  return { progress, progressRef, temporary, commit }
}
