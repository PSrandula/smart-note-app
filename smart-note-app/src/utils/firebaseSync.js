import { ref, set, onValue, off, get } from 'firebase/database'
import { db } from '../firebaseConfig'

/**
 * Push a single note to Firebase under notes/{userId}/{noteId}
 */
export async function pushNoteToFirebase(userId, note) {
  const noteRef = ref(db, `notes/${userId}/${note.id}`)
  await set(noteRef, note)
}

/**
 * Listen for real-time updates for a user's notes.
 * callback receives an object { noteId: note, ... }
 * Returns an unsubscribe function.
 */
export function listenToUserNotes(userId, callback) {
  const notesRef = ref(db, `notes/${userId}`)
  const listener = (snapshot) => {
    const data = snapshot.val() || {}
    callback(data)
  }
  onValue(notesRef, listener)
  return () => { off(notesRef, 'value', listener) }
}

/**
 * Publish a public note copy for sharing
 */
export async function publishPublicNote(note) {
  const pubRef = ref(db, `public_notes/${note.id}`)
  await set(pubRef, note)
}

/**
 * One-time read for a public note
 */
export async function getPublicNote(noteId) {
  const pubRef = ref(db, `public_notes/${noteId}`)
  return new Promise((resolve) => {
    onValue(pubRef, (snap) => {
      resolve(snap.val())
    }, { onlyOnce: true })
  })
}

// Fetch all user notes once (for upward sync)
export async function fetchUserNotesOnce(userId) {
  const notesRef = ref(db, `notes/${userId}`)
  const snap = await get(notesRef)
  return snap.val() || {}
}

export async function deleteNoteFromFirebase(userId, noteId) {
  const noteRef = ref(db, `notes/${userId}/${noteId}`)
  await set(noteRef, null)
}
