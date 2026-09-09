import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { groups } from '../../dataset/editorial/expansion-items.mjs'
import { questionFingerprint } from './question-fingerprint.mjs'
import { createHash } from 'node:crypto'
import { replacements } from '../../dataset/editorial/replacements.mjs'

const root = fileURLToPath(new URL('../../', import.meta.url))
const units = JSON.parse(await readFile(resolve(root, 'dataset/content/source-units.json'), 'utf8'))
const taxonomy = JSON.parse(await readFile(resolve(root, 'dataset/content/taxonomy.json'), 'utf8'))
const path = resolve(root, 'dataset/content/questions/expansion-draft.json')
let previous = []
try { previous = JSON.parse(await readFile(path, 'utf8')) } catch (error) {
  if (error.code !== 'ENOENT') throw error
}
const previousById = new Map(previous.map((q) => [q.id, q]))
const questions = []
for (const [groupUnitId, items] of groups) {
  for (const [originalStem, ...originalAnswers] of items) {
  const replacement = replacements[`PGN-EXP-${String(questions.length + 26).padStart(4, '0')}`]
  const unitId = replacement?.unitId ?? groupUnitId
  const stem = replacement?.stem ?? originalStem
  const answers = replacement?.answers ?? originalAnswers
  const unit = units.find((candidate) => candidate.id === unitId)
  if (!unit || unit.verificationStatus !== 'verified') throw new Error(`Unidad no verificada: ${unitId}`)
  const topicId = unit.topicIds[0]
  const topic = taxonomy.topics.find((candidate) => candidate.id === topicId)
  // Una unidad común no prueba aplicabilidad a una convocatoria concreta.
  // Solo se conservan convocatorias expresamente asignadas a la unidad.
  const applicable = units.filter((candidate) => candidate.id.match(/^pgn-call-\d+-2026-v3-profile$/)
    && unit.targetCallIds.includes(candidate.targetCallIds[0]))
    if (answers.length !== 4) throw new Error(`Se requieren cuatro opciones: ${stem}`)
    const index = questions.length
    // Reproducible sin secuencia ABCD que permita anticipar respuestas.
    const correctIndex = createHash('sha256').update(`pgn-answer-position:${index + 26}`).digest()[0] % 4
    const options = answers.map((_, position) => {
      const answerIndex = (position - correctIndex + 4) % 4
      const [text, rationale] = answers[answerIndex]
      return { id: 'ABCD'[position], text, rationale }
    })
    const question = {
      id: `PGN-EXP-${String(index + 26).padStart(4, '0')}`,
      status: 'needs_review', moduleId: topic.moduleId, topicId,
      secondaryTopicIds: [], questionType: 'application', difficulty: 2,
      stem, options, correctOptionId: 'ABCD'[correctIndex],
      explanation: replacement?.explanation ?? answers[0][1],
      references: [
        { sourceId: unit.sourceId, sourceUnitId: unit.id, locator: unit.locator, supports: 'correct_answer' },
        ...applicable.map((profile) => ({ sourceId: profile.sourceId, sourceUnitId: profile.id, locator: profile.locator, supports: 'context' }))
      ],
      targetCallIds: unit.targetCallIds,
      createdMethod: 'ai_draft', reviews: [], validFrom: null,
      tags: ['original-case', 'bank100']
    }
    const old = previousById.get(question.id)
    if (old && questionFingerprint(old) === questionFingerprint(question)) {
      question.status = old.status
      question.reviews = old.reviews
      question.validFrom = old.validFrom
    }
    questions.push(question)
  }
}
const normalize = (text) => text.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
const stems = questions.map((q) => normalize(q.stem))
const answerSets = questions.map((q) => q.options.map((o) => normalize(o.text)).sort().join('\n'))
if (new Set(stems).size !== questions.length || new Set(answerSets).size !== questions.length) {
  throw new Error('No se permiten enunciados ni conjuntos de opciones repetidos.')
}
await writeFile(path, `${JSON.stringify(questions, null, 2)}\n`, 'utf8')
console.log(`Lote original: ${questions.length} preguntas distintas; las ediciones invalidan revisiones anteriores.`)
