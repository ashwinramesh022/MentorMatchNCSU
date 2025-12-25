import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  // Simple shared credentials - change these as needed
  const CORRECT_USERNAME = 'admin'
  const CORRECT_PASSWORD = 'mentormatch2026'

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (username === CORRECT_USERNAME && password === CORRECT_PASSWORD) {
      // Store authentication in sessionStorage
      sessionStorage.setItem('isAuthenticated', 'true')
      navigate('/')
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>MentorMatch NCSU</h1>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-large">
            Login
          </button>
        </form>
        <p className="login-note">
          Contact your administrator for login credentials
        </p>
      </div>
    </div>
  )
}

export default Login

