import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const incorporatedAt = '2026-09-03'

const localSources = [
  {
    id: 'normative-source-registry',
    title: 'Registro de normas del Concurso PGN 2026',
    category: 'official-source-registry',
    sourcePath: '02_fuentes_oficiales/normatividad/registro_normas.csv',
    targetPath: 'dataset/raw/official/normatividad/registro_normas.csv',
    mimeType: 'text/csv',
    status: 'copied_pending_review',
    notes: 'Registro heredado; varias descargas y verificaciones siguen pendientes.'
  },
  {
    id: 'normative-source-index',
    title: 'Índice de normatividad del Concurso PGN 2026',
    category: 'official-source-registry',
    sourcePath: '02_fuentes_oficiales/normatividad/indice.md',
    targetPath: 'dataset/raw/official/normatividad/indice.md',
    mimeType: 'text/markdown',
    status: 'copied_pending_review',
    notes: 'Índice de trabajo; no sustituye los documentos oficiales.'
  },
  {
    id: 'pgn-resolution-076-2026',
    title: 'Resolución 076 de 2026',
    category: 'official-regulation',
    sourcePath: '02_fuentes_oficiales/normatividad/pdf/resolucion_076_2026.pdf',
    targetPath: 'dataset/raw/official/normatividad/resolucion_076_2026.pdf',
    mimeType: 'application/pdf',
    status: 'copied_pending_review',
    notes: 'PDF disponible; la revisión visual integral sigue pendiente.'
  },
  {
    id: 'pgn-calls-compilation-vr03',
    title: 'Compilado de convocatorias VR03 del 28 de abril de 2026',
    category: 'official-calls',
    sourcePath: '03_convocatorias/pdf/COMPILADO_CONVOCATORIAS_VR03_28042026.pdf',
    targetPath: 'dataset/raw/official/convocatorias/COMPILADO_CONVOCATORIAS_VR03_28042026.pdf',
    mimeType: 'application/pdf',
    status: 'copied_pending_review',
    notes: 'Conservar como compilado histórico y contrastar con modificaciones posteriores.'
  },
  ...['121', '126', '127'].map((code) => ({
    id: `pgn-call-${code}-2026`,
    title: `Convocatoria ${code}-2026`,
    category: 'official-call-sheet',
    sourcePath: `03_convocatorias/pdf/${code}-2026.pdf`,
    targetPath: `dataset/raw/official/convocatorias/${code}-2026.pdf`,
    mimeType: 'application/pdf',
    status: 'copied_pending_review',
    notes: 'Ficha de referencia para conocimientos, funciones y requisitos.'
  })),
  {
    id: 'pgn-initial-diagnostic',
    title: 'Diagnóstico inicial transversal de 25 preguntas',
    category: 'question-seed',
    sourcePath: '06_preparacion/diagnostico_inicial.md',
    targetPath: 'dataset/raw/seed/diagnostico_inicial.md',
    mimeType: 'text/markdown',
    status: 'seed_unapproved',
    notes: 'Material semilla; ninguna pregunta está aprobada o validada en fase 0.'
  },
  {
    id: 'merito-pgn-product-definition',
    title: 'Documentación del aplicativo de estudio PGN',
    category: 'product-reference',
    sourcePath: '06_preparacion/documentacion_aplicativo_estudio_pgn.md',
    targetPath: 'docs/producto.md',
    mimeType: 'text/markdown',
    status: 'reference',
    notes: 'Definición funcional y arquitectura de referencia.'
  },
  {
    id: 'merito-pgn-implementation-plan',
    title: 'Plan de implementación por fases',
    category: 'implementation-reference',
    sourcePath: '06_preparacion/plan_implementacion_por_fases.md',
    targetPath: 'docs/plan_implementacion_por_fases.md',
    mimeType: 'text/markdown',
    status: 'reference',
    notes: 'Las fases 0 y 1 están implementadas; las fases posteriores requieren autorización.'
  },
  {
    id: 'pgn-transversal-study-plan',
    title: 'Plan transversal del Concurso PGN 2026',
    category: 'study-reference',
    sourcePath: '06_preparacion/plan_transversal_concurso_pgn_2026.md',
    targetPath: 'docs/plan_estudio_transversal.md',
    mimeType: 'text/markdown',
    status: 'reference',
    notes: 'Plan de estudio sujeto a la futura guía oficial.'
  }
]

const pendingSources = [
  ['pgn-resolution-108-2026', 'Resolución 108 de 2026', 'https://meritoconstruyendoexcelencia.com.co/statics/normativas_especificas/RESOLUCION%20108%20DE%2023%20DE%20ABRIL%20DE%202026.pdf'],
  ['pgn-resolution-133-2026', 'Resolución 133 de 2026', 'https://meritoconstruyendoexcelencia.com.co/statics/normativas_especificas/RESOLUCIO%CC%81N%20No.%20133%20(20%20MAYO%202026).pdf'],
  ['colombia-constitution-1991', 'Constitución Política de Colombia', 'https://meritoconstruyendoexcelencia.com.co/#/convocatorias/normatividad'],
  ['decree-law-262-2000', 'Decreto Ley 262 de 2000', 'https://meritoconstruyendoexcelencia.com.co/#/convocatorias/normatividad'],
  ['decree-263-2000', 'Decreto 263 de 2000', 'https://meritoconstruyendoexcelencia.com.co/#/convocatorias/normatividad'],
  ['decree-264-2000', 'Decreto 264 de 2000', 'https://meritoconstruyendoexcelencia.com.co/#/convocatorias/normatividad'],
  ['decree-law-265-2000', 'Decreto Ley 265 de 2000', 'https://meritoconstruyendoexcelencia.com.co/#/convocatorias/normatividad'],
  ['decree-1851-2021', 'Decreto 1851 de 2021', 'https://meritoconstruyendoexcelencia.com.co/#/convocatorias/normatividad'],
  ['law-909-2004', 'Ley 909 de 2004', 'https://meritoconstruyendoexcelencia.com.co/#/convocatorias/normatividad'],
  ['pgn-specific-functions-manual', 'Manual Específico de Funciones por Competencias Laborales y Requisitos', 'https://meritoconstruyendoexcelencia.com.co/#/convocatorias/normatividad'],
  ['pgn-resolution-056-2026', 'Resolución 056 de 2026', 'https://meritoconstruyendoexcelencia.com.co/#/convocatorias/normatividad']
].map(([id, title, url]) => ({
  id,
  title,
  category: 'official-source-pending',
  sourcePath: null,
  targetPath: null,
  mimeType: null,
  sha256: null,
  incorporatedAt,
  status: 'pending_download',
  public: false,
  url,
  notes: 'Fuente identificada; no existe una copia local incorporada en la fase 0.'
}))

const inventory = []

for (const source of localSources) {
  const content = await readFile(resolve(projectRoot, source.targetPath))
  inventory.push({
    ...source,
    sha256: createHash('sha256').update(content).digest('hex'),
    incorporatedAt,
    public: false
  })
}

inventory.push(...pendingSources)

const outputPath = resolve(projectRoot, 'dataset/catalog/source-inventory.json')
await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8')

console.log(`Inventario generado: ${inventory.length} registros (${localSources.length} archivos locales).`)
