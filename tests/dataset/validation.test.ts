import { describe, expect, it } from 'vitest'
import { validateDatasetDocuments } from '../../scripts/dataset/core.js'
import { validDocuments } from './fixtures.js'

async function messages(documents: ReturnType<typeof validDocuments>): Promise<string> {
  const result = await validateDatasetDocuments(documents, { checkFiles: false })
  return result.issues.map((issue) => `${issue.location}: ${issue.message}`).join('\n')
}

describe('validaciones relacionales', () => {
  it('acepta un dataset consistente', async () => {
    expect(await messages(validDocuments())).toBe('')
  })

  it.each(['sources', 'sourceUnits', 'examProfiles', 'questions', 'inventory'] as const)('detecta identificadores duplicados en %s', async (collection) => {
    const documents = validDocuments()
    const records = documents[collection] as unknown[]
    records.push(structuredClone(records[0]))
    expect(await messages(documents)).toContain('Identificador duplicado')
  })

  it.each(['modules', 'topics'] as const)('detecta identificadores duplicados en taxonomy.%s', async (collection) => {
    const documents = validDocuments()
    const records = (documents.taxonomy as Record<string, unknown[]>)[collection]
    records.push(structuredClone(records[0]))
    expect(await messages(documents)).toContain('Identificador duplicado')
  })

  it('detecta fuentes inexistentes', async () => {
    const documents = validDocuments()
    const questions = documents.questions as Array<{ references: Array<{ sourceId: string }> }>
    questions[0].references[0].sourceId = 'missing-source'
    expect(await messages(documents)).toContain('fuente inexistente')
  })

  it('detecta referencias a temas y convocatorias inexistentes', async () => {
    const documents = validDocuments()
    const questions = documents.questions as Array<{ topicId: string; targetCallIds: string[] }>
    questions[0].topicId = 'missing-topic'
    questions[0].targetCallIds = ['missing-call']
    const result = await messages(documents)
    expect(result).toContain('tema inexistente')
    expect(result).toContain('convocatoria inexistente')
  })

  it('impide publicar sin fuente A o B verificada y vigente', async () => {
    const documents = validDocuments()
    const sources = documents.sources as Array<{ authorityTier: string }>
    sources[0].authorityTier = 'N/A'
    expect(await messages(documents)).toContain('fuente A o B verificada y vigente')
  })

  it('impide publicar sin una unidad oficial verificada', async () => {
    const missingUnit = validDocuments()
    const questions = missingUnit.questions as Array<{ references: Array<{ sourceUnitId: string | null }> }>
    questions[0].references[0].sourceUnitId = null
    expect(await messages(missingUnit)).toContain('unidad verificada')

    const pendingUnit = validDocuments()
    const units = pendingUnit.sourceUnits as Array<{ verificationStatus: string }>
    units[0].verificationStatus = 'pending_review'
    expect(await messages(pendingUnit)).toContain('unidad verificada')
  })

  it('impide verificar una unidad si su fuente no está verificada y vigente', async () => {
    const documents = validDocuments()
    const sources = documents.sources as Array<{ validity: string }>
    sources[0].validity = 'unknown'
    expect(await messages(documents)).toContain('unidad verificada requiere una fuente verificada y vigente')
  })

  it('detecta diferencias frente al inventario', async () => {
    const documents = validDocuments()
    const sources = documents.sources as Array<{ contentHash: string }>
    sources[0].contentHash = 'b'.repeat(64)
    expect(await messages(documents)).toContain('source-inventory.json')
  })
})
