import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import App from './App'
import Home from './pages/Home'
import SharedNoteView from './pages/SharedNoteView'
import Login from './pages/Login'
import Register from './pages/Register'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebaseConfig'
import './index.css' // was ./styles.css

function RequireAuth({ children }) {
  const [ready, setReady] = useState(false)
  const [user, setUser] = useState(null)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => { setUser(u); setReady(true) })
    return () => unsub()
  }, [])
  if (!ready) return null
  return user ? children : <Navigate to="/login" replace />
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={
            <RequireAuth>
              <Home />
            </RequireAuth>
          } />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="note/:id" element={<SharedNoteView />} />
          <Route path="*" element={<div className="p-6">Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
