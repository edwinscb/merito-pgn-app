import { describe, expect, it } from 'vitest'
import { buildQuestionBank } from '../../scripts/dataset/build.js'
import { renderCoverageReport } from '../../scripts/dataset/coverage.js'
import { validateRepositoryDataset } from '../../scripts/dataset/core.js'

describe('pipeline con el dataset real', () => {
  it('conserva inventario, hashes y fuentes pendientes', async () => {
    const result = await validateRepositoryDataset()
    expect(result.issues).toEqual([])
    expect(result.data?.sources).toHaveLength(22)
    expect(result.data?.inventory).toHaveLength(22)
    expect(result.data?.sources.filter((source) => source.status === 'pending_download')).toHaveLength(11)
  })

  it('mantiene las 25 semillas fuera del banco público', async () => {
    const result = await validateRepositoryDataset()
    expect(result.data?.questions).toHaveLength(25)
    expect(result.data?.questions.every((question) => question.status === 'needs_review')).toBe(true)
    const first = buildQuestionBank(result.data?.questions ?? [])
    const second = buildQuestionBank(result.data?.questions ?? [])
    expect(first).toEqual({ schemaVersion: 1, questions: [] })
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })

  it('reporta ceros explícitos y cobertura por tema y convocatoria', async () => {
    const result = await validateRepositoryDataset()
    if (!result.data) throw new Error('El dataset de prueba debe ser válido.')
    const report = renderCoverageReport(result.data)
    expect(report).toContain('| validated_assisted | 0 |')
    expect(report).toContain('| C | 0 |')
    expect(report).toContain('| 121-2026 | 0 |')
    expect(report).toContain('| sin_convocatoria | 25 |')
    expect(report).toContain('derecho_disciplinario')
  })
})
