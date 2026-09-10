import { describe, expect, it } from 'vitest'
import { RegistrationSchema, registrationState, colombiaDate } from '../src/domain/registration'
import raw from '../dataset/content/registration.json'
const registration = RegistrationSchema.parse(raw)
describe('inscripción con instantes absolutos', () => {
  it('distingue antes de apertura, ventana, cierre exacto y después', () => {
    expect(registrationState(registration, Date.parse('2026-09-07T07:59:59-05:00')).status).toBe('upcoming')
    expect(registrationState(registration, Date.parse(registration.opensAt!)).status).toBe('open')
    expect(registrationState(registration, Date.parse('2026-09-18T15:59:59-05:00'))).toEqual({ status: 'open', minutes: 1 })
    expect(registrationState(registration, Date.parse(registration.closesAt!))).toEqual({ status: 'closed', minutes: 0 })
    expect(registrationState(registration, Date.parse('2027-01-01T00:00:00Z'))).toEqual({ status: 'closed', minutes: 0 })
  })
  it('no depende de la zona del teléfono ni inventa fechas no confirmadas', () => {
    expect(registrationState(registration, Date.parse('2026-09-18T23:00:00+02:00')).status).toBe('closed')
    expect(colombiaDate(registration.closesAt!)).toContain('16:00')
    expect(registrationState({ ...registration, confirmed: false }, Date.now()).status).toBe('unknown')
    expect(registrationState(undefined, Date.now()).status).toBe('unknown')
    expect(RegistrationSchema.safeParse({ ...registration, evidenceUrl: null }).success).toBe(false)
    expect(RegistrationSchema.safeParse({ ...registration, closesAt: registration.opensAt }).success).toBe(false)
  })
})
