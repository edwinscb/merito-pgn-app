import { createHash } from 'node:crypto'
import { access, readFile, readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import {
  ExamProfilesFileSchema,
  QuestionsFileSchema,
  SourceUnitsFileSchema,
  SourcesFileSchema,
  TaxonomySchema,
  type ExamProfile,
  type Question,
  type Source,
  type SourceUnit,
  type Taxonomy
} from '../../src/domain/dataset/contracts.js'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

const InventoryEntrySchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  sourcePath: z.string().nullable(),
  targetPath: z.string().nullable(),
  mimeType: z.string().nullable(),
  status: z.string(),
  notes: z.string(),
  sha256: z.string().nullable(),
  incorporatedAt: z.string(),
  public: z.literal(false),
  url: z.string().optional()
})
const InventorySchema = z.array(InventoryEntrySchema)

export type InventoryEntry = z.infer<typeof InventoryEntrySchema>

export interface DatasetDocuments {
  sources: unknown
  sourceUnits: unknown
  taxonomy: unknown
  examProfiles: unknown
  questions: unknown
  inventory: unknown
}

export interface Dataset {
  sources: Source[]
  sourceUnits: SourceUnit[]
  taxonomy: Taxonomy
  examProfiles: ExamProfile[]
  questions: Question[]
  inventory: InventoryEntry[]
}

export interface ValidationIssue {
  location: string
  message: string
}

export interface ValidationResult {
  data?: Dataset
  issues: ValidationIssue[]
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8'))
}

export async function loadDatasetDocuments(root = projectRoot): Promise<DatasetDocuments> {
  const questionsDirectory = resolve(root, 'dataset/content/questions')
  const questionFiles = (await readdir(questionsDirectory))
    .filter((name) => name.endsWith('.json'))
    .sort((left, right) => left.localeCompare(right))
  const questionGroups = await Promise.all(
    questionFiles.map((name) => readJson(resolve(questionsDirectory, name)))
  )
  const questions = questionGroups.flatMap((group) => Array.isArray(group) ? group : [group])

  return {
    sources: await readJson(resolve(root, 'dataset/content/sources.json')),
    sourceUnits: await readJson(resolve(root, 'dataset/content/source-units.json')),
    taxonomy: await readJson(resolve(root, 'dataset/content/taxonomy.json')),
    examProfiles: await readJson(resolve(root, 'dataset/content/exam-profiles.json')),
    questions,
    inventory: await readJson(resolve(root, 'dataset/catalog/source-inventory.json'))
  }
}

function formatPath(prefix: string, path: PropertyKey[]): string {
  return path.length === 0 ? prefix : `${prefix}.${path.map(String).join('.')}`
}

function parsePart<T>(
  schema: z.ZodType<T>,
  value: unknown,
  location: string,
  issues: ValidationIssue[]
): T | undefined {
  const parsed = schema.safeParse(value)
  if (parsed.success) return parsed.data
  for (const issue of parsed.error.issues) {
    issues.push({ location: formatPath(location, issue.path), message: issue.message })
  }
  return undefined
}

function duplicateIssues<T extends { id: string }>(
  values: T[],
  location: string,
  issues: ValidationIssue[]
): void {
  const seen = new Set<string>()
  values.forEach((value, index) => {
    if (seen.has(value.id)) {
      issues.push({ location: `${location}.${index}.id`, message: `Identificador duplicado: ${value.id}` })
    }
    seen.add(value.id)
  })
}

function missingReference(
  ids: Set<string>,
  value: string,
  location: string,
  kind: string,
  issues: ValidationIssue[]
): void {
  if (!ids.has(value)) {
    issues.push({ location, message: `Referencia a ${kind} inexistente: ${value}` })
  }
}

async function validateLocalSources(
  sources: Source[],
  root: string,
  issues: ValidationIssue[]
): Promise<void> {
  await Promise.all(sources.map(async (source, index) => {
    if (!source.localPath || !source.contentHash) return
    const absolutePath = resolve(root, source.localPath)
    try {
      await access(absolutePath)
      const actualHash = createHash('sha256').update(await readFile(absolutePath)).digest('hex')
      if (actualHash !== source.contentHash) {
        issues.push({
          location: `sources.${index}.contentHash`,
          message: `El hash no coincide con el archivo local ${source.localPath}.`
        })
      }
    } catch {
      issues.push({
        location: `sources.${index}.localPath`,
        message: `No existe el archivo local ${source.localPath}.`
      })
    }
  }))
}

function validateInventoryParity(
  sources: Source[],
  inventory: InventoryEntry[],
  issues: ValidationIssue[]
): void {
  const sourcesById = new Map(sources.map((source) => [source.id, source]))
  const inventoryById = new Map(inventory.map((entry) => [entry.id, entry]))

  inventory.forEach((entry, index) => {
    const source = sourcesById.get(entry.id)
    if (!source) {
      issues.push({ location: `inventory.${index}.id`, message: `La fuente ${entry.id} no fue transformada.` })
      return
    }
    const comparisons: Array<[string, unknown, unknown]> = [
      ['title', source.title, entry.title],
      ['category', source.category, entry.category],
      ['sourcePath', source.sourcePath, entry.sourcePath],
      ['localPath', source.localPath, entry.targetPath],
      ['mimeType', source.mimeType, entry.mimeType],
      ['contentHash', source.contentHash, entry.sha256],
      ['incorporatedAt', source.incorporatedAt, entry.incorporatedAt],
      ['status', source.status, entry.status],
      ['public', source.public, entry.public],
      ['notes', source.notes, entry.notes],
      ['url', source.url, entry.url ?? null]
    ]
    for (const [field, actual, expected] of comparisons) {
      if (actual !== expected) {
        issues.push({
          location: `sources.${entry.id}.${field}`,
          message: `No coincide con source-inventory.json: esperado ${JSON.stringify(expected)}.`
        })
      }
    }
  })

  sources.forEach((source, index) => {
    if (!inventoryById.has(source.id)) {
      issues.push({ location: `sources.${index}.id`, message: `La fuente ${source.id} no existe en el inventario.` })
    }
  })
}

export async function validateDatasetDocuments(
  documents: DatasetDocuments,
  options: { root?: string; checkFiles?: boolean } = {}
): Promise<ValidationResult> {
  const issues: ValidationIssue[] = []
  const sources = parsePart(SourcesFileSchema, documents.sources, 'sources', issues)
  const sourceUnits = parsePart(SourceUnitsFileSchema, documents.sourceUnits, 'sourceUnits', issues)
  const taxonomy = parsePart(TaxonomySchema, documents.taxonomy, 'taxonomy', issues)
  const examProfiles = parsePart(ExamProfilesFileSchema, documents.examProfiles, 'examProfiles', issues)
  const questions = parsePart(QuestionsFileSchema, documents.questions, 'questions', issues)
  const inventory = parsePart(InventorySchema, documents.inventory, 'inventory', issues)

  if (!sources || !sourceUnits || !taxonomy || !examProfiles || !questions || !inventory) {
    return { issues }
  }

  duplicateIssues(sources, 'sources', issues)
  duplicateIssues(sourceUnits, 'sourceUnits', issues)
  duplicateIssues(taxonomy.modules, 'taxonomy.modules', issues)
  duplicateIssues(taxonomy.topics, 'taxonomy.topics', issues)
  duplicateIssues(examProfiles, 'examProfiles', issues)
  duplicateIssues(questions, 'questions', issues)
  duplicateIssues(inventory, 'inventory', issues)

  const sourceIds = new Set(sources.map((source) => source.id))
  const sourceUnitIds = new Set(sourceUnits.map((unit) => unit.id))
  const moduleIds = new Set(taxonomy.modules.map((module) => module.id))
  const topicIds = new Set(taxonomy.topics.map((topic) => topic.id))
  const callIds = new Set(examProfiles.map((profile) => profile.id))
  const sourcesById = new Map(sources.map((source) => [source.id, source]))
  const unitsById = new Map(sourceUnits.map((unit) => [unit.id, unit]))

  taxonomy.topics.forEach((topic, index) => {
    missingReference(moduleIds, topic.moduleId, `taxonomy.topics.${index}.moduleId`, 'módulo', issues)
    if (topic.parentTopicId) {
      missingReference(topicIds, topic.parentTopicId, `taxonomy.topics.${index}.parentTopicId`, 'tema padre', issues)
    }
  })

  sourceUnits.forEach((unit, index) => {
    missingReference(sourceIds, unit.sourceId, `sourceUnits.${index}.sourceId`, 'fuente', issues)
    unit.topicIds.forEach((topicId, topicIndex) =>
      missingReference(topicIds, topicId, `sourceUnits.${index}.topicIds.${topicIndex}`, 'tema', issues)
    )
    unit.targetCallIds.forEach((callId, callIndex) =>
      missingReference(callIds, callId, `sourceUnits.${index}.targetCallIds.${callIndex}`, 'convocatoria', issues)
    )
    const source = sourcesById.get(unit.sourceId)
    if (source?.contentHash && source.contentHash !== unit.sourceHash) {
      issues.push({ location: `sourceUnits.${index}.sourceHash`, message: 'El hash no coincide con la fuente referenciada.' })
    }
  })

  examProfiles.forEach((profile, index) => {
    profile.sourceIds.forEach((sourceId, sourceIndex) =>
      missingReference(sourceIds, sourceId, `examProfiles.${index}.sourceIds.${sourceIndex}`, 'fuente', issues)
    )
    profile.topicDistribution.forEach((item, topicIndex) =>
      missingReference(topicIds, item.topicId, `examProfiles.${index}.topicDistribution.${topicIndex}.topicId`, 'tema', issues)
    )
  })

  questions.forEach((question, index) => {
    missingReference(moduleIds, question.moduleId, `questions.${index}.moduleId`, 'módulo', issues)
    missingReference(topicIds, question.topicId, `questions.${index}.topicId`, 'tema', issues)
    question.secondaryTopicIds.forEach((topicId, topicIndex) =>
      missingReference(topicIds, topicId, `questions.${index}.secondaryTopicIds.${topicIndex}`, 'tema', issues)
    )
    question.targetCallIds.forEach((callId, callIndex) =>
      missingReference(callIds, callId, `questions.${index}.targetCallIds.${callIndex}`, 'convocatoria', issues)
    )

    const topic = taxonomy.topics.find((candidate) => candidate.id === question.topicId)
    if (topic && topic.moduleId !== question.moduleId) {
      issues.push({ location: `questions.${index}.moduleId`, message: 'El tema principal no pertenece al módulo indicado.' })
    }

    question.references.forEach((reference, referenceIndex) => {
      missingReference(sourceIds, reference.sourceId, `questions.${index}.references.${referenceIndex}.sourceId`, 'fuente', issues)
      if (reference.sourceUnitId) {
        missingReference(sourceUnitIds, reference.sourceUnitId, `questions.${index}.references.${referenceIndex}.sourceUnitId`, 'unidad', issues)
        const unit = unitsById.get(reference.sourceUnitId)
        if (unit && unit.sourceId !== reference.sourceId) {
          issues.push({ location: `questions.${index}.references.${referenceIndex}.sourceUnitId`, message: 'La unidad no pertenece a la fuente indicada.' })
        }
      }
    })

    if (question.status === 'validated_assisted') {
      const hasPublishableSource = question.references.some((reference) => {
        const source = sourcesById.get(reference.sourceId)
        return reference.supports === 'correct_answer'
          && (source?.authorityTier === 'A' || source?.authorityTier === 'B')
          && source.status === 'verified'
          && source.validity === 'effective'
      })
      if (!hasPublishableSource) {
        issues.push({
          location: `questions.${index}.references`,
          message: 'Una pregunta validated_assisted requiere respaldo de respuesta correcta en una fuente A o B verificada y vigente.'
        })
      }
    }
  })

  validateInventoryParity(sources, inventory, issues)
  if (options.checkFiles !== false) {
    await validateLocalSources(sources, options.root ?? projectRoot, issues)
  }

  return {
    data: { sources, sourceUnits, taxonomy, examProfiles, questions, inventory },
    issues
  }
}

export async function validateRepositoryDataset(root = projectRoot): Promise<ValidationResult> {
  return validateDatasetDocuments(await loadDatasetDocuments(root), { root, checkFiles: true })
}

export function formatIssues(issues: ValidationIssue[]): string {
  return issues.map((issue) => `- ${issue.location}: ${issue.message}`).join('\n')
}
