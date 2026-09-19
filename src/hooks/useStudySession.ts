import { useEffect, useState } from 'react'
import { loadStudyBank, type Block, type StudyBank } from '../domain/learning'
import {
  newStudyOrder,
  restoreStudyOrder,
  STUDY_KEY,
  type StudyOrder,
} from '../domain/study-order'
import { useStudyOrderPersistence } from './useStudyOrderPersistence'

export type Scope = 'todo' | 'convocatoria' | 'comportamentales'

const MENSAJE_DE_FALLO =
  'No se pudieron cargar las preguntas. Comprueba tu conexión y vuelve a intentar.'

// Dueno del banco y de todo el estado de estudio: filtros, secuencia barajada y
// posicion. Banco y estudio van juntos y no en dos hooks porque la restauracion
// necesita las preguntas ya cargadas: `restoreStudyOrder` valida contra ellas los
// ids guardados. Separarlos obligaria a restaurar en un efecto posterior, y ese
// render intermedio dibujaria la pantalla de inicio antes de la de estudio: un
// parpadeo que hoy no existe.
//
// `view` entra porque la secuencia solo se persiste mientras se esta estudiando.
// `onRestored` y `onLoadError` salen porque no son de este hook: decidir que vista
// se muestra es de la raiz de composicion, y `error` es un unico banner que App
// comparte con el fallo de importacion del progreso. Ambos se invocan en el mismo
// lote que el resto de la carga, asi que no añaden un render extra.
export function useStudySession(
  view: string,
  callbacks: { onRestored: () => void; onLoadError: (message: string) => void },
) {
  const { onRestored, onLoadError } = callbacks
  const [bank, setBank] = useState<StudyBank | null>(null)
  const [block, setBlock] = useState<Block>('comun')
  const [search, setSearch] = useState('')
  const [topic, setTopic] = useState('')
  const [onlySaved, setOnlySaved] = useState(false)
  // El alcance vive en la capa de filtrado, no en study-order: cambiarlo no debe
  // invalidar el orden barajado que el usuario ya tiene.
  const [scope, setScope] = useState<Scope>('todo')
  const [reviewIds, setReviewIds] = useState<string[] | null>(null)
  const [studyIndex, setStudyIndex] = useState(0)
  const [studyOrder, setStudyOrder] = useState<StudyOrder | null>(null)
  const [studyTemporary, setStudyTemporary] = useState(false)

  useEffect(() => {
    let mounted = true
    loadStudyBank()
      .then((b) => {
        if (!mounted) return
        setBank(b)
        try {
          const saved = restoreStudyOrder(
            sessionStorage.getItem(STUDY_KEY),
            b.questions,
          )
          setStudyOrder(saved ?? newStudyOrder(b.questions, 'comun'))
          if (saved) {
            setBlock(saved.block)
            setStudyIndex(saved.index)
            setSearch(saved.search)
            setTopic(saved.topic)
            setOnlySaved(saved.onlySaved)
            setReviewIds(saved.reviewIds)
            onRestored()
          }
        } catch {
          setStudyOrder(newStudyOrder(b.questions, 'comun'))
          setStudyTemporary(true)
        }
      })
      .catch(() => {
        if (mounted) onLoadError(MENSAJE_DE_FALLO)
      })
    return () => {
      mounted = false
    }
    // Dependencias vacias como en el bloque original: la carga ocurre una vez.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useStudyOrderPersistence(
    { studyOrder, studyIndex, search, topic, onlySaved, reviewIds, view },
    setStudyTemporary,
  )

  return {
    bank,
    block,
    setBlock,
    search,
    setSearch,
    topic,
    setTopic,
    onlySaved,
    setOnlySaved,
    scope,
    setScope,
    reviewIds,
    setReviewIds,
    studyIndex,
    setStudyIndex,
    studyOrder,
    setStudyOrder,
    studyTemporary,
  }
}
