import { colombiaDate, registrationState, type Registration } from './domain/registration'
// Registro del cierre de inscripciones. Ya no cuenta el tiempo restante: la
// ventana cerro el 18 de septiembre de 2026 y una cuenta atras solo podria
// mostrar ceros. Se conserva el estado, la fecha y la evidencia normativa,
// que son registro editorial del proyecto.
export function RegistrationCard({ registration: r, now }: { registration?: Registration; now: number }) {
  const state = registrationState(r, now)
  const label =
    state.status === 'unknown' ? 'Consulta el cronograma oficial' :
    state.status === 'closed' ? 'Inscripciones cerradas' :
    state.status === 'upcoming' ? 'Inscripciones aún no abiertas' : 'Inscripciones abiertas'
  return <section className="panel registration" aria-label="Inscripciones al concurso">
    <h2>Cierre de inscripciones</h2>
    <p className="registration-time">{label}</p>
    {r?.confirmed && r.closesAt && <p>{colombiaDate(r.closesAt)} (hora de Colombia).</p>}
    {state.status === 'upcoming' && r?.opensAt && <p>Apertura: {colombiaDate(r.opensAt)}.</p>}
    <a href={r?.portalUrl ?? 'https://meritoconstruyendoexcelencia.com.co/'} target="_blank" rel="noreferrer">Ir al portal oficial ↗</a>
    {r && <details><summary>Fuente y condiciones</summary><p>{r.paymentNote}</p>
      {r.evidenceUrl && <a href={r.evidenceUrl} target="_blank" rel="noreferrer">Consultar resolución</a>}
      <p>Comprobado: {r.checkedAt ?? 'pendiente'}. Sin conexión se usa el último cronograma descargado; los cambios del organizador no se consultan automáticamente.</p>
    </details>}
  </section>
}
