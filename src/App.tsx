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
import { QuestionsView } from './views/QuestionsView'
import { ResultsView } from './views/ResultsView'
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
  // Se conserva el objeto del hook, no solo sus piezas: la vista de preguntas lo
  // recibe completo para que agregar un filtro no cambie su firma.
  const study = useStudySession(view, {
    onRestored: () => setView('questions'),
    onLoadError: setError,
  })
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
  } = study
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
          <QuestionsView
            bank={bank}
            study={study}
            learning={{ progress, progressRef, commit }}
            examProfile={examProfile}
            examTopics={examTopics}
            onGoStudy={goStudy}
          />
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
        {bank && view === 'results' && session && (
          <ResultsView
            bank={bank}
            session={session}
            block={block}
            topic={topic}
            error={error}
            now={now}
            cutoffOf={cutoffOf}
            labelTopic={labelTopic}
            onStudy={goStudy}
            onSetupExam={setupExam}
          />
        )}
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
