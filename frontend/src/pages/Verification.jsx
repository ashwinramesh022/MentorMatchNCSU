import React, { useState, useEffect } from 'react'
import { getMatches, verifyMatch, getData } from '../utils/api'
import * as XLSX from 'xlsx'
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

  const handleExportToExcel = async () => {
    const verifiedMatches = matches.filter(m => m.status === 'verified' && m.verified)
    
    if (verifiedMatches.length === 0) {
      setMessage({ type: 'error', text: 'No verified matches to export' })
      return
    }

    try {
      // Fetch full mentor and mentee data to get additional details
      const [mentorsData, menteesData] = await Promise.all([
        getData('mentor'),
        getData('mentee')
      ])
      
      const allMentors = mentorsData.data || []
      const allMentees = menteesData.data || []
      
      // Create lookup maps
      const mentorMap = new Map(allMentors.map(m => [m.id, m]))
      const menteeMap = new Map(allMentees.map(m => [m.id, m]))

      // Prepare data for Excel with full details
      const excelData = verifiedMatches.map((match, index) => {
        const mentor = mentorMap.get(match.mentor_id) || {}
        const mentee = menteeMap.get(match.mentee_id) || {}
        
        return {
          'Match #': index + 1,
          'Mentee Name': match.mentee_name || mentee.name || '',
          'Mentee Email': mentee.email || mentee.Email || '',
          'Mentee ID': match.mentee_id || '',
          'Mentee Discipline': mentee.discipline || '',
          'Mentee Location': mentee.location || '',
          'Mentee Mode': mentee.mode || '',
          'Mentor Name': match.mentor_name || mentor.name || '',
          'Mentor Email': mentor.email || mentor.Email || '',
          'Mentor ID': match.mentor_id || '',
          'Mentor Discipline': mentor.discipline || '',
          'Mentor Location': mentor.location || '',
          'Mentor Mode': mentor.mode || '',
          'Compatibility Score (%)': ((match.score || 0) * 100).toFixed(1),
          'Status': 'Verified',
          'Date Exported': new Date().toLocaleDateString()
        }
      })

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Verified Matches')

      // Set column widths
      const colWidths = [
        { wch: 10 }, // Match #
        { wch: 25 }, // Mentee Name
        { wch: 30 }, // Mentee Email
        { wch: 12 }, // Mentee ID
        { wch: 20 }, // Mentee Discipline
        { wch: 20 }, // Mentee Location
        { wch: 15 }, // Mentee Mode
        { wch: 25 }, // Mentor Name
        { wch: 30 }, // Mentor Email
        { wch: 12 }, // Mentor ID
        { wch: 20 }, // Mentor Discipline
        { wch: 20 }, // Mentor Location
        { wch: 15 }, // Mentor Mode
        { wch: 20 }, // Compatibility Score
        { wch: 12 }, // Status
        { wch: 15 }  // Date Exported
      ]
      ws['!cols'] = colWidths

      // Generate filename with current date
      const filename = `Verified_Matches_${new Date().toISOString().split('T')[0]}.xlsx`

      // Download file
      XLSX.writeFile(wb, filename)
      setMessage({ type: 'success', text: `Exported ${verifiedMatches.length} verified matches to Excel` })
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      setMessage({ type: 'error', text: 'Failed to export matches. Please try again.' })
    }
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ margin: 0 }}>Verified Matches ({verifiedMatches.length})</h2>
            <p style={{ margin: '0.5rem 0 0 0' }}>Matches that have been approved and finalized.</p>
          </div>
          {verifiedMatches.length > 0 && (
            <button 
              className="btn btn-success" 
              onClick={handleExportToExcel}
              style={{ whiteSpace: 'nowrap' }}
            >
              📥 Export to Excel
            </button>
          )}
        </div>

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


