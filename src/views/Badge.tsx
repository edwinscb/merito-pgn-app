import type { Question } from '../domain/dataset/contracts'
import type { StudyBank } from '../domain/learning'

// Sello editorial de una pregunta. Compara el contenido con el del banco para no
// declarar aprobada una pregunta que cambio despues de la aprobacion.
export function Badge({ question, bank }: { question: Question; bank: StudyBank }) {
  const current = bank.questions.find(q => q.id === question.id)
  const content = (q: Question) => JSON.stringify([q.stem, [...q.options].sort((a, b) => a.id.localeCompare(b.id)), q.correctOptionId, q.explanation, q.references])
  const approved = bank.ownerApprovedIds.includes(question.id) && current && content(current) === content(question)
  return (
    <span
      className={`badge ${approved || question.status === 'validated_assisted' ? 'reviewed' : 'provisional'}`}
    >
      {approved ? 'Aprobada por el propietario' : question.status === 'validated_assisted' ? 'Revisada' : 'Provisional'}
    </span>
  )
}
