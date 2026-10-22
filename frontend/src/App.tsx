import { useState } from 'react'
import { ApiError, generateDeck, submitQuiz } from './api/client'
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

  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [quizError, setQuizError] = useState<string | null>(null)

  async function handleGenerate(sourceText: string, title: string) {
    setGenerating(true)
    setGenerateError(null)
    try {
      const newDeck = await generateDeck({ sourceText, title: title || undefined })
      setDeck(newDeck)
      setStage('flashcards')
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
    setGenerateError(null)
    setQuizError(null)
    setStage('input')
  }

  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <span aria-hidden="true" className="text-2xl">⚡</span>
          <h1 className="text-xl font-bold">FlashLearn</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-10">
        {stage === 'input' && !generating && (
          <>
            <h2 className="mb-6 text-center text-2xl font-semibold">
              Turn any text into flashcards and a quiz
            </h2>
            <InputForm onGenerate={handleGenerate} loading={generating} error={generateError} />
          </>
        )}

        {generating && <LoadingSkeleton />}

        {stage === 'flashcards' && deck && (
          <>
            <h2 className="mb-6 text-center text-2xl font-semibold">{deck.title}</h2>
            <FlashcardPlayer flashcards={deck.flashcards} onStartQuiz={() => setStage('quiz')} />
          </>
        )}

        {stage === 'quiz' && deck && (
          <>
            <h2 className="mb-6 text-center text-2xl font-semibold">Quiz: {deck.title}</h2>
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
