import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getPublicNote } from '../utils/firebaseSync'
import SyntaxHighlighter from '../components/SyntaxHighlighter'

export default function SharedNoteView() {
  const { id } = useParams()
  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    
    const fetchNote = async () => {
      try {
        setLoading(true)
        const noteData = await getPublicNote(id)
        if (mounted) {
          if (noteData) {
            setNote(noteData)
          } else {
            setError('Note not found')
          }
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to load note')
          console.error('Error fetching note:', err)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchNote()
    
    return () => { mounted = false }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading shared note...</p>
        </div>
      </div>
    )
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Note Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {error || 'The note you are looking for does not exist or has been removed.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 
                      dark:border-gray-700 p-6 md:p-8 transition-all duration-200">
          
          {/* Note Header */}
          <header className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {note.title || 'Untitled Note'}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
              <span>📅 Last updated: {new Date(note.lastUpdated).toLocaleString()}</span>
              {note.language && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 
                               dark:text-blue-300 rounded-full text-xs">
                  {note.language}
                </span>
              )}
            </div>
          </header>

          {/* Note Content */}
          <div className="prose dark:prose-invert max-w-none">
            {note.content && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Content:</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            )}

            {/* Code Syntax Highlighting */}
            {note.content && note.language && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  Code Preview:
                </h3>
                <SyntaxHighlighter 
                  language={note.language} 
                  value={note.content} 
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Shared via Smart Note App • {window.location.hostname}
            </p>
          </footer>
        </div>
      </div>
    </div>
  )
}