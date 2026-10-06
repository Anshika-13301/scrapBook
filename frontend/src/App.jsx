import React, { useState, useEffect } from 'react'
import Login from './Components/Login'
import Gallery from './Components/Gallery'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  return (
    <div className="app-container">
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <Gallery token={token} setToken={setToken} />
      )}
    </div>
  )
}

export default App