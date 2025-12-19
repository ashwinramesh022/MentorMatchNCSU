import React, { useState, useEffect } from 'react'
import { getStats, getMatches, getData } from '../utils/api'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import './Reports.css'

function Reports() {
  const [stats, setStats] = useState({})
  const [matches, setMatches] = useState([])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, matchesData, mentorsData] = await Promise.all([
        getStats(),
        getMatches(),
        getData('mentor')
      ])
      setStats(statsData.stats || {})
      setMatches(matchesData.matches || [])
      setMentors(mentorsData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare data for charts
  const matchStatusData = [
    { name: 'Verified', value: matches.filter(m => m.status === 'verified').length },
    { name: 'Pending', value: matches.filter(m => m.status === 'pending' || !m.verified).length }
  ]

  const unmatchedData = [
    { name: 'Matched', value: stats.verified_matches || 0 },
    { name: 'Unmatched', value: stats.unmatched_mentees || 0 }
  ]

  // Mentor capacity usage
  const mentorCapacityData = Object.entries(stats.mentor_capacity_usage || {})
    .map(([mentorId, count]) => {
      const mentor = mentors.find(m => m.id === parseInt(mentorId))
      return {
        name: mentor ? mentor.name : `Mentor ${mentorId}`,
        current: count,
        max: mentor ? (mentor.max_mentees || 3) : 3,
        usage: mentor ? ((count / (mentor.max_mentees || 3)) * 100).toFixed(0) : 0
      }
    })
    .sort((a, b) => b.current - a.current)
    .slice(0, 10) // Top 10 mentors

  const COLORS = ['#3498db', '#27ae60', '#e74c3c', '#f39c12', '#9b59b6']

  if (loading) {
    return <div className="loading">Loading reports...</div>
  }

  return (
    <div className="reports">
      <h1>Reports & Analytics</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Mentors</h3>
          <div className="stat-value">{stats.total_mentors || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Mentees</h3>
          <div className="stat-value">{stats.total_mentees || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Matches</h3>
          <div className="stat-value">{stats.total_matches || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Verified Matches</h3>
          <div className="stat-value">{stats.verified_matches || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Unmatched Mentees</h3>
          <div className="stat-value">{stats.unmatched_mentees || 0}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="card chart-card">
          <h2>Match Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={matchStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {matchStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card chart-card">
          <h2>Matched vs Unmatched</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={unmatchedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {unmatchedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2>Mentor Capacity Usage (Top 10)</h2>
        <p>Shows current mentee count vs maximum capacity for each mentor.</p>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={mentorCapacityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#3498db" name="Current Mentees" />
            <Bar dataKey="max" fill="#95a5a6" name="Max Capacity" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h2>Summary</h2>
        <div className="summary-stats">
          <div className="summary-item">
            <strong>Match Rate:</strong>{' '}
            {stats.total_mentees > 0
              ? ((stats.verified_matches / stats.total_mentees) * 100).toFixed(1)
              : 0}%
          </div>
          <div className="summary-item">
            <strong>Average Mentor Utilization:</strong>{' '}
            {mentorCapacityData.length > 0
              ? (mentorCapacityData.reduce((sum, m) => sum + parseFloat(m.usage), 0) / mentorCapacityData.length).toFixed(1)
              : 0}%
          </div>
          <div className="summary-item">
            <strong>Pending Verifications:</strong>{' '}
            {matches.filter(m => m.status === 'pending' || !m.verified).length}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports


