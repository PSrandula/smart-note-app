import React from 'react'

export default function NoteCard({ note, onEdit, onDelete, onShare, onHistory }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getLanguageBadge = (lang) => {
    const colors = {
      javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      python: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      java: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      cpp: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      bash: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    }
    return colors[lang] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 
                  dark:border-gray-700 p-5 hover:shadow-md transition-all duration-200 
                  hover:border-gray-300 dark:hover:border-gray-600">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white truncate">
            {note.title || 'Untitled Note'}
          </h3>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              📅 {formatDate(note.lastUpdated)}
            </span>
            {note.language && (
              <span className={`text-xs px-2 py-1 rounded-full ${getLanguageBadge(note.language)}`}>
                {note.language}
              </span>
            )}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-3">
          <button
            onClick={() => onEdit(note)}
            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 
                     rounded-lg transition-colors duration-150"
            title="Edit note"
            aria-label="Edit note"
          >
            {/* Heroicon Pencil */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 013.182 3.182L7.125 19.587l-4.11.685.685-4.11 12.162-12.675z" />
            </svg>
          </button>
          <button
            onClick={() => onShare(note)}
            className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 
                     rounded-lg transition-colors duration-150"
            title="Share note"
            aria-label="Share note"
          >
            {/* Heroicon Link */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6.75h2.25a3.75 3.75 0 013.75 3.75v.75a3.75 3.75 0 01-3.75 3.75H15m-6 0H6.75A3.75 3.75 0 013 11.25v-.75a3.75 3.75 0 013.75-3.75H9m2.25 6.75l3-3m-6.5 0l3-3" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 
                     rounded-lg transition-colors duration-150"
            title="Delete note"
            aria-label="Delete note"
          >
            {/* Heroicon Trash */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75v7.5m4.5-7.5v7.5M4.5 6.75h15M10.5 3.75h3a1.5 1.5 0 011.5 1.5v1.5h-6V5.25a1.5 1.5 0 011.5-1.5zm9 3v12a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18.75v-12" />
            </svg>
          </button>
          <button
            onClick={() => onHistory(note)}
            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-150"
            title="View history"
            aria-label="View history"
          >
            {/* Clock/History icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
          {note.content || 'No content...'}
        </p>
      </div>

      {/* Character Count */}
      <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
        <span>{note.content?.length || 0} characters</span>
        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
          #{note.id.slice(0, 8)}
        </span>
      </div>
    </div>
  )
}