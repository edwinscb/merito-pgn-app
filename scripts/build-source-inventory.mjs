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
    notes: 'Las fases 0 y 1 están implementadas y la Fase 2 se encuentra en curso.'
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
  },
  {
    id: 'colombia-constitution-1991',
    title: 'Constitución Política de Colombia',
    category: 'official-general-law',
    sourcePath: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4125',
    targetPath: 'dataset/raw/official/normatividad/fase2/constitucion_politica_1991_funcion_publica.pdf',
    mimeType: 'application/pdf',
    status: 'verified',
    url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=4125',
    notes: 'Copia oficial de Función Pública; artículos 118, 209 y 275 revisados visualmente para el lote piloto.'
  },
  {
    id: 'decree-law-262-2000',
    title: 'Decreto Ley 262 de 2000',
    category: 'official-general-law',
    sourcePath: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=40618',
    targetPath: 'dataset/raw/official/normatividad/fase2/decreto_ley_262_2000_funcion_publica.pdf',
    mimeType: 'application/pdf',
    status: 'verified',
    url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=40618',
    notes: 'Copia oficial de Función Pública; artículos 7 y 23 revisados visualmente para el lote piloto.'
  },
  {
    id: 'law-1437-2011',
    title: 'Ley 1437 de 2011',
    category: 'official-general-law',
    sourcePath: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=41249',
    targetPath: 'dataset/raw/official/normatividad/fase2/ley_1437_2011_funcion_publica.pdf',
    mimeType: 'application/pdf',
    status: 'verified',
    url: 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=41249',
    notes: 'Copia oficial de Función Pública; artículos 11 y 12 revisados visualmente para el lote piloto.'
  },
  {
    id: 'pgn-bulletin-107-2026-preventive-function',
    title: 'Boletín 107 de 2026 sobre función preventiva',
    category: 'official-institutional-content',
    sourcePath: 'https://www.procuraduria.gov.co/Pages/procuraduria-vigila-cumplimiento-ley-fortalece-convivencia-paz-municipios.aspx',
    targetPath: 'dataset/raw/official/normatividad/fase2/boletin_107_2026_funcion_preventiva.html',
    mimeType: 'text/html',
    status: 'verified',
    url: 'https://www.procuraduria.gov.co/Pages/procuraduria-vigila-cumplimiento-ley-fortalece-convivencia-paz-municipios.aspx',
    notes: 'Boletín oficial del 6 de febrero de 2026; ejemplo contextual de seguimiento a la Ley 2492. No respalda la definición general originalmente atribuida a su unidad; ver auditoría factual del piloto.'
  }
]

// Fuentes estructuradas incorporadas durante la revisión de la Fase 2.
// Se mantienen separadas del inventario heredado para conservar su paridad histórica.
const phase2Sources = [
  ['pgn-functions-general', 'Funciones misionales generales de la Procuraduría', 'official-institutional-content', 'Procuraduría General de la Nación', 'B', 'https://www.procuraduria.gov.co/procuraduria/conozca-entidad/Pages/objetivos-funciones.aspx', 'pgn-functions.html', 'text/html', 'needs_review', 'Contenido institucional general; sirve para clasificación y alcance, no sustituye una ficha de cargo.'],
  ['law-1755-2015', 'Ley 1755 de 2015 — derecho de petición', 'official-general-law', 'Departamento Administrativo de la Función Pública', 'B', 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=65334', 'norm-ley1755-2015.html', 'text/html', 'needs_review', 'Copia oficial consultada para contenido, competencia, términos y reserva; vigencia específica debe revisarse al publicar.'],
  ['law-1712-2014', 'Ley 1712 de 2014 — transparencia y acceso', 'official-general-law', 'Departamento Administrativo de la Función Pública', 'B', 'https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=56882', 'norm-ley1712-2014.html', 'text/html', 'needs_review', 'Copia oficial consultada para versión pública y acceso parcial.'],
  ['decree-1080-2015-archives', 'Decreto 1080 de 2015 — gestión documental', 'official-general-law', 'Colombia Compra Eficiente', 'B', 'https://relatoria.colombiacompra.gov.co/normativa/decreto-1080-de-2015/', 'norm-decreto1080-2015.html', 'text/html', 'needs_review', 'Compilación consultada para clasificación, metadatos, seguimiento y disposición; verificar reformas antes de publicar.'],
  ['minvivienda-phva-methodology', 'Metodología de indicadores de gestión y ciclo PHVA', 'official-institutional-guidance', 'Ministerio de Vivienda', 'B', 'https://www.minvivienda.gov.co/sites/default/files/procesos/pef-i-03-metodologia-de-indicadores-de-gestion-3.0.pdf', 'norm-phva-minvivienda.pdf', 'application/pdf', 'needs_review', 'Guía institucional 2019; respaldo conceptual, no se afirma vigencia general para PGN.'],
  ['law-80-1993', 'Ley 80 de 1993 — principios de contratación estatal', 'official-general-law', 'Departamento Administrativo de la Función Pública', 'B', 'https://www1.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=304', 'norm-ley80-1993.html', 'text/html', 'needs_review', 'Copia oficial consultada para planeación contractual; revisar reformas y régimen aplicable.'],
  ['funcion-publica-indicators', 'Lineamientos de indicadores de seguimiento institucional', 'official-institutional-guidance', 'Departamento Administrativo de la Función Pública', 'B', 'https://www.funcionpublica.gov.co/mipg/seguimiento-evaluacion-y-control-integral', 'norm-indicadores.html', 'text/html', 'needs_review', 'Lineamiento web consultado para campos mínimos de un indicador.'],
  ['nist-correlation', 'NIST Engineering Statistics Handbook — correlation and causation', 'official-technical-guidance', 'National Institute of Standards and Technology', 'B', 'https://www.itl.nist.gov/div898/handbook/ppc/section1/ppc136.htm', 'nist-correlation.html', 'text/html', 'needs_review', 'Referencia técnica conceptual; no es norma colombiana ni temario oficial PGN.'],
  ['cdc-data-analysis', 'CDC Field Epidemiology Manual — analysis and interpretation', 'official-technical-guidance', 'Centers for Disease Control and Prevention', 'B', 'https://www.cdc.gov/field-epi-manual/php/chapters/analyze-interpret-data.html', 'cdc-data-analysis.html', 'text/html', 'needs_review', 'Referencia técnica conceptual para sesgos y descripción de datos.'],
  ['missouri-db-integrity', 'Database Management Systems — Referential Integrity', 'official-technical-guidance', 'Missouri Office of Administration', 'B', 'https://oa.mo.gov/sites/default/files/CC-DBMSIntegrityARC.pdf', 'missouri-db-integrity.pdf', 'application/pdf', 'needs_review', 'Guía técnica gubernamental histórica; no se presenta como requisito normativo colombiano.'],
  ['nist-acid', 'NIST — atomicity in relational and NoSQL tradeoffs', 'official-technical-guidance', 'National Institute of Standards and Technology', 'B', 'https://csrc.nist.gov/csrc/media/projects/forum/documents/2012/fcsm_june2012_cooper_mell.pdf', 'nist-acid.pdf', 'application/pdf', 'needs_review', 'Material técnico conceptual de 2012; se limita a la definición de atomicidad.'],
  ['nist-least-privilege', 'NIST glossary — least privilege', 'official-technical-guidance', 'National Institute of Standards and Technology', 'B', 'https://csrc.nist.gov/glossary/term/least_privilege', 'nist-least-privilege.html', 'text/html', 'needs_review', 'Definición técnica conceptual de mínimo privilegio.'],
  ['ncsc-cloud-security', 'NCSC — using a cloud platform securely', 'official-technical-guidance', 'National Cyber Security Centre (UK)', 'B', 'https://www.ncsc.gov.uk/collection/cloud/using-cloud-services-securely/using-a-cloud-platform-securely', 'ncsc-cloud-security.html', 'text/html', 'needs_review', 'Guía técnica oficial extranjera; no es norma PGN.'],
  ['homeoffice-api', 'Home Office API standard — design and maintenance', 'official-technical-guidance', 'UK Home Office', 'B', 'https://engineering.homeoffice.gov.uk/standards/designing-and-maintaining-an-api/', 'homeoffice-api.html', 'text/html', 'needs_review', 'Estándar técnico oficial extranjero para versionado, documentación y pruebas.'],
  ['cisa-ransomware', 'CISA StopRansomware Guide', 'official-technical-guidance', 'Cybersecurity and Infrastructure Security Agency', 'B', 'https://www.cisa.gov/stopransomware/ransomware-guide', 'cisa-ransomware.html', 'text/html', 'needs_review', 'Guía de respuesta a ransomware; la pregunta se limita a contención, evidencia y procedimiento.'],
  ['decreto-815-2018', 'Decreto 815 de 2018 — competencias comportamentales', 'official-general-law', 'Departamento Administrativo de la Función Pública', 'B', 'https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=86304', 'norm-decreto815-2018.html', 'text/html', 'needs_review', 'Referencia general de competencias; no certifica aplicación a una convocatoria concreta.'],
  ['codigo-integridad', 'Código de Integridad del Servicio Público', 'official-institutional-guidance', 'Departamento Administrativo de la Función Pública', 'B', 'https://www.funcionpublica.gov.co/web/eva/codigo-integridad', 'norm-integridad.html', 'text/html', 'needs_review', 'Guía ética general para racionales conductuales.'],
  ['law-1952-2019', 'Ley 1952 de 2019 — Código General Disciplinario', 'official-general-law', 'Ministerio de Relaciones Exteriores', 'B', 'https://cancilleria.gov.co/normograma/compilacion/docs/ley_1952_2019.htm', 'norm-ley1952-2019.html', 'text/html', 'needs_review', 'Copia de compilación normativa consultada para deberes de legalidad y diligencia.'],
  ['dnp-public-innovation', 'Principios de la innovación pública en Colombia', 'official-institutional-guidance', 'Departamento Nacional de Planeación', 'B', 'https://colaboracion.dnp.gov.co/CDT/ModernizacionEstado/EiP/Principios_Innovaci%C3%B3n_P%C3%BAblica.pdf', 'norm-innovacion-dnp.pdf', 'application/pdf', 'needs_review', 'Guía conceptual para problema, usuarios, exploración y pilotos; no es temario de convocatoria.']
  ,['pgn-resolution-212-2026', 'Resolución 212 de 2026 — modificación de convocatorias', 'official-call-amendment', 'Procuraduría General de la Nación', 'A', 'https://www.procuraduria.gov.co/Documents/2026/Concurso-de-meritos/', 'resolucion-212-2026.pdf', 'application/pdf', 'needs_review', 'Acto del 6 de agosto de 2026 que modifica expresamente las convocatorias 121, 126 y 127, entre otras; requiere consolidar las fichas resultantes.']
  ,['pgn-resolution-243-2026', 'Resolución 243 de 2026 — modificación judicial', 'official-call-amendment', 'Procuraduría General de la Nación', 'A', 'https://www.procuraduria.gov.co/Documents/2026/Concurso-de-meritos/', 'resolucion-243-2026.pdf', 'application/pdf', 'needs_review', 'Acto posterior consultado; no se encontró en su artículo 6 una modificación específica de 121, 126 o 127.']
].map(([id, title, category, publisher, authorityTier, url, filename, mimeType, status, notes]) => ({
  id, title, category, publisher, authorityTier, url,
  sourcePath: url, targetPath: `dataset/raw/official/fase2-completion/${filename}`,
  mimeType, status, notes
}))

const callSheetSources = ['121', '126', '127'].map((code) => ({
  id: `pgn-call-${code}-2026-v3`,
  title: `Convocatoria ${code}-2026 — versión 3`,
  category: 'official-call-sheet-current',
  sourcePath: `https://meritoconstruyendoexcelencia.com.co/statics/convocatorias/${code}-2026/view.pdf`,
  targetPath: `dataset/raw/official/convocatorias/${code}-2026-v3.pdf`,
  mimeType: 'application/pdf',
  status: 'verified',
  url: `https://meritoconstruyendoexcelencia.com.co/statics/convocatorias/${code}-2026/view.pdf`,
  notes: 'Ficha oficial versión 3 visible en el portal del concurso y vinculada a la Resolución 212 de 2026; se cotejaron conocimientos, funciones, competencias y pruebas.'
}))

const pendingSources = [
  ['pgn-resolution-108-2026', 'Resolución 108 de 2026', 'https://meritoconstruyendoexcelencia.com.co/statics/normativas_especificas/RESOLUCION%20108%20DE%2023%20DE%20ABRIL%20DE%202026.pdf'],
  ['pgn-resolution-133-2026', 'Resolución 133 de 2026', 'https://meritoconstruyendoexcelencia.com.co/statics/normativas_especificas/RESOLUCIO%CC%81N%20No.%20133%20(20%20MAYO%202026).pdf'],
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

for (const source of [...localSources, ...phase2Sources, ...callSheetSources]) {
  const content = await readFile(resolve(projectRoot, source.targetPath))
  inventory.push({
    ...source,
    sha256: createHash('sha256').update(content).digest('hex'),
    incorporatedAt,
    public: false
  })
}

inventory.push(...pendingSources)

const finalVerifiedIds = new Set([
  'pgn-functions-general', 'law-1712-2014', 'decree-1080-2015-archives',
  'minvivienda-phva-methodology', 'funcion-publica-indicators',
  'nist-correlation', 'cdc-data-analysis', 'missouri-db-integrity',
  'nist-acid', 'nist-least-privilege', 'ncsc-cloud-security',
  'homeoffice-api', 'cisa-ransomware'
])
for (const source of inventory) {
  if (finalVerifiedIds.has(source.id)) {
    source.status = 'verified'
    source.notes += ' Revisión factual final de la pregunta asociada cotejada el 2026-09-07.'
  }
}

const outputPath = resolve(projectRoot, 'dataset/catalog/source-inventory.json')
await writeFile(outputPath, `${JSON.stringify(inventory, null, 2)}\n`, 'utf8')

console.log(`Inventario generado: ${inventory.length} registros (${localSources.length} archivos locales).`)
