import type { QuizQuestionView, QuizResult } from '../types'

interface ScoreSummaryProps {
  questions: QuizQuestionView[]
  result: QuizResult
  onReview: () => void
  onNewDeck: () => void
}

export function ScoreSummary({ questions, result, onReview, onNewDeck }: ScoreSummaryProps) {
  // Look up option text by id so we can show the chosen and correct answers.
  function optionText(questionId: string, optionId: string | null): string {
    if (!optionId) return '—'
    const question = questions.find((q) => q.id === questionId)
    return question?.options.find((o) => o.id === optionId)?.text ?? '—'
  }

  function questionText(questionId: string): string {
    return questions.find((q) => q.id === questionId)?.question ?? ''
  }

  return (
    <section aria-label="Quiz results" className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-medium text-slate-500">Your score</p>
        <p className="my-2 text-5xl font-bold text-indigo-600">{result.scorePercent}%</p>
        <p className="text-slate-600" role="status">
          {result.correctCount} of {result.totalQuestions} correct
        </p>
      </div>

      <ol className="mt-6 space-y-3">
        {result.outcomes.map((outcome, i) => (
          <li
            key={outcome.questionId}
            className={`rounded-xl border p-4 ${
              outcome.correct ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
            }`}
          >
            <p className="font-medium text-slate-900">
              <span aria-hidden="true">{outcome.correct ? '✓' : '✗'} </span>
              {i + 1}. {questionText(outcome.questionId)}
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Your answer: {optionText(outcome.questionId, outcome.selectedOptionId)}
              <span className="sr-only">{outcome.correct ? ' (correct)' : ' (incorrect)'}</span>
            </p>
            {!outcome.correct && (
              <p className="text-sm text-green-700">
                Correct answer: {optionText(outcome.questionId, outcome.correctOptionId)}
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onReview}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-indigo-600"
        >
          Review flashcards
        </button>
        <button
          type="button"
          onClick={onNewDeck}
          className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          New deck
        </button>
      </div>
    </section>
  )
}
