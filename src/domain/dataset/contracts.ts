import { z } from 'zod'

const idSchema = z.string().trim().min(1).regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/)
const dateSchema = z.string().date()
const dateTimeSchema = z.string().datetime({ offset: true })
const nonEmptyTextSchema = z.string().trim().min(1)

export const AuthorityTierSchema = z.enum(['A', 'B', 'C', 'D', 'N/A'])
export const SourceStatusSchema = z.enum([
  'copied_pending_review',
  'pending_download',
  'reference',
  'seed_unapproved',
  'verified',
  'needs_review',
  'retired'
])
export const SourceValiditySchema = z.enum(['unknown', 'effective', 'superseded'])
export const QuestionStatusSchema = z.enum([
  'draft_ai',
  'validated_assisted',
  'needs_review',
  'rejected',
  'retired'
])

export const SourceSchema = z.object({
  id: idSchema,
  title: nonEmptyTextSchema,
  category: nonEmptyTextSchema,
  publisher: nonEmptyTextSchema.nullable(),
  authorityTier: AuthorityTierSchema,
  url: z.string().url().nullable(),
  sourcePath: nonEmptyTextSchema.nullable(),
  localPath: nonEmptyTextSchema.nullable(),
  mimeType: nonEmptyTextSchema.nullable(),
  contentHash: z.string().regex(/^[a-f0-9]{64}$/).nullable(),
  incorporatedAt: dateSchema,
  publishedAt: dateSchema.nullable(),
  version: nonEmptyTextSchema.nullable(),
  validity: SourceValiditySchema,
  status: SourceStatusSchema,
  redistribution: z.enum(['prohibited', 'internal_only', 'to_verify']),
  public: z.literal(false),
  notes: nonEmptyTextSchema
}).superRefine((source, context) => {
  if (source.status === 'pending_download') {
    if (!source.url) {
      context.addIssue({ code: 'custom', path: ['url'], message: 'Una fuente pending_download requiere URL.' })
    }
    for (const field of ['localPath', 'mimeType', 'contentHash'] as const) {
      if (source[field] !== null) {
        context.addIssue({ code: 'custom', path: [field], message: `Una fuente pending_download debe tener ${field} en null.` })
      }
    }
  } else {
    if (!source.localPath) {
      context.addIssue({ code: 'custom', path: ['localPath'], message: 'Una fuente local requiere localPath.' })
    }
    if (!source.contentHash) {
      context.addIssue({ code: 'custom', path: ['contentHash'], message: 'Una fuente local requiere contentHash.' })
    }
  }
})

export const SourceUnitSchema = z.object({
  id: idSchema,
  sourceId: idSchema,
  locator: nonEmptyTextSchema,
  title: nonEmptyTextSchema,
  content: nonEmptyTextSchema,
  verificationStatus: z.enum(['pending_review', 'verified', 'retired']),
  sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
  topicIds: z.array(idSchema),
  targetCallIds: z.array(idSchema)
})

export const QuestionOptionSchema = z.object({
  id: z.enum(['A', 'B', 'C', 'D']),
  text: nonEmptyTextSchema,
  rationale: nonEmptyTextSchema.nullable()
})

export const QuestionReferenceSchema = z.object({
  sourceId: idSchema,
  sourceUnitId: idSchema.nullable(),
  locator: nonEmptyTextSchema,
  supports: z.enum(['provenance', 'correct_answer', 'distractor', 'context'])
})

export const ReviewPassSchema = z.object({
  id: idSchema,
  kind: z.enum(['factual', 'editorial']),
  method: z.literal('ai_assisted'),
  reviewerId: nonEmptyTextSchema,
  model: nonEmptyTextSchema.nullable(),
  reviewedAt: dateTimeSchema,
  outcome: z.enum(['pass', 'needs_changes', 'fail']),
  notes: nonEmptyTextSchema
})

export const QuestionSchema = z.object({
  id: idSchema,
  status: QuestionStatusSchema,
  moduleId: idSchema,
  topicId: idSchema,
  secondaryTopicIds: z.array(idSchema),
  questionType: z.enum(['conceptual', 'application', 'technical_analysis', 'behavioral', 'interpretation']),
  difficulty: z.number().int().min(1).max(5),
  stem: nonEmptyTextSchema,
  options: z.array(QuestionOptionSchema).length(4),
  correctOptionId: z.enum(['A', 'B', 'C', 'D']),
  explanation: nonEmptyTextSchema,
  references: z.array(QuestionReferenceSchema).min(1),
  targetCallIds: z.array(idSchema),
  createdMethod: z.enum(['seed_import', 'manual', 'ai_draft']),
  reviews: z.array(ReviewPassSchema),
  validFrom: dateSchema.nullable(),
  tags: z.array(nonEmptyTextSchema)
}).superRefine((question, context) => {
  const reviewIds = question.reviews.map((review) => review.id)
  if (new Set(reviewIds).size !== reviewIds.length) {
    context.addIssue({ code: 'custom', path: ['reviews'], message: 'Los identificadores de revisión no pueden repetirse.' })
  }

  const optionIds = new Set(question.options.map((option) => option.id))
  if (optionIds.size !== question.options.length) {
    context.addIssue({ code: 'custom', path: ['options'], message: 'Los identificadores de opción no pueden repetirse.' })
  }

  const normalize = (value: string) => value.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es')
  const optionTexts = question.options.map((option) => normalize(option.text))
  if (new Set(optionTexts).size !== optionTexts.length) {
    context.addIssue({ code: 'custom', path: ['options'], message: 'Las opciones no pueden repetir el mismo texto.' })
  }

  if (!optionIds.has(question.correctOptionId)) {
    context.addIssue({ code: 'custom', path: ['correctOptionId'], message: 'La clave no corresponde a una opción existente.' })
  }

  if (question.status === 'validated_assisted') {
    const latestReview = (kind: 'factual' | 'editorial') => question.reviews
      .filter((review) => review.kind === kind)
      .sort((left, right) => Date.parse(right.reviewedAt) - Date.parse(left.reviewedAt))[0]
    const factualReview = latestReview('factual')
    const editorialReview = latestReview('editorial')
    if (!question.validFrom || factualReview?.outcome !== 'pass' || editorialReview?.outcome !== 'pass') {
      context.addIssue({ code: 'custom', path: ['status'], message: 'Una pregunta validated_assisted requiere vigencia y revisiones factual y editorial aprobadas.' })
    }
    if (factualReview && editorialReview && factualReview.reviewerId === editorialReview.reviewerId) {
      context.addIssue({ code: 'custom', path: ['reviews'], message: 'Las revisiones factual y editorial deben tener revisores independientes.' })
    }
    for (const latest of [factualReview, editorialReview]) {
      if (latest && question.reviews.filter((review) => review.kind === latest.kind
        && Date.parse(review.reviewedAt) === Date.parse(latest.reviewedAt)).length > 1) {
        context.addIssue({ code: 'custom', path: ['reviews'], message: 'La última revisión de cada tipo debe ser inequívoca: hay fechas repetidas.' })
      }
    }
    question.options.forEach((option, index) => {
      if (!option.rationale) {
        context.addIssue({ code: 'custom', path: ['options', index, 'rationale'], message: 'Una pregunta validated_assisted requiere explicación de cada opción.' })
      }
    })
  }
})

export const TaxonomyModuleSchema = z.object({
  id: idSchema,
  label: nonEmptyTextSchema
})

export const TaxonomyTopicSchema = z.object({
  id: idSchema,
  moduleId: idSchema,
  label: nonEmptyTextSchema,
  parentTopicId: idSchema.nullable()
})

export const TaxonomySchema = z.object({
  schemaVersion: z.literal(1),
  modules: z.array(TaxonomyModuleSchema),
  topics: z.array(TaxonomyTopicSchema)
})

export const ExamProfileSchema = z.object({
  id: idSchema,
  title: nonEmptyTextSchema,
  status: z.enum(['provisional', 'confirmed']),
  sourceIds: z.array(idSchema).min(1),
  questionCount: z.number().int().positive().nullable(),
  durationMinutes: z.number().int().positive().nullable(),
  // Corte aprobatorio de la prueba de Conocimientos sobre 100. La Tabla No. 1 del
  // articulo 18 lo fija por nivel de empleo, asi que no es una constante global.
  passingKnowledgeScore: z.number().int().min(0).max(100).nullable(),
  topicDistribution: z.array(z.object({
    topicId: idSchema,
    weight: z.number().min(0).max(1)
  })),
  notes: nonEmptyTextSchema
})

export const AttemptSchema = z.object({
  questionId: idSchema,
  attemptedAt: dateTimeSchema,
  selectedOptionId: z.enum(['A', 'B', 'C', 'D']),
  correct: z.boolean(),
  confidence: z.number().int().min(1).max(3).nullable(),
  responseTimeSeconds: z.number().nonnegative(),
  mode: z.enum(['practice', 'simulation']),
  examId: idSchema.nullable()
})

export const ProgressExportSchema = z.object({
  schemaVersion: z.literal(1),
  exportedAt: dateTimeSchema,
  appVersion: nonEmptyTextSchema,
  attempts: z.array(AttemptSchema)
})

export const SourcesFileSchema = z.array(SourceSchema)
export const SourceUnitsFileSchema = z.array(SourceUnitSchema)
export const QuestionsFileSchema = z.array(QuestionSchema)
export const ExamProfilesFileSchema = z.array(ExamProfileSchema)

export type AuthorityTier = z.infer<typeof AuthorityTierSchema>
export type Source = z.infer<typeof SourceSchema>
export type SourceUnit = z.infer<typeof SourceUnitSchema>
export type QuestionStatus = z.infer<typeof QuestionStatusSchema>
export type Question = z.infer<typeof QuestionSchema>
export type ReviewPass = z.infer<typeof ReviewPassSchema>
export type ExamProfile = z.infer<typeof ExamProfileSchema>
export type Attempt = z.infer<typeof AttemptSchema>
export type ProgressExport = z.infer<typeof ProgressExportSchema>
export type Taxonomy = z.infer<typeof TaxonomySchema>
