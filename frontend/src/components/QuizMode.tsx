import { useState } from 'react'
import type { QuizAnswer, QuizQuestionView } from '../types'

interface QuizModeProps {
  questions: QuizQuestionView[]
  onSubmit: (answers: QuizAnswer[]) => void
  submitting: boolean
  error: string | null
}

export function QuizMode({ questions, onSubmit, submitting, error }: QuizModeProps) {
  // Map of questionId -> selected optionId.
  const [selected, setSelected] = useState<Record<string, string>>({})

  const allAnswered = questions.every((q) => selected[q.id])

  function handleSubmit() {
    const answers: QuizAnswer[] = questions.map((q) => ({
      questionId: q.id,
      selectedOptionId: selected[q.id],
    }))
    onSubmit(answers)
  }

  return (
    <section aria-label="Quiz" className="mx-auto w-full max-w-2xl">
      <ol className="space-y-6">
        {questions.map((question, qIndex) => (
          <li key={question.id}>
            <fieldset className="rounded-xl border border-slate-200 p-4">
              <legend className="px-1 font-medium text-slate-900">
                {qIndex + 1}. {question.question}
              </legend>
              <div className="mt-3 space-y-2">
                {question.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 transition hover:bg-slate-50 has-checked:border-indigo-500 has-checked:bg-indigo-50"
                  >
                    <input
                      type="radio"
                      name={question.id}
                      value={option.id}
                      checked={selected[question.id] === option.id}
                      onChange={() =>
                        setSelected((prev) => ({ ...prev, [question.id]: option.id }))
                      }
                      className="h-4 w-4 accent-indigo-600 focus-visible:outline-2 focus-visible:outline-indigo-600"
                    />
                    <span className="text-slate-700">{option.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>

      {error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!allAnswered || submitting}
        className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? 'Scoring…' : allAnswered ? 'Submit answers' : 'Answer all questions to submit'}
      </button>
    </section>
  )
}
