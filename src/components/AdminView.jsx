import { useState, useEffect } from 'react'
import apiService from '../services/api'

function AdminView() {
  const [problems, setProblems] = useState([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredProblems, setFilteredProblems] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [deletedProblem, setDeletedProblem] = useState(null)
  const [showUndo, setShowUndo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const itemsPerPage = 10

  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin-authenticated')
    const savedPassword = sessionStorage.getItem('admin-password')
    if (authStatus === 'true' && savedPassword) {
      setIsAuthenticated(true)
      apiService.setAdminPassword(savedPassword)
      loadProblems()
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      filterProblems()
    }
  }, [searchQuery, problems, sortBy])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])

  const loadProblems = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await apiService.getProblems({ sortBy })
      setProblems(data)
    } catch (err) {
      console.error('Error loading problems:', err)
      setError('Failed to load problems. Please refresh the page.')
    } finally {
      setLoading(false)
    }
  }

  const filterProblems = () => {
    let filtered = problems

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.email.toLowerCase().includes(query) ||
          p.problem.toLowerCase().includes(query)
      )
    }

    filtered = sortProblems(filtered)
    setFilteredProblems(filtered)
  }

  const sortProblems = (problemsList) => {
    const sorted = [...problemsList]
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      case 'email':
        return sorted.sort((a, b) => a.email.localeCompare(b.email))
      case 'status':
        return sorted.sort((a, b) => {
          if (a.status === b.status) return 0
          return a.status === 'pending' ? -1 : 1
        })
      default:
        return sorted
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setLoading(true)

    try {
      await apiService.verifyAdminLogin(password)
      setIsAuthenticated(true)
      sessionStorage.setItem('admin-authenticated', 'true')
      sessionStorage.setItem('admin-password', password)
      await loadProblems()
    } catch (error) {
      setPasswordError('Incorrect password. Please try again.')
      console.error('Login error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin-authenticated')
    sessionStorage.removeItem('admin-password')
    apiService.clearAdminPassword()
    setPassword('')
  }

  const handleDelete = async (problemId) => {
    const problemToDelete = problems.find(p => p.id === problemId)
    if (!problemToDelete) return

    try {
      await apiService.deleteProblem(problemId)
      
      setDeletedProblem(problemToDelete)
      await loadProblems()

      setShowUndo(true)
      setTimeout(() => {
        setShowUndo(false)
        setDeletedProblem(null)
      }, 5000)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete problem: ' + error.message)
    }
  }

  const handleUndo = async () => {
    if (!deletedProblem) return

    try {
      await apiService.submitProblem(deletedProblem)
      setShowUndo(false)
      setDeletedProblem(null)
      await loadProblems()
    } catch (error) {
      console.error('Undo error:', error)
      alert('Failed to undo delete: ' + error.message)
    }
  }

  const handleStatusToggle = async (problemId) => {
    const problem = problems.find(p => p.id === problemId)
    if (!problem) return

    const newStatus = problem.status === 'pending' ? 'resolved' : 'pending'

    try {
      await apiService.updateProblemStatus(problemId, newStatus)
      await loadProblems()
    } catch (error) {
      console.error('Status toggle error:', error)
      alert('Failed to update status: ' + error.message)
    }
  }

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL problems? This cannot be undone!')) {
      return
    }

    try {
      for (const problem of problems) {
        await apiService.deleteProblem(problem.id)
      }
      setProblems([])
      setFilteredProblems([])
    } catch (error) {
      console.error('Clear all error:', error)
      alert('Failed to clear all problems: ' + error.message)
    }
  }

  const handleExportCSV = () => {
    if (problems.length === 0) return

    const csvContent = [
      ['Email', 'Problem', 'Submitted'],
      ...problems.map((p) => [
        p.email,
        `"${p.problem.replace(/"/g, '""')}"`,
        new Date(p.timestamp).toLocaleString()
      ])
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `share2solve-problems-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleCopyToClipboard = (problem) => {
    const text = `Email: ${problem.email}\nProblem: ${problem.problem}\nSubmitted: ${new Date(problem.timestamp).toLocaleString()}`
    navigator.clipboard.writeText(text).then(() => {
      alert('Problem details copied to clipboard!')
    })
  }

  const handleShareProblem = (problem) => {
    const text = `Problem from ${problem.email}:\n\n"${problem.problem}"\n\nShared via share2solve`
    const url = window.location.origin
    
    if (navigator.share) {
      navigator.share({
        title: 'Problem Shared from share2solve',
        text: text,
        url: url
      }).catch(err => console.log('Share cancelled'))
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${text}\n\n${url}`).then(() => {
        alert('Problem details copied to clipboard! You can now paste and share.')
      })
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="container">
        <section className="admin-dashboard" aria-labelledby="login-heading">
          <div className="admin-login">
            <h2 id="login-heading">🔒 Admin Login</h2>
            <p className="admin-subtitle">Enter password to access the dashboard</p>
            <form onSubmit={handleLogin} className="login-form" aria-label="Admin login form">
              <div className="form-group">
                <label htmlFor="password">Password <span aria-label="required">*</span></label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  className={passwordError ? 'input-error' : ''}
                  autoFocus
                  aria-invalid={passwordError ? 'true' : 'false'}
                  aria-describedby={passwordError ? 'password-error' : undefined}
                  aria-required="true"
                />
                {passwordError && (
                  <span className="error-message" id="password-error" role="alert">
                    {passwordError}
                  </span>
                )}
              </div>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
          </div>
        </section>
      </div>
    )
  }

  if (loading && problems.length === 0) {
    return (
      <div className="container">
        <section className="admin-dashboard" aria-labelledby="dashboard-heading">
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p>Loading problems...</p>
          </div>
        </section>
      </div>
    )
  }

  if (error && problems.length === 0) {
    return (
      <div className="container">
        <section className="admin-dashboard" aria-labelledby="dashboard-heading">
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }} role="alert">
            <p style={{ color: '#e74c3c' }}>⚠️ {error}</p>
            <button onClick={loadProblems} className="submit-btn" style={{ marginTop: '1rem' }}>
              Try Again
            </button>
          </div>
        </section>
      </div>
    )
  }

  const displayProblems = searchQuery || sortBy !== 'newest' ? filteredProblems : problems
  const recentCount = problems.filter(p => {
    const submittedTime = new Date(p.timestamp)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return submittedTime > dayAgo
  }).length

  const totalPages = Math.ceil(displayProblems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProblems = displayProblems.slice(startIndex, endIndex)

  const pendingCount = problems.filter(p => p.status === 'pending').length
  const resolvedCount = problems.filter(p => p.status === 'resolved').length

  return (
    <div className="container">
      {showUndo && (
        <div className="undo-toast" role="status" aria-live="polite" aria-atomic="true">
          <span>Problem deleted</span>
          <button 
            onClick={handleUndo} 
            className="undo-btn"
            aria-label="Undo delete action"
          >
            ↶ Undo
          </button>
        </div>
      )}
      <section className="admin-dashboard" aria-labelledby="dashboard-heading">
        <div className="admin-header">
          <div>
            <h2 id="dashboard-heading">
              Admin Dashboard
              <span className="stats-badge" aria-label={`${problems.length} total problems`}>
                {problems.length}
              </span>
            </h2>
            <div className="stats-row" role="status" aria-live="polite">
              <span className="stat-item">
                <span className="stat-icon pending" aria-hidden="true">⏳</span>
                <span className="sr-only">Pending problems: </span>
                {pendingCount} Pending
              </span>
              <span className="stat-item">
                <span className="stat-icon resolved" aria-hidden="true">✓</span>
                <span className="sr-only">Resolved problems: </span>
                {resolvedCount} Resolved
              </span>
              {recentCount > 0 && (
                <span className="stat-item">
                  <span className="stat-icon new" aria-hidden="true">🔥</span>
                  <span className="sr-only">New problems in last 24 hours: </span>
                  {recentCount} New (24h)
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="logout-btn"
            aria-label="Logout from admin dashboard"
          >
            Logout
          </button>
        </div>

        {problems.length > 0 && (
          <>
            <div className="admin-controls" role="search" aria-label="Problem search and filters">
              <div className="search-box">
                <label htmlFor="search-input" className="sr-only">Search problems</label>
                <input
                  type="search"
                  id="search-input"
                  placeholder="🔍 Search by email or problem..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                  aria-label="Search by email or problem content"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="clear-search"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="sort-box">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                  aria-label="Sort problems by"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="email">Email (A-Z)</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div className="action-buttons" role="group" aria-label="Bulk actions">
                <button 
                  onClick={handleExportCSV} 
                  className="export-btn"
                  aria-label="Export all problems to CSV file"
                >
                  📥 Export CSV
                </button>
                <button 
                  onClick={handleClearAll} 
                  className="clear-btn"
                  aria-label="Clear all problems"
                >
                  🗑️ Clear All
                </button>
              </div>
            </div>
          </>
        )}

        {problems.length === 0 ? (
          <div className="no-problems" role="status">
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">📭</span>
              <h3>No problems submitted yet</h3>
              <p>Submissions will appear here once users start sharing their problems.</p>
            </div>
          </div>
        ) : displayProblems.length === 0 ? (
          <div className="no-problems" role="status">
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">🔍</span>
              <h3>No results found</h3>
              <p>Try adjusting your search query.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="problems-list" role="list" aria-label="Problems list">
              {paginatedProblems.map((item) => (
                <article 
                  key={item.id} 
                  className={`problem-card ${item.status === 'resolved' ? 'resolved' : ''}`}
                  role="listitem"
                  aria-label={`Problem from ${item.email}, status: ${item.status}`}
                >
                  <div className="problem-header">
                    <div className="problem-info">
                      <strong>{item.email}</strong>
                      <span 
                        className={`status-badge ${item.status}`}
                        role="status"
                        aria-label={`Status: ${item.status}`}
                      >
                        {item.status === 'resolved' ? '✓ Resolved' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="problem-actions" role="group" aria-label="Problem actions">
                      <button
                        onClick={() => handleStatusToggle(item.id)}
                        className="action-icon status-icon"
                        aria-label={item.status === 'resolved' ? 'Mark as pending' : 'Mark as resolved'}
                        title={item.status === 'resolved' ? 'Mark as pending' : 'Mark as resolved'}
                      >
                        <span aria-hidden="true">{item.status === 'resolved' ? '↶' : '✓'}</span>
                      </button>
                      <button
                        onClick={() => handleShareProblem(item)}
                        className="action-icon share-icon"
                        aria-label="Share this problem"
                        title="Share problem"
                      >
                        <span aria-hidden="true">📤</span>
                      </button>
                      <button
                        onClick={() => handleCopyToClipboard(item)}
                        className="action-icon"
                        aria-label="Copy problem details to clipboard"
                        title="Copy to clipboard"
                      >
                        <span aria-hidden="true">📋</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="action-icon delete-icon"
                        aria-label="Delete this problem"
                        title="Delete problem"
                      >
                        <span aria-hidden="true">🗑️</span>
                      </button>
                    </div>
                  </div>
                  <p>{item.problem}</p>
                  <time 
                    className="problem-timestamp"
                    dateTime={item.timestamp}
                  >
                    Submitted on {new Date(item.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </time>
                </article>
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="pagination" role="navigation" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  aria-label="Go to previous page"
                  aria-disabled={currentPage === 1}
                >
                  ← Previous
                </button>
                <div className="pagination-info" role="status" aria-live="polite">
                  <span aria-current="page">Page {currentPage} of {totalPages}</span>
                  <span className="pagination-count" aria-label={`Showing items ${startIndex + 1} to ${Math.min(endIndex, displayProblems.length)} of ${displayProblems.length} total`}>
                    ({startIndex + 1}-{Math.min(endIndex, displayProblems.length)} of {displayProblems.length})
                  </span>
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  aria-label="Go to next page"
                  aria-disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default AdminView
