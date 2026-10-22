import type {
  Deck,
  GenerateDeckRequest,
  QuizResult,
  SubmitQuizRequest,
} from '../types'

// Thrown for any non-2xx response so callers can show a friendly message.
export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    throw new ApiError(
      `Request failed (${response.status})`,
      response.status,
    )
  }

  return response.json() as Promise<T>
}

export function generateDeck(body: GenerateDeckRequest): Promise<Deck> {
  return request<Deck>('/decks/generate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export function getDeck(id: string): Promise<Deck> {
  return request<Deck>(`/decks/${id}`)
}

export function submitQuiz(body: SubmitQuizRequest): Promise<QuizResult> {
  return request<QuizResult>('/quiz/submit', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}
