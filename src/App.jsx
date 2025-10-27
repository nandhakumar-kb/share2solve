import { useState, useEffect } from 'react'
import Homepage from './components/Homepage'
import AdminView from './components/AdminView'

function App() {
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const adminParam = urlParams.get('admin')
    setIsAdmin(adminParam === 'view')
  }, [])

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <nav className="navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-content">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="share2solve logo" className="navbar-logo" />
          <h1>share2solve</h1>
        </div>
      </nav>
      <main id="main-content" role="main">
        {isAdmin ? <AdminView /> : <Homepage />}
      </main>
    </>
  )
}

export default App
