import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import type { Dataset } from './core.js'
import { formatIssues, projectRoot, validateRepositoryDataset } from './core.js'

const QUESTION_STATUSES = ['draft_ai', 'validated_assisted', 'needs_review', 'rejected', 'retired'] as const
const SOURCE_STATUSES = ['copied_pending_review', 'pending_download', 'reference', 'seed_unapproved', 'verified', 'needs_review', 'retired'] as const
const AUTHORITY_TIERS = ['A', 'B', 'C', 'D', 'N/A'] as const

function table(rows: Array<[string, number]>): string {
  return ['| Categoría | Cantidad |', '| --- | ---: |', ...rows.map(([label, count]) => `| ${label} | ${count} |`)].join('\n')
}

function countBy(values: string[], categories: readonly string[]): Array<[string, number]> {
  return categories.map((category) => [category, values.filter((value) => value === category).length])
}

export function renderCoverageReport(dataset: Dataset): string {
  const topicRows: Array<[string, number]> = dataset.taxonomy.topics.map((topic) => [
    `${topic.id} — ${topic.label}`,
    dataset.questions.filter((question) => question.topicId === topic.id).length
  ])
  const callRows: Array<[string, number]> = dataset.examProfiles.map((profile) => [
    profile.id,
    dataset.questions.filter((question) => question.targetCallIds.includes(profile.id)).length
  ])
  callRows.push(['sin_convocatoria', dataset.questions.filter((question) => question.targetCallIds.length === 0).length])

  return [
    '# Cobertura del dataset',
    '',
    `- Fuentes: **${dataset.sources.length}**`,
    `- Unidades verificables: **${dataset.sourceUnits.length}**`,
    `- Preguntas: **${dataset.questions.length}**`,
    `- Preguntas publicables: **${dataset.questions.filter((question) => question.status === 'validated_assisted').length}**`,
    '',
    '## Preguntas por estado',
    '',
    table(countBy(dataset.questions.map((question) => question.status), QUESTION_STATUSES)),
    '',
    '## Fuentes por estado',
    '',
    table(countBy(dataset.sources.map((source) => source.status), SOURCE_STATUSES)),
    '',
    '## Fuentes por nivel de autoridad',
    '',
    table(countBy(dataset.sources.map((source) => source.authorityTier), AUTHORITY_TIERS)),
    '',
    '## Preguntas por tema principal',
    '',
    table(topicRows),
    '',
    '## Preguntas por convocatoria',
    '',
    table(callRows),
    ''
  ].join('\n')
}

const isDirectRun = process.argv[1] && import.meta.url === new URL(`file:///${process.argv[1].replaceAll('\\', '/')}`).href

if (isDirectRun) {
  const result = await validateRepositoryDataset()
  if (!result.data || result.issues.length > 0) {
    console.error(`No se generó cobertura porque el dataset es inválido:\n${formatIssues(result.issues)}`)
    process.exitCode = 1
  } else {
    const report = renderCoverageReport(result.data)
    const outputDirectory = resolve(projectRoot, 'dataset/reports')
    await mkdir(outputDirectory, { recursive: true })
    await writeFile(resolve(outputDirectory, 'coverage.md'), report, 'utf8')
    console.log(report)
  }
}
