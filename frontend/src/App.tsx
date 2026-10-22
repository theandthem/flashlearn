import { useState } from 'react'
import { ApiError, generateDeck, getDeck, submitQuiz } from './api/client'
import { DeckLibrary } from './components/DeckLibrary'
import { FlashcardPlayer } from './components/FlashcardPlayer'
import { InputForm } from './components/InputForm'
import { LoadingSkeleton } from './components/LoadingSkeleton'
import { QuizMode } from './components/QuizMode'
import { ScoreSummary } from './components/ScoreSummary'
import type { Deck, QuizAnswer, QuizResult } from './types'

type Stage = 'input' | 'flashcards' | 'quiz' | 'score'

function App() {
  const [stage, setStage] = useState<Stage>('input')
  const [deck, setDeck] = useState<Deck | null>(null)
  const [result, setResult] = useState<QuizResult | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [libraryReload, setLibraryReload] = useState(0)

  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [opening, setOpening] = useState(false)
  const [openError, setOpenError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)

  async function handleGenerate(sourceText: string, title: string) {
    setGenerating(true)
    setGenerateError(null)
    try {
      const newDeck = await generateDeck({ sourceText, title: title || undefined })
      setDeck(newDeck)
      setSelectedId(newDeck.id)
      setResult(null)
      setStage('flashcards')
      setLibraryReload((n) => n + 1) // surface the new deck in the library
    } catch (err) {
      setGenerateError(messageFor(err, 'Could not generate a deck. Please try again.'))
    } finally {
      setGenerating(false)
    }
  }

  async function handleSubmitQuiz(answers: QuizAnswer[]) {
    if (!deck) return
    setSubmitting(true)
    setQuizError(null)
    try {
      const quizResult = await submitQuiz({ deckId: deck.id, answers })
      setResult(quizResult)
      setStage('score')
    } catch (err) {
      setQuizError(messageFor(err, 'Could not score your quiz. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  function handleNewDeck() {
    setDeck(null)
    setResult(null)
    setSelectedId(null)
    setGenerateError(null)
    setQuizError(null)
    setOpenError(null)
    setStage('input')
  }

  // Open a saved deck from the library: fetch the full deck, then show it.
  async function handleOpenDeck(id: string) {
    setOpening(true)
    setOpenError(null)
    try {
      const full = await getDeck(id)
      setDeck(full)
      setSelectedId(id)
      setResult(null)
      setStage('flashcards')
    } catch {
      setOpenError('Could not open that deck. Please try again.')
    } finally {
      setOpening(false)
    }
  }

  // If the deck currently shown is deleted, return to the new-deck screen.
  function handleDeckDeleted(id: string) {
    if (id === selectedId) {
      handleNewDeck()
    }
  }

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-4">
          <span aria-hidden="true" className="text-2xl">⚡</span>
          <h1 className="text-xl font-bold">FlashLearn</h1>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[300px_1fr]">
        {/* Left: new deck action + saved deck library */}
        <aside aria-label="Deck library" className="lg:sticky lg:top-8 lg:self-start">
          <button
            type="button"
            onClick={handleNewDeck}
            className="mb-4 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            + New deck
          </button>
          <DeckLibrary onSelect={handleOpenDeck} activeId={selectedId} reloadToken={libraryReload} onDeleted={handleDeckDeleted} />
        </aside>

        {/* Right: input, loading, or the active deck stage */}
        <main>
          {stage === 'input' && !generating && !opening && (
            <>
              <h2 className="mx-auto mb-6 max-w-2xl text-2xl font-semibold">
                Turn any text into flashcards and a quiz
              </h2>
              <InputForm onGenerate={handleGenerate} loading={generating} error={generateError} />
              {openError && (
                <p role="alert" className="mx-auto mt-4 max-w-2xl rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {openError}
                </p>
              )}
            </>
          )}

          {(generating || opening) && (
            <LoadingSkeleton label={opening ? 'Loading your deck…' : undefined} />
          )}

          {stage === 'flashcards' && deck && (
            <>
              <h2 className="mx-auto mb-6 max-w-2xl text-2xl font-semibold">{deck.title}</h2>
              <FlashcardPlayer flashcards={deck.flashcards} onStartQuiz={() => setStage('quiz')} />
            </>
          )}

          {stage === 'quiz' && deck && (
            <>
              <h2 className="mx-auto mb-6 max-w-2xl text-2xl font-semibold">Quiz: {deck.title}</h2>
              <QuizMode
                questions={deck.quizQuestions}
                onSubmit={handleSubmitQuiz}
                submitting={submitting}
                error={quizError}
              />
            </>
          )}

          {stage === 'score' && deck && result && (
            <ScoreSummary
              questions={deck.quizQuestions}
              result={result}
              onReview={() => setStage('flashcards')}
              onNewDeck={handleNewDeck}
            />
          )}
        </main>
      </div>
    </div>
  )
}

// Prefer a specific 400 message; fall back to a generic one otherwise.
function messageFor(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.status === 400) {
    return 'Please provide some source text first.'
  }
  return fallback
}

export default App
