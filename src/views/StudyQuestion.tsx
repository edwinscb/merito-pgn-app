import { useRef, useState } from 'react'
import type { Question } from '../domain/dataset/contracts'
import { blankMark, type Mark, type StudyBank } from '../domain/learning'
import { Badge } from './Badge'
import { Explanation } from './Explanation'

// Una pregunta en modo estudio: opciones, explicacion y las marcas personales.
export function StudyQuestion({
  question,
  bank,
  mark,
  outOfScope,
  onMark,
  onAnswer,
}: {
  question: Question
  bank: StudyBank
  mark: Mark
  outOfScope: boolean
  onMark: (m: Mark) => void
  onAnswer: (
    option: 'A' | 'B' | 'C' | 'D',
    confidence: number | null,
    seconds: number,
  ) => void
}) {
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [reporting, setReporting] = useState(mark.problem)
  const started = useRef(Date.now())
  const update = (patch: Partial<Mark>) =>
    onMark({ ...mark, ...patch, updatedAt: Date.now() })
  return (
    <article className="question-card">
      <div className="question-meta">
        <Badge question={question} bank={bank} />
        <span>{bank.topics.find((t) => t.id === question.topicId)?.label}</span>
        {outOfScope && (
          <span className="badge provisional">Fuera de tu convocatoria</span>
        )}
      </div>
      <h2 className="question-title">{question.stem}</h2>
      <div className="options">
        {question.options.map((o, i) => (
          <button
            key={o.id}
            aria-pressed={selected === o.id}
            disabled={revealed}
            className={`option ${selected === o.id ? 'selected' : ''} ${revealed && o.id === question.correctOptionId ? 'correct' : ''}`}
            onClick={() => setSelected(o.id)}
          >
            <span className="option-letter">{'ABCD'[i]}</span> {o.text}
          </button>
        ))}
      </div>
      {!revealed && (
        <>
          <details className="optional">
            <summary>Confianza en mi respuesta (opcional)</summary>
            <div className="button-row">
              {[1, 2, 3].map((n) => (
                <button
                  className="chip"
                  key={n}
                  aria-pressed={confidence === n}
                  onClick={() => setConfidence(confidence === n ? null : n)}
                >
                  {['Baja', 'Media', 'Alta'][n - 1]}
                </button>
              ))}
            </div>
          </details>
          <div className="button-row">
            <button
              className="primary"
              disabled={!selected}
              onClick={() => {
                if (selected) {
                  onAnswer(
                    selected,
                    confidence,
                    Math.round((Date.now() - started.current) / 1000),
                  )
                  setRevealed(true)
                }
              }}
            >
              Comprobar
            </button>
            <button className="text-button" onClick={() => setRevealed(true)}>
              Ver explicación
            </button>
          </div>
        </>
      )}
      {revealed && <Explanation question={question} bank={bank} />}
      <div className="personal-actions">
        <button
          className="chip"
          aria-pressed={mark.saved}
          onClick={() => update({ saved: !mark.saved })}
        >
          {mark.saved ? 'Guardada para repasar' : 'Guardar para repasar'}
        </button>
        <button
          className="chip"
          aria-pressed={mark.reviewed}
          onClick={() => update({ reviewed: !mark.reviewed })}
        >
          {mark.reviewed ? 'Revisada por mí ✓' : 'Marcar revisada por mí'}
        </button>
        <button
          className="text-button"
          onClick={() => setReporting(!reporting)}
        >
          Reportar problema
        </button>
      </div>
      {reporting && (
        <div className="report">
          <label>
            Nota personal (opcional)
            <textarea
              maxLength={2000}
              value={mark.note}
              onChange={(e) => update({ note: e.target.value })}
            />
          </label>
          <button
            className="secondary"
            onClick={() => update({ problem: !mark.problem })}
          >
            {mark.problem ? 'Quitar marca de problema' : 'Marcar problema'}
          </button>
          <small>
            La marca queda en tu dispositivo y se incluye al exportar el
            progreso.
          </small>
        </div>
      )}
    </article>
  )
}
