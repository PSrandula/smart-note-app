import React, { useState, useEffect } from 'react'
import useNetworkStatus from '../hooks/useNetworkStatus'
import useNotesSync from '../hooks/useNotesSync'
import NoteEditor from '../components/NoteEditor'
import NoteCard from '../components/NoteCard'
import { publishPublicNote } from '../utils/firebaseSync'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../firebaseConfig'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { getVersions } from '../utils/indexedDB'

export default function Home() {
  const online = useNetworkStatus()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const { notes, createOrUpdateNote, removeNote, restoreNoteVersion } = useNotesSync(online, user?.uid)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  const [notice, setNotice] = useState(null) // { type: 'success'|'error'|'info', message: string }
  const [confirmState, setConfirmState] = useState({ open: false, note: null })
  const [shareModal, setShareModal] = useState({ open: false, link: '', note: null })
  const [historyModal, setHistoryModal] = useState({ open: false, note: null, versions: [] })
  // pagination state
  const [page, setPage] = useState(1)
  const pageSize = 5
  const navigate = useNavigate()

  // Auth state change listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Theme management
  useEffect(() => {
    const isDark = theme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Share note functionality
  const handleShare = async (note) => {
    try {
      await publishPublicNote(note)
      const link = `${window.location.origin}/note/${note.id}`
      setShareModal({ open: true, link, note })
      // no auto copy now
      setNotice({ type: 'info', message: 'Share link generated.' })
    } catch {
      setNotice({ type: 'error', message: 'Failed to generate share link.' })
    }
  }

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareModal.link)
      setNotice({ type: 'success', message: 'Link copied to clipboard.' })
    } catch {
      setNotice({ type: 'error', message: 'Copy failed.' })
    }
  }

  const closeShareModal = () => setShareModal({ open: false, link: '', note: null })

  // Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth)
      setNotice({ type: 'success', message: 'Logged out successfully.' })
      setTimeout(() => navigate('/login'), 1200)
    } catch (error) {
      setNotice({ type: 'error', message: 'Logout failed.' })
    }
  }

  // Reset to first page when searching
  useEffect(() => { setPage(1) }, [search])

  // Filter notes based on search
  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(search.toLowerCase()) ||
    note.content?.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination calculations
  const total = filteredNotes.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const end = Math.min(start + pageSize, total)
  const pagedNotes = filteredNotes.slice(start, end)

  // Reset editing
  const handleSaveNote = (note) => {
    createOrUpdateNote(note)
    setEditing(null)
    // notification is handled by NoteEditor via onNotify
  }

  // Start edit: show toast
  const handleStartEdit = (note) => {
    setEditing(note)
    setNotice({ type: 'info', message: `Editing: ${note.title || 'Untitled'}` })
  }

  // Delete confirm workflow
  const askDelete = (note) => setConfirmState({ open: true, note })
  const confirmDelete = async () => {
    const note = confirmState.note
    try {
      await removeNote(note.id)
      setNotice({ type: 'success', message: `Deleted: ${note.title || 'Untitled'}` })
    } catch {
      setNotice({ type: 'error', message: 'Delete failed.' })
    } finally {
      setConfirmState({ open: false, note: null })
    }
  }
  const cancelDelete = () => {
    setConfirmState({ open: false, note: null })
    setNotice({ type: 'info', message: 'Delete cancelled.' })
  }

  const openHistory = async (note) => {
    const versions = await getVersions(note.id)
    setHistoryModal({ open: true, note, versions })
  }

  const closeHistory = () => setHistoryModal({ open: false, note: null, versions: [] })

  const handleRestoreVersion = async (version) => {
    await restoreNoteVersion(version)
    setNotice({ type: 'success', message: 'Version restored.' })
    closeHistory()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Toast */}
      {notice && (
        <Toast
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
          duration={5000}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        
         {/* HEADER SECTION */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Smart Note App
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your thoughts, organized beautifully</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            {/* Network Status */}
            <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md transition-all duration-300 ${
              online 
                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-green-200 dark:shadow-green-900' 
                : 'bg-gradient-to-r from-red-400 to-pink-500 text-white shadow-red-200 dark:shadow-red-900'
            }`}>
              {online ? '🟢 Online' : '🔴 Offline'}
            </span>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-3 rounded-xl bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 
                         hover:shadow-xl transition-all duration-300 hover:scale-105
                         bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <span className="text-lg transition-transform duration-300 hover:rotate-45">
                {theme === 'dark' ? '☀️' : '🌙'}
              </span>
            </button>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 
                               px-4 py-2 rounded-full border border-gray-200 dark:border-gray-600
                               shadow-md backdrop-blur-sm">
                  👤 {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white 
                           hover:from-red-600 hover:to-pink-700 transition-all duration-300 
                           shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link 
                  to="/login" 
                  className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white 
                           hover:from-blue-600 hover:to-purple-700 transition-all duration-300 
                           shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="text-sm px-5 py-2.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 
                           text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 
                           transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Column - Notes & Editor */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Search Bar */}
              <div className="relative">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="🔍 Search notes by title or content..."
                  className="w-full p-4 pl-12 pr-10 border rounded-xl outline-none
                            bg-white border-gray-200 text-gray-900 placeholder-gray-500
                            dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder-gray-400
                            focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                            transition-all duration-200 shadow-sm"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 
                             hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Note Editor */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 
                            dark:border-gray-700 p-6 transition-all duration-200">
                <NoteEditor
                  initial={editing}
                  onSave={handleSaveNote}
                  onNotify={(n) => setNotice(n)}
                />
              </div>

              {/* Notes List */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Your Notes ({filteredNotes.length})
                </h2>
                
                {pagedNotes.length > 0 ? (
                  <div className="grid gap-4">
                    {pagedNotes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onEdit={handleStartEdit}
                        onDelete={() => askDelete(note)}
                        onShare={handleShare}
                        onHistory={openHistory}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl 
                                border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      {search ? 'No matching notes found...' : 'No notes yet. Create your first note above! 📝'}
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {total > pageSize && (
                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Showing <span className="font-medium">{total === 0 ? 0 : start + 1}</span>–
                      <span className="font-medium">{end}</span> of <span className="font-medium">{total}</span>
                    </div>
                    <nav className="inline-flex items-center gap-2">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1.5 rounded border text-sm ${
                          currentPage === 1
                            ? 'border-gray-300 text-gray-400 cursor-not-allowed dark:border-gray-700'
                            : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                        }`}
                        aria-label="Previous page"
                      >
                        ‹ Previous
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                      </span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1.5 rounded border text-sm ${
                          currentPage === totalPages
                            ? 'border-gray-300 text-gray-400 cursor-not-allowed dark:border-gray-700'
                            : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                        }`}
                        aria-label="Next page"
                      >
                        Next ›
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 
                            dark:border-gray-700 p-6 sticky top-6 transition-all duration-200">
                <h3 className="font-semibold text-lg mb-4 text-gray-900 dark:text-white">
                  ℹ️ How It Works
                </h3>
                <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-1">💾</span>
                    <span>Notes auto-save locally and sync when online</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">🌐</span>
                    <span>Works offline - changes sync when back online</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">🔗</span>
                    <span>Share notes publicly with generated links</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1">💡</span>
                    <span>Supports code syntax highlighting</span>
                  </li>
                </ul>
                
                {/* Quick Stats */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Quick Stats</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="font-semibold text-blue-600 dark:text-blue-400">{notes.length}</div>
                      <div className="text-blue-500 dark:text-blue-300">Total</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="font-semibold text-green-600 dark:text-green-400">{filteredNotes.length}</div>
                      <div className="text-green-500 dark:text-green-300">Filtered</div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Delete confirm modal */}
      <ConfirmModal
        open={confirmState.open}
        title="Delete note"
        message={`Are you sure you want to delete "${confirmState.note?.title || 'Untitled'}"? This action cannot be undone.`}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
      />
      <ShareModal
        open={shareModal.open}
        link={shareModal.link}
        noteTitle={shareModal.note?.title}
        onCopy={copyShareLink}
        onClose={closeShareModal}
      />
      <HistoryModal
        open={historyModal.open}
        note={historyModal.note}
        versions={historyModal.versions}
        onRestore={handleRestoreVersion}
        onClose={closeHistory}
      />
    </div>
  )
}

// Toast component (5s, animated with progress)
function Toast({ type = 'success', message, onClose, duration = 5000 }) {
  const [percent, setPercent] = React.useState(100)
  React.useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.max(0, 100 - (elapsed / duration) * 100)
      setPercent(p)
      if (p === 0) { clearInterval(id); onClose?.() }
    }, 60)
    return () => clearInterval(id)
  }, [duration, onClose])
  return (
    <div className="fixed top-4 right-4 z-50" role="status" aria-live="polite" tabIndex={0}>
      <div className={`relative flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border overflow-hidden
        backdrop-blur-sm transition-all animate-[fadeSlide_.35s_ease]
        ${type === 'success'
          ? 'bg-gradient-to-r from-emerald-50 to-green-100 border-green-200 text-green-800 dark:from-emerald-900/40 dark:to-green-800/20 dark:border-green-700 dark:text-green-100'
          : type === 'error'
          ? 'bg-gradient-to-r from-rose-50 to-red-100 border-red-200 text-red-800 dark:from-rose-900/40 dark:to-red-800/20 dark:border-red-700 dark:text-red-100'
          : 'bg-gradient-to-r from-sky-50 to-sky-100 border-sky-200 text-sky-800 dark:from-sky-900/40 dark:to-sky-800/20 dark:border-sky-700 dark:text-sky-100'}`}>
        {type === 'success' && (
          <svg className="w-6 h-6 flex-shrink-0 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" />
          </svg>
        )}
        {type === 'error' && (
          <svg className="w-6 h-6 flex-shrink-0 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
          </svg>
        )}
        {type === 'info' && (
          <svg className="w-6 h-6 flex-shrink-0 text-sky-500 dark:text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
          </svg>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{message}</span>
          <span className="text-[11px] opacity-60">Closing in {(percent/20).toFixed(0)}s</span>
        </div>
        <button onClick={onClose} className="ml-auto text-sm opacity-60 hover:opacity-100">✕</button>
        <div
          className={`absolute bottom-0 left-0 h-1 ${type === 'error' ? 'bg-red-500/80 dark:bg-red-400/70' : type === 'info' ? 'bg-sky-500/80 dark:bg-sky-400/70' : 'bg-green-500/80 dark:bg-green-400/70'} transition-[width]`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(-8px) scale(.98)}100%{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  )
}

// Confirm modal for delete
function ConfirmModal({ open, title = 'Delete note', message, onCancel, onConfirm }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-50 w-full max-w-md mx-4 rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-5 text-sm text-gray-700 dark:text-gray-300">
          {message}
        </div>
        <div className="p-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onCancel} className="px-4 py-2 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// Share modal for sharing notes
function ShareModal({ open, link, noteTitle, onCopy, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-lg mx-4 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Share Note</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Close share dialog">
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Generate a public link to share your note. Anyone with the link can view it.
          </p>
          {noteTitle && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Note: <span className="font-medium">{noteTitle || 'Untitled'}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 px-3 py-2 rounded-lg border bg-gray-50 border-gray-300 text-gray-800 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 text-sm"
            />
            <button
              onClick={onCopy}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors"
            >
              Copy Link
            </button>
          </div>
        </div>
        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// History modal for note versions
function HistoryModal({ open, note, versions, onRestore, onClose }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-50 w-full max-w-xl mx-4 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            History: {note?.title || 'Untitled'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label="Close history">
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[60vh] overflow-auto">
          {versions.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">No previous versions saved yet.</p>
          )}
          {versions.map(v => (
            <div key={v.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Saved: {new Date(v.savedAt).toLocaleString()}
                </span>
                <button
                  onClick={() => onRestore(v)}
                  className="text-xs px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Restore
                </button>
              </div>
              <div className="text-xs mb-2">
                <span className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {v.language}
                </span>
              </div>
              <pre className="text-xs whitespace-pre-wrap max-h-32 overflow-auto text-gray-700 dark:text-gray-300">
                {v.content?.slice(0, 1000) || '(empty)'}
              </pre>
            </div>
          ))}
        </div>
        <div className="px-6 pb-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}