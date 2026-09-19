import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildStudyBank } from '../scripts/dataset/build-study.mjs'
const read = (p) =>
  JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'))
const args = [
  read('public/data/question-bank.json'),
  [...read('dataset/content/questions/expansion-draft.json'), ...read('dataset/content/questions/study-200.json')],
  read('dataset/content/study-authorization.json'),
  read('dataset/content/taxonomy.json'),
  read('dataset/content/sources.json'),
  read('dataset/content/registration.json'),
  read('dataset/content/owner-approval.json'),
  read('dataset/content/exam-profiles.json'),
]
describe('habilitación de estudio ligada al contenido', () => {
  it('publica 200, distingue 18/182, excluye siete semillas y es determinista', () => {
    const bank = buildStudyBank(...args)
    expect(bank.questions).toHaveLength(200)
    expect(bank.ownerApprovedIds).toHaveLength(200)
    expect(bank.provisionalIds).toHaveLength(182)
    expect(bank.questions.filter((q) => q.moduleId === 'comun')).toHaveLength(
      100,
    )
    expect(bank.questions.filter((q) => q.moduleId === 'tecnico')).toHaveLength(
      100,
    )
    expect(
      bank.questions.filter((q) => q.status === 'validated_assisted'),
    ).toHaveLength(18)
    for (const n of [6, 10, 21, 22, 23, 24, 25])
      expect(
        bank.questions.some(
          (q) => q.id === `PGN-SEED-${String(n).padStart(4, '0')}`,
        ),
      ).toBe(false)
    expect(bank).toEqual(buildStudyBank(...args))
    expect(bank).toEqual(read('public/data/study-bank.json'))
  })
  it('rechaza autorizaciones duplicadas, desactualizadas y preguntas retiradas', () => {
    const approval = structuredClone(args)
    approval[6].questions[0].contentHash = '0'.repeat(64)
    expect(() => buildStudyBank(...approval)).toThrow(/Aprobación desactualizada/)
    const duplicate = structuredClone(args)
    duplicate[2].questions.push(duplicate[2].questions[0])
    expect(() => buildStudyBank(...duplicate)).toThrow(/duplicada/)
    const stale = structuredClone(args)
    stale[1][0].explanation += ' cambiado'
    expect(() => buildStudyBank(...stale)).toThrow(/desactualizada/)
    const retired = structuredClone(args)
    retired[1][0].status = 'retired'
    expect(() => buildStudyBank(...retired)).toThrow(/no habilitable/)
  })
})
