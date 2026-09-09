import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { questionFingerprint } from './question-fingerprint.mjs'

const root = new URL('../../', import.meta.url)
const read = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'))
const questions = await read('dataset/content/questions/expansion-draft.json')
const reports = await Promise.all(['factual', 'editorial'].map((kind) => read(`dataset/reports/bank100-${kind}-final.json`)))
// Consume evidencia producida por revisores; nunca fabrica resultados pass.
if (reports.some((report) => report.independence !== 'independent-reviewer')
  || reports[0].reviewerId === reports[1].reviewerId) {
  throw new Error('Promoción bloqueada: se requieren dos revisores independientes acreditados.')
}
for (const report of reports) {
  if (!report.reviewerId || !Number.isFinite(Date.parse(report.reviewedAt))
    || Date.parse(report.reviewedAt) > Date.now()) throw new Error('Metadatos de revisión inválidos.')
  if (new Set(report.questions.map((entry) => entry.id)).size !== report.questions.length) {
    throw new Error('IDs duplicados en informe.')
  }
  for (const question of questions) {
    const entry = report.questions.find((item) => item.id === question.id)
    if (!entry || entry.contentHash !== questionFingerprint(question)
      || !['pass', 'needs_changes', 'fail'].includes(entry.outcome) || !entry.notes?.trim()) {
      throw new Error(`Informe ausente, inválido o desactualizado: ${question.id}`)
    }
  }
}
for (const question of questions) {
  question.reviews = reports.map((report, index) => {
    const entry = report.questions.find((item) => item.id === question.id)
    return { id: `${question.id}-${index}-${entry.contentHash.slice(0, 12)}`,
      kind: index === 0 ? 'factual' : 'editorial', method: 'ai_assisted',
      reviewerId: report.reviewerId, model: null, reviewedAt: report.reviewedAt,
      outcome: entry.outcome, notes: entry.notes }
  })
  question.status = question.reviews.every((entry) => entry.outcome === 'pass') ? 'validated_assisted' : 'needs_review'
  question.validFrom = question.status === 'validated_assisted'
    ? reports.map((report) => report.reviewedAt.slice(0, 10)).sort().at(-1) : null
}
await writeFile(fileURLToPath(new URL('dataset/content/questions/expansion-draft.json', root)), `${JSON.stringify(questions, null, 2)}\n`)
console.log(`Promovidas ${questions.filter((q) => q.status === 'validated_assisted').length} preguntas con evidencia coincidente.`)
