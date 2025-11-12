import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

export default function SyntaxHighlighterWrapper({ language, value }) {
  // Custom style adjustments
  const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
      ...oneDark['pre[class*="language-"]'],
      background: 'transparent',
      margin: 0,
      padding: 0,
      borderRadius: '0.5rem',
    },
    'code[class*="language-"]': {
      ...oneDark['code[class*="language-"]'],
      background: 'transparent',
    }
  }

  return (
    <div className="rounded-xl bg-gray-900 dark:bg-gray-800 border border-gray-700 
                  overflow-hidden shadow-lg transition-all duration-200">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 dark:bg-gray-900 
                    border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm text-gray-300 font-medium">
            {language || 'text'}
          </span>
        </div>
        <button
          onClick={() => {
            navigator.clipboard.writeText(value)
            // You could add a toast notification here
          }}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors duration-150 
                   px-3 py-1 rounded border border-gray-600 hover:border-gray-500"
        >
          Copy
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 max-h-96 overflow-auto">
        <SyntaxHighlighter 
          language={language || 'text'}
          style={customStyle}
          customStyle={{
            background: 'transparent',
            padding: 0,
            margin: 0,
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          wrapLongLines={true}
        >
          {value || '// No code to display'}
        </SyntaxHighlighter>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-800 dark:bg-gray-900 border-t border-gray-700 
                    text-xs text-gray-400 text-center">
        Syntax highlighted with Prism • {value?.length || 0} characters
      </div>
    </div>
  )
}