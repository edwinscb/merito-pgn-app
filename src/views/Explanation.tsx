import type { Question } from '../domain/dataset/contracts'
import type { StudyBank } from '../domain/learning'

// Respuesta correcta, por que fallan las otras opciones, y las fuentes.
export function Explanation({
  question,
  bank,
}: {
  question: Question
  bank: StudyBank
}) {
  return (
    <section className="explanation" aria-label="Explicación">
      <h3>
        Respuesta:{' '}
        {question.options.find((o) => o.id === question.correctOptionId)?.text}
      </h3>
      <p>{question.explanation}</p>
      <details>
        <summary>Por qué las otras opciones no corresponden</summary>
        <ul>
          {question.options
            .filter((o) => o.id !== question.correctOptionId)
            .map((o) => (
              <li key={o.id}>
                <strong>{o.text}</strong>
                <p>{o.rationale}</p>
              </li>
            ))}
        </ul>
      </details>
      <details>
        <summary>Consultar fuentes</summary>
        <ul>
          {question.references
            .filter((r) => r.supports === 'correct_answer')
            .map((r, i) => {
              const source = bank.sources.find((s) => s.id === r.sourceId)
              return (
                <li key={i}>
                  {source?.url ? (
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  ) : (
                    (source?.title ?? 'Fuente de respaldo')
                  )}
                  <p>{r.locator}</p>
                </li>
              )
            })}
        </ul>
      </details>
    </section>
  )
}
