import {
  LearningProgressSchema,
  emptyProgress,
  type LearningProgress,
} from '../learning.js'
import { AttemptSchema } from '../dataset/contracts.js'

let memory = emptyProgress()
let queue = Promise.resolve(true)
let persistent = true
export const isPersistent = () => persistent
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) {
      reject(Error('IndexedDB no disponible'))
      return
    }
    const request = indexedDB.open('merito-pgn-progress', 2)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('attempts'))
        db.createObjectStore('attempts', { keyPath: 'key' })
      if (!db.objectStoreNames.contains('learning'))
        db.createObjectStore('learning')
    }
    let blocked = false
    request.onsuccess = () => {
      if (blocked) {
        request.result.close()
        return
      }
      request.result.onversionchange = () => request.result.close()
      resolve(request.result)
    }
    request.onerror = () => reject(request.error)
    request.onblocked = () => {
      blocked = true
      reject(Error('Cierra otras pestañas para actualizar el progreso.'))
    }
  })
}
export async function loadLearning(): Promise<LearningProgress> {
  let db: IDBDatabase | undefined
  try {
    db = await openDatabase()
    const result = await new Promise<LearningProgress>((resolve, reject) => {
      const tx = db!.transaction(['learning', 'attempts'], 'readonly')
      const saved = tx.objectStore('learning').get('progress')
      const old = tx.objectStore('attempts').getAll()
      tx.oncomplete = () => {
        try {
          resolve(
            saved.result
              ? LearningProgressSchema.parse(saved.result)
              : {
                  ...emptyProgress(),
                  attempts: old.result.map((a) => AttemptSchema.parse(a)),
                },
          )
        } catch (e) {
          reject(e)
        }
      }
      tx.onerror = () => reject(tx.error)
    })
    memory = result
    persistent = true
    return result
  } catch {
    persistent = false
    return memory
  } finally {
    db?.close()
  }
}
export function saveLearning(progress: LearningProgress): Promise<boolean> {
  const snapshot = LearningProgressSchema.parse(progress)
  memory = snapshot
  // Serializar escrituras evita que respuestas rápidas restauren un snapshot antiguo.
  queue = queue.then(async () => {
    let db: IDBDatabase | undefined
    try {
      db = await openDatabase()
      await new Promise<void>((resolve, reject) => {
        const tx = db!.transaction('learning', 'readwrite')
        tx.objectStore('learning').put(snapshot, 'progress')
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
        tx.onabort = () => reject(tx.error)
      })
      persistent = true
      return true
    } catch {
      persistent = false
      return false
    } finally {
      db?.close()
    }
  })
  return queue
}
