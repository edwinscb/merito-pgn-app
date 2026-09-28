import { describe, expect, it } from 'vitest'
import rawBank from '../public/data/study-bank.json'
import {
  QuestionSchema,
  type Attempt,
  type Question,
} from '../src/domain/dataset/contracts'
import {
  emptyProgress,
  type LearningProgress,
  type Session,
  type StudyBank,
} from '../src/domain/learning'
import {
  MIN_TOPIC_ANSWERS,
  studyFirst,
  topicMastery,
  type TopicMastery,
} from '../src/domain/study-selectors'

const base = QuestionSchema.parse(rawBank.questions[0])
const pregunta = (id: string, topicId: string): Question =>
  QuestionSchema.parse({ ...base, id, topicId, correctOptionId: 'A' })

const doc = pregunta('D1', 'gestion_documental')
const doc2 = pregunta('D2', 'gestion_documental')
const con = pregunta('C1', 'contratacion_estatal')
const fuera = pregunta('F1', 'datos_y_analitica')

const banco: StudyBank = {
  schemaVersion: 1,
  ownerApprovedIds: [],
  provisionalIds: [],
  sources: [],
  questions: [doc, doc2, con, fuera],
  topics: [
    { id: 'gestion_documental', label: 'Gestión documental', moduleId: 'comun' },
    { id: 'contratacion_estatal', label: 'Contratación estatal', moduleId: 'comun' },
    { id: 'datos_y_analitica', label: 'Datos y analítica', moduleId: 'tecnico' },
  ],
  examProfiles: [],
} as unknown as StudyBank
const temas = new Set(['gestion_documental', 'contratacion_estatal'])

const intento = (questionId: string, correct: boolean): Attempt => ({
  questionId,
  attemptedAt: '2026-09-20T12:00:00.000Z',
  selectedOptionId: correct ? 'A' : 'B',
  correct,
  confidence: null,
  responseTimeSeconds: 3,
  mode: 'practice',
  examId: null,
})
const simulacro = (
  id: string,
  selected: Record<string, 'A' | 'B' | null>,
  finishedAt: number | null,
): Session =>
  ({
    id,
    block: null,
    profileId: '126-2026',
    questions: [doc, doc2, con].filter((q) => q.id in selected),
    startedAt: 1000,
    endsAt: 2000,
    finishedAt,
    index: 0,
    answers: Object.fromEntries(
      Object.entries(selected).map(([q, s]) => [
        q,
        { selected: s, flagged: false, seconds: 1 },
      ]),
    ),
  }) as Session
const progreso = (over: Partial<LearningProgress>): LearningProgress => ({
  ...emptyProgress(),
  ...over,
})
const de = (m: TopicMastery[], id: string) => m.find((t) => t.topicId === id)

describe('topicMastery', () => {
  it('suma los intentos del estudio y las respuestas de simulacros terminados', () => {
    const m = topicMastery(
      banco,
      progreso({
        attempts: [intento('D1', true), intento('D2', false)],
        sessions: [simulacro('S1', { D1: 'A', C1: 'A' }, 1500)],
      }),
      temas,
    )
    expect(de(m, 'gestion_documental')).toMatchObject({ answered: 3, hits: 2 })
    expect(de(m, 'contratacion_estatal')).toMatchObject({ answered: 1, hits: 1 })
  })
  it('no cuenta un simulacro sin terminar', () => {
    const m = topicMastery(
      banco,
      progreso({ sessions: [simulacro('S1', { D1: 'A' }, null)] }),
      temas,
    )
    expect(de(m, 'gestion_documental')).toMatchObject({ answered: 0, hits: 0 })
  })
  it('cuenta como fallo la pregunta omitida en un simulacro', () => {
    const m = topicMastery(
      banco,
      progreso({ sessions: [simulacro('S1', { D1: null, D2: 'A' }, 1500)] }),
      temas,
    )
    expect(de(m, 'gestion_documental')).toMatchObject({ answered: 2, hits: 1 })
  })
  it('ignora temas fuera de la prueba e intentos de preguntas que ya no están', () => {
    const m = topicMastery(
      banco,
      progreso({ attempts: [intento('F1', true), intento('BORRADA', true)] }),
      temas,
    )
    expect(m.map((t) => t.topicId)).toEqual([
      'gestion_documental',
      'contratacion_estatal',
    ])
    expect(m.every((t) => t.answered === 0)).toBe(true)
  })
  it('sin banco devuelve una lista vacía', () => {
    expect(topicMastery(null, emptyProgress(), temas)).toEqual([])
  })
})

const tema = (label: string, answered: number, hits: number): TopicMastery => ({
  topicId: label,
  label,
  answered,
  hits,
})

describe('studyFirst', () => {
  it(`exige ${MIN_TOPIC_ANSWERS} respuestas para juzgar el acierto de un tema`, () => {
    const justo = tema('Justo', MIN_TOPIC_ANSWERS, 0)
    const corto = tema('Corto', MIN_TOPIC_ANSWERS - 1, 0)
    expect(studyFirst([justo, corto])).toEqual([justo])
  })
  it('pone primero los temas sin practicar', () => {
    const debil = tema('Débil', 5, 1)
    const nuevo = tema('Nuevo', 0, 0)
    expect(studyFirst([debil, nuevo])).toEqual([nuevo, debil])
  })
  it('elige los tres de menor acierto y desempata por nombre', () => {
    const lista = [
      tema('Delta', 10, 9),
      tema('Beta', 5, 1),
      tema('Alfa', 10, 2),
      tema('Gamma', 5, 4),
      tema('Épsilon', 5, 3),
    ]
    expect(studyFirst(lista).map((t) => t.label)).toEqual([
      'Alfa',
      'Beta',
      'Épsilon',
    ])
  })
})
