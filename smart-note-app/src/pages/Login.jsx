import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebaseConfig'

// Simple toast component
function Toast({ type = 'success', message, onClose, duration = 5000 }) {
  const [percent, setPercent] = useState(100)
  useEffect(() => {
    const start = Date.now()
    const id = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.max(0, 100 - (elapsed / duration) * 100)
      setPercent(p)
      if (p === 0) {
        clearInterval(id)
        onClose()
      }
    }, 60)
    return () => clearInterval(id)
  }, [duration, onClose])
  return (
    <div className="fixed top-4 right-4 z-50" role="status" aria-live="polite" tabIndex={0}>
      <div className={`relative flex items-center gap-3 px-5 py-4 rounded-xl shadow-xl border overflow-hidden
        backdrop-blur-sm transition-all animate-[fadeSlide_.35s_ease]
        ${type === 'success'
          ? 'bg-gradient-to-r from-emerald-50 to-green-100 border-green-200 text-green-800 dark:from-emerald-900/40 dark:to-green-800/20 dark:border-green-700 dark:text-green-100'
          : 'bg-gradient-to-r from-rose-50 to-red-100 border-red-200 text-red-800 dark:from-rose-900/40 dark:to-red-800/20 dark:border-red-700 dark:text-red-100'}`}>
        {type === 'success' ? (
          <svg className="w-6 h-6 flex-shrink-0 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 flex-shrink-0 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v4m0 4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
          </svg>
        )}
        <div className="flex flex-col">
          <span className="text-sm font-medium">{message}</span>
          <span className="text-[11px] opacity-60">Closing in {(percent/20).toFixed(0)}s</span>
        </div>
        <button onClick={onClose} className="ml-auto text-sm opacity-60 hover:opacity-100">✕</button>
        <div
          className={`absolute bottom-0 left-0 h-1 ${type === 'success' ? 'bg-green-500/80 dark:bg-green-400/70' : 'bg-red-500/80 dark:bg-red-400/70'} transition-[width]`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <style>{`@keyframes fadeSlide{0%{opacity:0;transform:translateY(-8px) scale(.98)}100%{opacity:1;transform:translateY(0) scale(1)}}`}</style>
    </div>
  )
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [notice, setNotice] = useState(null) // { type, message }
  const [loginInProgress, setLoginInProgress] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      // Redirect only if user already logged in before coming to page (not during active login)
      if (u && !loginInProgress) navigate('/')
    })
    return () => unsub()
  }, [navigate, loginInProgress])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoginInProgress(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setNotice({ type: 'success', message: 'Login successful.' })
      setTimeout(() => navigate('/'), 5000)
    } catch (err) {
      setNotice({ type: 'error', message: err.message || 'Login failed' })
      setTimeout(() => setNotice(null), 5000)
      setLoginInProgress(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {notice && (
        <Toast
          type={notice.type}
          message={notice.message}
          onClose={() => setNotice(null)}
          duration={5000}
        />
      )}
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Login to continue to Smart Note App</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-2 rounded border bg-white border-gray-300 text-gray-900
                         dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500/40 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full p-2 rounded border bg-white border-gray-300 text-gray-900
                         dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100
                         focus:ring-2 focus:ring-blue-500/40 outline-none"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:opacity-95"
          >
            Login
          </button>
          <p className="text-sm text-center">
            No account? <Link to="/register" className="underline">Register</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
