// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { IDBFactory } from 'fake-indexeddb'
import { emptyProgress } from '../src/domain/learning.js'

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('indexedDB', new IDBFactory())
})
describe('migración IndexedDB v2', () => {
  it('conserva intentos v1 y persiste marcas nuevas', async () => {
    const attempt = {
      key: 'old',
      questionId: 'q1',
      attemptedAt: '2026-09-07T12:00:00.000Z',
      selectedOptionId: 'A',
      correct: true,
      confidence: 3,
      responseTimeSeconds: 4,
      mode: 'practice',
      examId: null,
    }
    await new Promise<void>((resolve, reject) => {
      const r = indexedDB.open('merito-pgn-progress', 1)
      r.onupgradeneeded = () =>
        r.result.createObjectStore('attempts', { keyPath: 'key' })
      r.onerror = () => reject(r.error)
      r.onsuccess = () => {
        const db = r.result
        const tx = db.transaction('attempts', 'readwrite')
        tx.objectStore('attempts').put(attempt)
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
      }
    })
    const store = await import('../src/domain/progress/learning-store.js')
    const progress = await store.loadLearning()
    expect(progress.attempts).toHaveLength(1)
    expect(progress.attempts[0].confidence).toBe(3)
    progress.marks.q1 = {
      saved: true,
      reviewed: false,
      problem: false,
      note: '',
      updatedAt: 1,
    }
    expect(await store.saveLearning(progress)).toBe(true)
    expect(await store.loadLearning()).toEqual(progress)
    expect(store.isPersistent()).toBe(true)
  })
  it('serializa escrituras y no pierde la última marca', async () => {
    const store = await import('../src/domain/progress/learning-store.js')
    const p = emptyProgress()
    await Promise.all([
      store.saveLearning(p),
      store.saveLearning({
        ...p,
        marks: {
          q1: {
            saved: true,
            reviewed: false,
            problem: false,
            note: 'última',
            updatedAt: 2,
          },
        },
      }),
    ])
    expect((await store.loadLearning()).marks.q1.note).toBe('última')
  })
  it('avisa de fallback temporal sin fingir persistencia', async () => {
    vi.stubGlobal('indexedDB', undefined)
    const store = await import('../src/domain/progress/learning-store.js')
    const p = emptyProgress()
    p.marks.q1 = {
      saved: true,
      reviewed: false,
      problem: false,
      note: 'temporal',
      updatedAt: 1,
    }
    expect(await store.saveLearning(p)).toBe(false)
    expect(await store.loadLearning()).toEqual(p)
    expect(store.isPersistent()).toBe(false)
  })
})

// Abre la base con la versión y almacenes dados, como lo haría una pestaña o una
// versión anterior de la aplicación, sin pasar por el store.
function openRaw(version: number, stores: string[]): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open('merito-pgn-progress', version)
    r.onupgradeneeded = () => {
      for (const name of stores)
        if (!r.result.objectStoreNames.contains(name))
          r.result.createObjectStore(
            name,
            name === 'attempts' ? { keyPath: 'key' } : undefined,
          )
    }
    r.onsuccess = () => resolve(r.result)
    r.onerror = () => reject(r.error)
  })
}
function putRaw(db: IDBDatabase, store: string, value: unknown, key?: string) {
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
function getRaw(db: IDBDatabase, store: string, key: string) {
  return new Promise<unknown>((resolve, reject) => {
    const g = db.transaction(store).objectStore(store).get(key)
    g.onsuccess = () => resolve(g.result)
    g.onerror = () => reject(g.error)
  })
}
const v1Attempt = {
  key: 'old',
  questionId: 'q1',
  attemptedAt: '2026-09-07T12:00:00.000Z',
  selectedOptionId: 'A',
  correct: true,
  confidence: 3,
  responseTimeSeconds: 4,
  mode: 'practice',
  examId: null,
}

describe('carga fallida sin sobrescribir', () => {
  it('conserva intacto un registro que no pasa el esquema', async () => {
    const unreadable = { schemaVersion: 999, sessions: 'no es una lista' }
    const seed = await openRaw(2, ['attempts', 'learning'])
    await putRaw(seed, 'learning', unreadable, 'progress')
    seed.close()
    const store = await import('../src/domain/progress/learning-store.js')

    await store.loadLearning()
    expect(await store.saveLearning(emptyProgress())).toBe(false)

    const db = await openRaw(2, [])
    expect(await getRaw(db, 'learning', 'progress')).toEqual(unreadable)
    db.close()
  })
  it('no borra los intentos v1 cuando otra pestaña bloqueó la carga', async () => {
    const otherTab = await openRaw(1, ['attempts'])
    await putRaw(otherTab, 'attempts', v1Attempt)
    const store = await import('../src/domain/progress/learning-store.js')

    await store.loadLearning()
    expect(store.isPersistent()).toBe(false)
    otherTab.close()
    expect(await store.saveLearning(emptyProgress())).toBe(false)

    expect((await store.loadLearning()).attempts).toHaveLength(1)
  })
  it('vuelve a guardar cuando una carga posterior sí lee el registro', async () => {
    const seed = await openRaw(2, ['attempts', 'learning'])
    await putRaw(seed, 'learning', { basura: true }, 'progress')
    const store = await import('../src/domain/progress/learning-store.js')
    await store.loadLearning()
    await putRaw(seed, 'learning', emptyProgress(), 'progress')
    seed.close()

    await store.loadLearning()
    const next = emptyProgress()
    next.marks.q1 = {
      saved: true,
      reviewed: false,
      problem: false,
      note: 'tras recuperar',
      updatedAt: 1,
    }
    expect(await store.saveLearning(next)).toBe(true)
    expect((await store.loadLearning()).marks.q1.note).toBe('tras recuperar')
  })
})
