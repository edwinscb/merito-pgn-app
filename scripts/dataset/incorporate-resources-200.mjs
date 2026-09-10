import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { resources200 } from './resources-200.mjs'
const root = new URL('../../', import.meta.url)
const read = async p => JSON.parse(await readFile(new URL(p, root), 'utf8'))
const sources = await read('dataset/content/sources.json')
await mkdir(new URL('dataset/raw/official/study-200/', root), { recursive: true })
for (const [id, title, publisher, url, name, mimeType] of resources200) {
  const localPath = `dataset/raw/official/study-200/${name}`
  let bytes
  try { bytes = await readFile(new URL(localPath, root)) } catch {
    const response = await fetch(url)
    if (!response.ok) throw Error(`${id}: HTTP ${response.status}`)
    bytes = Buffer.from(await response.arrayBuffer())
    if (mimeType === 'application/pdf' && bytes.subarray(0, 5).toString() !== '%PDF-') throw Error(`${id}: no es PDF`)
    await writeFile(new URL(localPath, root), bytes)
  }
  const record = { id, title, publisher, url, localPath, mimeType, contentHash: createHash('sha256').update(bytes).digest('hex'),
    category: id === 'pgn-historical-guide' ? 'historical-exam-guide' : 'official-technical-guidance', authorityTier: 'B',
    sourcePath: null, incorporatedAt: '2026-09-10', publishedAt: null, version: null, validity: 'unknown', status: 'needs_review',
    redistribution: 'internal_only', public: false,
    notes: id === 'pgn-historical-guide' ? 'Guía histórica 2012–2013: formato orientativo, no normativa ni ponderación vigente. No se reproducen preguntas.' : 'Documentación primaria consultada para ejercicios originales. No constituye temario oficial PGN; pendiente de revisión editorial independiente.' }
  const index = sources.findIndex(s => s.id === id)
  if (index < 0) sources.push(record)
  else if (sources[index].contentHash !== record.contentHash) throw Error(`La copia de ${id} cambió; revisar manualmente.`)
}
await writeFile(new URL('dataset/content/sources.json', root), JSON.stringify(sources, null, 2) + '\n')
console.log('Recursos incorporados sin alterar fuentes anteriores.')
