-- V2__vector_store.sql
-- Enables pgvector and creates the Spring AI vector store table for semantic
-- search over past learning. Flyway owns this schema, so Spring AI is configured
-- with initialize-schema=false.

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Dimensions (1536) match OpenAI's text-embedding-3-small model.
CREATE TABLE vector_store (
    id        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content   TEXT,
    metadata  JSONB,
    embedding VECTOR(1536)
);

-- HNSW index with cosine distance for fast approximate nearest-neighbour search.
CREATE INDEX idx_vector_store_embedding
    ON vector_store
    USING hnsw (embedding vector_cosine_ops);
