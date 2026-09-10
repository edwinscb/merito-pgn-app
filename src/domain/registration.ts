import { z } from 'zod'
export const RegistrationSchema = z.object({
  schemaVersion: z.literal(1), confirmed: z.boolean(),
  opensAt: z.string().datetime({ offset: true }).nullable(),
  closesAt: z.string().datetime({ offset: true }).nullable(),
  timeZone: z.literal('America/Bogota'), portalUrl: z.string().url(),
  evidenceUrl: z.string().url().nullable(), checkedAt: z.string().date().nullable(),
  locator: z.string().min(1), paymentNote: z.string(),
}).superRefine((r, ctx) => {
  if (r.confirmed && (!r.opensAt || !r.closesAt || !r.evidenceUrl || !r.checkedAt || Date.parse(r.opensAt) >= Date.parse(r.closesAt)))
    ctx.addIssue({ code: 'custom', message: 'Cronograma confirmado incompleto o incoherente.' })
})
export type Registration = z.infer<typeof RegistrationSchema>
export function registrationState(r: Registration | undefined, now: number) {
  if (!r?.confirmed || !r.opensAt || !r.closesAt) return { status: 'unknown' as const, minutes: 0 }
  if (now < Date.parse(r.opensAt)) return { status: 'upcoming' as const, minutes: 0 }
  const minutes = Math.max(0, Math.ceil((Date.parse(r.closesAt) - now) / 60000))
  return { status: now >= Date.parse(r.closesAt) ? 'closed' as const : 'open' as const, minutes }
}
export const colombiaDate = (date: string) => new Intl.DateTimeFormat('es-CO', {
  timeZone: 'America/Bogota', dateStyle: 'long', timeStyle: 'short', hour12: false,
}).format(new Date(date))
