import {
  scoreSession,
  type LearningProgress,
  type Session,
  type StudyBank,
} from '../domain/learning'
import {
  MIN_TOPIC_ANSWERS,
  sessionTitle,
  studyFirst,
  studyStats,
  topicMastery,
  type TopicMastery,
} from '../domain/study-selectors'

const percent = (t: TopicMastery) => Math.round((t.hits / t.answered) * 100)

// Progreso del estudio: estadisticas, respaldos y historial de pruebas.
// Calcula sus propias estadisticas en vez de recibirlas: los selectores viven en
// el dominio, asi que no hay motivo para que App las derive por ella.
export function ProgressView({
  learning,
  bank,
  examTopics,
  cutoffOf,
  onDownload,
  onUpload,
  onOpenResults,
}: {
  learning: { progress: LearningProgress; temporary: boolean }
  bank: StudyBank
  examTopics: Set<string>
  cutoffOf: (s: Session) => number | null
  onDownload: () => void
  onUpload: (file: File) => void
  onOpenResults: (id: string) => void
}) {
  const { progress, temporary } = learning
  const { total, hits, saved } = studyStats(progress)
  const completed = progress.sessions.filter((s) => s.finishedAt)
  const mastery = topicMastery(bank, progress, examTopics)
  const first = studyFirst(mastery)
  return (
    <>
      <div className="page-heading">
        <h1>Tu progreso</h1>
        <p>
          {temporary
            ? 'Tus resultados son temporales. Exporta una copia antes de cerrar.'
            : 'Un paso cada día. Tus resultados se guardan en este dispositivo.'}
        </p>
      </div>
      <div className="stats">
        <div>
          <strong>{total}</strong>Preguntas intentadas
        </div>
        <div>
          <strong>{total ? Math.round((hits / total) * 100) : 0}%</strong>
          Aciertos
        </div>
        <div>
          <strong>{saved}</strong>
          Guardadas
        </div>
      </div>
      <h2>Estudia esto primero</h2>
      {!first.length ? (
        <p className="empty">
          Responde al menos {MIN_TOPIC_ANSWERS} preguntas de un tema para ver
          cuáles te cuestan más.
        </p>
      ) : (
        <ul className="topic-list">
          {first.map((t) => (
            <li key={t.topicId}>
              <span>{t.label}</span>
              <small>
                {t.answered
                  ? `${percent(t)}% de aciertos`
                  : 'Sin practicar'}
              </small>
            </li>
          ))}
        </ul>
      )}
      <h2>Dominio por tema</h2>
      <p className="bank-note">
        Suma el estudio y los simulacros terminados. En un simulacro, la omitida
        cuenta como fallo. Con menos de {MIN_TOPIC_ANSWERS} respuestas el
        porcentaje todavía no dice mucho.
      </p>
      <ul className="topic-list">
        {mastery.map((t) => (
          <li key={t.topicId}>
            <span>{t.label}</span>
            <small>
              {t.answered
                ? `${percent(t)}% · ${t.hits}/${t.answered}${
                    t.answered < MIN_TOPIC_ANSWERS ? ' · pocos intentos' : ''
                  }`
                : 'Sin practicar'}
            </small>
          </li>
        ))}
      </ul>
      <div className="button-row">
        <button className="primary" onClick={onDownload}>
          Exportar progreso
        </button>
        <label className="secondary file-label">
          Importar progreso
          <input
            aria-label="Importar progreso"
            type="file"
            accept="application/json"
            onChange={(e) => {
              if (e.target.files?.[0]) onUpload(e.target.files[0])
              e.target.value = ''
            }}
          />
        </label>
      </div>
      <p className="bank-note">
        Incluye tus marcas y notas personales. Conserva la copia en un
        lugar privado. Los resultados con preguntas provisionales son
        orientativos.
      </p>
      <h2>Pruebas terminadas</h2>
      {!completed.length ? (
        <p className="empty">Tu primera prueba aparecerá aquí.</p>
      ) : (
        completed
          .slice()
          .reverse()
          .map((s) => (
            <button
              className="history-row"
              key={s.id}
              onClick={() => onOpenResults(s.id)}
            >
              <span>
                {sessionTitle(s)}
                <small>
                  {new Date(s.startedAt).toLocaleDateString('es-CO')}
                </small>
              </span>
              <strong>
                {scoreSession(s, cutoffOf(s)).score}/100 →
              </strong>
            </button>
          ))
      )}
    </>
  )
}
