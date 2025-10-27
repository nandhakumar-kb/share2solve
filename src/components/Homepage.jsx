import { useState, useEffect } from 'react'

function Homepage() {
  const [email, setEmail] = useState('')
  const [problem, setProblem] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const maxChars = 1000

  useEffect(() => {
    setCharCount(problem.length)
  }, [problem])

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleEmailChange = (e) => {
    const value = e.target.value
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  const handleProblemChange = (e) => {
    const value = e.target.value
    if (value.length <= maxChars) {
      setProblem(value)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    
    const newProblem = {
      email,
      problem,
      timestamp: new Date().toISOString()
    }

    const existingProblems = JSON.parse(localStorage.getItem('share2solve-problems') || '[]')
    existingProblems.push(newProblem)
    localStorage.setItem('share2solve-problems', JSON.stringify(existingProblems))

    setTimeout(() => {
      setEmail('')
      setProblem('')
      setEmailError('')
      setIsSubmitting(false)
      setShowSuccess(true)

      window.scrollTo({ top: 0, behavior: 'smooth' })

      setTimeout(() => {
        setShowSuccess(false)
      }, 4000)
    }, 500)
  }

  const handleShareWebsite = (platform) => {
    const url = window.location.origin
    const title = 'share2solve - Share Your Challenges'
    const text = 'Check out share2solve - a safe space to share problems and find solutions!'
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`,
      copy: null
    }

    if (platform === 'copy') {
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard!')
        setShowShareMenu(false)
      })
    } else if (platform === 'native' && navigator.share) {
      navigator.share({
        title: title,
        text: text,
        url: url
      }).catch(err => console.log('Share cancelled'))
      setShowShareMenu(false)
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
      setShowShareMenu(false)
    }
  }

  return (
    <div className="container">
      <section className="intro-section" aria-labelledby="intro-heading">
        <div className="intro-header">
          <div>
            <h2 id="intro-heading">Share Your Challenges</h2>
            <p>
              At share2solve, we believe that every problem shared is a step towards a solution. Whether you're facing technical issues, user experience hurdles, or any other challenges, we're here to listen and help. Submit your problems below, and let's work together to find effective solutions.
            </p>
          </div>
          <div className="share-website-container">
            <button 
              className="share-website-btn"
              onClick={() => setShowShareMenu(!showShareMenu)}
              aria-label="Share this website"
              aria-expanded={showShareMenu}
              aria-haspopup="true"
            >
              <span aria-hidden="true">📤</span> Share Website
            </button>
            {showShareMenu && (
              <div className="share-menu" role="menu">
                {navigator.share && (
                  <button 
                    className="share-option"
                    onClick={() => handleShareWebsite('native')}
                    role="menuitem"
                  >
                    <span aria-hidden="true">📱</span> Share
                  </button>
                )}
                <button 
                  className="share-option"
                  onClick={() => handleShareWebsite('twitter')}
                  role="menuitem"
                >
                  <span aria-hidden="true">🐦</span> Twitter
                </button>
                <button 
                  className="share-option"
                  onClick={() => handleShareWebsite('facebook')}
                  role="menuitem"
                >
                  <span aria-hidden="true">👥</span> Facebook
                </button>
                <button 
                  className="share-option"
                  onClick={() => handleShareWebsite('linkedin')}
                  role="menuitem"
                >
                  <span aria-hidden="true">💼</span> LinkedIn
                </button>
                <button 
                  className="share-option"
                  onClick={() => handleShareWebsite('whatsapp')}
                  role="menuitem"
                >
                  <span aria-hidden="true">💬</span> WhatsApp
                </button>
                <button 
                  className="share-option"
                  onClick={() => handleShareWebsite('email')}
                  role="menuitem"
                >
                  <span aria-hidden="true">✉️</span> Email
                </button>
                <button 
                  className="share-option"
                  onClick={() => handleShareWebsite('copy')}
                  role="menuitem"
                >
                  <span aria-hidden="true">🔗</span> Copy Link
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="form-section" aria-labelledby="form-heading">
        <h2 id="form-heading">Submit Your Problem</h2>
        {showSuccess && (
          <div className="success-message" role="status" aria-live="polite">
            ✓ Thank you! Your submission has been received successfully.
          </div>
        )}
        <form onSubmit={handleSubmit} aria-label="Problem submission form">
          <div className="form-group">
            <label htmlFor="email">Email Address <span aria-label="required">*</span></label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="your.email@example.com"
              required
              disabled={isSubmitting}
              className={emailError ? 'input-error' : ''}
              aria-invalid={emailError ? 'true' : 'false'}
              aria-describedby={emailError ? 'email-error' : undefined}
              aria-required="true"
            />
            {emailError && (
              <span className="error-message" id="email-error" role="alert">
                {emailError}
              </span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="problem">
              Describe Your Problem <span aria-label="required">*</span>
              <span 
                className={`char-counter ${charCount >= maxChars ? 'char-limit' : ''}`}
                id="char-counter"
                aria-live="polite"
              >
                {charCount}/{maxChars}
              </span>
            </label>
            <textarea
              id="problem"
              value={problem}
              onChange={handleProblemChange}
              placeholder="Share your thoughts, challenges, or concerns here..."
              required
              disabled={isSubmitting}
              aria-describedby="char-counter"
              aria-required="true"
              aria-label={`Problem description, ${charCount} of ${maxChars} characters used`}
            />
          </div>

          <button 
            type="submit" 
            className="submit-btn" 
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Problem'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default Homepage
