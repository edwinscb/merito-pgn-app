import { useEffect, useMemo, useRef, useState } from 'react'
import { loadQuestionBank } from './domain/questionBank'
import { createProgressExport, loadAttempts, parseProgressExport, replaceAttempts, saveAttempt } from './domain/progress/store'
import type { Attempt, Question } from './domain/dataset/contracts'
import './styles.css'

type View = 'home' | 'practice' | 'simulation' | 'progress' | 'summary'
type Session = { mode: 'practice' | 'simulation'; questions: Question[]; index: number; correct: number }
const milestones = [
  { label: 'Fase 0', detail: 'Base y documentación', status: 'Lista' },
  { label: 'Fase 1', detail: 'Contratos del dataset', status: 'Lista' },
  { label: 'Fase 2', detail: 'Banco semilla y revisión asistida', status: 'En curso' },
  { label: 'Fase 3', detail: 'Entrenador esencial', status: 'Implementada' },
]

function Explanation({ question }: { question: Question }) {
  return <div><p>{question.explanation}</p><ul>{question.options.map((option) => <li key={option.id}><strong>{option.id}.</strong> {option.rationale}</li>)}</ul><p className="muted">Respaldo: {question.references.filter((reference) => reference.supports === 'correct_answer').map((reference) => `${reference.sourceId} · ${reference.locator}`).join('; ')}</p></div>
}

function App() {
  const [view, setView] = useState<View>('home')
  const [questions, setQuestions] = useState<Question[]>([])
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [session, setSession] = useState<Session | null>(null)
  const [selected, setSelected] = useState<Attempt['selectedOptionId'] | null>(null)
  const [confidence, setConfidence] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const startedAt = useRef(performance.now())
  const [topicFilter, setTopicFilter] = useState('')
  const [callFilter, setCallFilter] = useState('')
  const [sessionSize, setSessionSize] = useState(10)
  const eligible = questions.filter((q) => (!topicFilter || q.topicId === topicFilter) && (!callFilter || q.targetCallIds.includes(callFilter)))
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { Promise.all([loadQuestionBank(), loadAttempts()]).then(([bank, stored]) => { setQuestions(bank); setAttempts(stored) }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'No se pudo cargar el entrenador.')) }, [])
  const accuracy = attempts.length ? Math.round(attempts.filter((a) => a.correct).length / attempts.length * 100) : 0
  const reviewIds = useMemo(() => new Set(questions.filter((q) => {
    const history = attempts.filter((a) => a.questionId === q.id).sort((a, b) => Date.parse(b.attemptedAt) - Date.parse(a.attemptedAt))
    const last = history[0]
    if (!last || !last.correct || last.confidence === 1) return true
    const intervalDays = last.confidence === 2 ? 1 : Math.min(7, Math.max(1, history.length * 2))
    return Date.now() - Date.parse(last.attemptedAt) >= intervalDays * 86_400_000
  }).map((q) => q.id)), [attempts, questions])
  const current = session?.questions[session.index]
  function begin(mode: 'practice' | 'simulation') {
    const ordered = [...eligible]
    for (let i = ordered.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[ordered[i], ordered[j]] = [ordered[j], ordered[i]]
    }
    if (mode === 'practice') ordered.sort((a, b) => Number(!reviewIds.has(a.id)) - Number(!reviewIds.has(b.id)))
    const selectedQuestions = ordered.slice(0, sessionSize)
    if (!selectedQuestions.length) return
    startedAt.current = performance.now()
    setSession({ mode, questions: selectedQuestions, index: 0, correct: 0 }); setSelected(null); setConfidence(null); setSubmitted(false); setView(mode)
  }
  async function submitAnswer() {
    if (!current || !selected || !confidence || submitted || !session || savingRef.current) return
    savingRef.current = true
    setSaving(true)
    const attempt: Attempt = { questionId: current.id, attemptedAt: new Date().toISOString(), selectedOptionId: selected, correct: selected === current.correctOptionId, confidence, responseTimeSeconds: Math.max(0, Math.round((performance.now() - startedAt.current) / 1000)), mode: session.mode, examId: null }
    try {
      await saveAttempt(attempt); setAttempts((previous) => [...previous, attempt]); setSession({ ...session, correct: session.correct + (attempt.correct ? 1 : 0) }); setSubmitted(true); setError(null)
    } catch { setError('No se pudo guardar la respuesta. Inténtalo de nuevo.') }
    finally { savingRef.current = false; setSaving(false) }
  }
  function nextQuestion() {
    if (!session) return
    if (session.index + 1 >= session.questions.length) { setView('summary'); return }
    startedAt.current = performance.now()
    setSession({ ...session, index: session.index + 1 }); setSelected(null); setConfidence(null); setSubmitted(false)
  }
  function exportProgress() { const blob = new Blob([JSON.stringify(createProgressExport(attempts), null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'merito-pgn-progress.json'; anchor.click(); URL.revokeObjectURL(url) }
  async function importProgress(file: File) { try { const imported = parseProgressExport(await file.text()); const merged = [...new Map([...attempts, ...imported.attempts].map((a) => [`${a.questionId}|${a.attemptedAt}|${a.mode}`, a])).values()]; await replaceAttempts(merged); setAttempts(merged); setError(null) } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : 'No se pudo importar el progreso.') } }
  return <main className="shell">
    <header className="topbar"><a className="brand" href="#inicio" onClick={() => setView('home')}><span className="brand-mark" aria-hidden="true">M</span><span>Mérito PGN</span></a><span className="phase-badge">Fase 3 implementada</span></header>
    {error && <p className="notice error" role="alert">{error}</p>}
    {view === 'home' && <><section className="hero" id="inicio"><div className="hero-copy"><p className="eyebrow">Concurso PGN 2026 · preparación personal</p><h1>Entrena con evidencia, paso a paso.</h1><p className="lede">Práctica y simulacro local sobre el banco público aprobado. Tus respuestas permanecen en este dispositivo.</p><fieldset className="session-settings"><legend>Sesión de estudio (no reproduce parámetros oficiales)</legend><label>Tema<select value={topicFilter} onChange={(event) => setTopicFilter(event.target.value)}><option value="">Todos los temas</option>{[...new Set(questions.map((q) => q.topicId))].sort().map((topic) => <option key={topic} value={topic}>{topic.replaceAll('_', ' ')}</option>)}</select></label><label>Convocatoria<select value={callFilter} onChange={(event) => setCallFilter(event.target.value)}><option value="">Todas, incluido contenido sin asignación</option>{[...new Set(questions.flatMap((q) => q.targetCallIds))].sort().map((call) => <option key={call} value={call}>{call}</option>)}</select></label><label>Cantidad<input type="number" min="1" max="200" value={sessionSize} onChange={(event) => setSessionSize(Math.max(1, Math.min(200, Number(event.target.value) || 1)))} /></label><p>{eligible.length} preguntas disponibles; se usarán hasta {sessionSize}.</p></fieldset><div className="action-grid"><button className="button" onClick={() => begin('practice')} disabled={!eligible.length}>Practicar ahora</button><button className="button secondary" onClick={() => begin('simulation')} disabled={!eligible.length}>Simulacro breve</button><button className="button ghost" onClick={() => setView('progress')}>Ver progreso</button></div></div><aside className="status-card" aria-label="Estado de preparación"><p className="status-label">Estado actual</p><strong>Entrenador local</strong><div className="status-rule" /><dl><div><dt>Preguntas publicadas</dt><dd>{questions.length}</dd></div><div><dt>Respuestas guardadas</dt><dd>{attempts.length}</dd></div><div><dt>Precisión</dt><dd>{accuracy}%</dd></div><div><dt>Por repasar</dt><dd>{reviewIds.size}</dd></div></dl></aside></section><section className="milestones" aria-labelledby="roadmap-title"><div><p className="eyebrow">Ruta de construcción</p><h2 id="roadmap-title">Primero evidencia, después entrenamiento.</h2></div><ol>{milestones.map((m) => <li key={m.label} className={m.status === 'Lista' || m.status === 'Implementada' ? 'complete' : ''}><span className="step-dot" aria-hidden="true" /><div><span className="step-label">{m.label}</span><p>{m.detail}</p></div><span className="step-status">{m.status}</span></li>)}</ol></section></>}
    {(view === 'practice' || view === 'simulation') && current && <section className="trainer"><button className="back-link" onClick={() => setView('home')}>← Volver al inicio</button><p className="eyebrow">{session?.mode === 'practice' ? 'Práctica enfocada' : 'Simulacro breve'} · pregunta {(session?.index ?? 0) + 1} de {session?.questions.length}</p><div className="progress-track"><span style={{ width: `${(((session?.index ?? 0) + 1) / (session?.questions.length || 1)) * 100}%` }} /></div><article className="question-card"><p className="question-stem">{current.stem}</p><div className="options">{current.options.map((o) => <button key={o.id} className={`option ${selected === o.id ? 'selected' : ''} ${submitted && session?.mode === 'practice' && o.id === current.correctOptionId ? 'correct' : ''} ${submitted && session?.mode === 'practice' && selected === o.id && o.id !== current.correctOptionId ? 'incorrect' : ''}`} onClick={() => !submitted && setSelected(o.id)}>{o.id}. {o.text}</button>)}</div><fieldset className="confidence"><legend>¿Qué tanta confianza tienes?</legend>{[1, 2, 3].map((level) => <button type="button" key={level} className={confidence === level ? 'confidence-selected' : ''} onClick={() => !submitted && setConfidence(level)}>{level} · {level === 1 ? 'baja' : level === 2 ? 'media' : 'alta'}</button>)}</fieldset>{submitted && session?.mode === 'practice' && <div className={`feedback ${selected === current.correctOptionId ? 'success' : 'warning'}`}><strong>{selected === current.correctOptionId ? 'Respuesta correcta' : `Respuesta correcta: ${current.correctOptionId}`}</strong><Explanation question={current} /></div>}<div className="trainer-actions">{!submitted ? <button className="button" onClick={submitAnswer} disabled={!selected || !confidence || saving}>{saving ? 'Guardando…' : session?.mode === 'simulation' ? 'Guardar respuesta' : 'Comprobar respuesta'}</button> : <button className="button" onClick={nextQuestion}>{session && session.index + 1 >= session.questions.length ? 'Ver resumen' : 'Siguiente'}</button>}</div></article></section>}
    {view === 'summary' && session && <section className="trainer summary"><p className="eyebrow">Sesión completada</p><h2>{session.mode === 'practice' ? 'Práctica terminada' : 'Simulacro terminado'}</h2><p className="summary-score">{session.correct} / {session.questions.length} correctas</p><p>El resultado y tus niveles de confianza quedaron guardados localmente.</p>{session.mode === 'simulation' && session.questions.map((question) => <details key={question.id}><summary>{question.stem} · clave {question.correctOptionId}</summary><Explanation question={question} /></details>)}<button className="button" onClick={() => setView('home')}>Continuar</button></section>}
    {view === 'progress' && <section className="trainer"><button className="back-link" onClick={() => setView('home')}>← Volver al inicio</button><p className="eyebrow">Progreso local</p><h2>Tu historial permanece contigo.</h2><div className="progress-grid"><div><span>Respuestas</span><strong>{attempts.length}</strong></div><div><span>Precisión</span><strong>{accuracy}%</strong></div><div><span>Por repasar</span><strong>{reviewIds.size}</strong></div></div><div className="import-export"><button className="button" onClick={exportProgress} disabled={!attempts.length}>Exportar progreso</button><label className="button secondary">Importar progreso<input type="file" accept="application/json" hidden onChange={(event) => event.target.files?.[0] && importProgress(event.target.files[0])} /></label></div><p className="muted">La importación valida el contrato y combina intentos sin duplicarlos. No hay sincronización con servidores.</p></section>}
    <footer><p>Contenido de estudio no oficial. Las preguntas sin respaldo oficial no se publican ni aparecen en el entrenador.</p></footer>
  </main>
}
export default App
