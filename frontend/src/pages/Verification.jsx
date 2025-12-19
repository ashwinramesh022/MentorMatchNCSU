import React, { useState, useEffect } from 'react'
import { getMatches, verifyMatch, getData } from '../utils/api'
import './Verification.css'

function Verification() {
  const [matches, setMatches] = useState([])
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState(null)
  const [reassigning, setReassigning] = useState(null)
  const [newMentorId, setNewMentorId] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [matchesData, mentorsData] = await Promise.all([
        getMatches(),
        getData('mentor')
      ])
      setMatches(matchesData.matches || [])
      setMentors(mentorsData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'Failed to load matches' })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (menteeId, mentorId) => {
    try {
      await verifyMatch(menteeId, mentorId, 'approve')
      setMessage({ type: 'success', text: 'Match approved successfully' })
      await loadData()
    } catch (error) {
      console.error('Error approving match:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to approve match' })
    }
  }

  const handleReassign = async (menteeId, oldMentorId) => {
    if (!newMentorId) {
      setMessage({ type: 'error', text: 'Please select a new mentor' })
      return
    }
    
    try {
      await verifyMatch(menteeId, oldMentorId, 'reassign', parseInt(newMentorId))
      setMessage({ type: 'success', text: 'Match reassigned successfully' })
      setReassigning(null)
      setNewMentorId('')
      await loadData()
    } catch (error) {
      console.error('Error reassigning match:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to reassign match' })
    }
  }

  const handleStartReassign = (match) => {
    setReassigning(match.mentee_id)
    setNewMentorId('')
  }

  const handleCancelReassign = () => {
    setReassigning(null)
    setNewMentorId('')
  }

  const pendingMatches = matches.filter(m => m.status === 'pending' || !m.verified)
  const verifiedMatches = matches.filter(m => m.status === 'verified' && m.verified)

  if (loading) {
    return <div className="loading">Loading matches...</div>
  }

  return (
    <div className="verification">
      <h1>Match Verification</h1>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h2>Pending Verification ({pendingMatches.length})</h2>
        <p>Review and approve or reassign matches before finalizing.</p>

        {pendingMatches.length === 0 ? (
          <p className="text-muted">No pending matches to verify.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mentee</th>
                  <th>Mentor</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingMatches.map((match, index) => (
                  <React.Fragment key={index}>
                    <tr>
                      <td><strong>{match.mentee_name}</strong></td>
                      <td>{match.mentor_name}</td>
                      <td>
                        <span className={`score-badge ${match.score > 0.7 ? 'high' : match.score > 0.4 ? 'medium' : 'low'}`}>
                          {(match.score * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        {reassigning === match.mentee_id ? (
                          <div className="reassign-controls">
                            <select
                              value={newMentorId}
                              onChange={(e) => setNewMentorId(e.target.value)}
                              style={{ marginRight: '0.5rem', minWidth: '200px' }}
                            >
                              <option value="">Select new mentor...</option>
                              {mentors
                                .filter(m => m.id !== match.mentor_id)
                                .map(mentor => (
                                  <option key={mentor.id} value={mentor.id}>
                                    {mentor.name} - {mentor.discipline}
                                  </option>
                                ))}
                            </select>
                            <button
                              className="btn btn-success"
                              onClick={() => handleReassign(match.mentee_id, match.mentor_id)}
                              style={{ marginRight: '0.5rem' }}
                            >
                              Confirm
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={handleCancelReassign}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="action-buttons">
                            <button
                              className="btn btn-success"
                              onClick={() => handleApprove(match.mentee_id, match.mentor_id)}
                              style={{ marginRight: '0.5rem' }}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleStartReassign(match)}
                            >
                              Reassign
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                    {match.top_alternatives && match.top_alternatives.length > 0 && (
                      <tr className="alternatives-row">
                        <td colSpan="4">
                          <div className="alternatives-info">
                            <strong>Alternatives:</strong>
                            {match.top_alternatives.map((alt, altIndex) => (
                              <span key={altIndex} className="alternative-tag">
                                {alt.mentor_name} ({(alt.score * 100).toFixed(1)}%)
                              </span>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Verified Matches ({verifiedMatches.length})</h2>
        <p>Matches that have been approved and finalized.</p>

        {verifiedMatches.length === 0 ? (
          <p className="text-muted">No verified matches yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Mentee</th>
                  <th>Mentor</th>
                  <th>Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {verifiedMatches.map((match, index) => (
                  <tr key={index}>
                    <td><strong>{match.mentee_name}</strong></td>
                    <td>{match.mentor_name}</td>
                    <td>
                      <span className={`score-badge ${match.score > 0.7 ? 'high' : match.score > 0.4 ? 'medium' : 'low'}`}>
                        {(match.score * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td>
                      <span className="status-badge verified">Verified</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Verification


