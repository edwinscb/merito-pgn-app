import { formatIssues, validateRepositoryDataset } from './core.js'

const result = await validateRepositoryDataset()

if (result.issues.length > 0) {
  console.error(`Dataset inválido (${result.issues.length} errores):\n${formatIssues(result.issues)}`)
  process.exitCode = 1
} else {
  console.log(`Dataset válido: ${result.data?.sources.length ?? 0} fuentes, ${result.data?.sourceUnits.length ?? 0} unidades y ${result.data?.questions.length ?? 0} preguntas.`)
}
