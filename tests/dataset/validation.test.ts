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

  it('detecta identificadores duplicados', async () => {
    const documents = validDocuments()
    const questions = documents.questions as unknown[]
    questions.push(structuredClone(questions[0]))
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

  it('detecta diferencias frente al inventario', async () => {
    const documents = validDocuments()
    const sources = documents.sources as Array<{ contentHash: string }>
    sources[0].contentHash = 'b'.repeat(64)
    expect(await messages(documents)).toContain('source-inventory.json')
  })
})
