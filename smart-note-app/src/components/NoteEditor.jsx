import React, { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

export default function NoteEditor({ initial = null, onSave, onNotify }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [isEditing, setIsEditing] = useState(false)

  // Reset form when initial prop changes
  useEffect(() => {
    if (initial) {
      setTitle(initial.title || '')
      setContent(initial.content || '')
      setLanguage(initial.language || 'javascript')
      setIsEditing(true)
    } else {
      setTitle('')
      setContent('')
      setLanguage('javascript')
      setIsEditing(false)
    }
  }, [initial])

  const handleSave = () => {
    if (!title.trim() && !content.trim()) {
      onNotify?.({ type: 'error', message: 'Add title or content before saving.' })
      return
    }

    const note = {
      id: initial?.id || uuidv4(),
      title: title.trim(),
      content: content.trim(),
      language,
      lastUpdated: Date.now(),
    }
    
    onSave(note)
    onNotify?.({ type: 'success', message: initial ? 'Note updated.' : 'Note saved.' })
    
    // Reset form if not editing existing note
    if (!initial) {
      setTitle('')
      setContent('')
      setLanguage('javascript')
    }
  }

  const handleCancel = () => {
    if (initial) {
      // If editing, reset to initial values
      setTitle(initial.title || '')
      setContent(initial.content || '')
      setLanguage(initial.language || 'javascript')
    } else {
      // If creating new, clear form
      setTitle('')
      setContent('')
      setLanguage('javascript')
    }
  }

  const characterCount = content.length
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="space-y-4">
      
      {/* Editor Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditing ? '✏️ Edit Note' : '📝 Create New Note'}
        </h2>
        {initial && (
          <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 
                         dark:bg-gray-700 px-3 py-1 rounded-full">
            Editing: #{initial.id.slice(0, 8)}
          </span>
        )}
      </div>

      {/* Title Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Note Title
        </label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for your note..."
          className="w-full p-4 rounded-xl border bg-white border-gray-300 text-gray-900
                     dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                     outline-none transition-all duration-200 placeholder-gray-500 
                     dark:placeholder-gray-400 shadow-sm"
        />
      </div>

      {/* Content Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Note Content {isEditing && '(Editing)'}
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full p-4 rounded-xl border bg-white border-gray-300 text-gray-900
                     dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100
                     focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                     outline-none transition-all duration-200 placeholder-gray-500 
                     dark:placeholder-gray-400 resize-none shadow-sm font-mono text-sm"
          placeholder={`Write your notes or paste code here...\n\n💡 Tip: Use the language selector below for code syntax highlighting.`}
        />
        
        {/* Character/Word Count */}
        <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{characterCount} characters</span>
          <span>{wordCount} words</span>
        </div>
      </div>

      {/* Language Selection & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 
                    border-t border-gray-200 dark:border-gray-700">
        
        {/* Language Selection */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
            💻 Code Language:
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="p-3 rounded-lg border text-sm bg-white border-gray-300 text-gray-900
                       dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                       outline-none transition-all duration-200 shadow-sm flex-1"
          >
            <option value="plaintext">Plain Text</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="bash">Bash/Shell</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="sql">SQL</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {(title.trim() || content.trim()) && (
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-600 
                       text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 
                       transition-colors duration-200 shadow-sm hover:shadow-md font-medium"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!title.trim() && !content.trim()}
            className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 
                     disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400
                     transition-colors duration-200 shadow-sm hover:shadow-md font-medium
                     flex items-center gap-2"
          >
            💾 {isEditing ? 'Update Note' : 'Save Note'}
          </button>
        </div>
      </div>

      {/* Helper Text */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                    rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>💡 Pro Tip:</strong> {isEditing 
            ? 'Your changes are saved locally immediately and will sync when online.' 
            : 'Your note will be saved locally and automatically sync to the cloud when online.'}
        </p>
      </div>
    </div>
  )
}