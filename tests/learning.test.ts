import { describe, expect, it } from 'vitest'
import rawBank from '../public/data/study-bank.json'
import { QuestionSchema } from '../src/domain/dataset/contracts.js'
import {
  createExamSession,
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
  it('importa v1, exporta v3 con marcas y confianza opcional; combina sin duplicar', () => {
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

const profile126 = rawBank.examProfiles.find((p) => p.id === '126-2026')!
const enAlcance = new Set(
  profile126.topicDistribution
    .filter((t) => t.weight > 0)
    .map((t) => t.topicId),
)
const fueraDeAlcance = [
  'datos_y_analitica',
  'derecho_disciplinario',
  'contratacion_estatal',
  'competencias_comportamentales',
]

describe('prueba de Conocimientos de la convocatoria 126-2026', () => {
  it('arma la sesion solo con los temas en alcance del perfil', () => {
    const s = createExamSession(questions, profile126, 40, 90, 1000)
    expect(s.questions).toHaveLength(40)
    expect(s.profileId).toBe('126-2026')
    expect(s.block).toBeNull()
    expect(s.endsAt).toBe(5401000)
    expect(new Set(s.questions.map((q) => q.id)).size).toBe(40)
    expect(s.questions.every((q) => enAlcance.has(q.topicId))).toBe(true)
    for (const tema of fueraDeAlcance)
      expect(s.questions.some((q) => q.topicId === tema)).toBe(false)
  })
  it('mezcla nucleo general y especifico, y el schema lo acepta', () => {
    const s = createExamSession(questions, profile126, 30, 60, 1000)
    expect(new Set(s.questions.map((q) => q.moduleId))).toEqual(
      new Set(['comun', 'tecnico']),
    )
    expect(SessionSchema.safeParse(s).success).toBe(true)
    // Con perfil y bloque a la vez la sesion es ambigua.
    expect(SessionSchema.safeParse({ ...s, block: 'comun' }).success).toBe(false)
    // Sin perfil vuelve a ser practica y el bloque unico se exige otra vez.
    expect(
      SessionSchema.safeParse({ ...s, block: 'comun', profileId: null }).success,
    ).toBe(false)
    expect(SessionSchema.safeParse({ ...s, block: null }).success).toBe(true)
  })
  it('rellena con los demas temas cuando uno no alcanza y no falla', () => {
    // El escenario es la ESCASEZ, no un tema concreto: antes valia usar
    // sistemas_operativos porque estaba vacio, pero ya tiene preguntas. Se pide
    // mas de lo que existe en los temas del perfil para provocarla igual.
    const temas = ['sistemas_operativos', 'gestion_documental']
    const disponibles = questions.filter((q) => temas.includes(q.topicId))
    const s = createExamSession(
      questions,
      {
        id: 'hueco',
        topicDistribution: [
          { topicId: temas[0], weight: 0.5 },
          { topicId: temas[1], weight: 0.5 },
        ],
      },
      disponibles.length + 10,
      30,
      1000,
    )
    // Entrega lo que hay en vez de lanzar, y nunca inventa preguntas de fuera.
    expect(s.questions).toHaveLength(disponibles.length)
    expect(s.questions.every((q) => temas.includes(q.topicId))).toBe(true)
  })
  it('califica sobre 100 y aplica el corte del perfil: 65 aprueba, 64 no', () => {
    const aprueba = createExamSession(questions, profile126, 20, 30, 1000)
    aprueba.questions.slice(0, 13).forEach((q) => {
      aprueba.answers[q.id].selected = q.correctOptionId
    })
    expect(scoreSession(aprueba, 65)).toMatchObject({
      correct: 13,
      wrong: 0,
      omitted: 7,
      score: 65,
      passed: true,
    })
    const reprueba = createExamSession(questions, profile126, 25, 30, 1000)
    reprueba.questions.slice(0, 16).forEach((q) => {
      reprueba.answers[q.id].selected = q.correctOptionId
    })
    expect(scoreSession(reprueba, 65)).toMatchObject({
      correct: 16,
      score: 64,
      passed: false,
    })
    // Sin corte no hay veredicto.
    expect(scoreSession(reprueba).passed).toBeNull()
    expect(scoreSession(reprueba).score).toBe(64)
  })
  it('migra un progreso v2 a v3 sin perder sesiones ni marcas', () => {
    const heredada = createSession(questions, 'tecnico', 4, 15, 1000)
    const marcada = heredada.questions[0].id
    heredada.answers[marcada] = { selected: 'B', flagged: true, seconds: 7 }
    const sinPerfil = { ...heredada } as Record<string, unknown>
    // Un export v2 real no conoce profileId.
    delete sinPerfil.profileId
    const v2 = {
      schemaVersion: 2,
      exportedAt: '2026-09-07T12:00:00.000Z',
      appVersion: '0.2.0',
      attempts: [
        {
          questionId: marcada,
          attemptedAt: '2026-09-07T12:00:00.000Z',
          selectedOptionId: 'B',
          correct: false,
          confidence: 2,
          responseTimeSeconds: 7,
          mode: 'practice',
          examId: null,
        },
      ],
      marks: {
        [marcada]: {
          saved: true,
          reviewed: false,
          problem: true,
          note: 'Repasar',
          updatedAt: 10,
        },
      },
      sessions: [sinPerfil],
    }
    const migrado = importLearning(JSON.stringify(v2))
    expect(migrado.sessions).toHaveLength(1)
    expect(migrado.sessions[0].profileId).toBeNull()
    expect(migrado.sessions[0].block).toBe('tecnico')
    expect(migrado.sessions[0].questions).toHaveLength(4)
    expect(migrado.sessions[0].answers[marcada]).toEqual({
      selected: 'B',
      flagged: true,
      seconds: 7,
    })
    expect(migrado.marks[marcada].note).toBe('Repasar')
    expect(migrado.attempts).toHaveLength(1)
    expect(exportLearning(migrado).schemaVersion).toBe(3)
    expect(importLearning(JSON.stringify(exportLearning(migrado)))).toEqual(
      migrado,
    )
  })
})

