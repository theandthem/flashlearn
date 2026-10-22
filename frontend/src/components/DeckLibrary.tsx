import { useEffect, useState } from 'react'
import { listDecks } from '../api/client'
import type { DeckSummary } from '../types'

interface DeckLibraryProps {
  onSelect: (id: string) => void
  activeId: string | null
  // Changing this value triggers a refetch (e.g. after a new deck is created).
  reloadToken: number
}

type LoadState = 'loading' | 'loaded' | 'error'

export function DeckLibrary({ onSelect, activeId, reloadToken }: DeckLibraryProps) {
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
              <li key={deck.id}>
                <button
                  type="button"
                  onClick={() => onSelect(deck.id)}
                  aria-current={isActive ? 'true' : undefined}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                    isActive
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <span className="block truncate font-medium text-slate-900">{deck.title}</span>
                  <span className="block text-xs text-slate-400">{formatDate(deck.createdAt)}</span>
                </button>
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
