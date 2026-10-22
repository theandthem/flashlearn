import { useEffect, useState } from 'react'
import { deleteDeck, listDecks, scormUrl } from '../api/client'
import type { DeckSummary } from '../types'

interface DeckLibraryProps {
  onSelect: (id: string) => void
  activeId: string | null
  // Changing this value triggers a refetch (e.g. after a new deck is created).
  reloadToken: number
  // Notifies the parent after a deck is deleted (so it can clear the active view).
  onDeleted: (id: string) => void
}

type LoadState = 'loading' | 'loaded' | 'error'

export function DeckLibrary({ onSelect, activeId, reloadToken, onDeleted }: DeckLibraryProps) {
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [state, setState] = useState<LoadState>('loading')

  // Refetch on mount and whenever reloadToken changes (e.g. a new deck was created).
  useEffect(() => {
    let cancelled = false
    setState('loading')
    listDecks()
      .then((data) => {
        if (cancelled) return
        setDecks(data)
        setState('loaded')
      })
      .catch(() => {
        if (!cancelled) setState('error')
      })
    return () => {
      cancelled = true
    }
  }, [reloadToken])

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete “${title}”? This cannot be undone.`)) return
    try {
      await deleteDeck(id)
      setDecks((prev) => prev.filter((deck) => deck.id !== id))
      onDeleted(id)
    } catch {
      window.alert('Could not delete the deck. Please try again.')
    }
  }

  return (
    <section aria-labelledby="library-heading">
      <h2 id="library-heading" className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
        Your library
      </h2>

      {state === 'loading' && (
        <p role="status" className="text-sm text-slate-400">
          Loading…
        </p>
      )}

      {state === 'error' && (
        <p role="alert" className="text-sm text-red-600">
          Couldn’t load your decks.
        </p>
      )}

      {state === 'loaded' && decks.length === 0 && (
        <p className="text-sm text-slate-400">No saved decks yet.</p>
      )}

      {state === 'loaded' && decks.length > 0 && (
        <ul className="space-y-2">
          {decks.map((deck) => {
            const isActive = deck.id === activeId
            return (
              <li
                key={deck.id}
                className={`overflow-hidden rounded-lg border ${
                  isActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-white'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelect(deck.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className="w-full px-3 py-2 text-left hover:bg-indigo-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-600"
                >
                  <span className="block truncate font-medium text-slate-900">{deck.title}</span>
                  <span className="block text-xs text-slate-400">{formatDate(deck.createdAt)}</span>
                </button>
                <div className="flex gap-4 border-t border-slate-200 px-3 py-1.5 text-xs">
                  <a
                    href={scormUrl(deck.id)}
                    download
                    className="font-medium text-indigo-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  >
                    Publish (SCORM)
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(deck.id, deck.title)}
                    className="font-medium text-red-600 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
