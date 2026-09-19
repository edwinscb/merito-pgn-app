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
import { blankMark } from './domain/learning'
import { Badge } from './views/Badge'
import { ExamView } from './views/ExamView'
import { HomeView } from './views/HomeView'
import { Explanation } from './views/Explanation'
import { clock } from './views/format'
import { StudyQuestion } from './views/StudyQuestion'
import { ProgressView } from './views/ProgressView'
import { SetupView } from './views/SetupView'
import { newStudyOrder, orderedQuestions, type StudyOrder } from './domain/study-order'
import {
  activeSessions,
  blockLabel,
  filterStudyQuestions,
  isOutOfScope,
  passingScoreOf,
  questionAt,
  questionsInScope,
  questionsOfBlock,
  sessionTitle,
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

const EXAM_PROFILE_ID = '126-2026'
const BEHAVIORAL_TOPIC = 'competencias_comportamentales'
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
          <HomeView
            bank={bank}
            progress={progress}
            now={now}
            examProfile={examProfile}
            examQuestions={examQuestions}
            onResume={(id) => {
              setSessionId(id)
              lastVisit.current = Date.now()
              setView('exam')
              setConfirmFinish(false)
            }}
            onSetupExam={setupExam}
            onGoStudy={goStudy}
          />
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
        {bank && view === 'exam' && session && !session.finishedAt && (
          <ExamView
            bank={bank}
            session={session}
            progress={progress}
            now={now}
            exam={exam}
            labelTopic={labelTopic}
            onLeave={() => setView('results')}
          />
        )}
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
          <ProgressView
            learning={{ progress, temporary }}
            cutoffOf={cutoffOf}
            onDownload={download}
            onUpload={(f) => void upload(f)}
            onOpenResults={(id) => {
              setSessionId(id)
              setView('results')
            }}
          />
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
