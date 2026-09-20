import {
  scoreSession,
  type Block,
  type Session,
  type StudyBank,
} from '../domain/learning'
import { blockLabel, sessionTitle } from '../domain/study-selectors'
import { Badge } from './Badge'
import { Explanation } from './Explanation'
import { clock } from './format'

// Resultados de una prueba terminada: puntaje, errores y omitidas con su
// explicacion. Calcula el corte y el puntaje por si misma a partir de la sesion.
export function ResultsView({
  bank,
  session,
  block,
  topic,
  error,
  now,
  cutoffOf,
  labelTopic,
  onStudy,
  onSetupExam,
}: {
  bank: StudyBank
  session: Session
  block: Block
  topic: string
  error: string
  now: number
  cutoffOf: (s: Session) => number | null
  labelTopic: (id: string) => string
  onStudy: (block: Block, ids?: string[] | null) => void
  onSetupExam: () => void
}) {

  const cutoff = cutoffOf(session)
  const score = scoreSession(session, cutoff)
  return (
    <section>
      <div className="page-heading">
        <p className="eyebrow">
          {session.profileId
            ? 'PRUEBA DE CONOCIMIENTOS FINALIZADA'
            : 'SIMULACRO FINALIZADO'}
        </p>
        <h1>
          Así te fue en{' '}
          {session.profileId
            ? 'la Prueba de Conocimientos'
            : blockLabel(session.block)}
        </h1>
        <p>
          {clock(
            Math.max(
              0,
              Math.round(
                ((session.finishedAt ?? now) - session.startedAt) /
                  1000,
              ),
            ),
          )}{' '}
          de trabajo. Cada error te ayuda a elegir qué repasar.
        </p>
      </div>
      <div className="stats">
        <div>
          <strong>{score.score}/100</strong>Nota
        </div>
        <div>
          <strong>{score.correct}</strong>Aciertos
        </div>
        <div>
          <strong>{score.wrong}</strong>Errores
        </div>
        <div>
          <strong>{score.omitted}</strong>Omitidas
        </div>
      </div>
      {cutoff === null ? (
        <p className="notice">
          Sin veredicto: la PGN no ha publicado el puntaje mínimo de esta
          prueba.
        </p>
      ) : (
        <p className="notice" role="status">
          {score.passed
            ? `Aprobada: ${score.score} sobre 100, el mínimo es ${cutoff}.`
            : `No aprobada: ${score.score} sobre 100, el mínimo es ${cutoff}.`}
        </p>
      )}
      <div className="button-row">
        <button
          className="primary"
          onClick={() => {
            const failed = session.questions.filter(
              (q) =>
                session.answers[q.id].selected !== q.correctOptionId,
            )
            // La prueba mezcla modulos y el estudio filtra por uno: se abre el
            // del primer error. El filtro de alcance llega en la fase 5.
            // moduleId es string en el contrato; se estrecha aqui en vez
            // de forzar el tipo con una asercion.
            const destino =
              session.block ??
              (failed[0]?.moduleId === 'tecnico' ? 'tecnico' : 'comun')
            onStudy(
              destino,
              failed.map((q) => q.id),
            )
          }}
        >
          Repasar errores
        </button>
        <button
          className="secondary"
          onClick={onSetupExam}
        >
          Nueva prueba
        </button>
      </div>
      <h2>Resultados por tema</h2>
      <ul className="topic-results">
        {Object.entries(score.topics).map(([id, v]) => (
          <li key={id}>
            <span>{labelTopic(id)}</span>
            <strong>
              {v.correct}/{v.total}
            </strong>
          </li>
        ))}
      </ul>
      <h2>Revisa tus respuestas</h2>
      {session.questions.map((q, i) => (
        <details className="result-item" key={q.id}>
          <summary>
            {i + 1}. {q.stem}
            <span>
              {!session.answers[q.id].selected
                ? 'Omitida'
                : session.answers[q.id].selected === q.correctOptionId
                  ? 'Correcta'
                  : 'Incorrecta'}
            </span>
          </summary>
          <Badge question={q} bank={bank} />
          <p>
            Tu respuesta:{' '}
            {q.options.find(
              (o) => o.id === session.answers[q.id].selected,
            )?.text ?? 'Sin responder'}
          </p>
          <Explanation question={q} bank={bank} />
        </details>
      ))}
    </section>
  )
}
