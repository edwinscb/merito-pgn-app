import { useRef, useState } from 'react'
import type { Question } from './domain/dataset/contracts'
import {
  exportLearning,
  finishSession,
  importLearning,
  mergeProgress,
  profiles,
  scoreSession,
  settleExpired,
  type Block,
  type LearningProgress,
  type Mark,
  type Session,
  type StudyBank,
} from './domain/learning'
import './styles.css'
import { RegistrationCard } from './RegistrationCard'
import { SetupView } from './views/SetupView'
import { newStudyOrder, orderedQuestions, type StudyOrder } from './domain/study-order'
import {
  activeSessions,
  filterStudyQuestions,
  isOutOfScope,
  passingScoreOf,
  questionAt,
  questionsInScope,
  questionsOfBlock,
  topicLabel,
  weightedTopics,
} from './domain/study-selectors'
import { useClock } from './hooks/useClock'
import { useExpiredSessions } from './hooks/useExpiredSessions'
import { useExamRun } from './hooks/useExamRun'
import { useFocusOnViewChange } from './hooks/useFocusOnViewChange'
import { useLearningProgress } from './hooks/useLearningProgress'
import { useStudySession } from './hooks/useStudySession'
import { useTheme } from './hooks/useTheme'

const clock = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
const blockLabel = (block: Block | null) =>
  block === null ? 'Conocimientos' : block === 'comun' ? 'General' : 'Sistemas'
// Una sesion con perfil es la prueba de la convocatoria; sin perfil es historial
// heredado de los simulacros por bloque.
const sessionTitle = (s: Session) =>
  s.profileId ? 'Prueba de Conocimientos' : `Simulacro de ${blockLabel(s.block)}`
const EXAM_PROFILE_ID = '126-2026'
const BEHAVIORAL_TOPIC = 'competencias_comportamentales'
const blankMark = (): Mark => ({
  saved: false,
  reviewed: false,
  problem: false,
  note: '',
  updatedAt: Date.now(),
})
function Badge({ question, bank }: { question: Question; bank: StudyBank }) {
  const current = bank.questions.find(q => q.id === question.id)
  const content = (q: Question) => JSON.stringify([q.stem, [...q.options].sort((a, b) => a.id.localeCompare(b.id)), q.correctOptionId, q.explanation, q.references])
  const approved = bank.ownerApprovedIds.includes(question.id) && current && content(current) === content(question)
  return (
    <span
      className={`badge ${approved || question.status === 'validated_assisted' ? 'reviewed' : 'provisional'}`}
    >
      {approved ? 'Aprobada por el propietario' : question.status === 'validated_assisted' ? 'Revisada' : 'Provisional'}
    </span>
  )
}
function Explanation({
  question,
  bank,
}: {
  question: Question
  bank: StudyBank
}) {
  return (
    <section className="explanation" aria-label="Explicación">
      <h3>
        Respuesta:{' '}
        {question.options.find((o) => o.id === question.correctOptionId)?.text}
      </h3>
      <p>{question.explanation}</p>
      <details>
        <summary>Por qué las otras opciones no corresponden</summary>
        <ul>
          {question.options
            .filter((o) => o.id !== question.correctOptionId)
            .map((o) => (
              <li key={o.id}>
                <strong>{o.text}</strong>
                <p>{o.rationale}</p>
              </li>
            ))}
        </ul>
      </details>
      <details>
        <summary>Consultar fuentes</summary>
        <ul>
          {question.references
            .filter((r) => r.supports === 'correct_answer')
            .map((r, i) => {
              const source = bank.sources.find((s) => s.id === r.sourceId)
              return (
                <li key={i}>
                  {source?.url ? (
                    <a href={source.url} target="_blank" rel="noreferrer">
                      {source.title}
                    </a>
                  ) : (
                    (source?.title ?? 'Fuente de respaldo')
                  )}
                  <p>{r.locator}</p>
                </li>
              )
            })}
        </ul>
      </details>
    </section>
  )
}
function StudyQuestion({
  question,
  bank,
  mark,
  outOfScope,
  onMark,
  onAnswer,
}: {
  question: Question
  bank: StudyBank
  mark: Mark
  outOfScope: boolean
  onMark: (m: Mark) => void
  onAnswer: (
    option: 'A' | 'B' | 'C' | 'D',
    confidence: number | null,
    seconds: number,
  ) => void
}) {
  const [selected, setSelected] = useState<'A' | 'B' | 'C' | 'D' | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const [reporting, setReporting] = useState(mark.problem)
  const started = useRef(Date.now())
  const update = (patch: Partial<Mark>) =>
    onMark({ ...mark, ...patch, updatedAt: Date.now() })
  return (
    <article className="question-card">
      <div className="question-meta">
        <Badge question={question} bank={bank} />
        <span>{bank.topics.find((t) => t.id === question.topicId)?.label}</span>
        {outOfScope && (
          <span className="badge provisional">Fuera de tu convocatoria</span>
        )}
      </div>
      <h2 className="question-title">{question.stem}</h2>
      <div className="options">
        {question.options.map((o, i) => (
          <button
            key={o.id}
            aria-pressed={selected === o.id}
            disabled={revealed}
            className={`option ${selected === o.id ? 'selected' : ''} ${revealed && o.id === question.correctOptionId ? 'correct' : ''}`}
            onClick={() => setSelected(o.id)}
          >
            <span className="option-letter">{'ABCD'[i]}</span> {o.text}
          </button>
        ))}
      </div>
      {!revealed && (
        <>
          <details className="optional">
            <summary>Confianza en mi respuesta (opcional)</summary>
            <div className="button-row">
              {[1, 2, 3].map((n) => (
                <button
                  className="chip"
                  key={n}
                  aria-pressed={confidence === n}
                  onClick={() => setConfidence(confidence === n ? null : n)}
                >
                  {['Baja', 'Media', 'Alta'][n - 1]}
                </button>
              ))}
            </div>
          </details>
          <div className="button-row">
            <button
              className="primary"
              disabled={!selected}
              onClick={() => {
                if (selected) {
                  onAnswer(
                    selected,
                    confidence,
                    Math.round((Date.now() - started.current) / 1000),
                  )
                  setRevealed(true)
                }
              }}
            >
              Comprobar
            </button>
            <button className="text-button" onClick={() => setRevealed(true)}>
              Ver explicación
            </button>
          </div>
        </>
      )}
      {revealed && <Explanation question={question} bank={bank} />}
      <div className="personal-actions">
        <button
          className="chip"
          aria-pressed={mark.saved}
          onClick={() => update({ saved: !mark.saved })}
        >
          {mark.saved ? 'Guardada para repasar' : 'Guardar para repasar'}
        </button>
        <button
          className="chip"
          aria-pressed={mark.reviewed}
          onClick={() => update({ reviewed: !mark.reviewed })}
        >
          {mark.reviewed ? 'Revisada por mí ✓' : 'Marcar revisada por mí'}
        </button>
        <button
          className="text-button"
          onClick={() => setReporting(!reporting)}
        >
          Reportar problema
        </button>
      </div>
      {reporting && (
        <div className="report">
          <label>
            Nota personal (opcional)
            <textarea
              maxLength={2000}
              value={mark.note}
              onChange={(e) => update({ note: e.target.value })}
            />
          </label>
          <button
            className="secondary"
            onClick={() => update({ problem: !mark.problem })}
          >
            {mark.problem ? 'Quitar marca de problema' : 'Marcar problema'}
          </button>
          <small>
            La marca queda en tu dispositivo y se incluye al exportar el
            progreso.
          </small>
        </div>
      )}
    </article>
  )
}

export default function App() {
  const [theme, setTheme] = useTheme()
  const { progress, progressRef, temporary, commit } = useLearningProgress()
  const [view, setView] = useState<
    'home' | 'questions' | 'progress' | 'setup' | 'exam' | 'results'
  >('home')
  // Un solo banner de error, compartido por el fallo de carga del banco y por el
  // de importacion del progreso. Por eso vive aqui y no dentro de un hook.
  const [error, setError] = useState('')
  const {
    bank,
    block, setBlock,
    search, setSearch,
    topic, setTopic,
    onlySaved, setOnlySaved,
    scope, setScope,
    reviewIds, setReviewIds,
    studyIndex, setStudyIndex,
    studyOrder, setStudyOrder,
    studyTemporary,
  } = useStudySession(view, {
    onRestored: () => setView('questions'),
    onLoadError: setError,
  })
  const [now, setNow] = useClock()
  const lastVisit = useRef(Date.now())
  const mainRef = useFocusOnViewChange(view)
  useExpiredSessions(now, progressRef, commit, () => {
    if (view === 'exam') setView('results')
  })
  const active = activeSessions(progress)
  const available = questionsOfBlock(bank, block)
  const examProfile =
    bank?.examProfiles.find((p) => p.id === EXAM_PROFILE_ID) ?? null
  const exam = useExamRun({
    bank,
    examProfile,
    progress,
    progressRef,
    commit,
    seedClock: setNow,
    goTo: setView,
    lastVisit,
  })
  const {
    count, setCount,
    minutes, setMinutes,
    sessionId, setSessionId,
    confirmFinish, setConfirmFinish,
    session, setupExam, start, updateSession,
  } = exam
  const examTopics = weightedTopics(examProfile)
  const examQuestions = questionsInScope(bank, examTopics)
  const cutoffOf = (s: Session) => passingScoreOf(bank, s)
  const outOfScope = (q: Question) => isOutOfScope(q, examTopics)
  const filtered = filterStudyQuestions({
    bank, studyOrder, block, topic, search, onlySaved, reviewIds, scope,
    marks: progress.marks, examTopics,
  })
  const question = questionAt(filtered, studyIndex)
  const labelTopic = (id: string) => topicLabel(bank, id)
  const goStudy = (b: Block, ids: string[] | null = null) => {
    if (bank) setStudyOrder(newStudyOrder(bank.questions, b))
    setBlock(b)
    setTopic('')
    setSearch('')
    setOnlySaved(false)
    setReviewIds(ids)
    setStudyIndex(0)
    setView('questions')
  }
  // Cantidad y duracion salen del perfil. Si la PGN no las publico, quedan como
  // parametros de practica y la pantalla lo rotula.
  const leave = (target: 'home' | 'questions' | 'progress') => {
    if (view === 'exam') updateSession((s) => s)
    if (target === 'questions' && (view === 'home' || studyOrder?.block !== block)) { goStudy(block); return }
    setView(target)
  }
  const download = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(exportLearning(progressRef.current), null, 2)], {
        type: 'application/json',
      }),
    )
    const a = document.createElement('a')
    a.href = url
    a.download = 'merito-pgn-progreso.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  const upload = async (file: File) => {
    try {
      const imported = importLearning(await file.text())
      commit(settleExpired(mergeProgress(progressRef.current, imported)))
      setError('')
    } catch {
      setError(
        'No se pudo importar: el archivo no tiene un formato de progreso válido.',
      )
    }
  }
  const completed = progress.sessions.filter((s) => s.finishedAt)
  // El global cuenta solo el estudio. Las pruebas viven en su propio historial con
  // su nota: sumarlas mezclaría dos escalas distintas.
  const total = progress.attempts.length
  const hits = progress.attempts.filter((a) => a.correct).length
  return (
    <div className="app" data-theme={theme}>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <header className="app-header">
        <button className="brand" type="button" onClick={() => leave('home')}>
          {/* La M es decorativa: sin ocultarla el nombre accesible del boton
              quedaba "MMérito PGN" y un lector de pantalla leia la letra. */}
          <span className="brand-icon" aria-hidden="true">M</span>Mérito PGN
        </button>
        <span className="header-note">Tu espacio de estudio</span>
        <button
          className="theme-toggle"
          type="button"
          aria-label={
            theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'
          }
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☀' : '☾'}</span>
          {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        </button>
      </header>
      <main id="contenido" ref={mainRef} tabIndex={-1}>
        <div aria-live="polite">
          {error && (
            <p role="alert" className="notice error">
              {error}{' '}
              <button onClick={() => window.location.reload()}>
                Reintentar
              </button>
            </p>
          )}
          {temporary && (
            <p role="status" className="notice">
              El progreso es temporal: este navegador no pudo guardarlo. Exporta
              una copia antes de cerrar.
            </p>
          )}
        </div>
        {!bank && !error && (
          <p role="status" className="loading">
            Cargando preguntas…
          </p>
        )}
        {bank && view === 'home' && (
          <>
            <div className="page-heading">
              <p className="eyebrow">PREPARACIÓN PROCURADURÍA</p>
              <h1>¿Qué vas a practicar hoy?</h1>
              <p>Elige un bloque y avanza a tu ritmo.</p>
            </div>
            <RegistrationCard registration={bank.registration} now={now} />
            {active.map((s) => (
              <div className="resume" key={s.id}>
                <div>
                  <strong>{sessionTitle(s)} en curso</strong>
                  <p>
                    {clock(Math.max(0, Math.ceil((s.endsAt - now) / 1000)))}{' '}
                    restantes
                  </p>
                </div>
                <button
                  className="secondary"
                  onClick={() => {
                    setSessionId(s.id)
                    lastVisit.current = Date.now()
                    setView('exam')
                    setConfirmFinish(false)
                  }}
                >
                  Continuar
                </button>
              </div>
            ))}
            {examProfile && (
              <section className="block-card exam-card">
                <span className="block-symbol" aria-hidden="true">
                  {String.fromCharCode(9678)}
                </span>
                <h2>Prueba de Conocimientos</h2>
                <p>
                  Eliminatoria, con los temas de la convocatoria{' '}
                  {examProfile.id}.{' '}
                  {examProfile.passingKnowledgeScore === null
                    ? 'La PGN no ha publicado el puntaje minimo.'
                    : `Se aprueba con ${examProfile.passingKnowledgeScore} sobre 100.`}
                </p>
                <span className="count">
                  {examQuestions.length} preguntas en alcance
                </span>
                <button className="primary" onClick={setupExam}>
                  Prueba de Conocimientos {String.fromCharCode(183)} {examProfile.id}
                </button>
              </section>
            )}
            <div className="block-grid">
              {profiles.map((p) => (
                <section className="block-card" key={p.id}>
                  <span className="block-symbol" aria-hidden="true">
                    {p.block === 'comun' ? '§' : '⌘'}
                  </span>
                  <h2>{p.label}</h2>
                  <p>{p.description}</p>
                  <span className="count">
                    {
                      bank.questions.filter((q) => q.moduleId === p.block)
                        .length
                    }{' '}
                    preguntas
                  </span>
                  <button
                    className="primary"
                    onClick={() => goStudy(p.block)}
                  >
                    Estudiar {p.label}
                  </button>
                </section>
              ))}
            </div>
            <p className="bank-note">
              {bank.questions.length} preguntas para estudiar ·{' '}
              {bank.ownerApprovedIds.length} aprobadas por el propietario.
            </p>
            <section className="resource">
              <h2>Recursos para estudiar</h2>
              <a
                href="https://misionmerito.com/curso/concurso-procuraduria-nivel-profesional-y-asesor/"
                target="_blank"
                rel="noreferrer"
              >
                Abrir mi curso de Misión Mérito ↗
              </a>
              <p>El curso se consulta en su propia plataforma.</p>
            </section>
          </>
        )}
        {bank && examProfile && view === 'setup' && (
          <SetupView
            profile={examProfile}
            examQuestions={examQuestions}
            exam={exam}
            onBack={() => setView('home')}
          />
        )}
        {bank && view === 'questions' && (
          <>
            <div className="page-heading">
              <h1>Tu banco de preguntas</h1>
              <p>
                Responde, consulta la explicación y guarda lo que quieras
                repasar.
              </p>
            </div>
            <div className="filters">
              <button className="secondary" onClick={() => {
                setStudyOrder(newStudyOrder(bank.questions, block))
                setStudyIndex(0)
              }}>Mezclar de nuevo</button>
              {studyTemporary && <p role="status">El orden de estudio es temporal: no se puede recuperar al recargar.</p>}
              <div className="segmented" aria-label="Bloque">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    aria-pressed={block === p.block}
                    onClick={() => goStudy(p.block)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
              <label>
                Buscar pregunta
                <input
                  type="search"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setStudyIndex(0)
                  }}
                  placeholder="Escribe una palabra…"
                />
              </label>
              <label>
                Tema
                <select
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value)
                    setStudyIndex(0)
                  }}
                >
                  <option value="">Todos los temas</option>
                  {bank.topics
                    .filter(
                      (t) =>
                        t.moduleId === block &&
                        available.some((q) => q.topicId === t.id),
                    )
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                </select>
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={onlySaved}
                  onChange={(e) => {
                    setOnlySaved(e.target.checked)
                    setStudyIndex(0)
                  }}
                />{' '}
                Solo guardadas
              </label>
              <label>
                Alcance
                <select
                  value={scope}
                  onChange={(e) => {
                    const next = e.target.value as typeof scope
                    // Las comportamentales viven en el nucleo comun: se cambia de
                    // bloque para que la seccion tenga contenido.
                    if (next === 'comportamentales' && block !== 'comun')
                      goStudy('comun')
                    setScope(next)
                    setStudyIndex(0)
                  }}
                >
                  <option value="todo">Todo el banco</option>
                  <option value="convocatoria">
                    Solo mi convocatoria {examProfile ? examProfile.id : ''}
                  </option>
                  <option value="comportamentales">
                    Competencias comportamentales
                  </option>
                </select>
              </label>
            </div>
            {scope === 'comportamentales' && (
              <p className="notice" role="note">
                La prueba real de competencias comportamentales es
                clasificatoria: no se califica por acierto y esta aplicación no la
                simula. Estas preguntas sirven para reconocer el tipo de
                planteamiento, no para estimar un puntaje.
              </p>
            )}
            {scope === 'convocatoria' && (
              <p className="notice">
                Solo los temas de la convocatoria{' '}
                {examProfile ? examProfile.id : ''}. Las demás preguntas del banco
                siguen disponibles en {String.fromCharCode(171)}Todo el banco{String.fromCharCode(187)}.
              </p>
            )}
            {reviewIds && (
              <p className="notice">
                Repaso de errores y omitidas{' '}
                <button onClick={() => setReviewIds(null)}>Ver todas</button>
              </p>
            )}
            {question ? (
              <>
                <div className="study-position">
                  <span>
                    Pregunta {Math.min(studyIndex, filtered.length - 1) + 1} de{' '}
                    {filtered.length}
                  </span>
                  <div>
                    <button
                      className="text-button"
                      disabled={studyIndex === 0}
                      onClick={() => setStudyIndex((i) => Math.max(0, i - 1))}
                    >
                      ← Anterior
                    </button>
                    <button
                      className="text-button"
                      disabled={studyIndex >= filtered.length - 1}
                      onClick={() => setStudyIndex((i) => i + 1)}
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
                <StudyQuestion
                  key={`${studyOrder?.sequenceId}:${question.id}`}
                  question={question}
                  bank={bank}
                  mark={progress.marks[question.id] ?? blankMark()}
                  outOfScope={outOfScope(question)}
                  onMark={(m) =>
                    commit({
                      ...progressRef.current,
                      marks: { ...progressRef.current.marks, [question.id]: m },
                    })
                  }
                  onAnswer={(selected, confidence, seconds) =>
                    commit({
                      ...progressRef.current,
                      attempts: [
                        ...progressRef.current.attempts,
                        {
                          questionId: question.id,
                          attemptedAt: new Date().toISOString(),
                          selectedOptionId: selected,
                          confidence,
                          responseTimeSeconds: seconds,
                          correct: selected === question.correctOptionId,
                          mode: 'practice',
                          examId: null,
                        },
                      ],
                    })
                  }
                />
              </>
            ) : (
              <p className="empty">
                No hay preguntas con estos filtros. Prueba otro tema o elimina
                la búsqueda.
              </p>
            )}
          </>
        )}
        {bank &&
          view === 'exam' &&
          session &&
          !session.finishedAt &&
          (() => {
            const q = session.questions[session.index]
            const answer = session.answers[q.id]
            return (
              <section className="exam">
                <div className="exam-top">
                  <span>
                    {sessionTitle(session)} · {session.index + 1}/
                    {session.questions.length}
                  </span>
                  <strong
                    role="timer"
                    aria-live="polite"
                    aria-label="Tiempo restante"
                  >
                    {clock(
                      Math.max(0, Math.ceil((session.endsAt - now) / 1000)),
                    )}
                  </strong>
                </div>
                <progress
                  value={
                    Object.values(session.answers).filter((a) => a.selected)
                      .length
                  }
                  max={session.questions.length}
                  aria-label="Preguntas respondidas"
                />
                {session.endsAt - now <= 300000 && session.endsAt > now && (
                  <p className="notice" role="status">
                    Quedan menos de 5 minutos.
                  </p>
                )}
                <article className="question-card">
                  <div className="question-meta">
                    <Badge question={q} bank={bank} />
                    <span>{labelTopic(q.topicId)}</span>
                  </div>
                  <h1 className="question-title">{q.stem}</h1>
                  <div className="options">
                    {q.options.map((o, i) => (
                      <button
                        key={o.id}
                        className={`option ${answer.selected === o.id ? 'selected' : ''}`}
                        aria-pressed={answer.selected === o.id}
                        onClick={() =>
                          updateSession((s) => ({
                            ...s,
                            answers: {
                              ...s.answers,
                              [q.id]: { ...s.answers[q.id], selected: o.id },
                            },
                          }))
                        }
                      >
                        <span className="option-letter">{'ABCD'[i]}</span>{' '}
                        {o.text}
                      </button>
                    ))}
                  </div>
                  <button
                    className="chip"
                    aria-pressed={answer.flagged}
                    onClick={() =>
                      updateSession((s) => ({
                        ...s,
                        answers: {
                          ...s.answers,
                          [q.id]: {
                            ...s.answers[q.id],
                            flagged: !answer.flagged,
                          },
                        },
                      }))
                    }
                  >
                    {answer.flagged
                      ? 'Marcada para volver'
                      : 'Marcar para volver'}
                  </button>
                  <div className="exam-actions">
                    <button
                      className="secondary"
                      disabled={session.index === 0}
                      onClick={() =>
                        updateSession((s) => ({ ...s, index: s.index - 1 }))
                      }
                    >
                      Anterior
                    </button>
                    {session.index < session.questions.length - 1 ? (
                      <button
                        className="primary"
                        onClick={() =>
                          updateSession((s) => ({ ...s, index: s.index + 1 }))
                        }
                      >
                        Siguiente
                      </button>
                    ) : (
                      <button
                        className="primary"
                        onClick={() => setConfirmFinish(true)}
                      >
                        Finalizar
                      </button>
                    )}
                  </div>
                </article>
                <details className="question-map">
                  <summary>Ver todas las preguntas</summary>
                  <div>
                    {session.questions.map((item, i) => (
                      <button
                        key={item.id}
                        className={`chip ${session.answers[item.id].selected ? 'answered' : ''}`}
                        aria-label={`Pregunta ${i + 1}${session.answers[item.id].flagged ? ', marcada' : ''}`}
                        onClick={() =>
                          updateSession((s) => ({ ...s, index: i }))
                        }
                      >
                        {i + 1}
                        {session.answers[item.id].flagged ? ' ⚑' : ''}
                      </button>
                    ))}
                  </div>
                </details>
                <button
                  className="text-button"
                  onClick={() => setConfirmFinish(true)}
                >
                  Terminar ahora
                </button>
                {confirmFinish && (
                  <div className="notice">
                    <p>
                      Quedan{' '}
                      {
                        Object.values(session.answers).filter(
                          (a) => !a.selected,
                        ).length
                      }{' '}
                      preguntas sin responder. ¿Terminar el simulacro?
                    </p>
                    <div className="button-row">
                      <button
                        className="primary"
                        onClick={() => {
                          updateSession((s) => finishSession(s))
                          setView('results')
                          setConfirmFinish(false)
                        }}
                      >
                        Sí, ver resultados
                      </button>
                      <button
                        className="secondary"
                        onClick={() => setConfirmFinish(false)}
                      >
                        Seguir respondiendo
                      </button>
                    </div>
                  </div>
                )}
              </section>
            )
          })()}
        {bank &&
          view === 'results' &&
          session &&
          (() => {
            const cutoff = cutoffOf(session)
            const score = scoreSession(session, cutoff)
            return (
              <section>
                <div className="page-heading">
                  <p className="eyebrow">
                    {session.profileId
                      ? 'PRUEBA DE CONOCIMIENTOS FINALIZADA'
                      : 'SIMULACRO FINALIZADO'}
                  </p>
                  <h1>
                    Así te fue en{' '}
                    {session.profileId
                      ? 'la Prueba de Conocimientos'
                      : blockLabel(session.block)}
                  </h1>
                  <p>
                    {clock(
                      Math.max(
                        0,
                        Math.round(
                          ((session.finishedAt ?? now) - session.startedAt) /
                            1000,
                        ),
                      ),
                    )}{' '}
                    de trabajo. Cada error te ayuda a elegir qué repasar.
                  </p>
                </div>
                <div className="stats">
                  <div>
                    <strong>{score.score}/100</strong>Nota
                  </div>
                  <div>
                    <strong>{score.correct}</strong>Aciertos
                  </div>
                  <div>
                    <strong>{score.wrong}</strong>Errores
                  </div>
                  <div>
                    <strong>{score.omitted}</strong>Omitidas
                  </div>
                </div>
                {cutoff === null ? (
                  <p className="notice">
                    Sin veredicto: la PGN no ha publicado el puntaje mínimo de esta
                    prueba.
                  </p>
                ) : (
                  <p className="notice" role="status">
                    {score.passed
                      ? `Aprobada: ${score.score} sobre 100, el mínimo es ${cutoff}.`
                      : `No aprobada: ${score.score} sobre 100, el mínimo es ${cutoff}.`}
                  </p>
                )}
                <div className="button-row">
                  <button
                    className="primary"
                    onClick={() => {
                      const failed = session.questions.filter(
                        (q) =>
                          session.answers[q.id].selected !== q.correctOptionId,
                      )
                      // La prueba mezcla modulos y el estudio filtra por uno: se abre el
                      // del primer error. El filtro de alcance llega en la fase 5.
                      // moduleId es string en el contrato; se estrecha aqui en vez
                      // de forzar el tipo con una asercion.
                      const destino =
                        session.block ??
                        (failed[0]?.moduleId === 'tecnico' ? 'tecnico' : 'comun')
                      goStudy(
                        destino,
                        failed.map((q) => q.id),
                      )
                    }}
                  >
                    Repasar errores
                  </button>
                  <button
                    className="secondary"
                    onClick={setupExam}
                  >
                    Nueva prueba
                  </button>
                </div>
                <h2>Resultados por tema</h2>
                <ul className="topic-results">
                  {Object.entries(score.topics).map(([id, v]) => (
                    <li key={id}>
                      <span>{labelTopic(id)}</span>
                      <strong>
                        {v.correct}/{v.total}
                      </strong>
                    </li>
                  ))}
                </ul>
                <h2>Revisa tus respuestas</h2>
                {session.questions.map((q, i) => (
                  <details className="result-item" key={q.id}>
                    <summary>
                      {i + 1}. {q.stem}
                      <span>
                        {!session.answers[q.id].selected
                          ? 'Omitida'
                          : session.answers[q.id].selected === q.correctOptionId
                            ? 'Correcta'
                            : 'Incorrecta'}
                      </span>
                    </summary>
                    <Badge question={q} bank={bank} />
                    <p>
                      Tu respuesta:{' '}
                      {q.options.find(
                        (o) => o.id === session.answers[q.id].selected,
                      )?.text ?? 'Sin responder'}
                    </p>
                    <Explanation question={q} bank={bank} />
                  </details>
                ))}
              </section>
            )
          })()}
        {bank && view === 'progress' && (
          <>
            <div className="page-heading">
              <h1>Tu progreso</h1>
              <p>
                {temporary
                  ? 'Tus resultados son temporales. Exporta una copia antes de cerrar.'
                  : 'Un paso cada día. Tus resultados se guardan en este dispositivo.'}
              </p>
            </div>
            <div className="stats">
              <div>
                <strong>{total}</strong>Preguntas intentadas
              </div>
              <div>
                <strong>{total ? Math.round((hits / total) * 100) : 0}%</strong>
                Aciertos
              </div>
              <div>
                <strong>
                  {Object.values(progress.marks).filter((m) => m.saved).length}
                </strong>
                Guardadas
              </div>
            </div>
            <div className="button-row">
              <button className="primary" onClick={download}>
                Exportar progreso
              </button>
              <label className="secondary file-label">
                Importar progreso
                <input
                  aria-label="Importar progreso"
                  type="file"
                  accept="application/json"
                  onChange={(e) => {
                    if (e.target.files?.[0]) void upload(e.target.files[0])
                    e.target.value = ''
                  }}
                />
              </label>
            </div>
            <p className="bank-note">
              Incluye tus marcas y notas personales. Conserva la copia en un
              lugar privado. Los resultados con preguntas provisionales son
              orientativos.
            </p>
            <h2>Pruebas terminadas</h2>
            {!completed.length ? (
              <p className="empty">Tu primera prueba aparecerá aquí.</p>
            ) : (
              completed
                .slice()
                .reverse()
                .map((s) => (
                  <button
                    className="history-row"
                    key={s.id}
                    onClick={() => {
                      setSessionId(s.id)
                      setView('results')
                    }}
                  >
                    <span>
                      {sessionTitle(s)}
                      <small>
                        {new Date(s.startedAt).toLocaleDateString('es-CO')}
                      </small>
                    </span>
                    <strong>
                      {scoreSession(s, cutoffOf(s)).score}/100 →
                    </strong>
                  </button>
                ))
            )}
          </>
        )}
      </main>
      <footer>Material de preparación no oficial · Progreso local</footer>
      <nav className="navigation" aria-label="Navegación principal">
        {(['home', 'questions', 'progress'] as const).map((v, i) => (
          <button
            key={v}
            aria-current={view === v ? 'page' : undefined}
            onClick={() => leave(v)}
          >
            <span aria-hidden="true">{['⌂', '▤', '◔'][i]}</span>
            {['Inicio', 'Preguntas', 'Progreso'][i]}
          </button>
        ))}
      </nav>
    </div>
  )
}
