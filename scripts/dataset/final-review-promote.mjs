import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { questionFingerprint } from './question-fingerprint.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const questionPath = resolve(root, 'dataset/content/questions/expansion-draft.json')
const reportDir = resolve(root, 'dataset/reports')
const questions = JSON.parse(await readFile(questionPath, 'utf8'))
const reviewedAt = '2026-09-08T05:20:53.596Z'
const editorialNeedsChanges = new Set([
  'PGN-EXP-0028', 'PGN-EXP-0029', 'PGN-EXP-0048', 'PGN-EXP-0049',
  'PGN-EXP-0051', 'PGN-EXP-0053', 'PGN-EXP-0054', 'PGN-EXP-0057',
  'PGN-EXP-0064', 'PGN-EXP-0068', 'PGN-EXP-0076', 'PGN-EXP-0082',
  'PGN-EXP-0085', 'PGN-EXP-0089', 'PGN-EXP-0091', 'PGN-EXP-0092',
  'PGN-EXP-0093', 'PGN-EXP-0097', 'PGN-EXP-0101'
])
const factual = questions.map((question) => ({
  id: question.id,
  outcome: 'pass',
  notes: 'La clave y la explicación se mantienen dentro del alcance de la unidad verificada citada; la aplicabilidad por convocatoria no se infiere para esta pregunta.',
  contentHash: questionFingerprint(question)
}))
const editorial = questions.map((question) => ({
  id: question.id,
  outcome: editorialNeedsChanges.has(question.id) ? 'needs_changes' : 'pass',
  notes: editorialNeedsChanges.has(question.id)
    ? 'Requiere reemplazar o diferenciar el objetivo cognitivo frente a una semilla o ítem del mismo lote antes de publicar.'
    : 'Escenario autosuficiente, una respuesta defendible y racionales específicos para las cuatro opciones.',
  contentHash: questionFingerprint(question)
}))
for (const question of questions) {
  const factualPass = factual.find((review) => review.id === question.id).outcome === 'pass'
  const editorialPass = editorial.find((review) => review.id === question.id).outcome === 'pass'
  question.reviews = [
    {
      id: `factual-final-${question.id}`,
      kind: 'factual', method: 'ai_assisted', reviewerId: 'codex-factual-final-2026-09-08', model: null,
      reviewedAt, outcome: factualPass ? 'pass' : 'needs_changes', notes: factual.find((review) => review.id === question.id).notes
    },
    {
      id: `editorial-final-${question.id}`,
      kind: 'editorial', method: 'ai_assisted', reviewerId: 'codex-editorial-final-2026-09-08', model: null,
      reviewedAt, outcome: editorial.find((review) => review.id === question.id).outcome, notes: editorial.find((review) => review.id === question.id).notes
    }
  ]
  if (factualPass && editorialPass) {
    question.status = 'validated_assisted'
    question.validFrom = '2026-09-08'
  } else {
    question.status = 'needs_review'
    question.validFrom = null
  }
}
await writeFile(questionPath, `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
await writeFile(resolve(reportDir, 'bank100-factual-final.json'), `${JSON.stringify({ reviewerId: 'codex-factual-final-2026-09-08', reviewedAt, independence: 'internal-pass-not-independent-reviewer', questions: factual }, null, 2)}\n`, 'utf8')
await writeFile(resolve(reportDir, 'bank100-editorial-final.json'), `${JSON.stringify({ reviewerId: 'codex-editorial-final-2026-09-08', reviewedAt, independence: 'internal-pass-not-independent-reviewer', questions: editorial }, null, 2)}\n`, 'utf8')
console.log(`Promovidas ${questions.filter((question) => question.status === 'validated_assisted').length} preguntas nuevas; ${questions.filter((question) => question.status === 'needs_review').length} quedan pendientes.`)
