import { describe, expect, it } from 'vitest'
import { buildQuestionBank } from '../../scripts/dataset/build.js'
import { renderCoverageReport } from '../../scripts/dataset/coverage.js'
import { validateRepositoryDataset } from '../../scripts/dataset/core.js'

describe('pipeline con el dataset real', () => {
  it('conserva inventario, hashes y fuentes pendientes', async () => {
    const result = await validateRepositoryDataset()
    expect(result.issues).toEqual([])
    expect(result.data?.sources).toHaveLength(48)
    expect(result.data?.inventory).toHaveLength(48)
    expect(result.data?.sourceUnits).toHaveLength(31)
    expect(result.data?.sources.filter((source) => source.status === 'pending_download')).toHaveLength(9)
  })

  it('mantiene fuera del banco las semillas con hallazgos pendientes', async () => {
    const result = await validateRepositoryDataset()
    expect(result.data?.questions).toHaveLength(25)
    expect(result.data?.questions.filter((question) => question.status === 'validated_assisted')).toHaveLength(18)
    expect(result.data?.questions.filter((question) => question.status === 'needs_review')).toHaveLength(7)
    const pilotCorrections = result.data?.questions.filter((question) => ['PGN-SEED-0006', 'PGN-SEED-0010', 'PGN-SEED-0021', 'PGN-SEED-0022', 'PGN-SEED-0023', 'PGN-SEED-0024', 'PGN-SEED-0025'].includes(question.id)) ?? []
    expect(pilotCorrections.every((question) => question.status === 'needs_review')).toBe(true)
    expect(pilotCorrections.every((question) => question.targetCallIds.includes('121-2026'))).toBe(true)
    expect(pilotCorrections.every((question) => question.references.some((reference) => reference.sourceId !== 'pgn-initial-diagnostic'))).toBe(true)
    const first = buildQuestionBank(result.data?.questions ?? [])
    const second = buildQuestionBank(result.data?.questions ?? [])
    expect(first.schemaVersion).toBe(1)
    expect(first.questions.map((question) => question.id)).toEqual([
      'PGN-SEED-0001', 'PGN-SEED-0002', 'PGN-SEED-0003', 'PGN-SEED-0004',
      'PGN-SEED-0005', 'PGN-SEED-0007', 'PGN-SEED-0008', 'PGN-SEED-0009',
      'PGN-SEED-0011', 'PGN-SEED-0012', 'PGN-SEED-0013', 'PGN-SEED-0014',
      'PGN-SEED-0015', 'PGN-SEED-0016', 'PGN-SEED-0017', 'PGN-SEED-0018',
      'PGN-SEED-0019', 'PGN-SEED-0020'
    ])
    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })

  it('reporta ceros explícitos y cobertura por tema y convocatoria', async () => {
    const result = await validateRepositoryDataset()
    if (!result.data) throw new Error('El dataset de prueba debe ser válido.')
    const report = renderCoverageReport(result.data)
    expect(report).toContain('| validated_assisted | 18 |')
    expect(report).toContain('## Unidades por estado')
    expect(report).toContain('| pending_review | 9 |')
    expect(report).toContain('| C | 0 |')
    expect(report).toContain('| 121-2026 | 22 |')
    expect(report).toContain('| sin_convocatoria | 1 |')
    expect(report).toContain('derecho_disciplinario')
  })
})
