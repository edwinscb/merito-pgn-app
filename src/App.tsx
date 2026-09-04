const milestones = [
  { label: 'Fase 0', detail: 'Base y documentación', status: 'Lista' },
  { label: 'Fase 1', detail: 'Contratos del dataset', status: 'Pendiente' },
  { label: 'Fase 2', detail: 'Banco validado', status: 'Pendiente' },
]

function App() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Ir al inicio de Mérito PGN">
          <span className="brand-mark" aria-hidden="true">M</span>
          <span>Mérito PGN</span>
        </a>
        <span className="phase-badge">Fase 0</span>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Concurso PGN 2026 · preparación personal</p>
          <h1>Una base confiable antes de empezar a practicar.</h1>
          <p className="lede">
            La estructura del aplicativo y su dataset documental ya están en
            preparación. Las funciones de práctica se habilitarán en una fase posterior.
          </p>
        </div>

        <aside className="status-card" aria-label="Estado de preparación">
          <p className="status-label">Estado actual</p>
          <strong>Dataset en preparación</strong>
          <div className="status-rule" />
          <dl>
            <div><dt>Documentos incorporados</dt><dd>11</dd></div>
            <div><dt>Preguntas semilla</dt><dd>25</dd></div>
            <div><dt>Datos personales</dt><dd>0</dd></div>
          </dl>
        </aside>
      </section>

      <section className="milestones" aria-labelledby="roadmap-title">
        <div>
          <p className="eyebrow">Ruta de construcción</p>
          <h2 id="roadmap-title">Primero evidencia, después entrenamiento.</h2>
        </div>
        <ol>
          {milestones.map((milestone) => (
            <li key={milestone.label} className={milestone.status === 'Lista' ? 'complete' : ''}>
              <span className="step-dot" aria-hidden="true" />
              <div>
                <span className="step-label">{milestone.label}</span>
                <p>{milestone.detail}</p>
              </div>
              <span className="step-status">{milestone.status}</span>
            </li>
          ))}
        </ol>
      </section>

      <footer>
        <p>Contenido de estudio no oficial. Toda pregunta futura deberá conservar su fuente.</p>
      </footer>
    </main>
  )
}

export default App
