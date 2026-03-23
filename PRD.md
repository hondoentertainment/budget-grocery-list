# Budget Grocery List - Product Requirements Document

## 1. Product Overview

### 1.1 Purpose
Budget Grocery List is a web application designed to help users create, manage, and optimize their grocery shopping lists while staying within their budget. The app provides intelligent features like automatic categorization, price comparison across major retailers, AI-powered budget tips, and convenient input methods including voice recognition and recipe import.

### 1.2 Target Audience
- Budget-conscious shoppers
- Meal planners looking to optimize grocery spending
- Users who shop across multiple retailers (Amazon, Walmart, Target)
- Tech-savvy users who appreciate AI-assisted shopping recommendations

### 1.3 Value Proposition
- **Save Money**: AI-powered budget hacks and value comparison tools
- **Save Time**: Quick-add staples, voice input, and one-click retailer links
- **Stay Organized**: Automatic categorization and pantry tracking
- **Shop Smart**: Price comparison across Amazon, Walmart, and Target

---

## 2. Features

### 2.1 Core Features

#### 2.1.1 Budget Management
- **Budget Input**: Users can set a total grocery budget with dollar amount
- **Budget Tracking**: Real-time calculation of estimated total vs. budget
- **Visual Progress Bar**: Animated progress indicator showing budget consumption
- **Over-Budget Warnings**: Visual alerts when estimated costs exceed budget
- **Price Estimation**: Per-item estimated price input for accurate budget tracking

#### 2.1.2 Shopping List Management
- **Add Items**: Text input for adding grocery items
- **Quick-Add Staples**: One-click buttons for common items (Milk, Eggs, Bread, Bananas, Coffee)
- **Remove Items**: Individual item deletion
- **Clear All**: Bulk removal of all items
- **Duplicate Prevention**: Automatic detection and prevention of duplicate items

#### 2.1.3 Pantry Management
- **Pantry Toggle**: Mark items as "already have" to exclude from shopping
- **Visual Indicators**: Strikethrough text and reduced opacity for pantry items
- **Checkbox Interface**: Intuitive toggle buttons for pantry status

#### 2.1.4 Automatic Categorization
Items are automatically categorized based on keywords:

| Category | Icon | Keywords |
|----------|------|----------|
| Produce | 🥦 | apple, banana, carrot, onion, lettuce, tomato, potato, fruit, veg, berry, spinach, kale |
| Dairy & Eggs | 🥛 | milk, cheese, yogurt, butter, egg, cream, sour cream |
| Meat & Seafood | 🥩 | chicken, beef, pork, steak, salmon, shrimp, turkey, bacon, fish, ground |
| Frozen | ❄️ | ice cream, frozen, pizza, nugget |
| Pantry | 🥫 | rice, pasta, sauce, bread, cereal, flour, sugar, oil, spice, salt, pepper, can, bean, soup |
| Snacks & Drinks | 🍿 | chip, cookie, soda, juice, coffee, tea, water, cracker, nut, chocolate |
| Household | 🧼 | paper, soap, detergent, cleaner, bag, tinfoil, tissue |
| Other | 📦 | Default category |

### 2.2 Advanced Features

#### 2.2.1 Voice Input
- **Web Speech API Integration**: Browser-based voice recognition
- **Multi-Item Input**: Recognizes comma-separated or "and"-separated items
- **Natural Language**: Handles phrases like "milk, eggs, and bread"
- **Visual Feedback**: Pulsing animation during recording
- **Browser Support**: Works in Chrome, Edge, and other Web Speech API-compatible browsers

#### 2.2.2 Recipe Import (AI-Powered)
- **URL Import**: Extract ingredients from recipe URLs
- **Gemini AI Integration**: Uses Google's Gemini 1.5 Flash API
- **Ingredient Parsing**: Automatically extracts ingredient names from recipes
- **Bulk Addition**: Adds all extracted ingredients to the list at once
- **API Key Configuration**: Requires `VITE_GEMINI_API_KEY` environment variable

#### 2.2.3 Expert Budget Hacks (AI-Powered)
- **Contextual Tips**: AI-generated money-saving tips based on current list items
- **Gemini Integration**: Powered by Google's Gemini API
- **Fallback Content**: Default tips when API is unavailable
- **Refresh Capability**: Users can request new tips

#### 2.2.4 Value Calculator
- **Unit Price Comparison**: Compare price per unit between two products
- **Quick Access**: Toggle button in staples tray
- **Simple Interface**: Price and weight/volume inputs for two options
- **Instant Result**: Immediate calculation showing better value option

### 2.3 Retailer Integration

#### 2.3.1 Supported Retailers
| Retailer | Color Code | Sort Order |
|----------|------------|------------|
| Amazon | #ff9900 (Orange) | Price: Low to High |
| Walmart | #0071dc (Blue) | Price: Low to High |
| Target | #cc0000 (Red) | Price: Low to High |

#### 2.3.2 Shopping Links
- **Individual Links**: Each item has direct search links to all three retailers
- **Open All**: Batch open all items in retailer search pages
- **Copy Links**: Copy all retailer links to clipboard
- **Staggered Opening**: Prevents browser blocking with timed delays

### 2.4 Sharing & Persistence

#### 2.4.1 Share via Link
- **URL Encoding**: List data encoded in URL parameters
- **Budget Inclusion**: Optional budget parameter in shared links
- **One-Click Copy**: Copy shareable URL to clipboard
- **Auto-Restore**: Lists automatically load when visiting shared URLs

---

## 3. Tech Stack

### 3.1 Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | ^19.2.0 | UI Framework |
| React DOM | ^19.2.0 | DOM Rendering |
| Vite | ^7.2.4 | Build Tool & Dev Server |

### 3.2 Styling
- **CSS3**: Modern CSS with custom properties (variables)
- **Google Fonts**: Inter (body), Outfit (headings)
- **CSS Animations**: Custom keyframes for smooth transitions
- **Glassmorphism Design**: Backdrop filters, transparency effects

### 3.3 APIs & Integrations
| Service | Purpose | Endpoint |
|---------|---------|----------|
| Gemini 1.5 Flash | Recipe parsing & Budget tips | `generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent` |
| Web Speech API | Voice input | Browser native |
| Amazon Search | Price comparison | `amazon.com/s?k={query}&s=price-asc-rank` |
| Walmart Search | Price comparison | `walmart.com/search?q={query}&sort=price_low` |
| Target Search | Price comparison | `target.com/s?searchTerm={query}&sortBy=PriceLow` |

### 3.4 Development Tools
| Tool | Purpose |
|------|---------|
| ESLint | Code linting |
| @vitejs/plugin-react | React Fast Refresh |
| globals | ESLint global variables |

---

## 4. Data Models

### 4.1 Item Structure
```javascript
{
  name: string,           // Item name (e.g., "Organic Eggs")
  inPantry: boolean,      // Whether item is already owned
  estimatedPrice: number, // User's price estimate
  category: string        // Category key (e.g., "DAIRY", "PRODUCE")
}
```

### 4.2 Category Structure
```javascript
{
  label: string,    // Display name (e.g., "Dairy & Eggs")
  icon: string,     // Emoji icon (e.g., "🥛")
  keywords: array   // Keywords for auto-categorization
}
```

### 4.3 State Management
- **React useState**: Local component state
- **React useCallback**: Memoized callbacks
- **React useEffect**: Side effects (URL params, lifecycle)
- **React useRef**: Speech recognition reference

---

## 5. User Flows

### 5.1 Creating a Shopping List
```
1. User sets budget (optional)
2. User adds items via:
   - Text input (+ Enter or Add button)
   - Quick-add staple chips
   - Voice input (microphone button)
   - Recipe URL import
3. Items auto-categorize
4. User marks pantry items
5. User adds estimated prices
6. Budget progress updates in real-time
```

### 5.2 Shopping Workflow
```
1. User reviews categorized list
2. User clicks retailer links to compare prices
3. User opens all items in preferred retailer
4. User shops and marks items as purchased
```

### 5.3 Sharing Workflow
```
1. User completes list
2. User clicks "Share List"
3. URL copied to clipboard
4. Recipient opens URL
5. List and budget auto-populate
```

### 5.4 Voice Input Flow
```
1. User clicks microphone button
2. Browser requests microphone permission
3. Visual pulse animation indicates listening
4. User speaks item list
5. Speech recognized and parsed
6. Items added to list
```

---

## 6. UI/UX Design System

### 6.1 Color Palette
| Purpose | Value | Usage |
|---------|-------|-------|
| Background Primary | #020617 | Page background |
| Background Secondary | #0f172a | Card backgrounds |
| Background Card | rgba(30, 41, 59, 0.5) | Glass cards |
| Accent Primary | #818cf8 | Primary buttons, highlights |
| Accent Secondary | #6366f1 | Gradients, icons |
| Text Primary | #f8fafc | Headings, primary text |
| Text Secondary | #94a3b8 | Descriptions, labels |
| Text Muted | #64748b | Placeholders, disabled |
| Success | #10b981 | Budget OK, pantry items |
| Warning | #f59e0b | Caution states |
| Danger | #ef4444 | Over budget, errors |

### 6.2 Typography
| Element | Font | Weight | Size |
|---------|------|--------|------|
| H1 (Title) | Outfit | 800 | clamp(2rem, 5vw, 3.5rem) |
| H2 (Card Headers) | Outfit | 700 | 1.5rem |
| Body | Inter | 400/500/600 | 1rem |
| Buttons | Outfit | 700 | 1rem |
| Small Text | Inter | 600 | 0.75rem - 0.9rem |

### 6.3 Spacing & Layout
- **Container Max Width**: 900px
- **Card Padding**: 2rem (desktop), 1.5rem (mobile)
- **Card Border Radius**: 24px
- **Button Border Radius**: 14px
- **Input Border Radius**: 14px
- **Grid Gap**: 1rem - 2rem
- **Section Margin**: 2rem

### 6.4 Animations
| Animation | Duration | Easing | Purpose |
|-----------|----------|--------|---------|
| fadeInDown | 0.8s | cubic-bezier(0.16, 1, 0.3, 1) | Header entrance |
| slideIn | 0.4s | cubic-bezier(0.16, 1, 0.3, 1) | List items |
| toastPop | 0.4s | cubic-bezier(0.175, 0.885, 0.32, 1.275) | Notifications |
| pulse | 1.5s | infinite | Voice recording |
| progress-fill | 0.8s | cubic-bezier(0.16, 1, 0.3, 1) | Budget bar |

### 6.5 Responsive Breakpoints
| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Desktop | > 768px | Full layout, side-by-side elements |
| Mobile | <= 768px | Stacked layout, full-width buttons |
| Small Mobile | <= 600px | Reduced padding, compact cards |

---

## 7. Environment Configuration

### 7.1 Required Environment Variables
```
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 7.2 Optional Features
| Feature | Requirement |
|---------|-------------|
| Recipe Import | VITE_GEMINI_API_KEY |
| Expert Hacks | VITE_GEMINI_API_KEY (fallback without) |
| Voice Input | Browser with Web Speech API support |

---

## 8. Browser Compatibility

### 8.1 Supported Browsers
| Browser | Version | Notes |
|---------|---------|-------|
| Chrome | Latest | Full feature support |
| Edge | Latest | Full feature support |
| Firefox | Latest | No voice input |
| Safari | Latest | Limited testing |

### 8.2 Feature Availability
| Feature | Chrome/Edge | Firefox | Safari |
|---------|-------------|---------|--------|
| Core Features | ✅ | ✅ | ✅ |
| Voice Input | ✅ | ❌ | ❌ |
| Recipe Import | ✅ | ✅ | ✅ |
| Expert Hacks | ✅ | ✅ | ✅ |

---

## 9. Future Enhancements

### 9.1 Potential Features

#### Data Persistence & Management
| Feature | Description | Priority | Complexity |
|---------|-------------|----------|------------|
| **Local Storage Persistence** | Save lists to browser localStorage for session recovery | High | Low |
| **Multiple Lists** | Support for multiple named lists (Weekly, Party, Holiday) | High | Medium |
| **List Templates** | Pre-built templates (Keto, Vegan, Family of 4) | Medium | Low |
| **Shopping History** | Track completed shopping trips and purchased items | Medium | Medium |
| **Archive & Restore** | Archive old lists, restore when needed | Low | Low |

#### Smart Shopping Features
| Feature | Description | Priority | Complexity |
|---------|-------------|----------|------------|
| **Real Price Scraping** | Live price fetching via backend proxy | High | High |
| **Price History Charts** | Visual price trends over time | Medium | High |
| **Price Alerts** | Push notifications when prices drop | Medium | High |
| **Deal Finder** | Automatically find coupons and deals | Medium | High |
| **Alternative Suggestions** | AI suggests cheaper product alternatives | Medium | Medium |
| **Seasonal Recommendations** | Best time to buy produce and seasonal items | Low | Medium |
| **Buy-in-Bulk Advisor** | Calculate when bulk makes sense | Low | Medium |

#### AI & Automation
| Feature | Description | Priority | Complexity |
|---------|-------------|----------|------------|
| **Smart Categorization** | ML-based categorization beyond keyword matching | Medium | Medium |
| **Meal Planner Integration** | Generate lists from weekly meal plans | High | Medium |
| **Nutritional Analysis** | Recipe nutrition breakdown via AI | Medium | Medium |
| **Smart Restocking** | Auto-suggest items based on purchase history | Medium | High |
| **Receipt Scanning** | OCR to add items from receipt photos | Low | High |
| **Barcode Scanning** | Mobile camera integration for quick item add | Low | High |

#### Collaboration & Sharing
| Feature | Description | Priority | Complexity |
|---------|-------------|----------|------------|
| **Collaborative Lists** | Real-time shared editing with family/housemates | High | High |
| **Comments & Notes** | Add notes to items (brand preferences, sizes) | Medium | Low |
| **Assign Items** | Assign specific items to different shoppers | Medium | Medium |
| **Social Sharing** | Share deals and lists on social media | Low | Low |

#### Platform Expansion
| Feature | Description | Priority | Complexity |
|---------|-------------|----------|------------|
| **Mobile App** | Native iOS/Android apps with React Native | High | High |
| **Offline Mode** | Service worker for full offline functionality | High | Medium |
| **PWA Install** | Install as native-feel web app | Medium | Low |
| **Smart Watch App** | Quick list access on Apple Watch/Wear OS | Low | High |
| **Voice Assistant** | Alexa/Google Home integration | Low | High |

#### Retailer & Location
| Feature | Description | Priority | Complexity |
|---------|-------------|----------|------------|
| **Store Locator** | Find nearest store locations | Medium | Medium |
| **Store-Specific Prices** | Prices for user's local stores | High | High |
| **Inventory Check** | Check item availability before visiting | Medium | High |
| **Curbside Integration** | Add items directly to retailer curbside carts | Medium | High |
| **More Retailers** | Add Kroger, Costco, Aldi, Instacart | Medium | Medium |

### 9.2 API Enhancements
| Enhancement | Description | Impact |
|-------------|-------------|--------|
| **Backend Service** | Node.js/Express API for price scraping and data persistence | Enables real-time prices, user accounts |
| **Database** | MongoDB/PostgreSQL for user data and price history | Scalable data storage |
| **Redis Cache** | Cache frequently accessed prices | Faster load times |
| **WebSocket Server** | Real-time collaboration updates | Instant sync across devices |
| **Push Notification Service** | Firebase Cloud Messaging for price alerts | User engagement |

### 9.3 Monetization Opportunities
| Model | Description | Implementation |
|-------|-------------|----------------|
| **Freemium** | Basic features free, advanced features paid | Price alerts, unlimited lists, collaboration |
| **Affiliate Links** | Earn commission on retailer clicks | Amazon Associates, Walmart API |
| **Premium AI** | Advanced AI features with subscription | Meal planning, nutrition analysis |
| **White Label** | License to grocery chains | Custom branded versions |

### 9.4 Technical Debt & Improvements
| Improvement | Description | Benefit |
|-------------|-------------|---------|
| **TypeScript Migration** | Convert to TypeScript for type safety | Fewer bugs, better DX |
| **Component Library** | Extract reusable components | Consistency, faster development |
| **Testing Suite** | Jest + React Testing Library | Confidence in changes |
| **E2E Testing** | Cypress/Playwright tests | Prevent regressions |
| **Performance Audit** | Lighthouse optimization | Better UX, SEO |
| **Accessibility Audit** | WCAG 2.1 AA compliance | Inclusive design |

---

## 10. Security Considerations

### 10.1 API Key Security
- `VITE_GEMINI_API_KEY` is embedded in the client bundle at build time—acceptable for personal/local use only
- For public deployments, prefer the optional **server proxy** (`api/gemini.js` on Vercel) with `GEMINI_API_KEY` on the server and `VITE_GEMINI_PROXY_URL` pointing at `/api/gemini`
- Users can supply their own key for AI features when running locally

### 10.2 Data Privacy
- No server-side data storage (unless you deploy the optional Gemini proxy, which does not persist list data)
- Lists and budgets persist in **browser `localStorage`** under `grocery-app-v1` for recovery across sessions
- Shared lists use URL-encoded JSON (`items`, optional `budget`); treat shared links like sensitive data if lists are private
- No user tracking or analytics in the default app

---

## 11. Performance Considerations

### 11.1 Optimizations
- **React.memo**: Not currently implemented, opportunity for optimization
- **Lazy Loading**: Not currently implemented
- **Image Optimization**: No images (emoji-based icons)
- **Bundle Size**: Minimal dependencies (React + Vite only)

### 11.2 Performance Metrics
- **First Contentful Paint**: < 1.5s (estimated)
- **Time to Interactive**: < 3s (estimated)
- **Bundle Size**: ~100KB (estimated, gzipped)

---

## 12. Development Guidelines

### 12.1 Code Organization
```
src/
├── App.jsx              # Shell: state, persistence, handlers
├── App.css              # Layout and feature styles
├── main.jsx             # Entry (includes PWA service worker registration)
├── index.css            # Global styles, variables, a11y helpers
├── constants.js         # Categories, staples, filter keys
├── lib/
│   ├── persistence.js   # localStorage schema, migration, share payloads
│   └── gemini.js        # Gemini / proxy client
├── components/          # Presentational sections (budget, list, links, …)
└── assets/
```

### 12.2 Naming Conventions
- **Components**: PascalCase (e.g., `App.jsx`)
- **Functions**: camelCase (e.g., `addItem`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CATEGORIES`)
- **CSS Classes**: kebab-case (e.g., `item-row`)

### 12.3 State Management Rules
- Use `useState` for component state
- Use `useCallback` for event handlers passed to children
- Use `useEffect` for side effects and lifecycle management
- Avoid prop drilling (current scale doesn't require context)

---

## 13. Testing Requirements

### 13.1 Automated tests
- Playwright E2E in `tests/` — run `npm run test:e2e` (see GitHub Actions workflow)

### 13.2 Manual Testing Checklist
- [ ] Budget input and tracking
- [ ] Add/remove items
- [ ] Pantry toggle functionality
- [ ] Voice input (Chrome/Edge)
- [ ] Recipe URL import (with API key)
- [ ] Expert hacks generation
- [ ] Value calculator
- [ ] Retailer link generation
- [ ] Share link generation and loading
- [ ] Responsive layout (mobile/desktop)
- [ ] Over-budget warnings
- [ ] Empty state display

### 13.3 Browser Testing
- [ ] Chrome (Windows/Mac)
- [ ] Edge (Windows)
- [ ] Firefox (Windows/Mac)
- [ ] Safari (Mac/iOS)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## 14. Deployment

### 14.1 Build Process
```bash
npm run build
```

### 14.2 Output
- Static files in `dist/` directory
- No server-side requirements
- Can be deployed to any static hosting (Vercel, Netlify, GitHub Pages)

### 14.3 Environment Setup
1. Set `VITE_GEMINI_API_KEY` in build environment
2. Run build command
3. Deploy `dist/` contents

---

*Document Version: 1.0*
*Last Updated: 2026-02-04*
*Author: Kilo Code*
