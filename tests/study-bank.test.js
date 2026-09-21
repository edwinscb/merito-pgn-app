import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildStudyBank } from '../scripts/dataset/build-study.mjs'
const read = (p) =>
  JSON.parse(readFileSync(new URL('../' + p, import.meta.url), 'utf8'))
// El pipeline real descubre los archivos de preguntas con readdir. Enumerarlos a
// mano aqui hacia que esta prueba ignorara cualquier archivo nuevo y las
// autorizaciones de esas preguntas quedaran huerfanas.
const questionsDir = new URL('../dataset/content/questions/', import.meta.url)
const allQuestions = readdirSync(questionsDir)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .flatMap((f) => JSON.parse(readFileSync(new URL(f, questionsDir), 'utf8')))
const args = [
  read('public/data/question-bank.json'),
  allQuestions,
  read('dataset/content/study-authorization.json'),
  read('dataset/content/taxonomy.json'),
  read('dataset/content/sources.json'),
  read('dataset/content/registration.json'),
  read('dataset/content/owner-approval.json'),
  read('dataset/content/exam-profiles.json'),
]
describe('habilitación de estudio ligada al contenido', () => {
  it('publica 240, distingue 18/222, excluye siete semillas y es determinista', () => {
    const bank = buildStudyBank(...args)
    expect(bank.questions).toHaveLength(240)
    expect(bank.ownerApprovedIds).toHaveLength(240)
    expect(bank.provisionalIds).toHaveLength(222)
    expect(bank.questions.filter((q) => q.moduleId === 'comun')).toHaveLength(
      120,
    )
    expect(bank.questions.filter((q) => q.moduleId === 'tecnico')).toHaveLength(
      120,
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
