import { describe, expect, it } from 'vitest'
import { createProgressExport, parseProgressExport } from '../src/domain/progress/store.js'
const attempt = { questionId: 'q1', attemptedAt: '2026-09-07T12:00:00.000Z', selectedOptionId: 'A' as const, correct: true, confidence: 3, responseTimeSeconds: 4, mode: 'practice' as const, examId: null }
describe('progress export', () => {
  it('crea y valida una exportación versionada', () => expect(parseProgressExport(JSON.stringify(createProgressExport([attempt]))).attempts).toHaveLength(1))
  it('rechaza contratos inválidos', () => { expect(() => parseProgressExport(JSON.stringify({ schemaVersion: 1, attempts: [] }))).toThrow(/Exportación inválida/); expect(() => parseProgressExport('no-json')).toThrow(/JSON válido/) })
})
