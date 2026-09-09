import '@testing-library/jest-dom/vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import rawBank from '../public/data/study-bank.json'
import { QuestionSchema } from './domain/dataset/contracts'
import { createSession, emptyProgress } from './domain/learning'
import {
  isPersistent,
  loadLearning,
  saveLearning,
} from './domain/progress/learning-store'

vi.mock('./domain/progress/learning-store', () => ({
  loadLearning: vi.fn(),
  saveLearning: vi.fn(),
  isPersistent: vi.fn(),
}))
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  vi.mocked(loadLearning).mockResolvedValue(emptyProgress())
  vi.mocked(saveLearning).mockResolvedValue(true)
  vi.mocked(isPersistent).mockReturnValue(true)
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok: true, json: async () => rawBank }),
  )
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})
const ready = () =>
  screen.findByRole('heading', { name: '¿Qué vas a practicar hoy?' })
describe('estudio y simuladores móviles', () => {
  it('carga explícita y dos bloques, 102 preguntas, sin fases ni convocatorias', async () => {
    render(<App />)
    expect(screen.getByText('Cargando preguntas…')).toBeInTheDocument()
    await ready()
    expect(screen.getByText('46 preguntas')).toBeInTheDocument()
    expect(screen.getByText('56 preguntas')).toBeInTheDocument()
    expect(screen.getByText(/102 preguntas para estudiar/)).toHaveTextContent(
      '18 revisadas · 84 provisionales',
    )
    expect(screen.queryByText(/Fase \d/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/convocatoria/i)).not.toBeInTheDocument()
  })
  it('estudia sin confianza obligatoria y conserva marcas sin alterar revisión editorial', async () => {
    render(<App />)
    await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Estudiar General' }))
    const q = rawBank.questions.find((q) => q.moduleId === 'comun')!
    expect(screen.getByText('Provisional')).toBeInTheDocument()
    expect(screen.queryByText(q.explanation)).not.toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', {
        name: `${q.options[0].id} ${q.options[0].text}`,
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Comprobar' }))
    expect(screen.getByText(q.explanation)).toBeVisible()
    expect(saveLearning).toHaveBeenLastCalledWith(
      expect.objectContaining({
        attempts: [
          expect.objectContaining({ confidence: null, questionId: q.id }),
        ],
      }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Guardar para repasar' }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'Marcar revisada por mí' }),
    )
    expect(saveLearning).toHaveBeenLastCalledWith(
      expect.objectContaining({
        marks: {
          [q.id]: expect.objectContaining({ saved: true, reviewed: true }),
        },
      }),
    )
    expect(screen.getByText('Provisional')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Buscar pregunta'), {
      target: { value: 'xyz-no-existe' },
    })
    expect(
      screen.getByText(/No hay preguntas con estos filtros/),
    ).toBeInTheDocument()
  })
  it('simula con navegación, cambia respuestas, marca y no revela explicación hasta finalizar', async () => {
    render(<App />)
    await ready()
    fireEvent.click(
      screen.getByRole('button', { name: 'Iniciar simulacro de Sistemas' }),
    )
    expect(screen.getByLabelText('Preguntas')).toHaveValue(20)
    expect(screen.getByLabelText('Duración en minutos')).toHaveValue(30)
    fireEvent.change(screen.getByLabelText('Preguntas'), {
      target: { value: '2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar simulacro' }))
    const s = vi.mocked(saveLearning).mock.calls.at(-1)![0].sessions[0]
    expect(
      screen.queryByText(s.questions[0].explanation),
    ).not.toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', {
        name: `A ${s.questions[0].options[0].text}`,
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Marcar para volver' }))
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }))
    fireEvent.click(screen.getByRole('button', { name: 'Anterior' }))
    expect(
      screen.getByRole('button', {
        name: `A ${s.questions[0].options[0].text}`,
      }),
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: 'Marcada para volver' }),
    ).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', {
        name: `B ${s.questions[0].options[1].text}`,
      }),
    )
    fireEvent.click(screen.getByRole('button', { name: 'Terminar ahora' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sí, ver resultados' }))
    expect(
      screen.getByRole('heading', { name: 'Así te fue en Sistemas' }),
    ).toBeInTheDocument()
    expect(screen.getByText(s.questions[0].explanation)).toBeInTheDocument()
    expect(
      vi.mocked(saveLearning).mock.calls.at(-1)![0].sessions[0].answers[
        s.questions[0].id
      ].selected,
    ).toBe(s.questions[0].options[1].id)
  })
  it('recupera sesión activa tras recargar y cierra las vencidas', async () => {
    const s = createSession(
      rawBank.questions.map((q) => QuestionSchema.parse(q)),
      'comun',
      2,
      30,
    )
    s.index = 1
    s.answers[s.questions[0].id].flagged = true
    vi.mocked(loadLearning).mockResolvedValue({
      ...emptyProgress(),
      sessions: [s],
    })
    const app = render(<App />)
    await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(
      screen.getByRole('heading', { name: s.questions[1].stem }),
    ).toBeInTheDocument()
    app.unmount()
    vi.mocked(loadLearning).mockResolvedValue({
      ...emptyProgress(),
      sessions: [{ ...s, startedAt: 1, endsAt: 2 }],
    })
    render(<App />)
    await ready()
    expect(
      screen.queryByRole('button', { name: 'Continuar' }),
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(saveLearning).toHaveBeenCalledWith(
        expect.objectContaining({
          sessions: [expect.objectContaining({ finishedAt: 2 })],
        }),
      ),
    )
  })
  it('informa almacenamiento temporal y errores de carga', async () => {
    vi.mocked(isPersistent).mockReturnValue(false)
    const app = render(<App />)
    await ready()
    expect(screen.getByText(/El progreso es temporal/)).toBeVisible()
    app.unmount()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(Error('offline')))
    render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudieron cargar las preguntas',
    )
  })
})
