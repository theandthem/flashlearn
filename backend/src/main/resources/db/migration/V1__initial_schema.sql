-- V1__initial_schema.sql
-- Initial FlashLearn schema: decks and their flashcards + multiple-choice quiz.
-- pgvector embeddings are deferred to a later migration (Phase 3).

-- ── decks ──────────────────────────────────────────────────────────────
-- A deck is generated from a chunk of source text and owns everything below it.
CREATE TABLE decks (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT        NOT NULL,
    source_text TEXT        NOT NULL,                 -- the raw input the deck was generated from
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── flashcards ─────────────────────────────────────────────────────────
-- Front/back review cards plus a deeper explanation. Belong to exactly one deck.
CREATE TABLE flashcards (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id     UUID        NOT NULL REFERENCES decks (id) ON DELETE CASCADE,
    question    TEXT        NOT NULL,                 -- front of the card
    answer      TEXT        NOT NULL,                 -- back of the card
    explanation TEXT,                                 -- optional deep-dive, nullable
    position    INTEGER     NOT NULL,                 -- stable display order within the deck
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Foreign keys are not auto-indexed in Postgres; we always fetch cards by deck.
CREATE INDEX idx_flashcards_deck_id ON flashcards (deck_id);

-- ── quiz_questions ─────────────────────────────────────────────────────
-- The stem of a multiple-choice question. Its options live in quiz_options.
CREATE TABLE quiz_questions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id    UUID        NOT NULL REFERENCES decks (id) ON DELETE CASCADE,
    question   TEXT        NOT NULL,
    position   INTEGER     NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_quiz_questions_deck_id ON quiz_questions (deck_id);

-- ── quiz_options ───────────────────────────────────────────────────────
-- One row per selectable answer; exactly one per question is the correct one.
CREATE TABLE quiz_options (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID        NOT NULL REFERENCES quiz_questions (id) ON DELETE CASCADE,
    option_text TEXT        NOT NULL,
    is_correct  BOOLEAN     NOT NULL DEFAULT FALSE,
    position    INTEGER     NOT NULL                  -- order options are shown (A, B, C, D)
);

CREATE INDEX idx_quiz_options_question_id ON quiz_options (question_id);

-- Enforce at most one correct option per question at the DB level, not just in app code.
-- A partial unique index: uniqueness only applies to rows where is_correct = TRUE.
CREATE UNIQUE INDEX uq_quiz_options_one_correct
    ON quiz_options (question_id)
    WHERE is_correct;
