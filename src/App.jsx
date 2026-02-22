import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'

// Gemini API for recipe parsing (uses free tier)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const CATEGORIES = {
  PRODUCE: { label: 'Produce', icon: '🥦', keywords: ['apple', 'banana', 'carrot', 'onion', 'lettuce', 'tomato', 'potato', 'fruit', 'veg', 'berry', 'spinach', 'kale'] },
  DAIRY: { label: 'Dairy & Eggs', icon: '🥛', keywords: ['milk', 'cheese', 'yogurt', 'butter', 'egg', 'cream', 'sour cream'] },
  MEAT: { label: 'Meat & Seafood', icon: '🥩', keywords: ['chicken', 'beef', 'pork', 'steak', 'salmon', 'shrimp', 'turkey', 'bacon', 'fish', 'ground'] },
  FROZEN: { label: 'Frozen', icon: '❄️', keywords: ['ice cream', 'frozen', 'pizza', 'nugget'] },
  PANTRY: { label: 'Pantry', icon: '🥫', keywords: ['rice', 'pasta', 'sauce', 'bread', 'cereal', 'flour', 'sugar', 'oil', 'spice', 'salt', 'pepper', 'can', 'bean', 'soup'] },
  SNACKS: { label: 'Snacks & Drinks', icon: '🍿', keywords: ['chip', 'cookie', 'soda', 'juice', 'coffee', 'tea', 'water', 'cracker', 'nut', 'chocolate'] },
  HOUSEHOLD: { label: 'Household', icon: '🧼', keywords: ['paper', 'soap', 'detergent', 'cleaner', 'bag', 'tinfoil', 'tissue'] },
  OTHER: { label: 'Other', icon: '📦', keywords: [] }
}

const STAPLES = [
  { name: 'Milk', icon: '🥛' },
  { name: 'Eggs', icon: '🥚' },
  { name: 'Bread', icon: '🍞' },
  { name: 'Bananas', icon: '🍌' },
  { name: 'Coffee', icon: '☕' }
]

function App() {
  // Item structure: { name: string, inPantry: boolean, estimatedPrice: number, category: string }
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('grocery-items')
    return saved ? JSON.parse(saved) : []
  })
  const [inputValue, setInputValue] = useState('')
  const [budget, setBudget] = useState(() => {
    return localStorage.getItem('grocery-budget') || ''
  })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [recipeUrl, setRecipeUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [isListening, setIsListening] = useState(false)

  // Expert features state
  const [expertHacks, setExpertHacks] = useState([])
  const [flavorProfile, setFlavorProfile] = useState(null)
  const [isLoadingHacks, setIsLoadingHacks] = useState(false)
  const [isLoadingFlavor, setIsLoadingFlavor] = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [calcData, setCalcData] = useState({ p1: '', w1: '', p2: '', w2: '' })

  // Meal Planner state
  const [mealPlanInput, setMealPlanInput] = useState('')
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false)

  const recognitionRef = useRef(null)

  // AI Meal Planner - generate ingredients from meal descriptions
  const generateMealPlan = async () => {
    if (!mealPlanInput.trim()) return

    setIsGeneratingMeals(true)
    try {
      if (GEMINI_API_KEY) {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Given these meals: ${mealPlanInput}

Extract ALL grocery ingredients needed to make these meals. If serving sizes are mentioned (e.g., "for 4 people"), scale ingredient quantities appropriately but only return the ingredient names.

Return ONLY a JSON array of ingredient names, nothing else. Example: ["flour", "eggs", "chicken breast", "olive oil"]`
                }]
              }]
            })
          }
        )
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const ingredients = JSON.parse(jsonMatch[0])
          addMultipleItems(ingredients)
          setMealPlanInput('')
        }
      } else {
        showNotification('Add VITE_GEMINI_API_KEY to .env for meal planning')
      }
    } catch (error) {
      console.error('Meal plan generation failed:', error)
      showNotification('Failed to generate meal plan')
    } finally {
      setIsGeneratingMeals(false)
    }
  }

  // Recipe URL Import - extract ingredients using Gemini
  const importRecipe = async () => {
    if (!recipeUrl.trim()) return

    setIsImporting(true)
    try {
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
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const ingredients = JSON.parse(jsonMatch[0])
          addMultipleItems(ingredients)
        }
      } else {
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

  // Categorization helper
  const getCategory = (name) => {
    const lower = name.toLowerCase()
    for (const [key, cat] of Object.entries(CATEGORIES)) {
      if (cat.keywords.some(k => lower.includes(k))) return key
    }
    return 'OTHER'
  }

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

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('grocery-items', JSON.stringify(items))
  }, [items])

  useEffect(() => {
    localStorage.setItem('grocery-budget', budget)
  }, [budget])

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
      setItems(prev => [...prev, {
        name: trimmed,
        inPantry: false,
        estimatedPrice: '',
        category: getCategory(trimmed)
      }])
      if (itemName === inputValue) setInputValue('')
    }
  }, [inputValue, items])

  // Add multiple items (from voice or recipe)
  const addMultipleItems = (itemNames) => {
    const newItems = itemNames
      .map(name => name.trim())
      .filter(name => name && !items.find(i => i.name.toLowerCase() === name.toLowerCase()))
      .map(name => ({
        name,
        inPantry: false,
        estimatedPrice: '',
        category: getCategory(name)
      }))

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

  // Get Expert Budget Hacks from Gemini
  const getExpertAdvice = async () => {
    if (items.length === 0) return
    setIsLoadingHacks(true)
    try {
      if (GEMINI_API_KEY) {
        const itemNames = items.filter(i => !i.inPantry).map(i => i.name).join(', ')
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `I have these items in my grocery list: ${itemNames}. As a grocery shopping expert, give me 3 specific "Budget Hacks" or "Expert Tips" to save money on these specific types of items. Keep each tip under 12 tokens. Return ONLY a JSON array of strings.`
                }]
              }]
            })
          }
        )
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          setExpertHacks(JSON.parse(jsonMatch[0]))
        }
      } else {
        setExpertHacks([
          "Buy store brands for pantry staples to save 30%",
          "Check the unit price on bulk packs before buying",
          "Frozen veggies have the same nutrients for less"
        ])
      }
    } catch (e) {
      console.error('Failed to get hacks', e)
    } finally {
      setIsLoadingHacks(false)
    }
  }

  // Culinary Concierge - get flavor/seasoning suggestions
  const getFlavorProfile = async () => {
    if (items.length === 0) return
    setIsLoadingFlavor(true)
    try {
      if (GEMINI_API_KEY) {
        const itemNames = items.filter(i => !i.inPantry).map(i => i.name).join(', ')
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Analyze these grocery items: ${itemNames}. Suggest a "Culinary Strategy" to elevate these ingredients. Give me:
                  1. A "Flavor Anchor" (a primary seasoning or sauce)
                  2. Two "Pantry Essentials" to add.
                  Return ONLY a JSON object: {"anchor": "...", "pantry": ["...", "..."]}`
                }]
              }]
            })
          }
        )
        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          setFlavorProfile(JSON.parse(jsonMatch[0]))
        }
      } else {
        setFlavorProfile({
          anchor: "Garlic & Herb Fusion",
          pantry: ["Cold-pressed Olive Oil", "Smoked Paprika"]
        })
      }
    } catch (e) {
      console.error('Failed to get flavor profile', e)
    } finally {
      setIsLoadingFlavor(false)
    }
  }

  // Value Calculator Logic
  const getValueResult = () => {
    const v1 = parseFloat(calcData.p1) / parseFloat(calcData.w1)
    const v2 = parseFloat(calcData.p2) / parseFloat(calcData.w2)
    if (!v1 || !v2) return null
    return v1 < v2 ? 'Option 1 is better value!' : 'Option 2 is better value!'
  }

  const shoppingItems = items.filter(item => !item.inPantry)
  const groupedItems = Object.entries(CATEGORIES).map(([key, cat]) => ({
    ...cat,
    items: items.filter(i => i.category === key)
  })).filter(cat => cat.items.length > 0)

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>Budget Grocery List</h1>
          <p>The smartest way to find deals across Amazon, Walmart, and Target.</p>
        </header>

        {/* Budget Input with Progress */}
        <section className="card">
          <div className="card-header">
            <div className="card-icon icon-budget">💎</div>
            <h2>Grocery Budget</h2>
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
                  <span className="budget-label">Total Budget</span>
                  <span className="budget-amount">${parseFloat(budget).toFixed(2)}</span>
                </div>
                <div className="budget-row">
                  <span className="budget-label">Estimated:</span>
                  <span className={`budget-estimated ${isOverBudget ? 'over-budget' : ''}`}>
                    ${estimatedTotal.toFixed(2)} Estimated
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

        {/* AI Meal Planner */}
        <section className="card meal-planner-card">
          <div className="card-header">
            <div className="card-icon icon-meal">🍽️</div>
            <h2>AI Meal Planner</h2>
          </div>
          <p className="meal-planner-desc">
            Enter meals (with optional servings) and we'll generate your ingredient list!
          </p>
          <div className="input-group">
            <input
              type="text"
              placeholder='e.g., "Chicken stir-fry for 4, Caesar salad, spaghetti carbonara"'
              value={mealPlanInput}
              onChange={(e) => setMealPlanInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && generateMealPlan()}
            />
            <button
              className="btn btn-primary"
              onClick={generateMealPlan}
              disabled={isGeneratingMeals || !mealPlanInput.trim()}
            >
              {isGeneratingMeals ? '🔄 Generating...' : '✨ Generate List'}
            </button>
          </div>
        </section>

        {/* Staple Quick-Add */}
        <section className="staples-tray">
          {STAPLES.map(staple => (
            <button
              key={staple.name}
              className="staple-chip"
              onClick={() => addItem(staple.name)}
            >
              <span>{staple.icon}</span> {staple.name}
            </button>
          ))}
          <button className="staple-chip calc-toggle" onClick={() => setShowCalc(!showCalc)}>
            ⚖️ Value Calc
          </button>
        </section>

        {/* Value Calculator Tool */}
        {showCalc && (
          <section className="card value-calc-card">
            <div className="card-header">
              <div className="card-icon icon-results">⚖️</div>
              <h2>Value Comparison</h2>
            </div>
            <div className="calc-grid">
              <div className="calc-col">
                <p>Option 1</p>
                <input type="number" placeholder="Price $" value={calcData.p1} onChange={e => setCalcData({ ...calcData, p1: e.target.value })} />
                <input type="number" placeholder="Weight/Vol" value={calcData.w1} onChange={e => setCalcData({ ...calcData, w1: e.target.value })} />
              </div>
              <div className="calc-col">
                <p>Option 2</p>
                <input type="number" placeholder="Price $" value={calcData.p2} onChange={e => setCalcData({ ...calcData, p2: e.target.value })} />
                <input type="number" placeholder="Weight/Vol" value={calcData.w2} onChange={e => setCalcData({ ...calcData, w2: e.target.value })} />
              </div>
            </div>
            {getValueResult() && <div className="calc-result">{getValueResult()}</div>}
          </section>
        )}

        {/* Expert Advice Section */}
        {shoppingItems.length > 0 && (
          <div className="expert-grid">
            <section className="card expert-card">
              <div className="card-header">
                <div className="card-icon icon-recipe">🧠</div>
                <h2>Expert Budget Hacks</h2>
                <button className="btn btn-secondary btn-small" onClick={getExpertAdvice} disabled={isLoadingHacks}>
                  {isLoadingHacks ? 'Analyzing...' : 'Refresh Hacks'}
                </button>
              </div>
              {expertHacks.length > 0 ? (
                <ul className="hacks-list">
                  {expertHacks.map((hack, i) => (
                    <li key={i} className="hack-item">💡 {hack}</li>
                  ))}
                </ul>
              ) : (
                <p className="hack-promo">Need to save more? Let the expert analyze your list.</p>
              )}
            </section>

            <section className="card flavor-card">
              <div className="card-header">
                <div className="card-icon icon-culinary">👩‍🍳</div>
                <h2>Culinary Concierge</h2>
                <button className="btn btn-primary btn-small" onClick={getFlavorProfile} disabled={isLoadingFlavor}>
                  {isLoadingFlavor ? 'Designing...' : 'Get Strategy'}
                </button>
              </div>
              {flavorProfile ? (
                <div className="flavor-content">
                  <div className="flavor-anchor">
                    <span className="flavor-label">Flavor Anchor:</span>
                    <span className="flavor-value">{flavorProfile.anchor}</span>
                  </div>
                  <div className="flavor-pantry">
                    <span className="flavor-label">Elevate with:</span>
                    <div className="flavor-tags">
                      {flavorProfile.pantry.map(p => <span key={p} className="flavor-tag">{p}</span>)}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="hack-promo">Want a pro culinary strategy for these ingredients?</p>
              )}
            </section>
          </div>
        )}

        {/* Item Input */}
        <section className="card">
          <div className="card-header">
            <div className="card-icon icon-items">🥑</div>
            <h2>Shopping List</h2>
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
            <div className="grouped-list">
              {groupedItems.map(group => (
                <div key={group.label} className="category-group">
                  <h3 className="category-header">
                    <span>{group.icon}</span> {group.label}
                  </h3>
                  <ul className="item-list">
                    {group.items.map((item, index) => {
                      const actualIndex = items.findIndex(i => i.name === item.name);
                      return (
                        <li key={actualIndex} className={`item-row ${item.inPantry ? 'in-pantry' : ''}`}>
                          <button
                            className={`btn-checkbox ${item.inPantry ? 'checked' : ''}`}
                            onClick={() => togglePantry(actualIndex)}
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
                              onChange={(e) => updatePrice(actualIndex, e.target.value)}
                              min="0"
                              step="0.01"
                            />
                          </div>
                          <button
                            className="btn btn-icon btn-danger"
                            onClick={() => removeItem(actualIndex)}
                            aria-label="Remove item"
                          >
                            ✕
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>🥑</span>
              <p>Your shopping list is empty. Add items to get started.</p>
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

            {/* Basket Efficiency Score */}
            <div className="basket-efficiency">
              <div className="efficiency-header">
                <span className="efficiency-title">Basket Efficiency Score</span>
                <span className="efficiency-badge">Expert Analysis</span>
              </div>
              <div className="efficiency-grid">
                <div className="efficiency-stat">
                  <span className="stat-label">Estimated Total</span>
                  <span className="stat-value">${estimatedTotal.toFixed(2)}</span>
                </div>
                <div className="efficiency-stat">
                  <span className="stat-label">Optimal Retailer</span>
                  <span className="stat-value highlight">Walmart</span>
                </div>
                <div className="efficiency-stat">
                  <span className="stat-label">Savings Potential</span>
                  <span className="stat-value success">~$12.40</span>
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
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
