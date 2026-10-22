import { useCallback, useEffect, useState } from 'react'
import type { FlashcardView } from '../types'

interface FlashcardPlayerProps {
  flashcards: FlashcardView[]
  onStartQuiz: () => void
}

export function FlashcardPlayer({ flashcards, onStartQuiz }: FlashcardPlayerProps) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  const total = flashcards.length
  const card = flashcards[index]

  const goNext = useCallback(() => {
    setFlipped(false)
    setIndex((i) => Math.min(i + 1, total - 1))
  }, [total])

  const goPrev = useCallback(() => {
    setFlipped(false)
    setIndex((i) => Math.max(i - 1, 0))
  }, [])

  const toggleFlip = useCallback(() => setFlipped((f) => !f), [])

  // Keyboard shortcuts: ←/→ to move, Space/Enter to flip. Ignored while typing.
  useEffect(() => {
    function handleKey(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (event.key === 'ArrowRight') {
        goNext()
      } else if (event.key === 'ArrowLeft') {
        goPrev()
      } else if (event.key === ' ' || event.key === 'Enter') {
        // Only hijack Space/Enter when not focused on a button (buttons handle their own).
        if (target.tagName !== 'BUTTON') {
          event.preventDefault()
          toggleFlip()
        }
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goNext, goPrev, toggleFlip])

  return (
    <section aria-roledescription="flashcard deck" aria-label="Flashcards" className="mx-auto w-full max-w-2xl">
      {/* Announces the visible content whenever the card or face changes. */}
      <p aria-live="polite" className="sr-only">
        {`Card ${index + 1} of ${total}. ${
          flipped ? `Answer: ${card.answer}. ${card.explanation ?? ''}` : `Question: ${card.question}`
        }`}
      </p>

      <div className="flip-scene mb-4">
        <button
          type="button"
          onClick={toggleFlip}
          aria-pressed={flipped}
          aria-label={flipped ? 'Showing answer. Activate to show the question.' : 'Showing question. Activate to show the answer.'}
          className={`flip-card flex min-h-64 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
            flipped ? 'is-flipped' : ''
          }`}
        >
          <span className="flip-face" aria-hidden={flipped}>
            <span className="text-xl font-medium text-slate-900">{card.question}</span>
          </span>
          <span className="flip-face flip-face--back flex flex-col items-center justify-center gap-3 p-8" aria-hidden={!flipped}>
            <span className="text-xl font-medium text-slate-900">{card.answer}</span>
            {card.explanation && (
              <span className="text-sm text-slate-500">{card.explanation}</span>
            )}
          </span>
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>

        <span className="text-sm text-slate-500" aria-hidden="true">
          {index + 1} / {total}
        </span>

        <button
          type="button"
          onClick={goNext}
          disabled={index === total - 1}
          className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">Tip: use ← → to navigate, Space to flip.</p>
        <button
          type="button"
          onClick={onStartQuiz}
          className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Start quiz →
        </button>
      </div>
    </section>
  )
}
