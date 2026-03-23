import { useState } from 'react'

export default function ListTabs({
  lists,
  activeListId,
  onSelect,
  onAddList,
  onRenameList,
}) {
  const [draftName, setDraftName] = useState('')
  const [adding, setAdding] = useState(false)

  const submitNew = () => {
    const name = draftName.trim() || `List ${lists.length + 1}`
    onAddList(name)
    setDraftName('')
    setAdding(false)
  }

  return (
    <div className="list-tabs" role="tablist" aria-label="Shopping lists">
      <div className="list-tabs-scroll">
        {lists.map((list) => (
          <button
            key={list.id}
            type="button"
            role="tab"
            aria-selected={list.id === activeListId}
            className={`list-tab ${list.id === activeListId ? 'active' : ''}`}
            onClick={() => onSelect(list.id)}
          >
            <span className="list-tab-name">{list.name}</span>
            <span className="list-tab-meta">{list.items.filter((i) => !i.inPantry && !i.checkedOff).length}</span>
          </button>
        ))}
        {!adding ? (
          <button type="button" className="list-tab list-tab-add" onClick={() => setAdding(true)} aria-label="Create new list">
            + New list
          </button>
        ) : (
          <div className="list-tab-new">
            <input
              autoFocus
              aria-label="New list name"
              placeholder="List name"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitNew()
                if (e.key === 'Escape') {
                  setAdding(false)
                  setDraftName('')
                }
              }}
            />
            <button type="button" className="btn btn-primary btn-tiny" onClick={submitNew}>
              Add
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-tiny"
              onClick={() => {
                setAdding(false)
                setDraftName('')
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
      {lists.find((l) => l.id === activeListId) && (
        <button
          type="button"
          className="btn btn-ghost btn-rename"
          onClick={() => {
            const current = lists.find((l) => l.id === activeListId)
            const next = window.prompt('Rename list', current?.name || '')
            if (next != null && next.trim()) onRenameList(activeListId, next.trim())
          }}
        >
          Rename
        </button>
      )}
    </div>
  )
}
