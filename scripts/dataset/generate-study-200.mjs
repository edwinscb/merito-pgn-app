import { readFile, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { general200 } from './questions-200-general.mjs'
import { systems200 } from './questions-200-systems.mjs'
import { questionFingerprint } from './question-fingerprint.mjs'
const root = new URL('../../', import.meta.url)
const read = async p => JSON.parse(await readFile(new URL(p, root), 'utf8'))
const write = async (p, value) => writeFile(new URL(p, root), JSON.stringify(value, null, 2) + '\n')
if (general200.length !== 54 || systems200.length !== 44) throw Error('Lote incompleto: requiere 54 General y 44 Sistemas.')
const sources = await read('dataset/content/sources.json')
const units = (await read('dataset/content/source-units.json')).filter(u => !u.id.startsWith('study200-'))
const resolution = sources.find(s => s.id === 'pgn-resolution-133-2026')
Object.assign(resolution, { localPath: 'dataset/raw/official/fase2-completion/resolution-133-check.pdf', mimeType: 'application/pdf',
  contentHash: createHash('sha256').update(await readFile(new URL('dataset/raw/official/fase2-completion/resolution-133-check.pdf', root))).digest('hex'),
  status: 'needs_review', publishedAt: '2026-05-20', incorporatedAt: '2026-09-10', redistribution: 'internal_only',
  notes: 'Copia descargada y página 5 cotejada visualmente el 2026-09-10: apertura 7 septiembre 08:00, cierre 18 septiembre 16:00, hora Colombia. Revisión integral del acto pendiente.' })
units.push({ id: 'study200-registration', sourceId: resolution.id, locator: 'Página 5, artículos 1 y 2 y nota al pie 2',
  title: 'Ventana de inscripción y diferencia entre medios de pago', content: 'La Resolución 133 modifica el término: del 7 de septiembre de 2026 a las 08:00 al 18 de septiembre a las 16:00, hora legal colombiana. Pago PSE del 7 al 18; ventanilla o corresponsal del 7 al 17. El pago debe reflejarse antes del cierre. Los cambios se anuncian en Avisos Importantes. Cotejo visual limitado a esta página; no certifica revisión integral del acto.',
  verificationStatus: 'pending_review', sourceHash: resolution.contentHash, topicIds: [], targetCallIds: [] })
const guide = sources.find(s => s.id === 'pgn-historical-guide')
units.push({ id: 'study200-historical-format', sourceId: guide.id, locator: 'Guía histórica, páginas 26–38: ejemplos de conocimientos y competencias comportamentales',
  title: 'Alcance histórico de los ejemplos', content: 'La guía muestra formatos de evaluación de conocimientos y competencias del concurso histórico Procurando Mérito y Rectitud. Se usa para distinguir conocimiento aplicado y comportamiento, sin trasladar sus preguntas, reglas, ponderaciones ni normativa al concurso de 2026. No acredita que estos ejercicios originales hayan aparecido en un examen oficial.', verificationStatus: 'pending_review', sourceHash: guide.contentHash, topicIds: ['competencias_comportamentales'], targetCallIds: [] })
const questions = [...general200, ...systems200].map((q, i) => {
  const source = sources.find(s => s.id === q.source)
  if (!source?.contentHash || !['A', 'B'].includes(source.authorityTier)) throw Error(`Sin respaldo primario: ${q.source}`)
  const id = `PGN-NEW-${String(110 + i).padStart(4, '0')}`
  const unitId = `study200-${110 + i}`
  units.push({ id: unitId, sourceId: source.id, locator: q.locator, title: `Fundamento: ${q.locator}`,
    content: `Síntesis de estudio, no transcripción: ${q.explanation} Alcance: ${q.topic === 'competencias_comportamentales' ? 'referente general del Decreto 815; no se certifica aplicación directa al régimen especial PGN' : 'concepto de la fuente citada, aplicado a un caso didáctico original'}. Pendiente de revisión independiente.`,
    verificationStatus: 'pending_review', sourceHash: source.contentHash, topicIds: [q.topic], targetCallIds: [] })
  const options = q.wrong.map(([text, rationale]) => ({ text, rationale }))
  const position = i % 4
  options.splice(position, 0, { text: q.correct, rationale: q.explanation })
  return { id, status: 'needs_review', moduleId: i < 54 ? 'comun' : 'tecnico', topicId: q.topic, secondaryTopicIds: [],
    questionType: q.topic === 'competencias_comportamentales' ? 'behavioral' : i < 54 ? 'application' : 'technical_analysis', difficulty: 2,
    stem: q.stem, options: options.map((o, j) => ({ id: 'ABCD'[j], ...o })), correctOptionId: 'ABCD'[position], explanation: q.explanation,
    references: [{ sourceId: source.id, sourceUnitId: unitId, locator: q.locator, supports: 'correct_answer' }],
    targetCallIds: [], createdMethod: 'ai_draft', reviews: [], validFrom: null, tags: ['original-case', 'study200', 'provisional-authorized'] }
})
const authorization = await read('dataset/content/study-authorization.json')
authorization.questions = [...authorization.questions.filter(q => !q.questionId.startsWith('PGN-NEW-')), ...questions.map(q => ({ questionId: q.id, contentHash: questionFingerprint(q) }))]
await write('dataset/content/sources.json', sources)
await write('dataset/content/source-units.json', units)
await write('dataset/content/questions/study-200.json', questions)
await write('dataset/content/study-authorization.json', authorization)
console.log(`Generadas ${questions.length} preguntas originales provisionales, con unidades y habilitación por hash.`)
