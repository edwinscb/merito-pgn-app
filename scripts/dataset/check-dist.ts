import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { projectRoot } from './core.js'
import { SourcesFileSchema } from '../../src/domain/dataset/contracts.js'

const distRoot = resolve(projectRoot, 'dist')
const forbiddenPathParts = ['dataset/raw', '01_perfil', '04_analisis', '05_postulacion']
const forbiddenDocumentExtensions = new Set(['.csv', '.doc', '.docx', '.md', '.pdf'])

async function listFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const groups = await Promise.all(entries.map((entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? listFiles(path) : [path]
  }))
  return groups.flat()
}

export function inspectArtifact(relativePath: string, bytes: Buffer, sourceHashes: Set<string>): string[] {
  const violations: string[] = []
  const normalizedPath = relativePath.toLocaleLowerCase('es')
  if (forbiddenPathParts.some((part) => normalizedPath.includes(part))) {
    violations.push(`${relativePath}: ruta sensible`)
  }
  if (forbiddenDocumentExtensions.has(extname(relativePath).toLocaleLowerCase('es'))) {
    violations.push(`${relativePath}: documento fuente no permitido`)
  }
  if (sourceHashes.has(createHash('sha256').update(bytes).digest('hex'))) {
    violations.push(`${relativePath}: copia completa de una fuente inventariada`)
  }
  const content = bytes.toString('utf8')
  if (forbiddenPathParts.some((part) => content.toLocaleLowerCase('es').includes(part))) {
    violations.push(`${relativePath}: referencia sensible embebida`)
  }
  return violations
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const sources = SourcesFileSchema.parse(JSON.parse(await readFile(resolve(projectRoot, 'dataset/content/sources.json'), 'utf8')))
  const sourceHashes = new Set(sources.flatMap((source) => source.contentHash ? [source.contentHash] : []))
  const violations: string[] = []
  for (const file of await listFiles(distRoot)) {
    violations.push(...inspectArtifact(relative(distRoot, file).replaceAll('\\', '/'), await readFile(file), sourceHashes))
  }
  if (violations.length > 0) {
    console.error(`Validación de privacidad de dist fallida:\n- ${violations.join('\n- ')}`)
    process.exitCode = 1
  } else {
    console.log('Privacidad de dist validada: no contiene dataset/raw ni documentos fuente.')
  }
}
