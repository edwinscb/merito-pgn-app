// Mide las pistas de forma que delatan la respuesta en las preguntas del temario
// del perfil 126-2026 y escribe el orden de los lotes de corrección. Lee el banco
// publicado porque es lo que estudia el usuario. La salida es determinista.
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../..')
const PROFILE = '126-2026'
// Umbral de cierre de cada lote: al azar la correcta sería la más larga ~25 %.
const MAX_LONGEST = 0.3
const ABSOLUTE = /(?<!\p{L})(siempre|nunca|jam[aá]s|s[oó]lo|[uú]nicamente|exclusivamente|todos|todas|ninguno|ninguna|autom[aá]tic[oa]s?|autom[aá]ticamente|universal(es)?)(?!\p{L})/iu

const bank = JSON.parse(await readFile(resolve(root, 'public/data/study-bank.json'), 'utf8'))
const profile = bank.examProfiles.find((p) => p.id === PROFILE)
const weights = profile.topicDistribution.filter((t) => t.weight > 0).sort((a, b) => b.weight - a.weight || a.topicId.localeCompare(b.topicId))
const label = (id) => bank.topics.find((t) => t.id === id)?.label ?? id

function cluesOf(question) {
  const correct = question.options.find((o) => o.id === question.correctOptionId)
  const others = question.options.filter((o) => o !== correct)
  const longest = correct.text.length >= Math.max(...others.map((o) => o.text.length))
  // Pista absoluta: algún distractor la usa y la correcta no, así se descarta por forma.
  const absolute = !ABSOLUTE.test(correct.text) && others.some((o) => ABSOLUTE.test(o.text))
  return { longest, absolute }
}

const rows = weights.map(({ topicId, weight }) => {
  const questions = bank.questions.filter((q) => q.topicId === topicId).sort((a, b) => a.id.localeCompare(b.id))
  const marked = questions.map((q) => ({ id: q.id, ...cluesOf(q) }))
  const longest = marked.filter((m) => m.longest).length
  const absolute = marked.filter((m) => m.absolute).length
  const affected = marked.filter((m) => m.longest || m.absolute)
  return { topicId, weight, total: questions.length, longest, absolute, affected }
})

const pct = (n, d) => (d ? `${Math.round((n / d) * 100)} %` : '—')
const total = rows.reduce((s, r) => s + r.total, 0)
const sum = (k) => rows.reduce((s, r) => s + (Array.isArray(r[k]) ? r[k].length : r[k]), 0)

const lines = [
  '# Pistas de forma en las preguntas del temario',
  '',
  `Generado por \`npm run dataset:pistas\` sobre \`public/data/study-bank.json\`, perfil ${PROFILE}.`,
  '',
  'Qué se mide:',
  '- **Más larga:** la opción correcta es igual o más larga que todos los distractores. Al azar pasaría en ~25 % de las preguntas.',
  '- **Absoluta:** algún distractor usa una palabra absoluta (siempre, nunca, solo, todos, automático…) y la correcta no.',
  '',
  `Criterio de cierre de cada lote: la correcta es la más larga en ${Math.round(MAX_LONGEST * 100)} % o menos de sus preguntas, y las palabras absolutas quedan repartidas entre correctas y distractores.`,
  '',
  '## Resumen',
  '',
  `- Preguntas del temario: ${total}`,
  `- Correcta más larga: ${sum('longest')} (${pct(sum('longest'), total)})`,
  `- Pista absoluta: ${sum('absolute')} (${pct(sum('absolute'), total)})`,
  `- Afectadas por al menos una: ${sum('affected')}`,
  '',
  '## Lotes, del tema de más peso al de menos',
  '',
  '| Lote | Tema | Peso | Preguntas | Más larga | Absoluta | Afectadas |',
  '| ---: | --- | ---: | ---: | ---: | ---: | ---: |',
  ...rows.map((r, i) => `| ${i + 1} | ${label(r.topicId)} | ${r.weight.toFixed(4)} | ${r.total} | ${r.longest} (${pct(r.longest, r.total)}) | ${r.absolute} | ${r.affected.length} |`),
  '',
  '## Preguntas por lote',
  '',
  ...rows.flatMap((r, i) => [
    `### Lote ${i + 1}: ${label(r.topicId)}`,
    '',
    ...r.affected.map((m) => `- ${m.id}: ${[m.longest && 'más larga', m.absolute && 'absoluta'].filter(Boolean).join(', ')}`),
    '',
  ]),
]

await writeFile(resolve(root, 'dataset/reports/pistas-temario.md'), lines.join('\n'))
console.log(`Pistas: ${sum('affected')} de ${total} preguntas del temario afectadas en ${rows.length} lotes.`)
