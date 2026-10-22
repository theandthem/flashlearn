import { useId, useState, type FormEvent } from 'react'

interface InputFormProps {
  onGenerate: (sourceText: string, title: string) => void
  loading: boolean
  error: string | null
}

const MAX_LENGTH = 20_000

export function InputForm({ onGenerate, loading, error }: InputFormProps) {
  const [sourceText, setSourceText] = useState('')
  const [title, setTitle] = useState('')

  // Stable ids to wire labels/help/error to inputs for screen readers.
  const textId = useId()
  const titleId = useId()
  const hintId = useId()
  const errorId = useId()

  const trimmed = sourceText.trim()
  const canSubmit = trimmed.length > 0 && !loading

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return
    onGenerate(trimmed, title.trim())
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto w-full max-w-2xl" noValidate>
      <div className="mb-4">
        <label htmlFor={titleId} className="mb-1 block text-sm font-medium text-slate-700">
          Deck title <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          disabled={loading}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-60"
          placeholder="e.g. Cell Biology Basics"
        />
      </div>

      <div className="mb-2">
        <label htmlFor={textId} className="mb-1 block text-sm font-medium text-slate-700">
          Source text
        </label>
        <textarea
          id={textId}
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          required
          rows={10}
          maxLength={MAX_LENGTH}
          disabled={loading}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          aria-invalid={error ? true : undefined}
          className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm focus-visible:outline-2 focus-visible:outline-indigo-600 disabled:opacity-60"
          placeholder="Paste an article, documentation, or your notes…"
        />
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
        <span id={hintId}>Paste any text and we’ll turn it into flashcards and a quiz.</span>
        <span aria-hidden="true">
          {trimmed.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
        </span>
      </div>

      {error && (
        <p
          id={errorId}
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Generate deck'}
      </button>
    </form>
  )
}
