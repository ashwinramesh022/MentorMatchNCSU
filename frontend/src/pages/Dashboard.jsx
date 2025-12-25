import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStats, runMatching } from '../utils/api'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState({
    total_mentors: 0,
    total_mentees: 0,
    total_matches: 0,
    verified_matches: 0,
    unmatched_mentees: 0
  })
  const [loading, setLoading] = useState(true)
  const [matching, setMatching] = useState(false)
  const [message, setMessage] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadStats()
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const data = await getStats()
      setStats(data.stats)
    } catch (error) {
      console.error('Error loading stats:', error)
      setMessage({ type: 'error', text: 'Failed to load statistics' })
    } finally {
      setLoading(false)
    }
  }

  const handleRunMatching = async () => {
    setMatching(true)
    setMessage(null)
    try {
      // Use default weights for quick matching from dashboard
      const defaultWeights = {
        discipline: 0.4,
        location: 0.3,
        mode: 0.3
      }
      await runMatching(defaultWeights)
      setMessage({ type: 'success', text: 'Matching completed successfully!' })
      await loadStats()
      // Navigate to matching engine to see results
      setTimeout(() => navigate('/matching'), 1500)
    } catch (error) {
      console.error('Error running matching:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to run matching algorithm' })
    } finally {
      setMatching(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Mentors</h3>
          <div className="stat-value">{stats.total_mentors}</div>
        </div>
        <div className="stat-card">
          <h3>Total Mentees</h3>
          <div className="stat-value">{stats.total_mentees}</div>
        </div>
        <div className="stat-card">
          <h3>Total Matches</h3>
          <div className="stat-value">{stats.total_matches}</div>
        </div>
        <div className="stat-card">
          <h3>Verified Matches</h3>
          <div className="stat-value">{stats.verified_matches}</div>
        </div>
        <div className="stat-card">
          <h3>Unmatched Mentees</h3>
          <div className="stat-value">{stats.unmatched_mentees}</div>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button 
            className="btn btn-primary" 
            onClick={handleRunMatching}
            disabled={matching}
          >
            {matching ? 'Running Matching...' : 'Run Matching'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/data')}
          >
            Manage Data
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/matching')}
          >
            Matching Engine
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/verification')}
          >
            Verify Matches
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Overview</h2>
        <p>
          Welcome to the Alumni Mentorship Matching Platform. Use the dashboard to get a quick 
          overview of your mentorship program. Click "Run Matching" to automatically match 
          mentees with mentors based on compatibility scores.
        </p>
        <p>
          Navigate to other sections using the menu above to manage data, configure matching 
          parameters, verify matches, and view detailed reports.
        </p>
      </div>

      <div className="card">
        <h2>ℹ️ Data Persistence</h2>
        <div className="alert alert-info">
          <strong>All data is shared across all users.</strong> When you upload mentors or mentees, 
          verify matches, or make any changes, they are immediately visible to everyone using the 
          application. The data is stored on the server and persists across sessions. This ensures 
          that all team members are working with the same up-to-date information.
        </div>
      </div>
    </div>
  )
}

export default Dashboard


