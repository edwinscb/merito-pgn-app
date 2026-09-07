import { z } from 'zod'
import { QuestionsFileSchema, type Question } from './dataset/contracts.js'

export const QuestionBankSchema = z.object({ schemaVersion: z.literal(1), questions: QuestionsFileSchema })
export async function loadQuestionBank(): Promise<Question[]> {
  const response = await fetch('/data/question-bank.json')
  if (!response.ok) throw new Error(`No se pudo cargar el banco (${response.status}).`)
  const parsed = QuestionBankSchema.safeParse(await response.json())
  if (!parsed.success) throw new Error('El banco público no cumple el contrato de preguntas.')
  return parsed.data.questions
}
