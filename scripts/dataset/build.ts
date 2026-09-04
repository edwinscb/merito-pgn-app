import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Question } from '../../src/domain/dataset/contracts.js'
import { formatIssues, projectRoot, validateRepositoryDataset } from './core.js'

export interface QuestionBank {
  schemaVersion: 1
  questions: Question[]
}

export function buildQuestionBank(questions: Question[]): QuestionBank {
  return {
    schemaVersion: 1,
    questions: questions
      .filter((question) => question.status === 'validated_assisted')
      .sort((left, right) => left.id.localeCompare(right.id))
  }
}

const isDirectRun = process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll('\\', '/')}`).href

if (isDirectRun) {
  const result = await validateRepositoryDataset()
  if (!result.data || result.issues.length > 0) {
    console.error(`No se generó el banco porque el dataset es inválido:\n${formatIssues(result.issues)}`)
    process.exitCode = 1
  } else {
    const outputDirectory = resolve(projectRoot, 'public/data')
    const outputPath = resolve(outputDirectory, 'question-bank.json')
    const bank = buildQuestionBank(result.data.questions)
    await mkdir(outputDirectory, { recursive: true })
    await writeFile(outputPath, `${JSON.stringify(bank, null, 2)}\n`, 'utf8')
    console.log(`Banco generado: ${bank.questions.length} preguntas publicables.`)
  }
}
