const STORAGE_KEY = 'grocery-app-v1'
const LEGACY_ITEMS = 'grocery-items'
const LEGACY_BUDGET = 'grocery-budget'

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function normalizeItem(raw) {
  return {
    id: raw.id || newId(),
    name: String(raw.name || ''),
    inPantry: !!raw.inPantry,
    checkedOff: !!raw.checkedOff,
    estimatedPrice: raw.estimatedPrice ?? '',
    category: raw.category || 'OTHER',
    note: raw.note || '',
  }
}

function normalizeList(list) {
  return {
    id: list.id || newId(),
    name: list.name || 'List',
    budget: list.budget ?? '',
    items: Array.isArray(list.items) ? list.items.map(normalizeItem) : [],
  }
}

export function loadAppState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const lists = Array.isArray(parsed.lists) ? parsed.lists.map(normalizeList) : []
      const activeListId = parsed.activeListId && lists.some((l) => l.id === parsed.activeListId)
        ? parsed.activeListId
        : lists[0]?.id
      if (lists.length) {
        return { lists, activeListId: activeListId || lists[0].id }
      }
    }
  } catch {
    /* ignore */
  }

  let legacyItems = []
  try {
    const li = localStorage.getItem(LEGACY_ITEMS)
    if (li) legacyItems = JSON.parse(li)
  } catch {
    legacyItems = []
  }
  const legacyBudget = localStorage.getItem(LEGACY_BUDGET) || ''
  const mainId = 'list-main'
  const lists = [{
    id: mainId,
    name: 'Main list',
    budget: legacyBudget,
    items: Array.isArray(legacyItems) ? legacyItems.map(normalizeItem) : [],
  }]

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lists, activeListId: mainId }))
    localStorage.removeItem(LEGACY_ITEMS)
    localStorage.removeItem(LEGACY_BUDGET)
  } catch {
    /* ignore */
  }

  return { lists, activeListId: mainId }
}

export function saveAppState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore */
  }
}

export function shareableItemsPayload(items) {
  return items.map((i) => ({
    name: i.name,
    inPantry: i.inPantry,
    checkedOff: false,
    estimatedPrice: i.estimatedPrice,
    category: i.category,
    note: i.note || '',
  }))
}

export function parseSharedItems(encoded) {
  const parsed = JSON.parse(decodeURIComponent(encoded))
  if (!Array.isArray(parsed)) return []
  return parsed.map(normalizeItem)
}

export { newId }
