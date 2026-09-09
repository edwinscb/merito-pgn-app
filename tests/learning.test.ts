import { describe, expect, it } from 'vitest'
import rawBank from '../public/data/study-bank.json'
import { QuestionSchema } from '../src/domain/dataset/contracts.js'
import {
  createSession,
  emptyProgress,
  exportLearning,
  finishSession,
  importLearning,
  mergeProgress,
  PracticeProfileSchema,
  scoreSession,
  SessionSchema,
  settleExpired,
  shuffled,
} from '../src/domain/learning.js'

const questions = rawBank.questions.map((q) => QuestionSchema.parse(q))
describe('dos simuladores de práctica', () => {
  it.each(['comun', 'tecnico'] as const)(
    'separa %s, toma 20 sin repetir y conserva identidades',
    (block) => {
      const s = createSession(questions, block, 20, 30, 1000)
      expect(s.questions).toHaveLength(20)
      expect(new Set(s.questions.map((q) => q.id)).size).toBe(20)
      expect(s.questions.every((q) => q.moduleId === block)).toBe(true)
      expect(s.endsAt).toBe(1801000)
      for (const q of s.questions) {
        const original = questions.find((item) => item.id === q.id)!
        expect(q.options.find((o) => o.id === q.correctOptionId)).toEqual(
          original.options.find((o) => o.id === original.correctOptionId),
        )
        s.answers[q.id].selected = q.correctOptionId
      }
      expect(scoreSession(s).correct).toBe(20)
    },
  )
  it('baraja una copia, no modifica la entrada', () => {
    const input = [1, 2, 3, 4]
    expect(shuffled(input, () => 0)).toEqual([2, 3, 4, 1])
    expect(input).toEqual([1, 2, 3, 4])
  })
  it('califica aciertos, errores, omitidas y temas', () => {
    const s = createSession(questions, 'comun', 3)
    s.answers[s.questions[0].id].selected = s.questions[0].correctOptionId
    s.answers[s.questions[1].id].selected = s.questions[1].options.find(
      (o) => o.id !== s.questions[1].correctOptionId,
    )!.id
    expect(scoreSession(s)).toMatchObject({ correct: 1, wrong: 1, omitted: 1 })
    expect(
      Object.values(scoreSession(s).topics).reduce((n, t) => n + t.total, 0),
    ).toBe(3)
  })
  it('recupera respuestas, orden y marcas; vence aunque la aplicación esté cerrada', () => {
    const s = createSession(questions, 'tecnico', 2, 1, 1000)
    s.index = 1
    s.answers[s.questions[0].id] = { selected: 'B', flagged: true, seconds: 4 }
    const imported = importLearning(
      JSON.stringify(exportLearning({ ...emptyProgress(), sessions: [s] })),
    )
    expect(imported.sessions[0]).toEqual(s)
    expect(settleExpired(imported, 60999).sessions[0].finishedAt).toBeNull()
    expect(settleExpired(imported, 62000).sessions[0].finishedAt).toBe(61000)
    expect(finishSession(finishSession(s, 30000), 50000).finishedAt).toBe(30000)
  })
  it('rechaza parámetros y sesiones inconsistentes', () => {
    expect(
      PracticeProfileSchema.safeParse({
        block: 'convocatoria',
        count: 20,
        minutes: 30,
      }).success,
    ).toBe(false)
    expect(() => createSession(questions, 'comun', 0)).toThrow()
    expect(() => createSession(questions, 'comun', 2.5)).toThrow()
    const s = createSession(questions, 'comun', 2)
    expect(SessionSchema.safeParse({ ...s, index: 2 }).success).toBe(false)
    expect(
      SessionSchema.safeParse({
        ...s,
        questions: [s.questions[0], s.questions[0]],
      }).success,
    ).toBe(false)
    expect(SessionSchema.safeParse({ ...s, answers: {} }).success).toBe(false)
  })
  it('importa v1, exporta v2 con marcas y confianza opcional; combina sin duplicar', () => {
    const attempt = {
      questionId: 'q1',
      attemptedAt: '2026-09-07T12:00:00.000Z',
      selectedOptionId: 'A',
      correct: true,
      confidence: 3,
      responseTimeSeconds: 4,
      mode: 'practice',
      examId: null,
    }
    const p = importLearning(
      JSON.stringify({
        schemaVersion: 1,
        exportedAt: '2026-09-07T12:00:00.000Z',
        appVersion: '0.1.0',
        attempts: [attempt],
      }),
    )
    p.attempts[0].confidence = null
    p.marks.q1 = {
      saved: true,
      reviewed: true,
      problem: true,
      note: 'Revisar',
      updatedAt: 10,
    }
    expect(importLearning(JSON.stringify(exportLearning(p)))).toEqual(p)
    expect(mergeProgress(p, p)).toEqual(p)
    expect(() => importLearning('{}')).toThrow()
    expect(() => importLearning('not json')).toThrow()
  })
})
