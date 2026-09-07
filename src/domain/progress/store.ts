import { ProgressExportSchema, type Attempt, type ProgressExport } from '../dataset/contracts.js'

const DB_NAME = 'merito-pgn-progress'
const STORE_NAME = 'attempts'
const APP_VERSION = '0.1.0'
type StoredAttempt = Attempt & { key: string }
let memoryAttempts: Attempt[] = []
const keyFor = (attempt: Attempt) => `${attempt.questionId}|${attempt.attemptedAt}|${attempt.mode}`
const browserIndexedDb = () => (globalThis as { indexedDB?: any }).indexedDB
const hasIndexedDb = () => Boolean(browserIndexedDb())
function openDatabase(): Promise<any> { return new Promise((resolve, reject) => { const request = browserIndexedDb().open(DB_NAME, 1); request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: 'key' }); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB.')) }) }
export async function loadAttempts(): Promise<Attempt[]> {
  if (!hasIndexedDb()) return [...memoryAttempts]
  try { const db = await openDatabase(); return await new Promise((resolve, reject) => { const request = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll(); request.onsuccess = () => resolve((request.result as StoredAttempt[]).map(({ key: _key, ...attempt }) => attempt)); request.onerror = () => reject(request.error) }) } catch { return [...memoryAttempts] }
}
export async function saveAttempt(attempt: Attempt): Promise<void> {
  memoryAttempts = [...memoryAttempts.filter((item) => keyFor(item) !== keyFor(attempt)), attempt]
  if (!hasIndexedDb()) return
  try { const db = await openDatabase(); await new Promise<void>((resolve, reject) => { const request = db.transaction(STORE_NAME, 'readwrite').objectStore(STORE_NAME).put({ ...attempt, key: keyFor(attempt) }); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error) }) } catch { /* fallback en memoria */ }
}
export async function replaceAttempts(attempts: Attempt[]): Promise<void> {
  memoryAttempts = [...attempts]
  if (!hasIndexedDb()) return
  try { const db = await openDatabase(); await new Promise<void>((resolve, reject) => { const transaction = db.transaction(STORE_NAME, 'readwrite'); const store = transaction.objectStore(STORE_NAME); store.clear(); attempts.forEach((attempt) => store.put({ ...attempt, key: keyFor(attempt) })); transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error) }) } catch { /* fallback en memoria */ }
}
export function createProgressExport(attempts: Attempt[]): ProgressExport { return ProgressExportSchema.parse({ schemaVersion: 1, exportedAt: new Date().toISOString(), appVersion: APP_VERSION, attempts }) }
export function parseProgressExport(text: string): ProgressExport { let value: unknown; try { value = JSON.parse(text) } catch { throw new Error('El archivo no contiene JSON válido.') }; const result = ProgressExportSchema.safeParse(value); if (!result.success) throw new Error(`Exportación inválida: ${result.error.issues[0]?.message ?? 'contrato no válido'}`); return result.data }
