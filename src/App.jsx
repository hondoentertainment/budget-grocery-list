import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'

// Gemini API for recipe parsing (uses free tier)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

function App() {
  // Item structure: { name: string, inPantry: boolean, estimatedPrice: number }
  const [items, setItems] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [budget, setBudget] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [recipeUrl, setRecipeUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef(null)

  // Load from URL params on mount (Share via Link restore)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sharedItems = params.get('items')
    const sharedBudget = params.get('budget')

    if (sharedItems) {
      try {
        const parsed = JSON.parse(decodeURIComponent(sharedItems))
        setItems(parsed)
        showNotification('Shared list loaded!')
      } catch (e) {
        console.error('Failed to parse shared items', e)
      }
    }
    if (sharedBudget) {
      setBudget(sharedBudget)
    }
  }, [])

  // Calculate estimated total
  const estimatedTotal = items
    .filter(item => !item.inPantry)
    .reduce((sum, item) => sum + (parseFloat(item.estimatedPrice) || 0), 0)

  const budgetNum = parseFloat(budget) || 0
  const isOverBudget = budgetNum > 0 && estimatedTotal > budgetNum
  const budgetProgress = budgetNum > 0 ? Math.min((estimatedTotal / budgetNum) * 100, 100) : 0

  // Generate search URLs for different retailers
  const generateAmazonUrl = (itemName) => {
    const searchQuery = encodeURIComponent(itemName)
    return `https://www.amazon.com/s?k=${searchQuery}&s=price-asc-rank`
  }

  const generateWalmartUrl = (itemName) => {
    const searchQuery = encodeURIComponent(itemName)
    return `https://www.walmart.com/search?q=${searchQuery}&sort=price_low`
  }

  const generateTargetUrl = (itemName) => {
    const searchQuery = encodeURIComponent(itemName)
    return `https://www.target.com/s?searchTerm=${searchQuery}&sortBy=PriceLow`
  }

  // Add item to list
  const addItem = useCallback((itemName = inputValue) => {
    const trimmed = (typeof itemName === 'string' ? itemName : inputValue).trim()
    if (trimmed && !items.find(i => i.name.toLowerCase() === trimmed.toLowerCase())) {
      setItems(prev => [...prev, { name: trimmed, inPantry: false, estimatedPrice: '' }])
      if (itemName === inputValue) setInputValue('')
    }
  }, [inputValue, items])

  // Add multiple items (from voice or recipe)
  const addMultipleItems = (itemNames) => {
    const newItems = itemNames
      .map(name => name.trim())
      .filter(name => name && !items.find(i => i.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({ name, inPantry: false, estimatedPrice: '' }))

    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems])
      showNotification(`Added ${newItems.length} item${newItems.length > 1 ? 's' : ''}!`)
    }
  }

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

  // Toggle pantry status
  const togglePantry = (index) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, inPantry: !item.inPantry } : item
    ))
  }

  // Update estimated price
  const updatePrice = (index, price) => {
    setItems(prev => prev.map((item, i) =>
      i === index ? { ...item, estimatedPrice: price } : item
    ))
  }

  // Show toast notification
  const showNotification = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Copy all links to clipboard
  const copyAllLinks = (retailer = 'amazon') => {
    const shoppingItems = items.filter(item => !item.inPantry)
    const urlGenerator = retailer === 'walmart' ? generateWalmartUrl
      : retailer === 'target' ? generateTargetUrl
        : generateAmazonUrl
    const links = shoppingItems.map(item => urlGenerator(item.name)).join('\n')
    navigator.clipboard.writeText(links).then(() => {
      showNotification(`All ${retailer} links copied!`)
    })
  }

  // Open all in new tabs
  const openAllLinks = (retailer = 'amazon') => {
    const shoppingItems = items.filter(item => !item.inPantry)
    const urlGenerator = retailer === 'walmart' ? generateWalmartUrl
      : retailer === 'target' ? generateTargetUrl
        : generateAmazonUrl
    shoppingItems.forEach((item, index) => {
      setTimeout(() => {
        window.open(urlGenerator(item.name), '_blank')
      }, index * 300)
    })
    showNotification(`Opening ${shoppingItems.length} ${retailer} searches...`)
  }

  // Clear all items
  const clearAll = () => {
    setItems([])
    showNotification('List cleared!')
  }

  // Share via Link - generate shareable URL
  const shareList = () => {
    const shareData = encodeURIComponent(JSON.stringify(items))
    const shareUrl = `${window.location.origin}${window.location.pathname}?items=${shareData}${budget ? `&budget=${budget}` : ''}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      showNotification('Share link copied to clipboard!')
    })
  }

  // Recipe URL Import - extract ingredients using Gemini
  const importRecipe = async () => {
    if (!recipeUrl.trim()) return

    setIsImporting(true)
    try {
      // For demo/MVP, we'll use a simple extraction approach
      // In production, you'd call Gemini API with the recipe URL
      if (GEMINI_API_KEY) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Extract just the ingredient names (not quantities) from this recipe URL: ${recipeUrl}. Return only a JSON array of ingredient names, nothing else. Example: ["flour", "sugar", "eggs"]`
                }]
              }]
            })
          }
        )
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        // Parse JSON from response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const ingredients = JSON.parse(jsonMatch[0])
          addMultipleItems(ingredients)
        }
      } else {
        // Demo mode - show example ingredients
        showNotification('Add VITE_GEMINI_API_KEY to .env for recipe import')
      }
    } catch (error) {
      console.error('Recipe import failed:', error)
      showNotification('Failed to import recipe')
    } finally {
      setIsImporting(false)
      setRecipeUrl('')
    }
  }

  // Voice Input - Web Speech API
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showNotification('Voice input not supported in this browser')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.interimResults = false

    recognitionRef.current.onstart = () => setIsListening(true)
    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.onerror = () => {
      setIsListening(false)
      showNotification('Voice recognition error')
    }

    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      // Parse items separated by "and", commas, or "comma"
      const itemList = transcript
        .toLowerCase()
        .replace(/\band\b/g, ',')
        .replace(/\bcomma\b/g, ',')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)

      addMultipleItems(itemList)
    }

    recognitionRef.current.start()
  }

  const shoppingItems = items.filter(item => !item.inPantry)

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>🛒 Budget Grocery List</h1>
          <p>Find the best deals across Amazon, Walmart & Target</p>
        </header>

        {/* Budget Input with Progress */}
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
              <div className="budget-info">
                <div className="budget-row">
                  <span className="budget-label">Budget:</span>
                  <span className="budget-amount">${parseFloat(budget).toFixed(2)}</span>
                </div>
                <div className="budget-row">
                  <span className="budget-label">Estimated:</span>
                  <span className={`budget-estimated ${isOverBudget ? 'over-budget' : ''}`}>
                    ${estimatedTotal.toFixed(2)}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-fill ${isOverBudget ? 'over-budget' : ''}`}
                    style={{ width: `${budgetProgress}%` }}
                  />
                </div>
                {isOverBudget && (
                  <div className="over-budget-warning">
                    ⚠️ Over budget by ${(estimatedTotal - budgetNum).toFixed(2)}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Recipe Import */}
        <section className="card">
          <div className="card-header">
            <div className="card-icon icon-recipe">🍳</div>
            <h2>Import Recipe</h2>
          </div>
          <div className="input-group">
            <input
              type="text"
              placeholder="Paste recipe URL (e.g., allrecipes.com/...)"
              value={recipeUrl}
              onChange={(e) => setRecipeUrl(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={importRecipe}
              disabled={isImporting}
            >
              {isImporting ? '⏳ Importing...' : '📥 Import'}
            </button>
          </div>
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
            <button className="btn btn-primary" onClick={() => addItem()}>
              Add Item
            </button>
            <button
              className={`btn btn-secondary btn-mic ${isListening ? 'listening' : ''}`}
              onClick={startVoiceInput}
              title="Voice input"
            >
              {isListening ? '🔴' : '🎤'}
            </button>
          </div>

          {items.length > 0 ? (
            <ul className="item-list">
              {items.map((item, index) => (
                <li key={index} className={`item-row ${item.inPantry ? 'in-pantry' : ''}`}>
                  <button
                    className={`btn-checkbox ${item.inPantry ? 'checked' : ''}`}
                    onClick={() => togglePantry(index)}
                    title={item.inPantry ? 'Need to buy' : 'Already have'}
                  >
                    {item.inPantry ? '✓' : ''}
                  </button>
                  <span className={item.inPantry ? 'strikethrough' : ''}>{item.name}</span>
                  <div className="price-input-wrapper">
                    <span className="price-prefix">$</span>
                    <input
                      type="number"
                      className="price-input"
                      placeholder="Est."
                      value={item.estimatedPrice}
                      onChange={(e) => updatePrice(index, e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
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

        {/* Results - Shopping Links */}
        {shoppingItems.length > 0 && (
          <section className="card">
            <div className="card-header">
              <div className="card-icon icon-results">🔗</div>
              <h2>Shopping Links ({shoppingItems.length} items)</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Click to compare prices across retailers (sorted low to high)
            </p>

            <div className="results-list">
              {shoppingItems.map((item, index) => (
                <div key={index} className="result-item">
                  <span>{item.name}</span>
                  <div className="result-actions">
                    <a
                      href={generateAmazonUrl(item.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="retailer-link amazon"
                    >
                      Amazon
                    </a>
                    <a
                      href={generateWalmartUrl(item.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="retailer-link walmart"
                    >
                      Walmart
                    </a>
                    <a
                      href={generateTargetUrl(item.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="retailer-link target"
                    >
                      Target
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <button className="btn btn-amazon" onClick={() => openAllLinks('amazon')}>
                🚀 Open All Amazon
              </button>
              <button className="btn btn-walmart" onClick={() => openAllLinks('walmart')}>
                🚀 Open All Walmart
              </button>
              <button className="btn btn-target" onClick={() => openAllLinks('target')}>
                🚀 Open All Target
              </button>
            </div>

            <div className="action-buttons">
              <button className="btn btn-success" onClick={shareList}>
                🔗 Share List
              </button>
              <button className="btn btn-secondary" onClick={() => copyAllLinks('amazon')}>
                📋 Copy Links
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
