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
