import { LIST_FILTER } from '../constants'

const FILTER_LABELS = [
  { id: LIST_FILTER.ALL, label: 'All' },
  { id: LIST_FILTER.TO_BUY, label: 'Need from store' },
  { id: LIST_FILTER.PANTRY, label: 'At home' },
  { id: LIST_FILTER.GOT, label: 'Picked up' },
]

export default function ShoppingListSection({
  inputValue,
  onInputChange,
  onAddItem,
  onKeyDownAdd,
  onVoiceClick,
  isListening,
  listFilter,
  onListFilterChange,
  groupedItems,
  items,
  filteredEmpty,
  onTogglePantry,
  onToggleCheckedOff,
  onUpdatePrice,
  onUpdateNote,
  onRemoveItem,
  onResetTrip,
  hasCheckedOff,
}) {
  return (
    <section className="card" aria-labelledby="list-heading">
      <div className="card-header">
        <div className="card-icon icon-items" aria-hidden="true">
          🥑
        </div>
        <h2 id="list-heading">Shopping list</h2>
      </div>

      <div className="list-filter-chips" role="group" aria-label="Filter list">
        {FILTER_LABELS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`filter-chip ${listFilter === f.id ? 'active' : ''}`}
            onClick={() => onListFilterChange(f.id)}
            aria-pressed={listFilter === f.id}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="input-group">
        <label className="sr-only" htmlFor="item-input">
          Add grocery item
        </label>
        <input
          id="item-input"
          type="text"
          placeholder="Enter a grocery item (e.g., organic eggs)"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDownAdd}
          autoComplete="off"
        />
        <button type="button" className="btn btn-primary" onClick={() => onAddItem()}>
          Add item
        </button>
        <button
          type="button"
          className={`btn btn-secondary btn-mic ${isListening ? 'listening' : ''}`}
          onClick={onVoiceClick}
          title="Voice input"
          aria-label={isListening ? 'Listening for voice input' : 'Add items with voice'}
        >
          {isListening ? '●' : '🎤'}
        </button>
      </div>

      {hasCheckedOff && (
        <div className="trip-actions">
          <button type="button" className="btn btn-ghost btn-small" onClick={onResetTrip}>
            Reset trip checkmarks
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          <span aria-hidden="true">🥑</span>
          <p>Your list is empty. Add items, use staples, voice, or meal planner to get started.</p>
        </div>
      ) : filteredEmpty ? (
        <div className="empty-state empty-state-soft">
          <span aria-hidden="true">🔍</span>
          <p>Nothing matches this filter. Try &quot;All&quot; or another view.</p>
        </div>
      ) : (
        <div className="grouped-list">
          {groupedItems.map((group) => (
            <div key={group.label} className="category-group">
              <h3 className="category-header">
                <span aria-hidden="true">{group.icon}</span> {group.label}
              </h3>
              <ul className="item-list">
                {group.items.map((item) => (
                  <li
                    key={item.id}
                    className={`item-row ${item.inPantry ? 'in-pantry' : ''} ${item.checkedOff ? 'checked-off' : ''}`}
                  >
                    <button
                      type="button"
                      className={`btn-checkbox ${item.inPantry ? 'checked' : ''}`}
                      onClick={() => onTogglePantry(item.id)}
                      aria-pressed={item.inPantry}
                      aria-label={item.inPantry ? `${item.name}: mark as need to buy` : `${item.name}: mark as already have at home`}
                    >
                      {item.inPantry ? '✓' : ''}
                    </button>
                    <div className="item-main">
                      <span className={item.inPantry ? 'strikethrough' : ''}>{item.name}</span>
                      {!item.inPantry && (
                        <button
                          type="button"
                          className={`btn-trip ${item.checkedOff ? 'on' : ''}`}
                          onClick={() => onToggleCheckedOff(item.id)}
                          aria-pressed={item.checkedOff}
                          aria-label={
                            item.checkedOff ? `${item.name}: mark as not yet picked up` : `${item.name}: mark picked up this trip`
                          }
                        >
                          {item.checkedOff ? 'Picked up' : 'Mark picked up'}
                        </button>
                      )}
                      <label className="item-note-label">
                        <span className="sr-only">Note for {item.name}</span>
                        <input
                          type="text"
                          className="item-note-input"
                          placeholder="Brand, size, notes…"
                          value={item.note}
                          onChange={(e) => onUpdateNote(item.id, e.target.value)}
                          maxLength={120}
                        />
                      </label>
                    </div>
                    <div className="price-input-wrapper">
                      <span className="price-prefix" aria-hidden="true">
                        $
                      </span>
                      <input
                        type="number"
                        className="price-input"
                        placeholder="Est."
                        value={item.estimatedPrice}
                        onChange={(e) => onUpdatePrice(item.id, e.target.value)}
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        aria-label={`Estimated price for ${item.name}`}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-icon btn-danger"
                      onClick={() => onRemoveItem(item.id)}
                      aria-label={`Remove ${item.name}`}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
