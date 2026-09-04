import {
  ExamProfileSchema,
  QuestionSchema,
  SourceSchema,
  type Question,
  type Source
} from '../../src/domain/dataset/contracts.js'
import type { DatasetDocuments } from '../../scripts/dataset/core.js'

export const validSource: Source = SourceSchema.parse({
  id: 'official-source',
  title: 'Fuente oficial',
  category: 'official-regulation',
  publisher: 'Entidad oficial',
  authorityTier: 'A',
  url: null,
  sourcePath: 'original/source.pdf',
  localPath: 'dataset/raw/source.pdf',
  mimeType: 'application/pdf',
  contentHash: 'a'.repeat(64),
  incorporatedAt: '2026-09-03',
  publishedAt: '2026-01-01',
  version: '1',
  validity: 'effective',
  status: 'verified',
  redistribution: 'internal_only',
  public: false,
  notes: 'Fixture oficial verificado.'
})

export const validQuestion: Question = QuestionSchema.parse({
  id: 'QUESTION-0001',
  status: 'validated_assisted',
  moduleId: 'comun',
  topicId: 'topic',
  secondaryTopicIds: [],
  questionType: 'conceptual',
  difficulty: 1,
  stem: '¿Cuál es la respuesta correcta?',
  options: [
    { id: 'A', text: 'Primera opción', rationale: 'No corresponde.' },
    { id: 'B', text: 'Segunda opción', rationale: 'Coincide con la fuente.' },
    { id: 'C', text: 'Tercera opción', rationale: 'No corresponde.' },
    { id: 'D', text: 'Cuarta opción', rationale: 'No corresponde.' }
  ],
  correctOptionId: 'B',
  explanation: 'La segunda opción está respaldada.',
  references: [{
    sourceId: 'official-source',
    sourceUnitId: null,
    locator: 'artículo 1',
    supports: 'correct_answer'
  }],
  targetCallIds: ['call-1'],
  createdMethod: 'manual',
  reviewedBy: 'revisión asistida',
  reviewedAt: '2026-09-03',
  validFrom: '2026-09-03',
  tags: []
})

export function validDocuments(): DatasetDocuments {
  const source = structuredClone(validSource)
  return {
    sources: [source],
    sourceUnits: [],
    taxonomy: {
      schemaVersion: 1,
      modules: [{ id: 'comun', label: 'Común' }],
      topics: [{ id: 'topic', moduleId: 'comun', label: 'Tema', parentTopicId: null }]
    },
    examProfiles: [ExamProfileSchema.parse({
      id: 'call-1',
      title: 'Convocatoria',
      status: 'confirmed',
      sourceIds: ['official-source'],
      questionCount: 1,
      durationMinutes: 1,
      topicDistribution: [{ topicId: 'topic', weight: 1 }],
      notes: 'Fixture.'
    })],
    questions: [structuredClone(validQuestion)],
    inventory: [{
      id: source.id,
      title: source.title,
      category: source.category,
      sourcePath: source.sourcePath,
      targetPath: source.localPath,
      mimeType: source.mimeType,
      status: source.status,
      notes: source.notes,
      sha256: source.contentHash,
      incorporatedAt: source.incorporatedAt,
      public: false
    }]
  }
}
