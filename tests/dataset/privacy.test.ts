import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { inspectArtifact } from '../../scripts/dataset/check-dist.js'

describe('privacidad del artefacto web', () => {
  it('rechaza fuentes HTML completas aunque se renombren', () => {
    const content = Buffer.from('<html>Documento oficial de prueba</html>')
    const hashes = new Set([createHash('sha256').update(content).digest('hex')])
    expect(inspectArtifact('assets/renamed.html', content, hashes).join(' ')).toContain('copia completa')
    expect(inspectArtifact('assets/renamed.bin', content, hashes).join(' ')).toContain('copia completa')
  })

  it('rechaza documentos y rutas sensibles en nombres y contenido', () => {
    expect(inspectArtifact('manual.pdf', Buffer.from('fixture'), new Set())).not.toEqual([])
    for (const forbidden of ['dataset/raw', '01_perfil', '04_analisis', '05_postulacion']) {
      expect(inspectArtifact(`${forbidden}/x.json`, Buffer.from('{}'), new Set())).not.toEqual([])
      expect(inspectArtifact('assets/app.js', Buffer.from(forbidden), new Set())).not.toEqual([])
    }
  })

  it('permite HTML de la aplicación y banco vacío sin fuentes completas', () => {
    expect(inspectArtifact('index.html', Buffer.from('<html>App</html>'), new Set())).toEqual([])
    expect(inspectArtifact('data/question-bank.json', Buffer.from('{"schemaVersion":1,"questions":[]}'), new Set())).toEqual([])
  })
})
