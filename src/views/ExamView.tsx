import {
  finishSession,
  type LearningProgress,
  type Session,
  type StudyBank,
} from '../domain/learning'
import { sessionTitle } from '../domain/study-selectors'
import type { useExamRun } from '../hooks/useExamRun'
import { Badge } from './Badge'
import { clock } from './format'

// La prueba en curso: una pregunta a la vez, sin explicaciones hasta terminar.
// Recibe el objeto del hook completo en vez de sus piezas, para que agregar un
// control a la prueba no cambie esta firma.
export function ExamView({
  bank,
  session,
  progress,
  now,
  exam,
  labelTopic,
  onLeave,
}: {
  bank: StudyBank
  session: Session
  progress: LearningProgress
  now: number
  exam: ReturnType<typeof useExamRun>
  labelTopic: (id: string) => string
  onLeave: () => void
}) {
  const { confirmFinish, setConfirmFinish, updateSession } = exam

  const q = session.questions[session.index]
  const answer = session.answers[q.id]
  return (
    <section className="exam">
      <div className="exam-top">
        <span>
          {sessionTitle(session)} · {session.index + 1}/
          {session.questions.length}
        </span>
        <strong
          role="timer"
          aria-live="polite"
          aria-label="Tiempo restante"
        >
          {clock(
            Math.max(0, Math.ceil((session.endsAt - now) / 1000)),
          )}
        </strong>
      </div>
      <progress
        value={
          Object.values(session.answers).filter((a) => a.selected)
            .length
        }
        max={session.questions.length}
        aria-label="Preguntas respondidas"
      />
      {session.endsAt - now <= 300000 && session.endsAt > now && (
        <p className="notice" role="status">
          Quedan menos de 5 minutos.
        </p>
      )}
      <article className="question-card">
        <div className="question-meta">
          <Badge question={q} bank={bank} />
          <span>{labelTopic(q.topicId)}</span>
        </div>
        <h1 className="question-title">{q.stem}</h1>
        <div className="options">
          {q.options.map((o, i) => (
            <button
              key={o.id}
              className={`option ${answer.selected === o.id ? 'selected' : ''}`}
              aria-pressed={answer.selected === o.id}
              onClick={() =>
                updateSession((s) => ({
                  ...s,
                  answers: {
                    ...s.answers,
                    [q.id]: { ...s.answers[q.id], selected: o.id },
                  },
                }))
              }
            >
              <span className="option-letter">{'ABCD'[i]}</span>{' '}
              {o.text}
            </button>
          ))}
        </div>
        <button
          className="chip"
          aria-pressed={answer.flagged}
          onClick={() =>
            updateSession((s) => ({
              ...s,
              answers: {
                ...s.answers,
                [q.id]: {
                  ...s.answers[q.id],
                  flagged: !answer.flagged,
                },
              },
            }))
          }
        >
          {answer.flagged
            ? 'Marcada para volver'
            : 'Marcar para volver'}
        </button>
        <div className="exam-actions">
          <button
            className="secondary"
            disabled={session.index === 0}
            onClick={() =>
              updateSession((s) => ({ ...s, index: s.index - 1 }))
            }
          >
            Anterior
          </button>
          {session.index < session.questions.length - 1 ? (
            <button
              className="primary"
              onClick={() =>
                updateSession((s) => ({ ...s, index: s.index + 1 }))
              }
            >
              Siguiente
            </button>
          ) : (
            <button
              className="primary"
              onClick={() => setConfirmFinish(true)}
            >
              Finalizar
            </button>
          )}
        </div>
      </article>
      <details className="question-map">
        <summary>Ver todas las preguntas</summary>
        <div>
          {session.questions.map((item, i) => (
            <button
              key={item.id}
              className={`chip ${session.answers[item.id].selected ? 'answered' : ''}`}
              aria-label={`Pregunta ${i + 1}${session.answers[item.id].flagged ? ', marcada' : ''}`}
              onClick={() =>
                updateSession((s) => ({ ...s, index: i }))
              }
            >
              {i + 1}
              {session.answers[item.id].flagged ? ' ⚑' : ''}
            </button>
          ))}
        </div>
      </details>
      <button
        className="text-button"
        onClick={() => setConfirmFinish(true)}
      >
        Terminar ahora
      </button>
      {confirmFinish && (
        <div className="notice">
          <p>
            Quedan{' '}
            {
              Object.values(session.answers).filter(
                (a) => !a.selected,
              ).length
            }{' '}
            preguntas sin responder. ¿Terminar el simulacro?
          </p>
          <div className="button-row">
            <button
              className="primary"
              onClick={() => {
                updateSession((s) => finishSession(s))
                onLeave()
                setConfirmFinish(false)
              }}
            >
              Sí, ver resultados
            </button>
            <button
              className="secondary"
              onClick={() => setConfirmFinish(false)}
            >
              Seguir respondiendo
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
