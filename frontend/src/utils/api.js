/**
 * API utility functions for communicating with the Flask backend
 */

import axios from 'axios'

// Use environment variable for production, fallback to /api for local development
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Helper function to handle API responses
const handleResponse = (response) => {
  if (response.data.success !== false) {
    return response.data
  }
  throw new Error(response.data.error || 'API request failed')
}

// Helper function to handle errors
const handleError = (error) => {
  if (error.response) {
    // Server responded with error status
    const status = error.response.status
    const message = error.response.data?.error || error.response.data?.message || error.message
    
    if (status === 403) {
      throw new Error('Access forbidden. Please ensure the backend server is running on port 5000.')
    } else if (status === 404) {
      throw new Error('API endpoint not found. Please check the backend server.')
    } else if (status === 500) {
      throw new Error(`Server error: ${message}`)
    } else {
      throw new Error(`Request failed (${status}): ${message}`)
    }
  } else if (error.request) {
    // Request made but no response received
    throw new Error('No response from server. Please ensure the backend is running on http://localhost:5000')
  } else {
    // Error setting up the request
    throw new Error(`Request error: ${error.message}`)
  }
}

// Health check
export const healthCheck = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`)
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}

// Data management
export const getData = async (type) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get-data?type=${type}`)
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}

export const uploadData = async (type, data) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/upload-data`, {
      type,
      data
    })
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}

export const updateRecord = async (type, recordId, record) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/update-record`, {
      type,
      id: recordId,
      record
    })
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}

export const deleteRecord = async (type, recordId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/delete-record?id=${recordId}&type=${type}`)
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}

// Matching
export const runMatching = async (weights) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/run-matching`, { weights })
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}

export const getMatches = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/get-matches`)
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}

export const verifyMatch = async (menteeId, mentorId, action, newMentorId = null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verify-match`, {
      mentee_id: menteeId,
      mentor_id: mentorId,
      action,
      new_mentor_id: newMentorId
    })
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}

export const clearMatches = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/clear-matches`)
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}

export const clearAll = async (type) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/clear-all`, { type })
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}

// Statistics
export const getStats = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/stats`)
    return handleResponse(response)
  } catch (error) {
    handleError(error)
  }
}


