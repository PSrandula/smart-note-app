import { useEffect, useState, useCallback } from 'react'
import { getAllNotesByUser, getAllNotes, saveNote, deleteNote as deleteNoteLocal, updateNoteDirect, addVersion, getVersions, clearVersions } from '../utils/indexedDB'
import { pushNoteToFirebase, listenToUserNotes, fetchUserNotesOnce, deleteNoteFromFirebase } from '../utils/firebaseSync'

/**
 * Manage local notes and sync with Firebase when online + authenticated.
 */
export default function useNotesSync(isOnline, userId) {
  const [notes, setNotes] = useState([])

  // load local notes for the current user when userId changes
  useEffect(() => {
    let mounted = true
    ;(async () => {
      if (!userId) { if (mounted) setNotes([]); return }
      const saved = await getAllNotesByUser(userId)
      if (mounted) setNotes((saved || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
    })()
    return () => { mounted = false }
  }, [userId])

  // when online and authenticated, listen + perform upward sync
  useEffect(() => {
    if (!isOnline || !userId) return
    let cancelled = false

    const unsubscribe = listenToUserNotes(userId, async (cloudNotesObj) => {
      if (cancelled) return
      const cloudMap = cloudNotesObj || {}
      const cloudNotes = Object.values(cloudMap)
      const localList = await getAllNotesByUser(userId)

      // Add / update newer from cloud (tag with userId)
      for (const cn of cloudNotes) {
        const found = localList.find(n => n.id === cn.id)
        if (!found || (cn.lastUpdated > (found.lastUpdated || 0))) {
          await saveNote({ ...cn, userId }, userId)
        }
      }

      // Remove locally any note (of this user) that no longer exists in cloud
      const cloudIds = new Set(Object.keys(cloudMap))
      for (const ln of localList) {
        if (!cloudIds.has(ln.id)) {
          await deleteNoteLocal(ln.id)
          await clearVersions(ln.id)
        }
      }

      const refreshed = await getAllNotesByUser(userId)
      setNotes((refreshed || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
    })

    // Upward sync (local -> cloud) for this user only
    ;(async () => {
      const [localList, cloudMap] = await Promise.all([
        getAllNotesByUser(userId),
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
      const refreshed = await getAllNotesByUser(userId)
      setNotes((refreshed || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
    })()

    return () => { cancelled = true; if (typeof unsubscribe === 'function') unsubscribe() }
  }, [isOnline, userId])

  const createOrUpdateNote = useCallback(async (note) => {
    if (!userId) return
    // detect previous version in this user's space
    const existing = (await getAllNotesByUser(userId)).find(n => n.id === note.id)
    if (existing) {
      if (
        existing.title !== note.title ||
        existing.content !== note.content ||
        existing.language !== note.language
      ) {
        await addVersion(existing)
      }
    }
    // save locally with userId
    await saveNote({ ...note, userId }, userId)
    const refreshed = await getAllNotesByUser(userId)
    setNotes((refreshed || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
    if (isOnline && userId) {
      await pushNoteToFirebase(userId, { ...note, userId })
      // mark synced
      const updated = { ...note, userId, lastSynced: note.lastUpdated }
      await updateNoteDirect(updated)
    }
  }, [isOnline, userId])

  const removeNote = useCallback(async (id) => {
    await deleteNoteLocal(id)
    await clearVersions(id)
    if (isOnline && userId) {
      await deleteNoteFromFirebase(userId, id)
    }
    const refreshed = userId ? await getAllNotesByUser(userId) : []
    setNotes((refreshed || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
  }, [isOnline, userId])

  // expose restore
  const restoreNoteVersion = useCallback(async (version) => {
    if (!userId) return
    const restored = {
      id: version.noteId,
      title: version.title,
      content: version.content,
      language: version.language,
      lastUpdated: Date.now(),
      userId,
    }
    await saveNote(restored, userId)
    const refreshed = await getAllNotesByUser(userId)
    setNotes((refreshed || []).sort((a,b)=> b.lastUpdated - a.lastUpdated))
    if (isOnline && userId) {
      await pushNoteToFirebase(userId, restored)
      restored.lastSynced = restored.lastUpdated
      await updateNoteDirect(restored)
    }
  }, [isOnline, userId])

  return { notes, createOrUpdateNote, removeNote, restoreNoteVersion, getVersions }
}
