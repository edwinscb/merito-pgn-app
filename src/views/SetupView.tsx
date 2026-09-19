import type { Question } from '../domain/dataset/contracts'
import type { StudyBank } from '../domain/learning'

type Perfil = StudyBank['examProfiles'][number]

// Configuracion de la prueba de conocimientos antes de empezarla.
// Recibe el objeto del simulacro completo en vez de sus piezas: asi su interfaz
// no crece cada vez que la prueba gana un parametro.
export function SetupView({
  profile,
  examQuestions,
  exam,
  onBack,
}: {
  profile: Perfil
  examQuestions: Question[]
  exam: {
    count: number
    setCount: (n: number) => void
    minutes: number
    setMinutes: (n: number) => void
    start: () => void
  }
  onBack: () => void
}) {
  const { count, setCount, minutes, setMinutes, start } = exam
  return (
    <section className="setup panel">
      <button className="text-button" onClick={onBack}>
        ← Inicio
      </button>
      <h1>
        Prueba de Conocimientos {String.fromCharCode(183)} {profile.id}
      </h1>
      <p>
        Prueba eliminatoria. Una pregunta a la vez. Las explicaciones
        aparecen al finalizar.
      </p>
      {(profile.questionCount === null ||
        profile.durationMinutes === null) && (
        <p className="notice">
          Formato no confirmado por la PGN: la Resolución 076 no define
          cantidad de preguntas ni duración. Los valores de abajo son de
          entrenamiento, no el formato oficial.
        </p>
      )}
      <label>
        Preguntas
        <input
          type="number"
          min={1}
          max={examQuestions.length}
          value={count}
          onChange={(e) =>
            setCount(
              Math.max(
                1,
                Math.min(
                  examQuestions.length,
                  Math.floor(Number(e.target.value)) || 1,
                ),
              ),
            )
          }
        />
      </label>
      <label>
        Duración en minutos
        <input
          type="number"
          min={1}
          max={240}
          value={minutes}
          onChange={(e) =>
            setMinutes(
              Math.max(
                1,
                Math.min(240, Math.floor(Number(e.target.value)) || 1),
              ),
            )
          }
        />
      </label>
      <p>
        Se usarán {Math.min(count, examQuestions.length)} de{' '}
        {examQuestions.length} preguntas del alcance de la convocatoria.
      </p>
      <p className="bank-note">
        Preguntas aprobadas por el propietario. Resultado orientativo para estudiar.
      </p>
      <button
        className="primary"
        disabled={!examQuestions.length}
        onClick={start}
      >
        Comenzar la prueba
      </button>
    </section>
  )
}
