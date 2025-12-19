import React, { useState, useEffect } from 'react'
import { getData, uploadData, updateRecord, deleteRecord, clearAll } from '../utils/api'
import './DataManagement.css'

function DataManagement() {
  const [activeTab, setActiveTab] = useState('mentor')
  const [mentors, setMentors] = useState([])
  const [mentees, setMentees] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [message, setMessage] = useState(null)
  const [csvData, setCsvData] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [mentorsData, menteesData] = await Promise.all([
        getData('mentor'),
        getData('mentee')
      ])
      setMentors(mentorsData.data || [])
      setMentees(menteesData.data || [])
    } catch (error) {
      console.error('Error loading data:', error)
      setMessage({ type: 'error', text: 'Failed to load data' })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record) => {
    setEditingId(record.id)
    setEditForm({ ...record })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const handleSaveEdit = async () => {
    try {
      await updateRecord(activeTab, editingId, editForm)
      setMessage({ type: 'success', text: 'Record updated successfully' })
      setEditingId(null)
      setEditForm({})
      await loadData()
    } catch (error) {
      console.error('Error updating record:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to update record' })
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return
    }
    try {
      await deleteRecord(activeTab, id)
      setMessage({ type: 'success', text: 'Record deleted successfully' })
      await loadData()
    } catch (error) {
      console.error('Error deleting record:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to delete record' })
    }
  }

  const handleClearAll = async () => {
    const typeName = activeTab === 'mentor' ? 'mentors' : 'mentees'
    const count = activeTab === 'mentor' ? mentors.length : mentees.length
    
    if (count === 0) {
      setMessage({ type: 'info', text: `No ${typeName} to clear` })
      return
    }
    
    if (!window.confirm(`Are you sure you want to delete ALL ${count} ${typeName}? This action cannot be undone and will also clear related matches.`)) {
      return
    }
    
    try {
      await clearAll(activeTab)
      setMessage({ type: 'success', text: `All ${typeName} cleared successfully` })
      await loadData()
    } catch (error) {
      console.error('Error clearing all:', error)
      setMessage({ type: 'error', text: error.message || `Failed to clear all ${typeName}` })
    }
  }

  const handleAddNew = () => {
    const newId = Math.max(...(activeTab === 'mentor' ? mentors : mentees).map(r => r.id || 0), 0) + 1
    const newRecord = {
      id: newId,
      name: '',
      discipline: '',
      location: '',
      mode: '',
      status: 'active',
      max_mentees: 3,
      current_mentees: 0
    }
    setEditingId(newId)
    setEditForm(newRecord)
  }

  // Robust CSV parser that supports quoted fields, commas, tabs, and newlines
  const parseCSV = (csvText) => {
    if (!csvText) return []

    const text = csvText.trim()
    
    // Detect delimiter: check if tabs are more common than commas in first few lines
    const sample = text.substring(0, Math.min(1000, text.length))
    const tabCount = (sample.match(/\t/g) || []).length
    const commaCount = (sample.match(/,/g) || []).length
    const delimiter = tabCount > commaCount ? '\t' : ','

    const rows = []
    let currentField = ''
    let currentRow = []
    let inQuotes = false

    for (let i = 0; i < text.length; i++) {
      const char = text[i]

      if (char === '"') {
        // Handle escaped quotes inside quoted fields
        if (inQuotes && text[i + 1] === '"') {
          currentField += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === delimiter && !inQuotes) {
        currentRow.push(currentField)
        currentField = ''
      } else if (char === '\n' && !inQuotes) {
        currentRow.push(currentField)
        rows.push(currentRow)
        currentRow = []
        currentField = ''
      } else if (char === '\r') {
        // Ignore carriage returns
        continue
      } else {
        currentField += char
      }
    }

    // Push the last field/row if needed
    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField)
      rows.push(currentRow)
    }

    if (rows.length < 2) return []

    // First non-empty row is headers
    const headerRow = rows[0]
    const headers = headerRow.map((h) => h.trim().toLowerCase())

    const records = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      if (!row || row.length === 0 || row.every((v) => !v || !v.trim())) {
        continue
      }

      const record = {}
      headers.forEach((header, index) => {
        record[header] = (row[index] || '').trim()
      })

      // Derive a generic "name" field if the CSV uses first/last name columns
      if (!record.name) {
        const firstName = record['first name'] || record.firstname || record['firstname'] || ''
        const lastName = record['last name'] || record.lastname || record['lastname'] || ''
        const combined = `${firstName} ${lastName}`.trim()
        if (combined) {
          record.name = combined
        }
      }

      // Skip rows that still don't have a name field
      if (!record.name) continue

      records.push(record)
    }

    return records
  }

  // Normalize raw CSV records from Google Form exports, preserving ALL original fields
  // and adding normalized fields for matching engine compatibility
  const normalizeRecordsForType = (rawRecords, type) => {
    const mapMode = (value) => {
      if (!value) return ''
      const v = value.toLowerCase()
      // Values like "Virtual, In-person" → Hybrid
      if (v.includes('virtual') && (v.includes('in-person') || v.includes('in person'))) {
        return 'Hybrid'
      }
      if (v.includes('virtual') || v.includes('zoom') || v.includes('google meet')) {
        return 'Remote'
      }
      if (v.includes('in-person') || v.includes('in person')) {
        return 'In-Person'
      }
      if (v.includes('no preference')) {
        return 'Hybrid'
      }
      return ''
    }

    const normalizeMentee = (record) => {
      // Preserve ALL original fields, just add normalized ones
      const normalized = { ...record }
      
      // Add normalized fields for matching engine
      normalized.discipline =
        record.discipline ||
        record['major(s)'] ||
        record['major'] ||
        record['major(s).'] ||
        ''

      normalized.location =
        record.location ||
        record['location of interest after graduation'] ||
        ''

      normalized.mode =
        record.mode ||
        mapMode(record['which way would you prefer to meet with your mentor?'])

      normalized.status = record.status || 'active'
      
      return normalized
    }

    const normalizeMentor = (record) => {
      // Preserve ALL original fields, just add normalized ones
      const normalized = { ...record }
      
      // Add normalized fields for matching engine
      normalized.discipline =
        record.discipline ||
        record['primary industry/field'] ||
        record["degree(s) and preferred class year(s)"] ||
        ''

      normalized.location =
        record.location ||
        record['city and state'] ||
        ''

      normalized.mode =
        record.mode ||
        mapMode(record['what type of mentorship format do you prefer?'] || record['what type of mentorship format do you prefer?  '])

      const multiStudents =
        record['are you open to mentoring multiple students?'] || ''
      const multiLower = multiStudents.toLowerCase()
      let maxMentees = 1
      if (multiLower.startsWith('yes')) {
        maxMentees = 3
      } else if (multiLower.startsWith('maybe')) {
        maxMentees = 2
      }

      normalized.status = record.status || 'active'
      normalized.max_mentees = maxMentees
      normalized.current_mentees = 0
      
      return normalized
    }

    if (type === 'mentor') {
      return rawRecords.map(normalizeMentor)
    }
    return rawRecords.map(normalizeMentee)
  }

  const handleUploadCSV = async () => {
    if (!csvData.trim()) {
      setMessage({ type: 'error', text: 'Please paste CSV data' })
      return
    }
    
    try {
      const rawRecords = parseCSV(csvData)
      const records = normalizeRecordsForType(rawRecords, activeTab)
      if (records.length === 0) {
        setMessage({ type: 'error', text: 'No valid records found in CSV' })
        return
      }
      
      await uploadData(activeTab, records)
      setMessage({ type: 'success', text: `Successfully uploaded ${records.length} records` })
      setCsvData('')
      await loadData()
    } catch (error) {
      console.error('Error uploading CSV:', error)
      setMessage({ type: 'error', text: error.message || 'Failed to upload CSV' })
    }
  }

  // Get all unique column names from the data (excluding id, timestamp, and internal fields)
  const getAllColumns = (data) => {
    if (!data || data.length === 0) return []
    
    const excludeFields = new Set(['id', 'timestamp', 'current_mentees'])
    const columns = new Set()
    
    data.forEach(record => {
      Object.keys(record).forEach(key => {
        if (!excludeFields.has(key.toLowerCase())) {
          columns.add(key)
        }
      })
    })
    
    // Sort columns: put name first, then common fields, then rest alphabetically
    const sorted = Array.from(columns).sort((a, b) => {
      const order = ['name', 'discipline', 'location', 'mode', 'status', 'max_mentees']
      const aIndex = order.indexOf(a.toLowerCase())
      const bIndex = order.indexOf(b.toLowerCase())
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex
      if (aIndex !== -1) return -1
      if (bIndex !== -1) return 1
      return a.localeCompare(b)
    })
    
    return sorted
  }

  const currentData = activeTab === 'mentor' ? mentors : mentees
  const allColumns = getAllColumns(currentData)

  // Format column name for display (capitalize, replace underscores)
  const formatColumnName = (col) => {
    return col
      .split(/[_\s]+/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  // Render cell value for a field
  const renderCellValue = (record, field) => {
    const value = record[field]
    if (value === null || value === undefined || value === '') {
      return <span style={{ color: '#999', fontStyle: 'italic' }}>—</span>
    }
    // Truncate very long values
    if (typeof value === 'string' && value.length > 100) {
      return <span title={value}>{value.substring(0, 100)}...</span>
    }
    return String(value)
  }

  // Render edit input for a field
  const renderEditInput = (field, value) => {
    const fieldLower = field.toLowerCase()
    
    // Special handling for certain fields
    if (fieldLower === 'mode') {
      return (
        <select
          value={value || ''}
          onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
        >
          <option value="">Select...</option>
          <option value="Remote">Remote</option>
          <option value="In-Person">In-Person</option>
          <option value="Hybrid">Hybrid</option>
        </select>
      )
    }
    
    if (fieldLower === 'status') {
      return (
        <select
          value={value || 'active'}
          onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      )
    }
    
    if (fieldLower === 'max_mentees') {
      return (
        <input
          type="number"
          value={value || 3}
          onChange={(e) => setEditForm({ ...editForm, [field]: parseInt(e.target.value) })}
          min="1"
          style={{ width: '60px' }}
        />
      )
    }
    
    // Default text input
    return (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
        style={{ minWidth: '150px' }}
      />
    )
  }

  if (loading) {
    return <div className="loading">Loading data...</div>
  }

  return (
    <div className="data-management">
      <h1>Data Management</h1>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'mentor' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentor')}
        >
          Mentors ({mentors.length})
        </button>
        <button 
          className={`tab ${activeTab === 'mentee' ? 'active' : ''}`}
          onClick={() => setActiveTab('mentee')}
        >
          Mentees ({mentees.length})
        </button>
      </div>

      <div className="card">
        <h2>Upload CSV Data</h2>
        <p>Paste CSV data from Google Forms. All columns will be preserved and displayed.</p>
        <textarea
          className="csv-input"
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Paste your CSV data here..."
          rows="5"
        />
        <button className="btn btn-primary" onClick={handleUploadCSV}>
          Upload CSV
        </button>
      </div>

      <div className="card">
        <div className="table-header">
          <h2>{activeTab === 'mentor' ? 'Mentors' : 'Mentees'}</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handleAddNew}>
              Add New
            </button>
            {(activeTab === 'mentor' ? mentors.length > 0 : mentees.length > 0) && (
              <button 
                className="btn btn-danger" 
                onClick={handleClearAll}
                title={`Delete all ${activeTab === 'mentor' ? 'mentors' : 'mentees'}`}
              >
                Clear All {activeTab === 'mentor' ? 'Mentors' : 'Mentees'}
              </button>
            )}
          </div>
        </div>

        {currentData.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            No {activeTab}s found. Add some data or upload a CSV.
          </div>
        ) : (
          <div className="table-container" style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <table style={{ minWidth: '100%' }}>
              <thead>
                <tr>
                  <th style={{ position: 'sticky', left: 0, backgroundColor: '#f5f5f5', zIndex: 10 }}>ID</th>
                  {allColumns.map((col) => (
                    <th key={col} style={{ minWidth: '150px' }}>
                      {formatColumnName(col)}
                    </th>
                  ))}
                  <th style={{ position: 'sticky', right: 0, backgroundColor: '#f5f5f5', zIndex: 10 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((record) => (
                  <tr key={record.id}>
                    {editingId === record.id ? (
                      <>
                        <td style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 9 }}>{record.id}</td>
                        {allColumns.map((col) => (
                          <td key={col}>
                            {renderEditInput(col, editForm[col])}
                          </td>
                        ))}
                        <td style={{ position: 'sticky', right: 0, backgroundColor: '#fff', zIndex: 9 }}>
                          <button className="btn btn-success" onClick={handleSaveEdit} style={{ marginRight: '0.5rem' }}>
                            Save
                          </button>
                          <button className="btn btn-secondary" onClick={handleCancelEdit}>
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 9 }}>{record.id}</td>
                        {allColumns.map((col) => (
                          <td key={col}>
                            {renderCellValue(record, col)}
                          </td>
                        ))}
                        <td style={{ position: 'sticky', right: 0, backgroundColor: '#fff', zIndex: 9 }}>
                          <button className="btn btn-secondary" onClick={() => handleEdit(record)} style={{ marginRight: '0.5rem' }}>
                            Edit
                          </button>
                          <button className="btn btn-danger" onClick={() => handleDelete(record.id)}>
                            Delete
                          </button>
                        </td>
                      </>
                    )}
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

export default DataManagement


