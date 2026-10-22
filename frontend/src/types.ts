// Types mirroring the backend REST DTOs. Keeping these in one place means the
// whole frontend shares a single, typed contract with the API.

export interface QuizOptionView {
  id: string
  text: string
}

export interface QuizQuestionView {
  id: string
  question: string
  options: QuizOptionView[]
}

export interface FlashcardView {
  id: string
  question: string
  answer: string
  explanation: string | null
}

export interface Deck {
  id: string
  title: string
  createdAt: string
  flashcards: FlashcardView[]
  quizQuestions: QuizQuestionView[]
}

export interface GenerateDeckRequest {
  sourceText: string
  title?: string
}

export interface QuizAnswer {
  questionId: string
  selectedOptionId: string
}

export interface SubmitQuizRequest {
  deckId: string
  answers: QuizAnswer[]
}

export interface QuestionOutcome {
  questionId: string
  selectedOptionId: string | null
  correctOptionId: string | null
  correct: boolean
}

export interface QuizResult {
  totalQuestions: number
  correctCount: number
  scorePercent: number
  outcomes: QuestionOutcome[]
}
