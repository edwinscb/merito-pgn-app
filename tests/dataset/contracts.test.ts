import { describe, expect, it } from 'vitest'
import {
  AttemptSchema,
  ExamProfileSchema,
  ProgressExportSchema,
  QuestionSchema,
  SourceSchema,
  SourceUnitSchema
} from '../../src/domain/dataset/contracts.js'
import { validDocuments, validQuestion, validSource } from './fixtures.js'

describe('contratos Zod del dataset', () => {
  it('acepta ejemplos válidos de los seis contratos', () => {
    expect(SourceSchema.safeParse(validSource).success).toBe(true)
    expect(SourceUnitSchema.safeParse({
      id: 'unit-1',
      sourceId: validSource.id,
      locator: 'artículo 1',
      title: 'Unidad',
      content: 'Contenido verificable.',
      verificationStatus: 'verified',
      sourceHash: validSource.contentHash,
      topicIds: ['topic'],
      targetCallIds: ['call-1']
    }).success).toBe(true)
    expect(QuestionSchema.safeParse(validQuestion).success).toBe(true)
    expect(ExamProfileSchema.safeParse((validDocuments().examProfiles as unknown[])[0]).success).toBe(true)

    const attempt = {
      questionId: validQuestion.id,
      attemptedAt: '2026-09-03T20:00:00-05:00',
      selectedOptionId: 'B',
      correct: true,
      confidence: 3,
      responseTimeSeconds: 20,
      mode: 'practice',
      examId: null
    }
    expect(AttemptSchema.safeParse(attempt).success).toBe(true)
    expect(ProgressExportSchema.safeParse({
      schemaVersion: 1,
      exportedAt: '2026-09-03T20:30:00-05:00',
      appVersion: '0.1.0',
      attempts: [attempt]
    }).success).toBe(true)
  })

  it('rechaza una fuente local sin hash y una pendiente que simula copia local', () => {
    expect(SourceSchema.safeParse({ ...validSource, contentHash: null }).success).toBe(false)
    expect(SourceSchema.safeParse({
      ...validSource,
      status: 'pending_download',
      url: 'https://example.com/source.pdf'
    }).success).toBe(false)
  })

  it('rechaza estados de pregunta no definidos', () => {
    expect(QuestionSchema.safeParse({ ...validQuestion, status: 'approved' }).success).toBe(false)
  })

  it('rechaza preguntas sin cuatro opciones, con opciones repetidas o clave inexistente', () => {
    expect(QuestionSchema.safeParse({
      ...validQuestion,
      options: validQuestion.options.slice(0, 3)
    }).success).toBe(false)

    const repeatedText = structuredClone(validQuestion)
    repeatedText.options[3].text = '  SEGUNDA   OPCIÓN '
    expect(QuestionSchema.safeParse(repeatedText).success).toBe(false)

    const missingKey = structuredClone(validQuestion)
    missingKey.options[3].id = 'C'
    missingKey.correctOptionId = 'D'
    const result = QuestionSchema.safeParse(missingKey)
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message).join(' ')).toContain('clave')
    }
  })

  it('rechaza localizadores vacíos y contratos de progreso inválidos', () => {
    const question = structuredClone(validQuestion)
    question.references[0].locator = '   '
    expect(QuestionSchema.safeParse(question).success).toBe(false)
    expect(AttemptSchema.safeParse({
      questionId: 'QUESTION-0001',
      attemptedAt: 'fecha inválida',
      selectedOptionId: 'A',
      correct: false,
      confidence: 4,
      responseTimeSeconds: -1,
      mode: 'practice',
      examId: null
    }).success).toBe(false)
    expect(ProgressExportSchema.safeParse({
      schemaVersion: 2,
      exportedAt: '2026-09-03T20:30:00-05:00',
      appVersion: '',
      attempts: []
    }).success).toBe(false)
  })
})
