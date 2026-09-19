import { z } from 'zod'
import { RegistrationSchema } from './registration.js'
import {
  AttemptSchema,
  QuestionSchema,
  ProgressExportSchema,
  type Question,
} from './dataset/contracts.js'

export const BlockSchema = z.enum(['comun', 'tecnico'])
export type Block = z.infer<typeof BlockSchema>
export const profiles = [
  {
    id: 'general',
    block: 'comun',
    label: 'General',
    description: 'Estado, gestión pública, transparencia y documentos.',
  },
  {
    id: 'sistemas',
    block: 'tecnico',
    label: 'Sistemas',
    description: 'Datos, software, infraestructura y ciberseguridad.',
  },
] as const
// El articulo 18 de la Resolucion 076 no fija cantidad ni duracion, asi que los
// limites siguen siendo los del producto, no un dato oficial.
export const ExamSetupSchema = z.object({
  count: z.number().int().min(1).max(200),
  minutes: z.number().int().min(1).max(240),
})
export const PracticeProfileSchema = ExamSetupSchema.extend({
  block: BlockSchema,
})
// Alcance minimo que la sesion necesita del perfil de la convocatoria.
export interface ExamScope {
  id: string
  topicDistribution: Array<{ topicId: string; weight: number }>
}
const AnswerSchema = z.object({
  selected: z.enum(['A', 'B', 'C', 'D']).nullable(),
  flagged: z.boolean(),
  seconds: z.number().nonnegative(),
})
export const SessionSchema = z
  .object({
    id: z.string().min(1),
    // Una sesion es de bloque (practica de un modulo) o de convocatoria (prueba de
    // Conocimientos, que mezcla nucleo general y especifico). Nunca las dos cosas.
    block: BlockSchema.nullable(),
    // Las sesiones creadas antes de la convocatoria quedan en null: historial heredado.
    profileId: z.string().min(1).nullable().default(null),
    questions: z.array(QuestionSchema).min(1),
    startedAt: z.number().nonnegative(),
    endsAt: z.number().nonnegative(),
    finishedAt: z.number().nonnegative().nullable(),
    index: z.number().int().nonnegative(),
    answers: z.record(z.string(), AnswerSchema),
  })
  .superRefine((s, ctx) => {
    if (
      s.index >= s.questions.length ||
      s.endsAt <= s.startedAt ||
      (s.finishedAt !== null &&
        (s.finishedAt < s.startedAt || s.finishedAt > s.endsAt)) ||
      new Set(s.questions.map((q) => q.id)).size !== s.questions.length
    )
      ctx.addIssue({ code: 'custom', message: 'Sesión inconsistente.' })
    if ((s.block === null) === (s.profileId === null))
      ctx.addIssue({
        code: 'custom',
        message: 'La sesion necesita bloque o perfil, nunca ambos ni ninguno.',
      })
    // La prueba de Conocimientos mezcla los dos modulos, por eso el bloque unico
    // solo se exige cuando la sesion es de practica por bloque.
    if (
      (s.block !== null && s.questions.some((q) => q.moduleId !== s.block)) ||
      s.questions.some((q) => !s.answers[q.id]) ||
      Object.keys(s.answers).length !== s.questions.length
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Respuestas o bloque inconsistentes.',
      })
  })
export type Session = z.infer<typeof SessionSchema>
export const MarkSchema = z.object({
  saved: z.boolean(),
  reviewed: z.boolean(),
  problem: z.boolean(),
  note: z.string().max(2000),
  updatedAt: z.number().nonnegative(),
})
export type Mark = z.infer<typeof MarkSchema>
export const LearningProgressSchema = z.object({
  attempts: z.array(AttemptSchema),
  marks: z.record(z.string(), MarkSchema),
  sessions: z.array(SessionSchema),
})
export type LearningProgress = z.infer<typeof LearningProgressSchema>
export const emptyProgress = (): LearningProgress => ({
  attempts: [],
  marks: {},
  sessions: [],
})
export const LearningExportSchema = LearningProgressSchema.extend({
  schemaVersion: z.literal(3),
  exportedAt: z.string().datetime(),
  appVersion: z.string(),
})
// v2 solo se diferencia de v3 en que sus sesiones no conocen profileId; el default
// del schema lo pone en null y la sesion queda como historial heredado.
const LearningExportV2Schema = LearningProgressSchema.extend({
  schemaVersion: z.literal(2),
  exportedAt: z.string().datetime(),
  appVersion: z.string(),
})
export function importLearning(text: string): LearningProgress {
  const value = JSON.parse(text)
  if (value.schemaVersion === 1)
    return {
      ...emptyProgress(),
      attempts: ProgressExportSchema.parse(value).attempts,
    }
  if (value.schemaVersion === 2)
    return LearningProgressSchema.parse(LearningExportV2Schema.parse(value))
  return LearningProgressSchema.parse(LearningExportSchema.parse(value))
}
export function exportLearning(progress: LearningProgress) {
  return LearningExportSchema.parse({
    ...progress,
    schemaVersion: 3,
    exportedAt: new Date().toISOString(),
    appVersion: '0.2.0',
  })
}
export function mergeProgress(
  a: LearningProgress,
  b: LearningProgress,
): LearningProgress {
  const marks = { ...a.marks }
  for (const [id, m] of Object.entries(b.marks))
    if (!marks[id] || m.updatedAt > marks[id].updatedAt) marks[id] = m
  const sessions = new Map(a.sessions.map((s) => [s.id, s]))
  // Las sesiones locales prevalecen: importar un respaldo no reabre un examen terminado.
  b.sessions.forEach((s) => {
    if (!sessions.has(s.id)) sessions.set(s.id, s)
  })
  return {
    marks,
    sessions: [...sessions.values()],
    attempts: [
      ...new Map(
        [...a.attempts, ...b.attempts].map((x) => [
          `${x.questionId}|${x.attemptedAt}|${x.mode}`,
          x,
        ]),
      ).values(),
    ],
  }
}
export function shuffled<T>(items: T[], random = Math.random): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
export function createSession(
  questions: Question[],
  block: Block,
  count = 20,
  minutes = 30,
  now = Date.now(),
): Session {
  PracticeProfileSchema.parse({ block, count, minutes })
  const chosen = shuffled(questions.filter((q) => q.moduleId === block))
    .slice(0, count)
    .map((q) => ({ ...q, options: shuffled(q.options) }))
  return SessionSchema.parse({
    id: crypto.randomUUID(),
    block,
    profileId: null,
    questions: chosen,
    startedAt: now,
    endsAt: now + minutes * 60000,
    finishedAt: null,
    index: 0,
    answers: Object.fromEntries(
      chosen.map((q) => [q.id, { selected: null, flagged: false, seconds: 0 }]),
    ),
  })
}
// Arma la prueba de Conocimientos: solo temas con peso en el perfil, repartidos por
// ese peso. Si un tema no alcanza para su cupo, el hueco lo llenan los demas temas
// del alcance en vez de fallar.
export function createExamSession(
  questions: Question[],
  profile: ExamScope,
  count = 20,
  minutes = 30,
  now = Date.now(),
  random = Math.random,
): Session {
  ExamSetupSchema.parse({ count, minutes })
  const scoped = profile.topicDistribution.filter((t) => t.weight > 0)
  const totalWeight = scoped.reduce((sum, t) => sum + t.weight, 0)
  const byTopic = new Map<string, Question[]>(scoped.map((t) => [t.topicId, []]))
  for (const q of questions) byTopic.get(q.topicId)?.push(q)
  const quota: Question[] = []
  const leftover: Question[] = []
  for (const t of scoped) {
    const available = shuffled(byTopic.get(t.topicId) ?? [], random)
    const target =
      totalWeight > 0 ? Math.round((t.weight / totalWeight) * count) : 0
    quota.push(...available.slice(0, target))
    leftover.push(...available.slice(target))
  }
  const filler = shuffled(leftover, random)
  while (quota.length < count && filler.length > 0) quota.push(filler.shift()!)
  const chosen = shuffled(quota, random)
    .slice(0, count)
    .map((q) => ({ ...q, options: shuffled(q.options, random) }))
  return SessionSchema.parse({
    id: crypto.randomUUID(),
    block: null,
    profileId: profile.id,
    questions: chosen,
    startedAt: now,
    endsAt: now + minutes * 60000,
    finishedAt: null,
    index: 0,
    answers: Object.fromEntries(
      chosen.map((q) => [q.id, { selected: null, flagged: false, seconds: 0 }]),
    ),
  })
}
export function finishSession(s: Session, now = Date.now()): Session {
  return { ...s, finishedAt: s.finishedAt ?? Math.min(now, s.endsAt) }
}
// El corte llega como dato del perfil. Sin corte no hay veredicto: passed queda en
// null en vez de inventar un aprobado.
export function scoreSession(s: Session, passingScore: number | null = null) {
  let correct = 0,
    omitted = 0
  const topics: Record<string, { correct: number; total: number }> = {}
  s.questions.forEach((q) => {
    const selected = s.answers[q.id].selected
    const hit = selected === q.correctOptionId
    if (!selected) omitted++
    else if (hit) correct++
    topics[q.topicId] ??= { correct: 0, total: 0 }
    topics[q.topicId].total++
    if (hit) topics[q.topicId].correct++
  })
  const score = Math.round((correct / s.questions.length) * 100)
  return {
    correct,
    omitted,
    wrong: s.questions.length - correct - omitted,
    topics,
    score,
    passed: passingScore === null ? null : score >= passingScore,
  }
}
export function settleExpired(
  progress: LearningProgress,
  now = Date.now(),
): LearningProgress {
  return {
    ...progress,
    sessions: progress.sessions.map((s) =>
      !s.finishedAt && s.endsAt <= now ? finishSession(s, now) : s,
    ),
  }
}

const BankSchema = z.object({
  ownerApprovedIds: z.array(z.string()).default([]),
  registration: RegistrationSchema.optional(),
  schemaVersion: z.literal(1),
  questions: z.array(QuestionSchema),
  topics: z.array(
    z.object({ id: z.string(), label: z.string(), moduleId: z.string() }),
  ),
  sources: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      url: z.string().url().nullable(),
    }),
  ),
  provisionalIds: z.array(z.string()),
  // Perfiles de convocatoria emitidos por build-study. Con default para que un
  // banco viejo en cache de la PWA siga cargando sin el campo.
  examProfiles: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        status: z.enum(['provisional', 'confirmed']),
        questionCount: z.number().int().positive().nullable(),
        durationMinutes: z.number().int().positive().nullable(),
        passingKnowledgeScore: z.number().int().min(0).max(100).nullable(),
        topicDistribution: z.array(
          z.object({ topicId: z.string(), weight: z.number().min(0).max(1) }),
        ),
        notes: z.string(),
      }),
    )
    .default([]),
})
export type StudyBank = z.infer<typeof BankSchema>
export async function loadStudyBank(): Promise<StudyBank> {
  const response = await fetch('/data/study-bank.json')
  if (!response.ok) throw Error('No se pudieron cargar las preguntas.')
  return BankSchema.parse(await response.json())
}
