-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 9. Create Knowledge Bases Table
CREATE TABLE knowledge_bases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Create Document Chunks Table
CREATE TABLE document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kb_id UUID REFERENCES knowledge_bases(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  embedding vector(768), -- Assuming 768 dimensions for standard embedding models (e.g. nomic-embed-text)
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a function to search for documents
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(768),
  match_count int DEFAULT null,
  kb_id_filter UUID DEFAULT null
) RETURNS TABLE (
  id UUID,
  kb_id UUID,
  content TEXT,
  metadata JSONB,
  similarity float
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    document_chunks.id,
    document_chunks.kb_id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) AS similarity
  FROM document_chunks
  WHERE (kb_id_filter IS NULL OR document_chunks.kb_id = kb_id_filter)
  ORDER BY document_chunks.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable RLS
ALTER TABLE knowledge_bases ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage knowledge bases for own projects" ON knowledge_bases 
  FOR ALL USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  ) WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage document chunks for own knowledge bases" ON document_chunks 
  FOR ALL USING (
    kb_id IN (SELECT id FROM knowledge_bases WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  ) WITH CHECK (
    kb_id IN (SELECT id FROM knowledge_bases WHERE project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()))
  );
