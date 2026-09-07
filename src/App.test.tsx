import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('presenta la Fase 1 completa y la Fase 2 en curso sin habilitar funciones futuras', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /una base confiable/i })).toBeInTheDocument()
    expect(screen.getByText('Dataset estructurado')).toBeInTheDocument()
    expect(screen.getByText('Fase 1 completada')).toBeInTheDocument()
    expect(screen.getByText('En curso')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
