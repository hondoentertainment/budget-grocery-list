# Budget Grocery List — Project Roadmap

## Current State Summary

The app is a polished, feature-rich PWA with AI-powered meal planning, recipe import, voice input, multi-list management, pantry tracking, retailer price-sorted links, unit price calculator, and offline support. The foundation is strong — the next phase should deepen user engagement, improve data accuracy, and unlock collaboration.

---

## Recommended Next 10 Features

### 1. Recurring Lists & Scheduled Reminders

**Priority: High** | **Effort: Medium**

Users buy the same groceries weekly. Let them mark a list as "recurring" and set a schedule (e.g., every Sunday). The app sends a push notification or PWA badge reminding them to review and shop. On trigger, it auto-creates a new list pre-populated from the template, excluding pantry items.

**Why now:** Multi-list support already exists. This turns one-time lists into a habit loop, dramatically increasing retention.

**Key implementation details:**
- `Notification` API + service worker push events
- Recurring schedule stored in localStorage (day-of-week + time)
- "Create from template" action that clones a list, resets trip checkmarks
- Badge API (`navigator.setAppBadge`) for unobtrusive reminders

---

### 2. Drag-and-Drop List Reordering

**Priority: High** | **Effort: Medium**

Items are currently ordered by insertion time. Users should be able to drag items to match their store's aisle layout — put produce first, dairy last, etc. Reorder within categories or across the flat list.

**Why now:** The category grouping is already in place; this adds physical-world utility by letting users sort items to match how they walk through a store.

**Key implementation details:**
- Use `@dnd-kit/core` (lightweight, accessible, React-friendly)
- Persist custom sort order per list in state
- "Sort by category" button as a one-click alternative to manual drag
- Touch-friendly: long-press to initiate drag on mobile

---

### 3. Spending History & Analytics Dashboard

**Priority: High** | **Effort: Medium**

Track estimated spending over time. Show a simple dashboard: weekly/monthly spend trend, category breakdown (pie chart), average cost per trip, and budget adherence rate. All data stays in localStorage.

**Why now:** Users already enter estimated prices per item. This data is discarded after each trip — capturing it creates a compelling reason to keep using the app.

**Key implementation details:**
- On "reset trip" or "clear list," archive the list snapshot to a `history` key in localStorage
- Lightweight chart library (e.g., `chart.js` or pure SVG)
- Dashboard as a new collapsible section or separate view
- Export history as CSV for users who want spreadsheet analysis

---

### 4. Collaborative / Shared Lists (Real-Time)

**Priority: High** | **Effort: High**

Allow household members to share and co-edit a list in real time. One person adds "milk" from the kitchen while the other is already at the store checking off items.

**Why now:** URL-based sharing already works for one-way snapshots. This upgrades it to live collaboration — the #1 feature that separates a personal tool from a household utility.

**Key implementation details:**
- Use a lightweight real-time backend (Firebase Realtime DB, Supabase Realtime, or PartyKit)
- Generate a shareable room code per list
- Conflict resolution: last-write-wins for simple fields, CRDT for item additions
- Presence indicators ("Alex is viewing this list")
- Fallback: continue working offline, sync when reconnected

---

### 5. Store Loyalty Card & Coupon Integration

**Priority: Medium** | **Effort: Medium**

Surface relevant digital coupons alongside list items. Integrate with publicly available coupon/deal APIs or scrape weekly circulars for Walmart, Target, and grocery chains. Show a badge on items that have active deals.

**Why now:** The app already links to retailers for price comparison. Surfacing deals at the item level closes the loop — users see *where* to buy and *when* the price is right.

**Key implementation details:**
- Start with a curated coupon API (e.g., Coupon API, or affiliate deal feeds)
- Match coupons to list items by keyword similarity
- Display deal badge + savings estimate next to matched items
- "Total potential savings" counter in the budget section
- Affiliate links for monetization (user-transparent)

---

### 6. Receipt Scanning & Price Capture (OCR)

**Priority: Medium** | **Effort: High**

After a shopping trip, snap a photo of the receipt. The app extracts item names and actual prices via OCR, then updates estimated prices with real data. Over time, this builds a personal price database.

**Why now:** Estimated prices are educated guesses. Receipt scanning grounds them in reality, making budget tracking genuinely accurate and powering better analytics (Feature #3).

**Key implementation details:**
- Use device camera via `<input type="file" capture="environment">`
- OCR via Gemini Vision (already integrated for text tasks) or Tesseract.js (offline)
- Parse receipt format: item name + price per line
- Match scanned items to list items (fuzzy matching)
- Store actual prices in item history for future estimates

---

### 7. Smart Substitution Suggestions

**Priority: Medium** | **Effort: Medium**

When an item is expensive or out of season, suggest cheaper alternatives. "Blueberries are $6/pint in January — try frozen blueberries ($3) or swap for bananas ($0.25/each)." Powered by Gemini with seasonal/pricing context.

**Why now:** The AI infrastructure (Gemini client, proxy) is already built. This adds a new high-value AI use case that directly saves users money — the app's core promise.

**Key implementation details:**
- Trigger suggestions when an item's estimated price exceeds category average
- Gemini prompt: "Suggest 2-3 cheaper grocery substitutes for {item} in {month}"
- Display as inline suggestion below the item row
- One-click "swap" to replace the item with the suggestion
- Cache suggestions in localStorage to reduce API calls

---

### 8. Multi-Store Trip Optimizer

**Priority: Medium** | **Effort: Medium**

Given a list of items with known prices at different stores, recommend the optimal store split: "Buy these 8 items at Walmart ($34), these 3 at Target ($12) — saves $9 vs. buying everything at one store." Factor in whether the time/gas cost of multiple stops is worth it.

**Why now:** The app already links to three retailers. This transforms passive links into an active recommendation engine that answers the real question: "Where should I actually shop today?"

**Key implementation details:**
- Let users tag items with store-specific prices (or pull from receipt history)
- Optimization algorithm: greedy assignment minimizing total cost, with a "single-store preference" toggle
- Display as a trip plan: Store A list, Store B list, with total and savings
- Map integration (optional): show store locations and route

---

### 9. Dietary Preferences & Nutritional Awareness

**Priority: Medium** | **Effort: Medium**

Let users set dietary preferences (vegetarian, gluten-free, keto, dairy-free, nut allergy, etc.). The app flags items that conflict with preferences, suggests compliant alternatives, and the AI meal planner respects dietary constraints automatically.

**Why now:** The meal planner and recipe import already generate item suggestions. Adding dietary awareness makes those AI features significantly more useful and trustworthy for users with real restrictions.

**Key implementation details:**
- Dietary profile stored in app settings (localStorage)
- Allergen/diet keyword database for flagging conflicts
- Warning badge on items that conflict with preferences
- Pass dietary constraints to Gemini prompts for meal planning and substitutions
- Filter for "safe" items in recipe import results

---

### 10. Pantry Inventory with Expiration Tracking

**Priority: Medium** | **Effort: Medium**

Upgrade the pantry toggle into a full inventory system. Users can track quantities, add expiration dates, and get "use it soon" alerts. When planning a meal, the app cross-references pantry inventory to show what's missing. Items approaching expiration get surfaced for meal planning priority.

**Why now:** The pantry toggle already distinguishes "have" from "need." Expanding it into a tracked inventory connects pantry, meal planning, and shopping into a unified workflow — reducing food waste and unnecessary purchases.

**Key implementation details:**
- Extend item schema: `{ quantity, unit, expirationDate, purchaseDate }`
- Pantry view: sorted by expiration date, color-coded freshness indicators
- "Expiring soon" notification via service worker (3-day and 1-day warnings)
- Meal planner integration: "Use up: chicken breast (expires tomorrow)"
- Auto-decrement quantities when items are checked off on a trip

---

## Implementation Priority Matrix

| # | Feature | Impact | Effort | Priority |
|---|---------|--------|--------|----------|
| 1 | Recurring Lists & Reminders | High | Medium | **Start here** |
| 2 | Drag-and-Drop Reordering | High | Medium | **Start here** |
| 3 | Spending History & Analytics | High | Medium | **Start here** |
| 4 | Collaborative Shared Lists | Very High | High | Phase 2 |
| 5 | Loyalty Card & Coupons | High | Medium | Phase 2 |
| 6 | Receipt Scanning (OCR) | High | High | Phase 2 |
| 7 | Smart Substitutions | Medium | Medium | Phase 3 |
| 8 | Multi-Store Trip Optimizer | Medium | Medium | Phase 3 |
| 9 | Dietary Preferences | Medium | Medium | Phase 3 |
| 10 | Pantry Inventory & Expiration | Medium | Medium | Phase 3 |

## Suggested Phasing

**Phase 1 (Next 2-4 weeks):** Features 1-3 — high impact, medium effort, no backend dependency. These deepen engagement using the existing client-side architecture.

**Phase 2 (Following 4-6 weeks):** Features 4-6 — introduce a lightweight backend for real-time sync, coupon data, and receipt processing. This is the "household upgrade" phase.

**Phase 3 (Ongoing):** Features 7-10 — AI-powered intelligence layer. Each builds on data from earlier phases (price history from receipts, pantry inventory, dietary profiles) to make the app genuinely smarter over time.

---

*Last Updated: 2026-03-24*
