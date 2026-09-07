import { describe, expect, it } from 'vitest'
import { buildQuestionBank } from '../../scripts/dataset/build.js'
import { renderCoverageReport } from '../../scripts/dataset/coverage.js'
import { validateRepositoryDataset } from '../../scripts/dataset/core.js'

describe('pipeline con el dataset real', () => {
  it('conserva inventario, hashes y fuentes pendientes', async () => {
    const result = await validateRepositoryDataset()
    expect(result.issues).toEqual([])
    expect(result.data?.sources).toHaveLength(43)
    expect(result.data?.inventory).toHaveLength(43)
    expect(result.data?.sourceUnits).toHaveLength(8)
    expect(result.data?.sources.filter((source) => source.status === 'pending_download')).toHaveLength(9)
  })

  it('mantiene fuera del banco las semillas sin doble revisión independiente', async () => {
    const result = await validateRepositoryDataset()
    expect(result.data?.questions).toHaveLength(25)
    expect(result.data?.questions.filter((question) => question.status === 'validated_assisted')).toHaveLength(2)
    expect(result.data?.questions.filter((question) => question.status === 'needs_review')).toHaveLength(23)
    const pilotCorrections = result.data?.questions.filter((question) => ['PGN-SEED-0002', 'PGN-SEED-0003', 'PGN-SEED-0005'].includes(question.id)) ?? []
    expect(pilotCorrections.every((question) => question.status === 'needs_review')).toBe(true)
    expect(pilotCorrections.every((question) => question.targetCallIds.length === 0)).toBe(true)
    expect(pilotCorrections.every((question) => question.references.some((reference) => reference.sourceId !== 'pgn-initial-diagnostic'))).toBe(true)
    const first = buildQuestionBank(result.data?.questions ?? [])
    const second = buildQuestionBank(result.data?.questions ?? [])
    expect(first.schemaVersion).toBe(1)
    expect(first.questions.map((question) => question.id)).toEqual(['PGN-SEED-0001', 'PGN-SEED-0004'])
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })

  it('reporta ceros explícitos y cobertura por tema y convocatoria', async () => {
    const result = await validateRepositoryDataset()
    if (!result.data) throw new Error('El dataset de prueba debe ser válido.')
    const report = renderCoverageReport(result.data)
    expect(report).toContain('| validated_assisted | 2 |')
    expect(report).toContain('## Unidades por estado')
    expect(report).toContain('| pending_review | 3 |')
    expect(report).toContain('| C | 0 |')
    expect(report).toContain('| 121-2026 | 0 |')
    expect(report).toContain('| sin_convocatoria | 25 |')
    expect(report).toContain('derecho_disciplinario')
  })
})
