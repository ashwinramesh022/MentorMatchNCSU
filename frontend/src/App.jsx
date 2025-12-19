import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import DataManagement from './pages/DataManagement'
import MatchingEngine from './pages/MatchingEngine'
import Verification from './pages/Verification'
import Reports from './pages/Reports'
import './App.css'

function Navigation() {
  const location = useLocation()
  
  const isActive = (path) => location.pathname === path
  
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
        </div>
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="app">
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
      </div>
    </Router>
  )
}

export default App


