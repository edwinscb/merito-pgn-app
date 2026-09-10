import { z } from 'zod'
import { BlockSchema, shuffled } from './learning.js'
import type { Question } from './dataset/contracts.js'

export const STUDY_KEY = 'merito-pgn-study:v1'
const OrderSchema = z.object({
  schemaVersion: z.literal(1),
  sequenceId: z.string().min(1),
  block: BlockSchema,
  order: z.array(z.object({ id: z.string(), options: z.array(z.enum(['A', 'B', 'C', 'D'])).length(4) })),
  index: z.number().int().nonnegative(),
  search: z.string(), topic: z.string(), onlySaved: z.boolean(),
  reviewIds: z.array(z.string()).nullable(),
})
export type StudyOrder = z.infer<typeof OrderSchema>
export function newStudyOrder(questions: Question[], block: StudyOrder['block'], random = Math.random): StudyOrder {
  return { schemaVersion: 1, sequenceId: crypto.randomUUID(), block, index: 0, search: '', topic: '', onlySaved: false, reviewIds: null,
    order: shuffled(questions.filter(q => q.moduleId === block), random).map(q => ({ id: q.id, options: shuffled(q.options.map(o => o.id), random) })) }
}
export function restoreStudyOrder(raw: string | null, questions: Question[]): StudyOrder | null {
  try {
    const saved = OrderSchema.parse(JSON.parse(raw ?? 'null'))
    const ids = questions.filter(q => q.moduleId === saved.block).map(q => q.id)
    if (saved.order.length !== ids.length || new Set(saved.order.map(q => q.id)).size !== ids.length ||
      saved.order.some(q => !ids.includes(q.id) || new Set(q.options).size !== 4) ||
      saved.index >= Math.max(1, ids.length)) return null
    return saved
  } catch { return null }
}
export function orderedQuestions(saved: StudyOrder, questions: Question[]): Question[] {
  const byId = new Map(questions.map(q => [q.id, q]))
  return saved.order.flatMap(entry => {
    const question = byId.get(entry.id)
    return question ? [{ ...question, options: entry.options.map(id => question.options.find(o => o.id === id)!) }] : []
  })
}
