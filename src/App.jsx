import { useState, useCallback, useEffect, useRef } from 'react'
import './App.css'
import { CATEGORIES, LIST_FILTER } from './constants'
import {
  loadAppState,
  saveAppState,
  normalizeItem,
  shareableItemsPayload,
  parseSharedItems,
  newId,
} from './lib/persistence'
import { geminiGenerateContent, extractText } from './lib/gemini'
import Toast from './components/Toast'
import ListTabs from './components/ListTabs'
import BudgetSection from './components/BudgetSection'
import MealPlannerSection from './components/MealPlannerSection'
import RecipeImportSection from './components/RecipeImportSection'
import StaplesTray from './components/StaplesTray'
import ValueCalculator from './components/ValueCalculator'
import ExpertSection from './components/ExpertSection'
import ShoppingListSection from './components/ShoppingListSection'
import ShoppingLinksSection from './components/ShoppingLinksSection'

function getCategory(name) {
  const lower = name.toLowerCase()
  for (const [key, cat] of Object.entries(CATEGORIES)) {
    if (cat.keywords.some((k) => lower.includes(k))) return key
  }
  return 'OTHER'
}

function filterByListFilter(items, filter) {
  switch (filter) {
    case LIST_FILTER.TO_BUY:
      return items.filter((i) => !i.inPantry && !i.checkedOff)
    case LIST_FILTER.PANTRY:
      return items.filter((i) => i.inPantry)
    case LIST_FILTER.GOT:
      return items.filter((i) => i.checkedOff)
    default:
      return items
  }
}

function groupFilteredItems(filteredItems) {
  return Object.entries(CATEGORIES)
    .map(([key, cat]) => ({
      ...cat,
      items: filteredItems.filter((i) => i.category === key),
    }))
    .filter((g) => g.items.length > 0)
}

function useActiveList(app) {
  return app.lists.find((l) => l.id === app.activeListId) || app.lists[0]
}

function computeNewGroceryItems(itemNames, existingItems) {
  const existing = new Set(existingItems.map((i) => i.name.toLowerCase()))
  return itemNames
    .map((n) => String(n).trim())
    .filter((name) => name && !existing.has(name.toLowerCase()))
    .map((name) => {
      existing.add(name.toLowerCase())
      return normalizeItem({
        name,
        inPantry: false,
        checkedOff: false,
        estimatedPrice: '',
        category: getCategory(name),
        note: '',
      })
    })
}

export default function App() {
  const [app, setApp] = useState(loadAppState)
  const [listFilter, setListFilter] = useState(LIST_FILTER.ALL)
  const [inputValue, setInputValue] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [recipeUrl, setRecipeUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [isListening, setIsListening] = useState(false)

  const [expertHacks, setExpertHacks] = useState([])
  const [flavorProfile, setFlavorProfile] = useState(null)
  const [isLoadingHacks, setIsLoadingHacks] = useState(false)
  const [isLoadingFlavor, setIsLoadingFlavor] = useState(false)
  const [showCalc, setShowCalc] = useState(false)
  const [calcData, setCalcData] = useState({ p1: '', w1: '', p2: '', w2: '' })

  const [mealPlanInput, setMealPlanInput] = useState('')
  const [isGeneratingMeals, setIsGeneratingMeals] = useState(false)

  const recognitionRef = useRef(null)
  const hydratedFromUrl = useRef(false)
  const bulkAddedRef = useRef(0)

  const showNotification = useCallback((message) => {
    setToastMessage(message)
    setShowToast(true)
    window.setTimeout(() => setShowToast(false), 3200)
  }, [])

  const activeList = useActiveList(app)
  const items = activeList?.items ?? []
  const budget = activeList?.budget ?? ''

  const updateActiveList = useCallback((updater) => {
    setApp((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === prev.activeListId ? updater(l) : l)),
    }))
  }, [])

  useEffect(() => {
    saveAppState(app)
  }, [app])

  useEffect(() => {
    if (hydratedFromUrl.current) return
    const params = new URLSearchParams(window.location.search)
    const sharedItems = params.get('items')
    const sharedBudget = params.get('budget')
    if (!sharedItems && !sharedBudget) return
    hydratedFromUrl.current = true

    setApp((prev) => {
      const id = prev.activeListId
      return {
        ...prev,
        lists: prev.lists.map((l) => {
          if (l.id !== id) return l
          let nextItems = l.items
          if (sharedItems) {
            try {
              nextItems = parseSharedItems(sharedItems)
            } catch {
              /* ignore */
            }
          }
          return {
            ...l,
            items: nextItems,
            budget: sharedBudget != null && sharedBudget !== '' ? sharedBudget : l.budget,
          }
        }),
      }
    })
    showNotification('Shared list loaded!')
  }, [showNotification])

  const setBudget = (value) => {
    updateActiveList((l) => ({ ...l, budget: value }))
  }

  const addItem = useCallback(
    (itemName = inputValue) => {
      const trimmed = (typeof itemName === 'string' ? itemName : inputValue).trim()
      if (!trimmed) return
      let added = false
      updateActiveList((l) => {
        if (l.items.some((i) => i.name.toLowerCase() === trimmed.toLowerCase())) return l
        added = true
        return {
          ...l,
          items: [
            ...l.items,
            normalizeItem({
              name: trimmed,
              inPantry: false,
              checkedOff: false,
              estimatedPrice: '',
              category: getCategory(trimmed),
              note: '',
            }),
          ],
        }
      })
      if (added && itemName === inputValue) setInputValue('')
    },
    [inputValue, updateActiveList],
  )

  const addMultipleItems = useCallback(
    (itemNames) => {
      bulkAddedRef.current = 0
      setApp((prev) => {
        const id = prev.activeListId
        const l = prev.lists.find((x) => x.id === id)
        if (!l) return prev
        const newItems = computeNewGroceryItems(itemNames, l.items)
        bulkAddedRef.current = newItems.length
        if (!newItems.length) return prev
        return {
          ...prev,
          lists: prev.lists.map((x) => (x.id === id ? { ...x, items: [...x.items, ...newItems] } : x)),
        }
      })
      const n = bulkAddedRef.current
      if (n > 0) showNotification(`Added ${n} item${n !== 1 ? 's' : ''}!`)
    },
    [showNotification],
  )

  const runGeminiJson = async (prompt, regex) => {
    const data = await geminiGenerateContent({
      contents: [{ parts: [{ text: prompt }] }],
    })
    const text = extractText(data)
    const m = text.match(regex)
    if (!m) return null
    try {
      return JSON.parse(m[0])
    } catch {
      return null
    }
  }

  const generateMealPlan = async () => {
    if (!mealPlanInput.trim()) return
    setIsGeneratingMeals(true)
    try {
      const ingredients = await runGeminiJson(
        `Given these meals: ${mealPlanInput}

Extract ALL grocery ingredients needed to make these meals. If serving sizes are mentioned (e.g., "for 4 people"), scale ingredient quantities appropriately but only return the ingredient names.

Return ONLY a JSON array of ingredient names, nothing else. Example: ["flour", "eggs", "chicken breast", "olive oil"]`,
        /\[[\s\S]*\]/,
      )
      if (ingredients?.length) {
        addMultipleItems(ingredients)
        setMealPlanInput('')
      } else {
        showNotification('Could not parse ingredients. Try simpler phrasing.')
      }
    } catch (e) {
      if (e.message === 'NO_GEMINI') {
        showNotification('Add VITE_GEMINI_API_KEY or VITE_GEMINI_PROXY_URL for meal planning.')
      } else {
        showNotification('Failed to generate meal plan.')
      }
    } finally {
      setIsGeneratingMeals(false)
    }
  }

  const importRecipe = async () => {
    if (!recipeUrl.trim()) return
    setIsImporting(true)
    try {
      const ingredients = await runGeminiJson(
        `Extract just the ingredient names (not quantities) from this recipe URL: ${recipeUrl}. Return only a JSON array of ingredient names, nothing else. Example: ["flour", "sugar", "eggs"]`,
        /\[[\s\S]*\]/,
      )
      if (ingredients?.length) {
        addMultipleItems(ingredients)
      } else {
        showNotification('No ingredients found. Try another URL.')
      }
    } catch (e) {
      if (e.message === 'NO_GEMINI') {
        showNotification('Add VITE_GEMINI_API_KEY or VITE_GEMINI_PROXY_URL for recipe import.')
      } else {
        showNotification('Failed to import recipe.')
      }
    } finally {
      setIsImporting(false)
      setRecipeUrl('')
    }
  }

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showNotification('Voice input is not supported in this browser.')
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
      showNotification('Voice recognition error.')
    }
    recognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      const itemList = transcript
        .toLowerCase()
        .replace(/\band\b/g, ',')
        .replace(/\bcomma\b/g, ',')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
      addMultipleItems(itemList)
    }
    recognitionRef.current.start()
  }

  const estimatedTotal = items.filter((i) => !i.inPantry).reduce((sum, i) => sum + (parseFloat(i.estimatedPrice) || 0), 0)
  const budgetNum = parseFloat(budget) || 0
  const isOverBudget = budgetNum > 0 && estimatedTotal > budgetNum
  const budgetProgress = budgetNum > 0 ? Math.min((estimatedTotal / budgetNum) * 100, 100) : 0

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

  const removeItem = (id) => {
    updateActiveList((l) => ({ ...l, items: l.items.filter((i) => i.id !== id) }))
  }

  const togglePantry = (id) => {
    updateActiveList((l) => ({
      ...l,
      items: l.items.map((i) => {
        if (i.id !== id) return i
        if (i.inPantry) return { ...i, inPantry: false }
        return { ...i, inPantry: true, checkedOff: false }
      }),
    }))
  }

  const toggleCheckedOff = (id) => {
    updateActiveList((l) => ({
      ...l,
      items: l.items.map((i) => (i.id === id ? { ...i, checkedOff: !i.checkedOff } : i)),
    }))
  }

  const updatePrice = (id, price) => {
    updateActiveList((l) => ({
      ...l,
      items: l.items.map((i) => (i.id === id ? { ...i, estimatedPrice: price } : i)),
    }))
  }

  const updateNote = (id, note) => {
    updateActiveList((l) => ({
      ...l,
      items: l.items.map((i) => (i.id === id ? { ...i, note } : i)),
    }))
  }

  const resetTripCheckmarks = () => {
    updateActiveList((l) => ({
      ...l,
      items: l.items.map((i) => ({ ...i, checkedOff: false })),
    }))
    showNotification('Trip checkmarks cleared.')
  }

  const copyAllLinks = (retailer = 'amazon') => {
    const shoppingItems = items.filter((i) => !i.inPantry && !i.checkedOff)
    const urlGenerator =
      retailer === 'walmart' ? generateWalmartUrl : retailer === 'target' ? generateTargetUrl : generateAmazonUrl
    const links = shoppingItems.map((item) => urlGenerator(item.name)).join('\n')
    navigator.clipboard.writeText(links).then(() => {
      showNotification(`Copied ${retailer} links.`)
    })
  }

  const openAllLinks = (retailer = 'amazon') => {
    const shoppingItems = items.filter((i) => !i.inPantry && !i.checkedOff)
    const urlGenerator =
      retailer === 'walmart' ? generateWalmartUrl : retailer === 'target' ? generateTargetUrl : generateAmazonUrl
    shoppingItems.forEach((item, index) => {
      setTimeout(() => {
        window.open(urlGenerator(item.name), '_blank')
      }, index * 300)
    })
    showNotification(`Opening ${shoppingItems.length} ${retailer} searches…`)
  }

  const clearAll = () => {
    updateActiveList((l) => ({ ...l, items: [] }))
    showNotification('List cleared.')
  }

  const shareList = () => {
    const payload = shareableItemsPayload(items)
    const shareData = encodeURIComponent(JSON.stringify(payload))
    const shareUrl = `${window.location.origin}${window.location.pathname}?items=${shareData}${budget ? `&budget=${encodeURIComponent(budget)}` : ''}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      showNotification('Share link copied to clipboard.')
    })
  }

  const getExpertAdvice = async () => {
    if (items.length === 0) return
    setIsLoadingHacks(true)
    try {
      const itemNames = items.filter((i) => !i.inPantry).map((i) => i.name).join(', ')
      const hacks = await runGeminiJson(
        `I have these items in my grocery list: ${itemNames}. As a grocery shopping expert, give me 3 specific "Budget Hacks" or "Expert Tips" to save money on these specific types of items. Keep each tip under 12 tokens. Return ONLY a JSON array of strings.`,
        /\[[\s\S]*\]/,
      )
      if (hacks?.length) setExpertHacks(hacks)
      else
        setExpertHacks([
          'Buy store brands for pantry staples to save about 30%.',
          'Check the unit price on bulk packs before you buy.',
          'Frozen vegetables match fresh nutrition for less.',
        ])
    } catch {
      setExpertHacks([
        'Buy store brands for pantry staples to save about 30%.',
        'Check the unit price on bulk packs before you buy.',
        'Frozen vegetables match fresh nutrition for less.',
      ])
    } finally {
      setIsLoadingHacks(false)
    }
  }

  const getFlavorProfile = async () => {
    if (items.length === 0) return
    setIsLoadingFlavor(true)
    try {
      const itemNames = items.filter((i) => !i.inPantry).map((i) => i.name).join(', ')
      const profile = await runGeminiJson(
        `Analyze these grocery items: ${itemNames}. Suggest a "Culinary Strategy" to elevate these ingredients. Give me:
                  1. A "Flavor Anchor" (a primary seasoning or sauce)
                  2. Two "Pantry Essentials" to add.
                  Return ONLY a JSON object: {"anchor": "...", "pantry": ["...", "..."]}`,
        /\{[\s\S]*\}/,
      )
      if (profile?.anchor && Array.isArray(profile.pantry)) setFlavorProfile(profile)
      else
        setFlavorProfile({
          anchor: 'Garlic and herb blend',
          pantry: ['Cold-pressed olive oil', 'Smoked paprika'],
        })
    } catch {
      setFlavorProfile({
        anchor: 'Garlic and herb blend',
        pantry: ['Cold-pressed olive oil', 'Smoked paprika'],
      })
    } finally {
      setIsLoadingFlavor(false)
    }
  }

  const getValueResult = () => {
    const v1 = parseFloat(calcData.p1) / parseFloat(calcData.w1)
    const v2 = parseFloat(calcData.p2) / parseFloat(calcData.w2)
    if (!v1 || !v2 || !Number.isFinite(v1) || !Number.isFinite(v2)) return null
    return v1 < v2 ? 'Option 1 is the better per-unit deal.' : 'Option 2 is the better per-unit deal.'
  }

  const shoppingItems = items.filter((i) => !i.inPantry && !i.checkedOff)
  const filteredItems = filterByListFilter(items, listFilter)
  const groupedItems = groupFilteredItems(filteredItems)
  const filteredEmpty = items.length > 0 && filteredItems.length === 0
  const hasCheckedOff = items.some((i) => i.checkedOff)

  const needFromStore = items.filter((i) => !i.inPantry && !i.checkedOff)
  const categoryCount = new Set(needFromStore.map((i) => i.category)).size
  const pricedNeedCount = needFromStore.filter((i) => parseFloat(i.estimatedPrice) > 0).length

  const selectList = (id) => {
    setApp((prev) => ({ ...prev, activeListId: id }))
    setListFilter(LIST_FILTER.ALL)
  }

  const addList = (name) => {
    const id = newId()
    setApp((prev) => ({
      ...prev,
      lists: [...prev.lists, { id, name, budget: '', items: [] }],
      activeListId: id,
    }))
    setListFilter(LIST_FILTER.ALL)
    showNotification(`Created “${name}”.`)
  }

  const renameList = (listId, name) => {
    setApp((prev) => ({
      ...prev,
      lists: prev.lists.map((l) => (l.id === listId ? { ...l, name } : l)),
    }))
  }

  return (
    <div className="app">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <div className="container">
        <header className="header">
          <h1>Budget Grocery List</h1>
          <p>Lists, budgets, and price-sorted links across Amazon, Walmart, and Target—offline-ready.</p>
        </header>

        <ListTabs
          lists={app.lists}
          activeListId={app.activeListId}
          onSelect={selectList}
          onAddList={addList}
          onRenameList={renameList}
        />

        <main id="main-content">
          <BudgetSection
            budget={budget}
            onBudgetChange={setBudget}
            estimatedTotal={estimatedTotal}
            budgetNum={budgetNum}
            isOverBudget={isOverBudget}
            budgetProgress={budgetProgress}
          />

          <MealPlannerSection
            mealPlanInput={mealPlanInput}
            onMealPlanChange={setMealPlanInput}
            onGenerate={generateMealPlan}
            isGeneratingMeals={isGeneratingMeals}
          />

          <RecipeImportSection
            recipeUrl={recipeUrl}
            onRecipeUrlChange={setRecipeUrl}
            onImport={importRecipe}
            isImporting={isImporting}
          />

          <StaplesTray showCalc={showCalc} onToggleCalc={() => setShowCalc((v) => !v)} onAddStaple={(n) => addItem(n)} />

          {showCalc && <ValueCalculator calcData={calcData} onCalcChange={setCalcData} result={getValueResult()} />}

          {shoppingItems.length > 0 && (
            <ExpertSection
              expertHacks={expertHacks}
              onRefreshHacks={getExpertAdvice}
              isLoadingHacks={isLoadingHacks}
              flavorProfile={flavorProfile}
              onGetFlavor={getFlavorProfile}
              isLoadingFlavor={isLoadingFlavor}
            />
          )}

          <ShoppingListSection
            inputValue={inputValue}
            onInputChange={setInputValue}
            onAddItem={addItem}
            onKeyDownAdd={(e) => {
              if (e.key === 'Enter') addItem()
            }}
            onVoiceClick={startVoiceInput}
            isListening={isListening}
            listFilter={listFilter}
            onListFilterChange={setListFilter}
            groupedItems={groupedItems}
            items={items}
            filteredEmpty={filteredEmpty}
            onTogglePantry={togglePantry}
            onToggleCheckedOff={toggleCheckedOff}
            onUpdatePrice={updatePrice}
            onUpdateNote={updateNote}
            onRemoveItem={removeItem}
            onResetTrip={resetTripCheckmarks}
            hasCheckedOff={hasCheckedOff}
          />

          {shoppingItems.length > 0 && (
            <ShoppingLinksSection
              shoppingItems={shoppingItems}
              estimatedTotal={estimatedTotal}
              budgetNum={budgetNum}
              generateAmazonUrl={generateAmazonUrl}
              generateWalmartUrl={generateWalmartUrl}
              generateTargetUrl={generateTargetUrl}
              onOpenAll={openAllLinks}
              onCopyLinks={copyAllLinks}
              onShare={shareList}
              onClearAll={clearAll}
              pricedNeedCount={pricedNeedCount}
              needCount={needFromStore.length}
              categoryCount={categoryCount}
            />
          )}
        </main>
      </div>

      <Toast message={toastMessage} visible={showToast} />
    </div>
  )
}
