import {
  blankMark,
  profiles,
  type Block,
  type LearningProgress,
  type StudyBank,
} from '../domain/learning'
import { newStudyOrder } from '../domain/study-order'
import type { Question } from '../domain/dataset/contracts'
import {
  filterStudyQuestions,
  isOutOfScope,
  questionAt,
  questionsOfBlock,
} from '../domain/study-selectors'
import type { useStudySession } from '../hooks/useStudySession'
import { StudyQuestion } from './StudyQuestion'

// Estudio por bloque: filtros, busqueda y una pregunta a la vez.
// Deriva available / filtered / question de los selectores del dominio en vez de
// recibirlos: sin eso esta vista necesitaria mas de veinte props.
export function QuestionsView({
  bank,
  study,
  learning,
  examProfile,
  examTopics,
  onGoStudy,
}: {
  bank: StudyBank
  study: ReturnType<typeof useStudySession>
  learning: {
    progress: LearningProgress
    progressRef: { current: LearningProgress }
    commit: (p: LearningProgress) => void
  }
  examProfile: StudyBank['examProfiles'][number] | null
  examTopics: Set<string>
  onGoStudy: (block: Block, ids?: string[] | null) => void
}) {
  const {
    block, setBlock,
    search, setSearch,
    topic, setTopic,
    onlySaved, setOnlySaved,
    scope, setScope,
    reviewIds, setReviewIds,
    studyIndex, setStudyIndex,
    studyOrder, setStudyOrder,
    studyTemporary,
  } = study
  const { progress, progressRef, commit } = learning
  const available = questionsOfBlock(bank, block)
  const filtered = filterStudyQuestions({
    bank, studyOrder, block, topic, search, onlySaved, reviewIds, scope,
    marks: progress.marks, examTopics,
  })
  const question = questionAt(filtered, studyIndex)
  const outOfScope = (q: Question) => isOutOfScope(q, examTopics)
  return (
    <>
      <div className="page-heading">
        <h1>Tu banco de preguntas</h1>
        <p>
          Responde, consulta la explicación y guarda lo que quieras
          repasar.
        </p>
      </div>
      <div className="filters">
        <button className="secondary" onClick={() => {
          setStudyOrder(newStudyOrder(bank.questions, block))
          setStudyIndex(0)
        }}>Mezclar de nuevo</button>
        {studyTemporary && <p role="status">El orden de estudio es temporal: no se puede recuperar al recargar.</p>}
        <div className="segmented" aria-label="Bloque">
          {profiles.map((p) => (
            <button
              key={p.id}
              aria-pressed={block === p.block}
              onClick={() => onGoStudy(p.block)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label>
          Buscar pregunta
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setStudyIndex(0)
            }}
            placeholder="Escribe una palabra…"
          />
        </label>
        <label>
          Tema
          <select
            value={topic}
            onChange={(e) => {
              setTopic(e.target.value)
              setStudyIndex(0)
            }}
          >
            <option value="">Todos los temas</option>
            {bank.topics
              .filter(
                (t) =>
                  t.moduleId === block &&
                  available.some((q) => q.topicId === t.id),
              )
              .map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={onlySaved}
            onChange={(e) => {
              setOnlySaved(e.target.checked)
              setStudyIndex(0)
            }}
          />{' '}
          Solo guardadas
        </label>
        <label>
          Alcance
          <select
            value={scope}
            onChange={(e) => {
              const next = e.target.value as typeof scope
              // Las comportamentales viven en el nucleo comun: se cambia de
              // bloque para que la seccion tenga contenido.
              if (next === 'comportamentales' && block !== 'comun')
                onGoStudy('comun')
              setScope(next)
              setStudyIndex(0)
            }}
          >
            <option value="todo">Todo el banco</option>
            <option value="convocatoria">
              Solo mi convocatoria {examProfile ? examProfile.id : ''}
            </option>
            <option value="comportamentales">
              Competencias comportamentales
            </option>
          </select>
        </label>
      </div>
      {scope === 'comportamentales' && (
        <p className="notice" role="note">
          La prueba real de competencias comportamentales es
          clasificatoria: no se califica por acierto y esta aplicación no la
          simula. Estas preguntas sirven para reconocer el tipo de
          planteamiento, no para estimar un puntaje.
        </p>
      )}
      {scope === 'convocatoria' && (
        <p className="notice">
          Solo los temas de la convocatoria{' '}
          {examProfile ? examProfile.id : ''}. Las demás preguntas del banco
          siguen disponibles en {String.fromCharCode(171)}Todo el banco{String.fromCharCode(187)}.
        </p>
      )}
      {reviewIds && (
        <p className="notice">
          Repaso de errores y omitidas{' '}
          <button onClick={() => setReviewIds(null)}>Ver todas</button>
        </p>
      )}
      {question ? (
        <>
          <div className="study-position">
            <span>
              Pregunta {Math.min(studyIndex, filtered.length - 1) + 1} de{' '}
              {filtered.length}
            </span>
            <div>
              <button
                className="text-button"
                disabled={studyIndex === 0}
                onClick={() => setStudyIndex((i) => Math.max(0, i - 1))}
              >
                ← Anterior
              </button>
              <button
                className="text-button"
                disabled={studyIndex >= filtered.length - 1}
                onClick={() => setStudyIndex((i) => i + 1)}
              >
                Siguiente →
              </button>
            </div>
          </div>
          <StudyQuestion
            key={`${studyOrder?.sequenceId}:${question.id}`}
            question={question}
            bank={bank}
            mark={progress.marks[question.id] ?? blankMark()}
            outOfScope={outOfScope(question)}
            onMark={(m) =>
              commit({
                ...progressRef.current,
                marks: { ...progressRef.current.marks, [question.id]: m },
              })
            }
            onAnswer={(selected, confidence, seconds) =>
              commit({
                ...progressRef.current,
                attempts: [
                  ...progressRef.current.attempts,
                  {
                    questionId: question.id,
                    attemptedAt: new Date().toISOString(),
                    selectedOptionId: selected,
                    confidence,
                    responseTimeSeconds: seconds,
                    correct: selected === question.correctOptionId,
                    mode: 'practice',
                    examId: null,
                  },
                ],
              })
            }
          />
        </>
      ) : (
        <p className="empty">
          No hay preguntas con estos filtros. Prueba otro tema o elimina
          la búsqueda.
        </p>
      )}
    </>
  )
}
