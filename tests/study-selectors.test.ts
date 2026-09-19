import { describe, expect, it } from 'vitest'
import rawBank from '../public/data/study-bank.json'
import { QuestionSchema, type Question } from '../src/domain/dataset/contracts'
import { emptyProgress, type Session, type StudyBank } from '../src/domain/learning'
import {
  activeSessions,
  BEHAVIORAL_TOPIC,
  blockLabel,
  filterStudyQuestions,
  finishedSessions,
  isOutOfScope,
  passingScoreOf,
  questionAt,
  questionsInScope,
  questionsOfBlock,
  sessionTitle,
  studyStats,
  topicLabel,
  weightedTopics,
} from '../src/domain/study-selectors'

const reales = rawBank.questions.map((q) => QuestionSchema.parse(q))

// Preguntas sinteticas: los casos borde necesitan control exacto del tema y del
// enunciado, que el banco real no ofrece.
const pregunta = (over: Partial<Question> & { id: string }): Question =>
  QuestionSchema.parse({ ...reales[0], ...over })

const q1 = pregunta({ id: 'X1', moduleId: 'comun', topicId: 'gestion_documental', stem: 'La Ley 594 regula el archivo.' })
const q2 = pregunta({ id: 'X2', moduleId: 'comun', topicId: 'contratacion_estatal', stem: 'El pliego de condiciones define reglas.' })
const q3 = pregunta({ id: 'X3', moduleId: 'tecnico', topicId: 'datos_y_analitica', stem: 'Un índice acelera la consulta.' })
const qComportamental = pregunta({ id: 'X4', moduleId: 'comun', topicId: BEHAVIORAL_TOPIC, stem: 'Ante un conflicto, actúa con integridad.' })

const banco = (over: Partial<StudyBank> = {}): StudyBank => ({
  schemaVersion: 1,
  ownerApprovedIds: [],
  provisionalIds: [],
  sources: [],
  questions: [q1, q2, q3, qComportamental],
  topics: [
    { id: 'gestion_documental', label: 'Gestión documental', moduleId: 'comun' },
    { id: 'contratacion_estatal', label: 'Contratación estatal', moduleId: 'comun' },
  ],
  examProfiles: [
    {
      id: 'P-CON-CORTE', title: 'Con corte', status: 'provisional',
      questionCount: null, durationMinutes: null, passingKnowledgeScore: 65,
      topicDistribution: [
        { topicId: 'gestion_documental', weight: 0.6 },
        { topicId: 'contratacion_estatal', weight: 0 },
      ],
      notes: '',
    },
    {
      id: 'P-SIN-CORTE', title: 'Sin corte', status: 'provisional',
      questionCount: null, durationMinutes: null, passingKnowledgeScore: null,
      topicDistribution: [], notes: '',
    },
  ],
  ...over,
})

const sesion = (over: Partial<Session> & { id: string }): Session =>
  ({
    id: over.id, block: over.block ?? 'comun', profileId: over.profileId ?? null,
    startedAt: 1000, endsAt: 2000, index: 0, questions: [], answers: {},
    finishedAt: over.finishedAt ?? null, score: null,
  }) as unknown as Session

const filtroBase = {
  bank: banco(), studyOrder: null, block: 'comun' as const, topic: '', search: '',
  onlySaved: false, reviewIds: null, scope: 'todo' as const,
  marks: {} as ReturnType<typeof emptyProgress>['marks'],
  examTopics: new Set(['gestion_documental']),
}

describe('sesiones', () => {
  it('separa abiertas de cerradas por finishedAt', () => {
    const p = { ...emptyProgress(), sessions: [sesion({ id: 'a' }), sesion({ id: 'b', finishedAt: 3000 })] }
    expect(activeSessions(p).map((s) => s.id)).toEqual(['a'])
    expect(finishedSessions(p).map((s) => s.id)).toEqual(['b'])
  })
  it('devuelve listas vacías cuando no hay sesiones', () => {
    expect(activeSessions(emptyProgress())).toEqual([])
    expect(finishedSessions(emptyProgress())).toEqual([])
  })
})

describe('preguntas por bloque', () => {
  it('filtra por moduleId', () => {
    expect(questionsOfBlock(banco(), 'comun').map((q) => q.id)).toEqual(['X1', 'X2', 'X4'])
    expect(questionsOfBlock(banco(), 'tecnico').map((q) => q.id)).toEqual(['X3'])
  })
  it('sin banco devuelve vacío en vez de fallar', () => {
    expect(questionsOfBlock(null, 'comun')).toEqual([])
  })
})

describe('alcance de la convocatoria', () => {
  it('toma solo los temas con peso mayor que cero', () => {
    const conPeso = weightedTopics(banco().examProfiles[0])
    expect([...conPeso]).toEqual(['gestion_documental'])
    expect(conPeso.has('contratacion_estatal')).toBe(false)
  })
  it('sin perfil el alcance está vacío', () => {
    expect(weightedTopics(null).size).toBe(0)
    expect(weightedTopics(banco().examProfiles[1]).size).toBe(0)
  })
  it('las preguntas en alcance son las de esos temas', () => {
    expect(questionsInScope(banco(), new Set(['gestion_documental'])).map((q) => q.id)).toEqual(['X1'])
    expect(questionsInScope(null, new Set(['gestion_documental']))).toEqual([])
  })
  it('las comportamentales NO quedan fuera de alcance: son otra prueba', () => {
    const alcance = new Set(['gestion_documental'])
    expect(isOutOfScope(q1, alcance)).toBe(false)
    expect(isOutOfScope(q2, alcance)).toBe(true)
    expect(isOutOfScope(qComportamental, alcance)).toBe(false)
  })
})

describe('corte aprobatorio y etiquetas', () => {
  it('toma el corte del perfil con el que se creó la sesión', () => {
    expect(passingScoreOf(banco(), sesion({ id: 'a', profileId: 'P-CON-CORTE' }))).toBe(65)
  })
  it('devuelve null cuando el perfil no afirma corte, no existe, o no hay banco', () => {
    expect(passingScoreOf(banco(), sesion({ id: 'a', profileId: 'P-SIN-CORTE' }))).toBeNull()
    expect(passingScoreOf(banco(), sesion({ id: 'a', profileId: 'INEXISTENTE' }))).toBeNull()
    expect(passingScoreOf(banco(), sesion({ id: 'a', profileId: null }))).toBeNull()
    expect(passingScoreOf(null, sesion({ id: 'a', profileId: 'P-CON-CORTE' }))).toBeNull()
  })
  it('etiqueta el tema y recurre a "Tema" cuando no lo conoce', () => {
    expect(topicLabel(banco(), 'gestion_documental')).toBe('Gestión documental')
    expect(topicLabel(banco(), 'inexistente')).toBe('Tema')
    expect(topicLabel(null, 'gestion_documental')).toBe('Tema')
  })
  it('nombra los bloques y distingue la prueba del simulacro heredado', () => {
    expect(blockLabel(null)).toBe('Conocimientos')
    expect(blockLabel('comun')).toBe('General')
    expect(blockLabel('tecnico')).toBe('Sistemas')
    expect(sessionTitle(sesion({ id: 'a', profileId: '126-2026' }))).toBe('Prueba de Conocimientos')
    expect(sessionTitle(sesion({ id: 'b', profileId: null, block: 'tecnico' }))).toBe('Simulacro de Sistemas')
  })
})

describe('estadísticas del estudio', () => {
  it('cuenta intentos, aciertos y guardadas', () => {
    const p = {
      ...emptyProgress(),
      attempts: [{ correct: true }, { correct: false }, { correct: true }],
      marks: { X1: { saved: true }, X2: { saved: false } },
    } as unknown as ReturnType<typeof emptyProgress>
    expect(studyStats(p)).toEqual({ total: 3, hits: 2, saved: 1 })
  })
  it('un progreso vacío da ceros, no NaN', () => {
    expect(studyStats(emptyProgress())).toEqual({ total: 0, hits: 0, saved: 0 })
  })
})

describe('posición en la lista', () => {
  it('acota el índice al último elemento cuando se pasa del final', () => {
    expect(questionAt([q1, q2], 0)?.id).toBe('X1')
    expect(questionAt([q1, q2], 1)?.id).toBe('X2')
    expect(questionAt([q1, q2], 99)?.id).toBe('X2')
  })
  it('una lista vacía no tiene pregunta', () => {
    expect(questionAt([], 0)).toBeUndefined()
    expect(questionAt([], 99)).toBeUndefined()
  })
  // Contrato real: solo se acota el limite superior. Un indice negativo no se
  // corrige y devuelve undefined. Hoy es inalcanzable porque `studyIndex` nace en
  // 0, pero queda fijado para que cambiarlo sea una decision y no un descuido.
  it('un índice negativo no se corrige: devuelve undefined', () => {
    expect(questionAt([q1, q2], -1)).toBeUndefined()
  })
})

describe('filtro de estudio', () => {
  it('sin filtros devuelve el bloque completo menos las comportamentales', () => {
    expect(filterStudyQuestions(filtroBase).map((q) => q.id)).toEqual(['X1', 'X2'])
  })
  it('busca en el enunciado sin distinguir mayúsculas', () => {
    expect(filterStudyQuestions({ ...filtroBase, search: 'LEY 594' }).map((q) => q.id)).toEqual(['X1'])
    expect(filterStudyQuestions({ ...filtroBase, search: 'pliego' }).map((q) => q.id)).toEqual(['X2'])
    expect(filterStudyQuestions({ ...filtroBase, search: 'no existe' })).toEqual([])
  })
  it('filtra por tema', () => {
    expect(filterStudyQuestions({ ...filtroBase, topic: 'contratacion_estatal' }).map((q) => q.id)).toEqual(['X2'])
  })
  it('filtra por guardadas usando las marcas', () => {
    const marks = { X2: { saved: true } } as unknown as typeof filtroBase.marks
    expect(filterStudyQuestions({ ...filtroBase, onlySaved: true, marks }).map((q) => q.id)).toEqual(['X2'])
    expect(filterStudyQuestions({ ...filtroBase, onlySaved: true }).map((q) => q.id)).toEqual([])
  })
  it('respeta una cola de repaso explícita', () => {
    expect(filterStudyQuestions({ ...filtroBase, reviewIds: ['X2'] }).map((q) => q.id)).toEqual(['X2'])
    expect(filterStudyQuestions({ ...filtroBase, reviewIds: [] })).toEqual([])
  })
  it('el alcance "convocatoria" deja solo los temas con peso', () => {
    expect(filterStudyQuestions({ ...filtroBase, scope: 'convocatoria' }).map((q) => q.id)).toEqual(['X1'])
  })
  it('el alcance "comportamentales" deja solo esas y excluye el resto', () => {
    expect(filterStudyQuestions({ ...filtroBase, scope: 'comportamentales' }).map((q) => q.id)).toEqual(['X4'])
  })
})

// Los selectores deben coincidir con el banco publicado, no solo con fixtures.
// Estas cifras estan documentadas en dataset/reports/coverage.md.
describe('coherencia con el banco real', () => {
  const real = rawBank as unknown as StudyBank
  it('la convocatoria 126-2026 tiene siete temas con peso y 133 preguntas en alcance', () => {
    const perfil = real.examProfiles.find((p) => p.id === '126-2026')!
    const temas = weightedTopics(perfil)
    expect(temas.size).toBe(7)
    expect(questionsInScope(real, temas)).toHaveLength(133)
    expect(perfil.passingKnowledgeScore).toBe(65)
  })
  it('121-2026 y 127-2026 no tienen temas con peso ni preguntas elegibles', () => {
    for (const id of ['121-2026', '127-2026']) {
      const perfil = real.examProfiles.find((p) => p.id === id)!
      const temas = weightedTopics(perfil)
      expect(temas.size).toBe(0)
      expect(questionsInScope(real, temas)).toHaveLength(0)
    }
  })
  it('los dos bloques suman las 200 preguntas del banco', () => {
    expect(questionsOfBlock(real, 'comun')).toHaveLength(100)
    expect(questionsOfBlock(real, 'tecnico')).toHaveLength(100)
  })
})
