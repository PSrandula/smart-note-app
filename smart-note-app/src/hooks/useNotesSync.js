import { useEffect, useState, useCallback } from 'react'
import { getAllNotes, saveNote, deleteNote as deleteNoteLocal, updateNoteDirect, addVersion, getVersions, clearVersions } from '../utils/indexedDB'
import { pushNoteToFirebase, listenToUserNotes, fetchUserNotesOnce, deleteNoteFromFirebase } from '../utils/firebaseSync'

/**
 * Manage local notes and sync with Firebase when online + authenticated.
 */
export default function useNotesSync(isOnline, userId) {
  const [notes, setNotes] = useState([])

  // load from indexedDB on mount
  useEffect(() => {
    let mounted = true
    getAllNotes().then((saved) => {
      if (mounted) setNotes((saved || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
    })
    return () => { mounted = false }
  }, [])

  // when online and authenticated, listen + perform upward sync
  useEffect(() => {
    if (!isOnline || !userId) return
    let cancelled = false

    const unsubscribe = listenToUserNotes(userId, async (cloudNotesObj) => {
      if (cancelled) return
      const cloudMap = cloudNotesObj || {}
      const cloudNotes = Object.values(cloudMap)
      const localList = await getAllNotes()

      // Add / update newer from cloud
      for (const cn of cloudNotes) {
        const found = localList.find(n => n.id === cn.id)
        if (!found || (cn.lastUpdated > (found.lastUpdated || 0))) {
          await saveNote(cn)
        }
      }

      // Remove locally any note that no longer exists in cloud
      const cloudIds = new Set(Object.keys(cloudMap))
      for (const ln of localList) {
        if (!cloudIds.has(ln.id)) {
          await deleteNoteLocal(ln.id)
          await clearVersions(ln.id)
        }
      }

      const refreshed = await getAllNotes()
      setNotes((refreshed || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
    })

    // Upward sync (local -> cloud)
    ;(async () => {
      const [localList, cloudMap] = await Promise.all([
        getAllNotes(),
        fetchUserNotesOnce(userId)
      ])
      for (const ln of localList) {
        const cloud = cloudMap[ln.id]
        if (!cloud || ln.lastUpdated > (cloud.lastUpdated || 0)) {
          await pushNoteToFirebase(userId, ln)
          if (ln.lastSynced !== ln.lastUpdated) {
            ln.lastSynced = ln.lastUpdated
            await updateNoteDirect(ln)
          }
        }
      }
      const refreshed = await getAllNotes()
      setNotes((refreshed || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
    })()

    return () => { cancelled = true; if (typeof unsubscribe === 'function') unsubscribe() }
  }, [isOnline, userId])

  const createOrUpdateNote = useCallback(async (note) => {
    // detect previous version
    const existing = (await getAllNotes()).find(n => n.id === note.id)
    if (existing) {
      if (
        existing.title !== note.title ||
        existing.content !== note.content ||
        existing.language !== note.language
      ) {
        await addVersion(existing)
      }
    }
    // save locally
    await saveNote(note)
    const refreshed = await getAllNotes()
    setNotes((refreshed || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
    if (isOnline && userId) {
      await pushNoteToFirebase(userId, note)
      // mark synced
      note.lastSynced = note.lastUpdated
      await updateNoteDirect(note)
    }
  }, [isOnline, userId])

  const removeNote = useCallback(async (id) => {
    // delete local
    await deleteNoteLocal(id)
    await clearVersions(id)
    // delete remote if possible
    if (isOnline && userId) {
      await deleteNoteFromFirebase(userId, id)
    }
    const refreshed = await getAllNotes()
    setNotes((refreshed || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
  }, [isOnline, userId])

  // expose restore
  const restoreNoteVersion = useCallback(async (version) => {
    const restored = {
      id: version.noteId,
      title: version.title,
      content: version.content,
      language: version.language,
      lastUpdated: Date.now(),
    }
    await saveNote(restored)
    const refreshed = await getAllNotes()
    setNotes((refreshed || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
    if (isOnline && userId) {
      await pushNoteToFirebase(userId, restored)
      restored.lastSynced = restored.lastUpdated
      await updateNoteDirect(restored)
    }
  }, [isOnline, userId])

  return { notes, createOrUpdateNote, removeNote, restoreNoteVersion, getVersions }
}
