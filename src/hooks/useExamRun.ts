import { useState } from 'react'
import {
  createExamSession,
  settleExpired,
  type LearningProgress,
  type Session,
  type StudyBank,
} from '../domain/learning'

// El perfil se deriva del banco en vez de importarse: asi es exactamente el mismo
// tipo que la aplicacion ya maneja, sin duplicar una definicion que podria
// desalinearse.
type PerfilDelBanco = StudyBank['examProfiles'][number]

type Dependencias = {
  bank: StudyBank | null
  examProfile: PerfilDelBanco | null
  progress: LearningProgress
  progressRef: { current: LearningProgress }
  commit: (next: LearningProgress) => void
  /** Siembra el reloj con el instante de inicio para que la cuenta atras no
   *  arranque desfasada. */
  seedClock: (now: number) => void
  goTo: (view: 'setup' | 'exam' | 'results') => void
  /** Instante de la ultima interaccion, para imputar segundos a la pregunta
   *  que el usuario tenia delante. */
  lastVisit: { current: number }
}

// Dueno de la prueba de conocimientos: su configuracion, la sesion en curso y las
// transiciones que la crean y la actualizan.
//
// Recibe ocho colaboradores porque ejecutar una prueba necesita genuinamente el
// banco, el perfil, el progreso, el reloj y la navegacion a la vez. Eso es
// cableado interno: no aparece en la interfaz de ninguna vista.
export function useExamRun(deps: Dependencias) {
  const { bank, examProfile, progress, progressRef, commit, seedClock, goTo, lastVisit } =
    deps
  const [count, setCount] = useState(20)
  const [minutes, setMinutes] = useState(30)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [confirmFinish, setConfirmFinish] = useState(false)

  const session = progress.sessions.find((s) => s.id === sessionId)

  const setupExam = () => {
    setCount(examProfile?.questionCount ?? 20)
    setMinutes(examProfile?.durationMinutes ?? 30)
    goTo('setup')
  }

  const start = () => {
    if (!bank) return
    if (!examProfile) return
    const s = createExamSession(bank.questions, examProfile, count, minutes)
    seedClock(s.startedAt)
    commit({
      ...progressRef.current,
      sessions: [...progressRef.current.sessions, s],
    })
    setSessionId(s.id)
    lastVisit.current = Date.now()
    goTo('exam')
    setConfirmFinish(false)
  }

  const updateSession = (mutate: (s: Session) => Session) => {
    const p = progressRef.current
    const s = p.sessions.find((s) => s.id === sessionId)
    if (!s || s.finishedAt) return
    const time = Date.now()
    if (time >= s.endsAt) {
      commit(settleExpired(p, time))
      goTo('results')
      return
    }
    const q = s.questions[s.index]
    const timed = {
      ...s,
      answers: {
        ...s.answers,
        [q.id]: {
          ...s.answers[q.id],
          seconds:
            s.answers[q.id].seconds +
            Math.max(0, (time - lastVisit.current) / 1000),
        },
      },
    }
    lastVisit.current = time
    const updated = mutate(timed)
    commit({
      ...p,
      sessions: p.sessions.map((x) => (x.id === updated.id ? updated : x)),
    })
  }

  return {
    count,
    setCount,
    minutes,
    setMinutes,
    sessionId,
    setSessionId,
    confirmFinish,
    setConfirmFinish,
    session,
    setupExam,
    start,
    updateSession,
  }
}
