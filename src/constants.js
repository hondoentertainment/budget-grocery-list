export const CATEGORIES = {
  PRODUCE: { label: 'Produce', icon: '🥦', keywords: ['apple', 'banana', 'carrot', 'onion', 'lettuce', 'tomato', 'potato', 'fruit', 'veg', 'berry', 'spinach', 'kale'] },
  DAIRY: { label: 'Dairy & Eggs', icon: '🥛', keywords: ['milk', 'cheese', 'yogurt', 'butter', 'egg', 'cream', 'sour cream'] },
  MEAT: { label: 'Meat & Seafood', icon: '🥩', keywords: ['chicken', 'beef', 'pork', 'steak', 'salmon', 'shrimp', 'turkey', 'bacon', 'fish', 'ground'] },
  FROZEN: { label: 'Frozen', icon: '❄️', keywords: ['ice cream', 'frozen', 'pizza', 'nugget'] },
  PANTRY: { label: 'Pantry', icon: '🥫', keywords: ['rice', 'pasta', 'sauce', 'bread', 'cereal', 'flour', 'sugar', 'oil', 'spice', 'salt', 'pepper', 'can', 'bean', 'soup'] },
  SNACKS: { label: 'Snacks & Drinks', icon: '🍿', keywords: ['chip', 'cookie', 'soda', 'juice', 'coffee', 'tea', 'water', 'cracker', 'nut', 'chocolate'] },
  HOUSEHOLD: { label: 'Household', icon: '🧼', keywords: ['paper', 'soap', 'detergent', 'cleaner', 'bag', 'tinfoil', 'tissue'] },
  OTHER: { label: 'Other', icon: '📦', keywords: [] },
}

export const STAPLES = [
  { name: 'Milk', icon: '🥛' },
  { name: 'Eggs', icon: '🥚' },
  { name: 'Bread', icon: '🍞' },
  { name: 'Bananas', icon: '🍌' },
  { name: 'Coffee', icon: '☕' },
]

export const LIST_FILTER = {
  ALL: 'all',
  TO_BUY: 'to_buy',
  PANTRY: 'pantry',
  GOT: 'got',
}
