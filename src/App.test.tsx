import '@testing-library/jest-dom/vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import bank from '../public/data/question-bank.json'
import { saveAttempt } from './domain/progress/store'

vi.mock('./domain/progress/store', () => ({
  loadAttempts: vi.fn().mockResolvedValue([]), saveAttempt: vi.fn().mockResolvedValue(undefined),
  createProgressExport: vi.fn(), parseProgressExport: vi.fn(), replaceAttempts: vi.fn(),
}))

beforeEach(() => { cleanup(); vi.clearAllMocks(); vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ schemaVersion: 1, questions: [] }) })) })

describe('App', () => {
  it('presenta el entrenador de Fase 3 y conserva Fase 2 en curso', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Fase 3 implementada')).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: /entrena con evidencia/i })).toBeInTheDocument()
    expect(screen.getByText('Fase 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver progreso' })).toBeInTheDocument()
  })
  it.each(['practice', 'simulation'])('guarda tiempo y respeta retroalimentación en %s', async (mode) => {
    const question = bank.questions[0]
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ schemaVersion: 1, questions: [question] }) }))
    const now = vi.spyOn(performance, 'now').mockReturnValue(1000)
    render(<App />)
    const start = screen.getByRole('button', { name: mode === 'practice' ? 'Practicar ahora' : 'Simulacro breve' })
    await waitFor(() => expect(start).toBeEnabled())
    fireEvent.click(start)
    now.mockReturnValue(8000)
    fireEvent.click(screen.getByRole('button', { name: `A. ${question.options[0].text}` }))
    fireEvent.click(screen.getByRole('button', { name: '2 · media' }))
    fireEvent.click(screen.getByRole('button', { name: mode === 'practice' ? 'Comprobar respuesta' : 'Guardar respuesta' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'Ver resumen' })).toBeInTheDocument())
    expect(saveAttempt).toHaveBeenCalledOnce()
    expect(saveAttempt).toHaveBeenCalledWith(expect.objectContaining({ responseTimeSeconds: 7, mode }))
    if (mode === 'simulation') expect(screen.queryByText(question.explanation)).not.toBeInTheDocument()
    else expect(screen.getByText(question.explanation)).toBeInTheDocument()
    now.mockRestore()
  })
})
