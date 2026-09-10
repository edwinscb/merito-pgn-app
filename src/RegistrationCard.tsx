import { colombiaDate, registrationState, type Registration } from './domain/registration'
export function RegistrationCard({ registration: r, now }: { registration?: Registration; now: number }) {
  const state = registrationState(r, now)
  return <section className="panel registration" aria-label="Inscripciones al concurso">
    <h2>Cierre de inscripciones</h2>
    <p className="registration-time">{state.status === 'unknown' ? 'Consulta el cronograma oficial' :
      state.status === 'closed' ? 'Inscripciones cerradas' : state.status === 'upcoming' ? 'Inscripciones aún no abiertas' :
      `${Math.floor(state.minutes / 1440)} días · ${Math.floor(state.minutes % 1440 / 60)} horas · ${state.minutes % 60} minutos`}</p>
    {r?.confirmed && r.closesAt && <p>{colombiaDate(r.closesAt)} (hora de Colombia).</p>}
    {state.status === 'upcoming' && r?.opensAt && <p>Apertura: {colombiaDate(r.opensAt)}.</p>}
    <a href={r?.portalUrl ?? 'https://meritoconstruyendoexcelencia.com.co/'} target="_blank" rel="noreferrer">Ir al portal oficial ↗</a>
    {r && <details><summary>Fuente y condiciones</summary><p>{r.paymentNote}</p>
      {r.evidenceUrl && <a href={r.evidenceUrl} target="_blank" rel="noreferrer">Consultar resolución</a>}
      <p>Comprobado: {r.checkedAt ?? 'pendiente'}. Sin conexión se usa el último cronograma descargado; los cambios del organizador no se consultan automáticamente.</p>
    </details>}
  </section>
}
