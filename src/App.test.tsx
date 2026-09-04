import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('presenta la fase documental sin habilitar funciones futuras', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: /una base confiable/i })).toBeInTheDocument()
    expect(screen.getByText('Dataset en preparación')).toBeInTheDocument()
    expect(screen.getByText('25')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
