import { openDB } from 'idb'

const DB_NAME = 'notes-db'
const STORE = 'notes'
const VERS_STORE = 'note_versions'

export const dbPromise = openDB(DB_NAME, 2, {
  upgrade(db, oldVersion) {
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE, { keyPath: 'id' })
    }
    if (oldVersion < 2 && !db.objectStoreNames.contains(VERS_STORE)) {
      const store = db.createObjectStore(VERS_STORE, { keyPath: 'id' })
      store.createIndex('by_note', 'noteId')
      store.createIndex('by_note_time', ['noteId', 'savedAt'])
    }
  },
})

export async function saveNote(note) {
  const db = await dbPromise
  if (!note.lastUpdated) note.lastUpdated = Date.now() // only set if absent
  await db.put(STORE, note)
}

export async function getAllNotes() {
  const db = await dbPromise
  return await db.getAll(STORE)
}

export async function getNoteById(id) {
  const db = await dbPromise
  return await db.get(STORE, id)
}

export async function deleteNote(id) {
  const db = await dbPromise
  await db.delete(STORE, id)
}

// Update note without modifying lastUpdated (used to mark lastSynced)
export async function updateNoteDirect(note) {
  const db = await dbPromise
  await db.put(STORE, note)
}

export async function addVersion(note) {
  const db = await dbPromise
  const version = {
    id: `${note.id}:${Date.now()}`,
    noteId: note.id,
    title: note.title,
    content: note.content,
    language: note.language,
    savedAt: Date.now(),
  }
  await db.put(VERS_STORE, version)
}

export async function getVersions(noteId) {
  const db = await dbPromise
  const idx = db.transaction(VERS_STORE).store.index('by_note')
  const all = await idx.getAll(noteId)
  return all.sort((a,b)=> b.savedAt - a.savedAt)
}

export async function clearVersions(noteId) {
  const db = await dbPromise
  const versions = await getVersions(noteId)
  for (const v of versions) {
    await db.delete(VERS_STORE, v.id)
  }
}
