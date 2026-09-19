import { useEffect } from 'react'
import { STUDY_KEY, type StudyOrder } from '../domain/study-order'

type Snapshot = {
  studyOrder: StudyOrder | null
  studyIndex: number
  search: string
  topic: string
  onlySaved: boolean
  reviewIds: string[] | null
  view: string
}

// Guarda la secuencia de estudio en la pestana para que recargar no rebaraje ni
// pierda la posicion. Solo escribe mientras se esta estudiando: en otras vistas
// no hay secuencia que conservar.
//
// Recibe el aviso de fallo en vez de devolverlo porque quien lo muestra es la
// misma vista que ya informa que el progreso es temporal.
export function useStudyOrderPersistence(
  snapshot: Snapshot,
  onUnavailable: (unavailable: boolean) => void,
) {
  const { studyOrder, studyIndex, search, topic, onlySaved, reviewIds, view } =
    snapshot
  useEffect(() => {
    if (!studyOrder || view !== 'questions') return
    try {
      sessionStorage.setItem(
        STUDY_KEY,
        JSON.stringify({
          ...studyOrder,
          index: studyIndex,
          search,
          topic,
          onlySaved,
          reviewIds,
        }),
      )
      onUnavailable(false)
    } catch {
      onUnavailable(true)
    }
    // Las dependencias son las del bloque original: el aviso se excluye a
    // proposito para no reescribir el almacenamiento en cada render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studyOrder, studyIndex, search, topic, onlySaved, reviewIds, view])
}
