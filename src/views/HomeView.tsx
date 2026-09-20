import {
  profiles,
  type Block,
  type LearningProgress,
  type StudyBank,
} from '../domain/learning'
import { activeSessions, sessionTitle } from '../domain/study-selectors'
import { RegistrationCard } from '../RegistrationCard'
import { clock } from './format'

// Inicio: sesiones por reanudar, la prueba de la convocatoria y los dos bloques
// de estudio. `onResume` es un solo callback a proposito: la vista pide reanudar
// y App decide que implica (sembrar el reloj, cambiar de vista, limpiar el
// confirmar-terminar), en vez de recibir cuatro setters sueltos.
export function HomeView({
  bank,
  progress,
  now,
  examProfile,
  examQuestions,
  onResume,
  onSetupExam,
  onGoStudy,
}: {
  bank: StudyBank
  progress: LearningProgress
  now: number
  examProfile: StudyBank['examProfiles'][number] | null
  examQuestions: unknown[]
  onResume: (id: string) => void
  onSetupExam: () => void
  onGoStudy: (block: Block) => void
}) {
  return (
    <>
      <div className="page-heading">
        <p className="eyebrow">PREPARACIÓN PROCURADURÍA</p>
        <h1>¿Qué vas a practicar hoy?</h1>
        <p>Elige un bloque y avanza a tu ritmo.</p>
      </div>
      <RegistrationCard registration={bank.registration} now={now} />
      {activeSessions(progress).map((s) => (
        <div className="resume" key={s.id}>
          <div>
            <strong>{sessionTitle(s)} en curso</strong>
            <p>
              {clock(Math.max(0, Math.ceil((s.endsAt - now) / 1000)))}{' '}
              restantes
            </p>
          </div>
          <button className="secondary" onClick={() => onResume(s.id)}>
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
          <button className="primary" onClick={onSetupExam}>
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
              onClick={() => onGoStudy(p.block)}
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
  )
}
