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

export const blockLabel = (block: Block | null): string =>
  block === null ? 'Conocimientos' : block === 'comun' ? 'General' : 'Sistemas'

// Una sesion con perfil es la prueba de la convocatoria; sin perfil es historial
// heredado de los simulacros por bloque.
export const sessionTitle = (s: Session): string =>
  s.profileId ? 'Prueba de Conocimientos' : `Simulacro de ${blockLabel(s.block)}`

/** Intentos totales y aciertos del estudio, para las estadisticas globales. */
export const studyStats = (progress: LearningProgress) => ({
  total: progress.attempts.length,
  hits: progress.attempts.filter((a) => a.correct).length,
  saved: Object.values(progress.marks).filter((m) => m.saved).length,
})

/** Intentos mínimos para que el acierto de un tema cuente como señal. */
export const MIN_TOPIC_ANSWERS = 5

export type TopicMastery = {
  topicId: string
  label: string
  answered: number
  hits: number
}

/**
 * Aciertos por tema de la prueba, sumando el estudio y los simulacros terminados.
 * En un simulacro la omitida cuenta como fallo, igual que al calificarlo. Los
 * intentos cuya pregunta ya no está en el banco no tienen tema y se ignoran.
 */
export function topicMastery(
  bank: StudyBank | null,
  progress: LearningProgress,
  topics: Set<string>,
): TopicMastery[] {
  if (!bank) return []
  const topicOf = new Map(bank.questions.map((q) => [q.id, q.topicId]))
  const counts = new Map<string, { answered: number; hits: number }>()
  const add = (topicId: string | undefined, correct: boolean) => {
    if (!topicId || !topics.has(topicId)) return
    const c = counts.get(topicId) ?? { answered: 0, hits: 0 }
    c.answered++
    if (correct) c.hits++
    counts.set(topicId, c)
  }
  for (const a of progress.attempts) add(topicOf.get(a.questionId), a.correct)
  for (const s of finishedSessions(progress))
    for (const q of s.questions)
      add(q.topicId, s.answers[q.id]?.selected === q.correctOptionId)
  return bank.topics
    .filter((t) => topics.has(t.id))
    .map((t) => ({
      topicId: t.id,
      label: t.label,
      ...(counts.get(t.id) ?? { answered: 0, hits: 0 }),
    }))
}

/**
 * Qué estudiar primero: los temas nunca practicados y los tres de menor acierto
 * entre los que ya tienen intentos suficientes. No pondera por peso: el reparto
 * oficial de la prueba no se conoce.
 */
export function studyFirst(mastery: TopicMastery[]): TopicMastery[] {
  const unpracticed = mastery.filter((t) => t.answered === 0)
  const weakest = mastery
    .filter((t) => t.answered >= MIN_TOPIC_ANSWERS)
    .sort(
      (a, b) =>
        a.hits / a.answered - b.hits / b.answered ||
        a.label.localeCompare(b.label, 'es'),
    )
    .slice(0, 3)
  return [...unpracticed, ...weakest]
}

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
