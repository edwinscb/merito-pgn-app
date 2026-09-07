import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

beforeEach(() => { vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ schemaVersion: 1, questions: [] }) })) })

describe('App', () => {
  it('presenta el entrenador de Fase 3 y conserva Fase 2 en curso', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByText('Fase 3 implementada')).toBeInTheDocument())
    expect(screen.getByRole('heading', { name: /entrena con evidencia/i })).toBeInTheDocument()
    expect(screen.getByText('Fase 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver progreso' })).toBeInTheDocument()
  })
})
