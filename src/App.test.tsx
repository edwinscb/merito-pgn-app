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
  sessionStorage.clear()
  vi.spyOn(Math, 'random').mockReturnValue(0.999999)
  const values = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  })
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
const MID_CHAR = String.fromCharCode(183)
// Banco con el formato ya publicado por la PGN, para el caso opuesto al real.
const bankConFormato = {
  ...rawBank,
  examProfiles: rawBank.examProfiles.map((p) =>
    p.id === '126-2026'
      ? { ...p, questionCount: 60, durationMinutes: 90 }
      : p,
  ),
}
const abrirPrueba = () =>
  fireEvent.click(
    screen.getByRole('button', {
      name: `Prueba de Conocimientos ${MID_CHAR} 126-2026`,
    }),
  )
const ready = () =>
  screen.findByRole('heading', { name: '¿Qué vas a practicar hoy?' })
describe('estudio y simuladores móviles', () => {
  it('recupera orden, opciones y posición; tema, filtros y marcas no vuelven a mezclar', async () => {
    vi.mocked(Math.random).mockReturnValue(0)
    const first = render(<App />)
    await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Estudiar Sistemas' }))
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente →' }))
    const snapshot = JSON.parse(sessionStorage.getItem('merito-pgn-study:v1')!)
    const stem = document.querySelector('.question-title')!.textContent
    const options = [...document.querySelectorAll('.option')].map(e => e.textContent)
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar a modo claro' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar para repasar' }))
    expect(JSON.parse(sessionStorage.getItem('merito-pgn-study:v1')!).order).toEqual(snapshot.order)
    first.unmount()
    render(<App />)
    await screen.findByRole('heading', { name: 'Tu banco de preguntas' })
    expect(document.querySelector('.question-title')!.textContent).toBe(stem)
    expect([...document.querySelectorAll('.option')].map(e => e.textContent)).toEqual(options)
    expect(screen.getByText('Pregunta 2 de 100')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Buscar pregunta'), { target: { value: 'SQL' } })
    expect(JSON.parse(sessionStorage.getItem('merito-pgn-study:v1')!).order).toEqual(snapshot.order)
    fireEvent.click(screen.getByRole('button', { name: 'Mezclar de nuevo' }))
    expect(JSON.parse(sessionStorage.getItem('merito-pgn-study:v1')!).sequenceId).not.toBe(snapshot.sequenceId)
  })
  it('inicia en oscuro, cambia a claro y recuerda la elección', async () => {
    const first = render(<App />)
    await ready()
    expect(document.documentElement.dataset.theme).toBe('dark')
    const toggle = screen.getByRole('button', { name: 'Cambiar a modo claro' })
    fireEvent.click(toggle)
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('merito-pgn-theme:v1')).toBe('light')
    first.unmount()
    render(<App />)
    await ready()
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(
      screen.getByRole('button', { name: 'Cambiar a modo oscuro' }),
    ).toBeInTheDocument()
  })
  it('mantiene separados los estados seleccionado y correcto', async () => {
    render(<App />)
    await ready()
    fireEvent.click(
      screen.getByRole('button', { name: 'Estudiar General' }),
    )
    const question = rawBank.questions.find((q) => q.moduleId === 'comun')!
    const correct = question.options.find(
      (option) => option.id === question.correctOptionId,
    )!
    const option = screen.getByRole('button', {
      name: `${correct.id} ${correct.text}`,
    })
    fireEvent.click(option)
    expect(option).toHaveClass('selected')
    fireEvent.click(
      screen.getByRole('button', { name: 'Comprobar' }),
    )
    expect(option).toHaveClass('correct')
    expect(option).toHaveClass('selected')
  })
  it('carga explícita y dos bloques, 200 preguntas, sin fases ni convocatorias', async () => {
    render(<App />)
    expect(screen.getByText('Cargando preguntas…')).toBeInTheDocument()
    await ready()
    expect(screen.getAllByText('100 preguntas')).toHaveLength(2)
    expect(screen.getByText(/200 preguntas para estudiar/)).toHaveTextContent(
      '200 aprobadas por el propietario',
    )
    expect(screen.queryByText(/Fase \d/)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/convocatoria/i)).not.toBeInTheDocument()
  })
  it('estudia sin confianza obligatoria y conserva marcas sin alterar revisión editorial', async () => {
    render(<App />)
    await ready()
    fireEvent.click(screen.getByRole('button', { name: 'Estudiar General' }))
    const q = rawBank.questions.find((q) => q.moduleId === 'comun')!
    expect(screen.getByText('Aprobada por el propietario')).toBeInTheDocument()
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
    expect(screen.getByText('Aprobada por el propietario')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Buscar pregunta'), {
      target: { value: 'xyz-no-existe' },
    })
    expect(
      screen.getByText(/No hay preguntas con estos filtros/),
    ).toBeInTheDocument()
  })
  it('presenta la prueba con navegación, cambia respuestas y no revela explicación hasta finalizar', async () => {
    render(<App />)
    await ready()
    fireEvent.click(
      screen.getByRole('button', {
        name: `Prueba de Conocimientos ${MID_CHAR} 126-2026`,
      }),
    )
    expect(screen.getByLabelText('Preguntas')).toHaveValue(20)
    expect(screen.getByLabelText('Duración en minutos')).toHaveValue(30)
    fireEvent.change(screen.getByLabelText('Preguntas'), {
      target: { value: '2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar la prueba' }))
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
      screen.getByRole('heading', {
        name: 'Así te fue en la Prueba de Conocimientos',
      }),
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

  it('toma cantidad y duración del perfil cuando la PGN ya las publico', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => bankConFormato }),
    )
    render(<App />)
    await ready()
    abrirPrueba()
    expect(screen.getByLabelText('Preguntas')).toHaveValue(60)
    expect(screen.getByLabelText('Duración en minutos')).toHaveValue(90)
    expect(
      screen.queryByText(/Formato no confirmado por la PGN/),
    ).not.toBeInTheDocument()
  })
  it('rotula el formato como no confirmado cuando el perfil viene en null', async () => {
    render(<App />)
    await ready()
    abrirPrueba()
    expect(screen.getByLabelText('Preguntas')).toHaveValue(20)
    expect(screen.getByLabelText('Duración en minutos')).toHaveValue(30)
    expect(
      screen.getByText(/Formato no confirmado por la PGN/),
    ).toBeInTheDocument()
  })
  it('muestra la nota sobre 100 y el veredicto contra el corte de 65', async () => {
    render(<App />)
    await ready()
    abrirPrueba()
    fireEvent.change(screen.getByLabelText('Preguntas'), {
      target: { value: '2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar la prueba' }))
    const s = vi.mocked(saveLearning).mock.calls.at(-1)![0].sessions[0]
    expect(s.profileId).toBe('126-2026')
    expect(s.block).toBeNull()
    for (const q of s.questions) {
      const correcta = q.options.find((o) => o.id === q.correctOptionId)!
      fireEvent.click(
        screen.getByRole('button', {
          name: `${correcta.id} ${correcta.text}`,
        }),
      )
      const siguiente = screen.queryByRole('button', { name: 'Siguiente' })
      if (siguiente) fireEvent.click(siguiente)
    }
    fireEvent.click(screen.getByRole('button', { name: 'Terminar ahora' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sí, ver resultados' }))
    expect(document.querySelector('.stats')!.textContent).toContain(
      '100/100Nota',
    )
    expect(
      screen.getByText('Aprobada: 100 sobre 100, el mínimo es 65.'),
    ).toBeInTheDocument()
  })
  it('no suma las preguntas de la prueba en el progreso global', async () => {
    render(<App />)
    await ready()
    abrirPrueba()
    fireEvent.change(screen.getByLabelText('Preguntas'), {
      target: { value: '2' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Comenzar la prueba' }))
    fireEvent.click(screen.getByRole('button', { name: 'Terminar ahora' }))
    fireEvent.click(screen.getByRole('button', { name: 'Sí, ver resultados' }))
    fireEvent.click(screen.getByRole('button', { name: 'Progreso' }))
    await screen.findByRole('heading', { name: 'Tu progreso' })
    expect(document.querySelector('.stats')!.textContent).toContain(
      '0Preguntas intentadas',
    )
    // La prueba aparece en su historial con la nota, no en el conteo global.
    expect(screen.getByText('Pruebas terminadas')).toBeInTheDocument()
    expect(document.querySelector('.history-row')!.textContent).toContain(
      'Prueba de Conocimientos',
    )
  })
})
