import { createHash } from 'node:crypto'

// Vincula todo el contenido revisable, incluida aplicabilidad y racionales.
export function questionFingerprint(question) {
  const { status, reviews, validFrom, ...content } = question
  const canonical = (value) => Array.isArray(value)
    ? value.map(canonical)
    : value && typeof value === 'object'
      ? Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonical(value[key])]))
      : value
  return createHash('sha256').update(JSON.stringify(canonical(content))).digest('hex')
}
