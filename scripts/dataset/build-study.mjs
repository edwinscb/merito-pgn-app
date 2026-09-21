import { readFile, writeFile, readdir } from 'node:fs/promises'
import { questionFingerprint } from './question-fingerprint.mjs'
import { pathToFileURL } from 'node:url'
import { resolve } from 'node:path'
import { z } from 'zod'
import { RegistrationSchema } from '../../src/domain/registration.ts'
import { ExamProfilesFileSchema } from '../../src/domain/dataset/contracts.ts'

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
  rawApproval,
  examProfiles,
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
  // Composicion comprometida en el README: dos bloques del mismo tamano, para
  // que General y Sistemas pesen igual al estudiar. Subio de 200 (100+100) a
  // 240 (120+120) al cubrir los dos conocimientos del temario del cargo que no
  // tenian ninguna pregunta. Si cambia, el README cambia con ella.
  const TOTAL_ENTREGA = 240
  const POR_BLOQUE = 120
  if (questions.length !== TOTAL_ENTREGA || ['comun', 'tecnico'].some(block => questions.filter(q => q.moduleId === block).length !== POR_BLOQUE))
    throw Error(
      `La entrega debe contener ${TOTAL_ENTREGA} preguntas, ${POR_BLOQUE} por bloque; hay ${questions.length} (comun ${questions.filter(q => q.moduleId === 'comun').length}, tecnico ${questions.filter(q => q.moduleId === 'tecnico').length}).`,
    )
  const usedSources = new Set(
    questions.flatMap((q) => q.references.map((r) => r.sourceId)),
  )
  const ownerApprovedIds = []
  if (rawApproval) {
    const approval = AuthorizationSchema.omit({ authorizedBy: true }).extend({ approvedBy: z.literal('project-owner') }).parse(rawApproval)
    for (const entry of approval.questions) {
      if (ownerApprovedIds.includes(entry.questionId)) throw Error(`Aprobación duplicada: ${entry.questionId}`)
      const question = questions.find(q => q.id === entry.questionId)
      if (!question || questionFingerprint(question) !== entry.contentHash) throw Error(`Aprobación desactualizada: ${entry.questionId}`)
      ownerApprovedIds.push(entry.questionId)
    }
    ownerApprovedIds.sort()
  }
  return {
    ownerApprovedIds,
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
    // El perfil de la convocatoria viaja con el banco: la app necesita el formato
    // oficial y el alcance tematico sin volver a leer el dataset.
    examProfiles: ExamProfilesFileSchema.parse(examProfiles ?? []).map(
      ({
        id,
        title,
        status,
        questionCount,
        durationMinutes,
        passingKnowledgeScore,
        topicDistribution,
        notes,
      }) => ({
        id,
        title,
        status,
        questionCount,
        durationMinutes,
        passingKnowledgeScore,
        topicDistribution,
        notes,
      }),
    ),
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
  const approval = await read('dataset/content/owner-approval.json')
  const examProfiles = await read('dataset/content/exam-profiles.json')
  const bank = buildStudyBank(
    reviewed,
    expansion,
    authorization,
    taxonomy,
    sources,
    registration,
    approval,
    examProfiles,
  )
  await writeFile(
    new URL('public/data/study-bank.json', root),
    JSON.stringify(bank, null, 2) + '\n',
  )
  console.log(
    `Banco de estudio: ${bank.questions.length} preguntas (${bank.provisionalIds.length} provisionales).`,
  )
}
