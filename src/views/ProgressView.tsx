import { scoreSession, type LearningProgress, type Session } from '../domain/learning'
import { sessionTitle, studyStats } from '../domain/study-selectors'

// Progreso del estudio: estadisticas, respaldos y historial de pruebas.
// Calcula sus propias estadisticas en vez de recibirlas: los selectores viven en
// el dominio, asi que no hay motivo para que App las derive por ella.
export function ProgressView({
  learning,
  cutoffOf,
  onDownload,
  onUpload,
  onOpenResults,
}: {
  learning: { progress: LearningProgress; temporary: boolean }
  cutoffOf: (s: Session) => number | null
  onDownload: () => void
  onUpload: (file: File) => void
  onOpenResults: (id: string) => void
}) {
  const { progress, temporary } = learning
  const { total, hits, saved } = studyStats(progress)
  const completed = progress.sessions.filter((s) => s.finishedAt)
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
