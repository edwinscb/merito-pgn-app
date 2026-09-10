import { readFile, writeFile, readdir } from 'node:fs/promises'
import { questionFingerprint } from './question-fingerprint.mjs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { z } from 'zod'
import { RegistrationSchema } from '../../src/domain/registration.ts'

export const AuthorizationSchema = z.object({
  schemaVersion: z.literal(1),
  authorizedBy: z.literal('project-owner'),
  reason: z.string().trim().min(1),
  questions: z.array(
    z.object({
      questionId: z.string().min(1),
      contentHash: z.string().regex(/^[a-f0-9]{64}$/),
    }),
  ),
})

export function buildStudyBank(
  reviewed,
  expansion,
  rawAuthorization,
  taxonomy,
  sources,
  registration,
) {
  const authorization = AuthorizationSchema.parse(rawAuthorization)
  const ids = new Set()
  const extra = authorization.questions.map((entry) => {
    if (ids.has(entry.questionId))
      throw Error(`Autorización duplicada: ${entry.questionId}`)
    ids.add(entry.questionId)
    const question = expansion.find((q) => q.id === entry.questionId)
    if (!question || questionFingerprint(question) !== entry.contentHash)
      throw Error(`Autorización desactualizada: ${entry.questionId}`)
    if (!['needs_review', 'validated_assisted'].includes(question.status))
      throw Error(`Estado no habilitable: ${entry.questionId}`)
    if (question.options.some((o) => !o.rationale))
      throw Error(`Faltan racionales: ${entry.questionId}`)
    return question
  })
  const questions = [
    ...new Map(
      [...reviewed.questions, ...extra].map((q) => [q.id, q]),
    ).values(),
  ].sort((a, b) => a.id.localeCompare(b.id))
  if (questions.length !== 200 || ['comun', 'tecnico'].some(block => questions.filter(q => q.moduleId === block).length !== 100))
    throw Error(
      `La entrega debe contener 200 preguntas, 100 por bloque; hay ${questions.length}.`,
    )
  const usedSources = new Set(
    questions.flatMap((q) => q.references.map((r) => r.sourceId)),
  )
  return {
    ...(registration ? { registration: RegistrationSchema.parse(registration) } : {}),
    schemaVersion: 1,
    questions,
    topics: taxonomy.topics.map(({ id, label, moduleId }) => ({
      id,
      label,
      moduleId,
    })),
    sources: sources
      .filter((s) => usedSources.has(s.id) && s.authorityTier !== 'N/A')
      .map(({ id, title, url }) => ({ id, title, url })),
    provisionalIds: questions
      .filter((q) => q.status !== 'validated_assisted')
      .map((q) => q.id),
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const root = new URL('../../', import.meta.url)
  const read = async (path) =>
    JSON.parse(await readFile(new URL(path, root), 'utf8'))
  const reviewed = await read('public/data/question-bank.json')
  const batches = (await readdir(new URL('dataset/content/questions/', root))).filter(name => name.endsWith('.json')).sort()
  const expansion = (await Promise.all(batches.map(name => read(`dataset/content/questions/${name}`)))).flat()
  const authorization = await read('dataset/content/study-authorization.json')
  const taxonomy = await read('dataset/content/taxonomy.json')
  const sources = await read('dataset/content/sources.json')
  const registration = await read('dataset/content/registration.json')
  const bank = buildStudyBank(
    reviewed,
    expansion,
    authorization,
    taxonomy,
    sources,
    registration,
  )
  await writeFile(
    new URL('public/data/study-bank.json', root),
    JSON.stringify(bank, null, 2) + '\n',
  )
  console.log(
    `Banco de estudio: ${bank.questions.length} preguntas (${bank.provisionalIds.length} provisionales).`,
  )
}
