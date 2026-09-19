import type { Question } from './dataset/contracts.js'
import type {
  Block,
  LearningProgress,
  Session,
  StudyBank,
} from './learning.js'
import { orderedQuestions, type StudyOrder } from './study-order.js'

// Las comportamentales no estan "fuera" del temario: son otra prueba,
// clasificatoria. Vive aqui y no en la interfaz porque es un id de la taxonomia.
export const BEHAVIORAL_TOPIC = 'competencias_comportamentales'

export type Scope = 'todo' | 'convocatoria' | 'comportamentales'

/** Sesiones abiertas: sin terminar y sin vencer por tiempo. */
export const activeSessions = (progress: LearningProgress): Session[] =>
  progress.sessions.filter((s) => !s.finishedAt)

/** Sesiones ya cerradas, para el historial. */
export const finishedSessions = (progress: LearningProgress): Session[] =>
  progress.sessions.filter((s) => s.finishedAt)

export const questionsOfBlock = (
  bank: StudyBank | null,
  block: Block,
): Question[] => bank?.questions.filter((q) => q.moduleId === block) ?? []

/**
 * Temas con peso en el perfil. El alcance sale de `topicDistribution` y no de
 * `targetCallIds`: un tema sin peso no entra en la prueba aunque alguna pregunta
 * declare la convocatoria.
 */
export const weightedTopics = (
  profile: StudyBank['examProfiles'][number] | null,
): Set<string> =>
  new Set(
    profile?.topicDistribution
      .filter((item) => item.weight > 0)
      .map((item) => item.topicId) ?? [],
  )

export const questionsInScope = (
  bank: StudyBank | null,
  topics: Set<string>,
): Question[] => bank?.questions.filter((q) => topics.has(q.topicId)) ?? []

export const isOutOfScope = (question: Question, topics: Set<string>): boolean =>
  !topics.has(question.topicId) && question.topicId !== BEHAVIORAL_TOPIC

/** Corte aprobatorio del perfil con el que se creo la sesion, o null si no se afirma. */
export const passingScoreOf = (
  bank: StudyBank | null,
  session: Session,
): number | null =>
  bank?.examProfiles.find((p) => p.id === session.profileId)
    ?.passingKnowledgeScore ?? null

export const topicLabel = (bank: StudyBank | null, id: string): string =>
  bank?.topics.find((t) => t.id === id)?.label ?? 'Tema'

export type StudyFilter = {
  bank: StudyBank | null
  studyOrder: StudyOrder | null
  block: Block
  topic: string
  search: string
  onlySaved: boolean
  reviewIds: string[] | null
  scope: Scope
  marks: LearningProgress['marks']
  examTopics: Set<string>
}

/**
 * Preguntas visibles al estudiar. Parte de la secuencia barajada cuando esta
 * disponible para el bloque actual, y del banco del bloque cuando no; luego aplica
 * los filtros del usuario.
 */
export function filterStudyQuestions(f: StudyFilter): Question[] {
  const base =
    f.studyOrder && f.studyOrder.block === f.block && f.bank
      ? orderedQuestions(f.studyOrder, f.bank.questions)
      : questionsOfBlock(f.bank, f.block)
  const buscado = f.search.toLocaleLowerCase('es')
  return base.filter(
    (q) =>
      (!f.topic || q.topicId === f.topic) &&
      (!f.onlySaved || f.marks[q.id]?.saved) &&
      (!f.reviewIds || f.reviewIds.includes(q.id)) &&
      (f.scope !== 'convocatoria' || f.examTopics.has(q.topicId)) &&
      (f.scope === 'comportamentales'
        ? q.topicId === BEHAVIORAL_TOPIC
        : q.topicId !== BEHAVIORAL_TOPIC) &&
      q.stem.toLocaleLowerCase('es').includes(buscado),
  )
}

/** Pregunta en la posicion actual, acotada al rango valido de la lista filtrada. */
export const questionAt = (
  filtered: Question[],
  index: number,
): Question | undefined =>
  filtered[Math.min(index, Math.max(0, filtered.length - 1))]
