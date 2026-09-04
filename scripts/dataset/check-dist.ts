import { readFile, readdir } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'
import { projectRoot } from './core.js'

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

const violations: string[] = []
for (const file of await listFiles(distRoot)) {
  const relativePath = relative(distRoot, file).replaceAll('\\', '/')
  const normalizedPath = relativePath.toLocaleLowerCase('es')
  if (forbiddenPathParts.some((part) => normalizedPath.includes(part))) {
    violations.push(`${relativePath}: ruta sensible`)
  }
  if (forbiddenDocumentExtensions.has(extname(file).toLocaleLowerCase('es'))) {
    violations.push(`${relativePath}: documento fuente no permitido`)
  }
  const content = await readFile(file, 'utf8').catch(() => '')
  if (forbiddenPathParts.some((part) => content.toLocaleLowerCase('es').includes(part))) {
    violations.push(`${relativePath}: referencia sensible embebida`)
  }
}

if (violations.length > 0) {
  console.error(`Validación de privacidad de dist fallida:\n- ${violations.join('\n- ')}`)
  process.exitCode = 1
} else {
  console.log('Privacidad de dist validada: no contiene dataset/raw ni documentos fuente.')
}
