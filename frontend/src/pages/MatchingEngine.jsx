import React, { useState, useEffect } from 'react'
import { runMatching, getMatches, clearMatches } from '../utils/api'
import './MatchingEngine.css'

function MatchingEngine() {
  // Default weights: Discipline is most important for mentorship alignment
  // Location and Mode are more flexible
  const [weights, setWeights] = useState({
    discipline: 0.5,  // Higher weight for career/field alignment
    location: 0.3,    // Moderate weight (can work remotely)
    mode: 0.2         // Lower weight (most flexible)
  })
  const [matches, setMatches] = useState([])
  const [unmatchedMentees, setUnmatchedMentees] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    loadMatches()
  }, [])

  const loadMatches = async () => {
    try {
      const data = await getMatches()
      setMatches(data.matches || [])
      setUnmatchedMentees(data.unmatched_mentees || [])
      if (data.weights) {
        setWeights(data.weights)
      }
      if (data.matches && data.matches.length > 0) {
        setShowResults(true)
      }
    } catch (error) {
      console.error('Error loading matches:', error)
    }
  }

  const handleWeightChange = (key, value) => {
    const newWeights = { ...weights, [key]: parseFloat(value) }
    setWeights(newWeights)
  }

  const normalizeWeights = () => {
    const total = Object.values(weights).reduce((sum, w) => sum + w, 0)
    if (total === 0) return weights
    const normalized = {}
    Object.keys(weights).forEach(key => {
      normalized[key] = weights[key] / total
    })
    return normalized
  }

  const handleRunMatching = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const normalizedWeights = normalizeWeights()
      const result = await runMatching(normalizedWeights)
      setMatches(result.matches || [])
      setUnmatchedMentees(result.unmatched_mentees || [])
      setShowResults(true)
      setMessage({ 
        type: 'success', 
        text: `Matching completed! Found ${result.total_matches} matches. ${result.total_unmatched} mentees unmatched.` 
      })
    } catch (error) {
      console.error('Error running matching:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to run matching algorithm' })
    } finally {
      setLoading(false)
    }
  }

  const handleClearMatches = async () => {
    if (!window.confirm('Are you sure you want to clear all matches? This action cannot be undone.')) {
      return
    }
    
    setLoading(true)
    setMessage(null)
    try {
      await clearMatches()
      setMatches([])
      setUnmatchedMentees([])
      setShowResults(false)
      setMessage({ type: 'success', text: 'All matches cleared successfully' })
    } catch (error) {
      console.error('Error clearing matches:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to clear matches' })
    } finally {
      setLoading(false)
    }
  }

  const formatScore = (score) => {
    return (score * 100).toFixed(1) + '%'
  }

  return (
    <div className="matching-engine">
      <h1>Matching Engine</h1>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h2>Matching Parameters</h2>
        <p>Adjust the weights for each matching criterion. The weights will be normalized automatically.</p>
        <div style={{ 
          backgroundColor: '#f0f7ff', 
          border: '1px solid #b3d9ff', 
          borderRadius: '4px', 
          padding: '1rem', 
          marginBottom: '1.5rem',
          fontSize: '0.9rem'
        }}>
          <strong>💡 Recommended Settings:</strong>
          <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
            <li><strong>Discipline (50-60%):</strong> Most important - ensures career/field alignment for meaningful mentorship</li>
            <li><strong>Location (20-30%):</strong> Moderate importance - geographic proximity helps but remote options exist</li>
            <li><strong>Mode (10-20%):</strong> Least critical - meeting format can be flexible (Hybrid works with both)</li>
          </ul>
          <p style={{ margin: '0.5rem 0 0 0', fontStyle: 'italic', color: '#666' }}>
            Current defaults prioritize discipline alignment, which is ideal for mentorship programs.
          </p>
        </div>
        
        <div className="weights-container">
          <div className="slider-container">
            <div className="slider-label">
              <span>Discipline Match</span>
              <span>{formatScore(weights.discipline)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={weights.discipline}
              onChange={(e) => handleWeightChange('discipline', e.target.value)}
              className="slider"
            />
          </div>

          <div className="slider-container">
            <div className="slider-label">
              <span>Location Match</span>
              <span>{formatScore(weights.location)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={weights.location}
              onChange={(e) => handleWeightChange('location', e.target.value)}
              className="slider"
            />
          </div>

          <div className="slider-container">
            <div className="slider-label">
              <span>Mode Match</span>
              <span>{formatScore(weights.mode)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={weights.mode}
              onChange={(e) => handleWeightChange('mode', e.target.value)}
              className="slider"
            />
          </div>
        </div>

        <div className="weight-summary">
          <strong>Total Weight: {formatScore(Object.values(weights).reduce((sum, w) => sum + w, 0))}</strong>
          {Object.values(weights).reduce((sum, w) => sum + w, 0) !== 1 && (
            <span className="warning"> (Will be normalized to 100%)</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            className="btn btn-primary btn-large" 
            onClick={handleRunMatching}
            disabled={loading}
          >
            {loading ? 'Running Matching Algorithm...' : 'Run Matching'}
          </button>
          {(matches.length > 0 || showResults) && (
            <button 
              className="btn btn-secondary" 
              onClick={handleClearMatches}
              disabled={loading}
            >
              Clear All Matches
            </button>
          )}
        </div>
      </div>

      {showResults && (
        <>
          <div className="card">
            <h2>Matching Results</h2>
            <p>Found {matches.length} matches. Each mentee is matched with their best mentor and top 3 alternatives.</p>
            
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Mentee</th>
                    <th>Best Match Mentor</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Top 3 Alternatives</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                        No matches found. Run the matching algorithm first.
                      </td>
                    </tr>
                  ) : (
                    matches.map((match, index) => (
                      <tr key={index}>
                        <td><strong>{match.mentee_name}</strong></td>
                        <td>{match.mentor_name}</td>
                        <td>
                          <span className={`score-badge ${match.score > 0.7 ? 'high' : match.score > 0.4 ? 'medium' : 'low'}`}>
                            {formatScore(match.score)}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${match.status === 'verified' ? 'verified' : 'pending'}`}>
                            {match.status}
                          </span>
                        </td>
                        <td>
                          <div className="alternatives">
                            {match.top_alternatives && match.top_alternatives.length > 0 ? (
                              match.top_alternatives.map((alt, altIndex) => (
                                <div key={altIndex} className="alternative-item">
                                  {alt.mentor_name} ({formatScore(alt.score)})
                                </div>
                              ))
                            ) : (
                              <span className="text-muted">No alternatives</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {unmatchedMentees.length > 0 && (
            <div className="card">
              <h2>Unmatched Mentees ({unmatchedMentees.length})</h2>
              <p>These mentees could not be matched with any available mentors.</p>
              <div className="unmatched-list">
                {unmatchedMentees.map((mentee) => (
                  <div key={mentee.id} className="unmatched-item">
                    {mentee.name} (ID: {mentee.id})
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default MatchingEngine


