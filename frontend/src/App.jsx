import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import DataManagement from './pages/DataManagement'
import MatchingEngine from './pages/MatchingEngine'
import Verification from './pages/Verification'
import Reports from './pages/Reports'
import Login from './pages/Login'
import './App.css'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  
  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated')
    window.location.href = '/login'
  }
  
  return (
    <nav className="navbar">
      <div className="nav-container">
        <h1 className="nav-title">MentorMatch NCSU</h1>
        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>Dashboard</Link>
          <Link to="/data" className={isActive('/data') ? 'active' : ''}>Data Management</Link>
          <Link to="/matching" className={isActive('/matching') ? 'active' : ''}>Matching Engine</Link>
          <Link to="/verification" className={isActive('/verification') ? 'active' : ''}>Verification</Link>
          <Link to="/reports" className={isActive('/reports') ? 'active' : ''}>Reports</Link>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}

function ProtectedRoute({ children }) {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true'
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <>
                  <Navigation />
                  <main className="main-content">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/data" element={<DataManagement />} />
                      <Route path="/matching" element={<MatchingEngine />} />
                      <Route path="/verification" element={<Verification />} />
                      <Route path="/reports" element={<Reports />} />
                    </Routes>
                  </main>
                </>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App


