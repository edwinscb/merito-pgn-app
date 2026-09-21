import { describe, expect, it } from 'vitest'
import { newStudyOrder, orderedQuestions, restoreStudyOrder } from '../src/domain/study-order'
import { QuestionSchema } from '../src/domain/dataset/contracts'
import raw from '../public/data/study-bank.json'
const questions = raw.questions.map(q => QuestionSchema.parse(q))
describe('orden estable de estudio', () => {
  it('baraja preguntas y opciones sin perder identidades ni duplicar', () => {
    const order = newStudyOrder(questions, 'comun', () => 0)
    const result = orderedQuestions(order, questions)
    const delBloque = questions.filter(q => q.moduleId === 'comun')
    // El invariante es no perder ni duplicar identidades, no el tamaño del
    // bloque: se deriva del banco para que ampliarlo no rompa esta prueba.
    expect(new Set(result.map(q => q.id)).size).toBe(delBloque.length)
    expect(result.map(q => q.id).sort()).toEqual(delBloque.map(q => q.id).sort())
    for (const q of result) {
      const original = questions.find(o => o.id === q.id)!
      expect(q.options.map(o => o.id).sort()).toEqual(['A', 'B', 'C', 'D'])
      expect(q.options.find(o => o.id === q.correctOptionId)?.text).toBe(original.options.find(o => o.id === original.correctOptionId)?.text)
    }
    expect(result[0].id).not.toBe(questions.find(q => q.moduleId === 'comun')!.id)
    const saved = { ...order, index: 8, search: 'ley', topic: '', onlySaved: true }
    expect(restoreStudyOrder(JSON.stringify(saved), questions)).toEqual(saved)
  })
  it('rechaza secuencias corruptas, duplicadas o de un banco anterior', () => {
    const order = newStudyOrder(questions, 'tecnico')
    expect(restoreStudyOrder('malformed', questions)).toBeNull()
    expect(restoreStudyOrder(JSON.stringify(order), questions.slice(0, 5))).toBeNull()
    order.order[1] = order.order[0]
    expect(restoreStudyOrder(JSON.stringify(order), questions)).toBeNull()
  })
})
