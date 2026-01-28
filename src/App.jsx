import { useState, useCallback } from 'react'
import './App.css'

function App() {
  const [items, setItems] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [budget, setBudget] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Generate Amazon search URL with price sorting
  const generateAmazonUrl = (item) => {
    const searchQuery = encodeURIComponent(item)
    return `https://www.amazon.com/s?k=${searchQuery}&s=price-asc-rank`
  }

  // Add item to list
  const addItem = useCallback(() => {
    const trimmed = inputValue.trim()
    if (trimmed && !items.includes(trimmed)) {
      setItems(prev => [...prev, trimmed])
      setInputValue('')
    }
  }, [inputValue, items])

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addItem()
    }
  }

  // Remove item
  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  // Show toast notification
  const showNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Copy all links to clipboard
  const copyAllLinks = () => {
    const links = items.map(item => generateAmazonUrl(item)).join('\n')
    navigator.clipboard.writeText(links).then(() => {
      showNotification('All links copied to clipboard!')
    })
  }

  // Open all in new tabs
  const openAllLinks = () => {
    items.forEach((item, index) => {
      setTimeout(() => {
        window.open(generateAmazonUrl(item), '_blank')
      }, index * 300) // Stagger to avoid popup blockers
    })
    showNotification(`Opening ${items.length} Amazon searches...`)
  }

  // Clear all items
  const clearAll = () => {
    setItems([])
    showNotification('List cleared!')
  }

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>🛒 Budget Grocery List</h1>
          <p>Find the best deals on Amazon for your shopping list</p>
        </header>

        {/* Budget Input */}
        <section className="card">
          <div className="card-header">
            <div className="card-icon icon-budget">💰</div>
            <h2>Your Budget</h2>
          </div>
          <div className="input-wrapper">
            <span className="input-prefix">$</span>
            <input
              type="number"
              className="has-prefix"
              placeholder="Enter your budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>
          {budget && (
            <div className="budget-display">
              <div>
                <div className="budget-amount">${parseFloat(budget).toFixed(2)}</div>
                <div className="budget-label">Shopping Budget</div>
              </div>
            </div>
          )}
        </section>

        {/* Item Input */}
        <section className="card">
          <div className="card-header">
            <div className="card-icon icon-items">📝</div>
            <h2>Add Items</h2>
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Enter a grocery item (e.g., organic eggs)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="btn btn-primary" onClick={addItem}>
              Add Item
            </button>
          </div>
          
          {items.length > 0 ? (
            <ul className="item-list">
              {items.map((item, index) => (
                <li key={index} className="item-row">
                  <span className="item-number">{index + 1}</span>
                  <span>{item}</span>
                  <button 
                    className="btn btn-icon btn-danger"
                    onClick={() => removeItem(index)}
                    aria-label="Remove item"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span>🛍️</span>
              <p>Add items above to build your shopping list</p>
            </div>
          )}
        </section>

        {/* Results */}
        {items.length > 0 && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon icon-results">🔗</div>
              <h2>Amazon Search Links</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Click each link to view products sorted by lowest price on Amazon
            </p>
            
            <div className="results-list">
              {items.map((item, index) => (
                <div key={index} className="result-item">
                  <span>{item}</span>
                  <div className="result-actions">
                    <a 
                      href={generateAmazonUrl(item)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="amazon-link"
                    >
                      Search on Amazon →
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <button className="btn btn-success" onClick={openAllLinks}>
                🚀 Open All in New Tabs
              </button>
              <button className="btn btn-secondary" onClick={copyAllLinks}>
                📋 Copy All Links
              </button>
              <button className="btn btn-secondary" onClick={clearAll}>
                🗑️ Clear List
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Toast notification */}
      {showToast && (
        <div className="toast toast-success">
          <span>✓</span>
          {toastMessage}
        </div>
      )}
    </div>
  )
}

export default App
