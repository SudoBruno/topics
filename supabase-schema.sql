-- Schema para o Supabase - Topics App
-- Execute este SQL no SQL Editor do Supabase

-- 1. Criar tabela topics
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  parent_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
  -- collapsed removido - é apenas estado de UI local
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

-- 3. Política para usuários verem apenas seus próprios tópicos
CREATE POLICY "Users can view their own topics" ON topics
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Política para usuários inserirem apenas seus próprios tópicos
CREATE POLICY "Users can insert their own topics" ON topics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Política para usuários atualizarem apenas seus próprios tópicos
CREATE POLICY "Users can update their own topics" ON topics
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Política para usuários deletarem apenas seus próprios tópicos
CREATE POLICY "Users can delete their own topics" ON topics
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Índices para performance
CREATE INDEX IF NOT EXISTS topics_user_id_idx ON topics(user_id);
CREATE INDEX IF NOT EXISTS topics_parent_id_idx ON topics(parent_id);
CREATE INDEX IF NOT EXISTS topics_updated_at_idx ON topics(updated_at);

-- 8. Remover coluna collapsed se existir (não é necessária no banco)
ALTER TABLE topics DROP COLUMN IF EXISTS collapsed;

-- 9. Verificar e converter colunas de timestamp se necessário
-- Primeiro, verificar o tipo atual das colunas:
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'topics' 
  AND column_name IN ('created_at', 'updated_at');

-- Se as colunas forem BIGINT, execute:
-- ALTER TABLE topics ALTER COLUMN created_at TYPE TIMESTAMP WITH TIME ZONE USING to_timestamp(created_at);
-- ALTER TABLE topics ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE USING to_timestamp(updated_at);

-- Se as colunas já forem TIMESTAMP WITH TIME ZONE, não faça nada.

-- 11. Verificar se a tabela foi criada corretamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'topics' 
ORDER BY ordinal_position;

-- 12. Criar tabela shared_topics para compartilhamento
CREATE TABLE IF NOT EXISTS shared_topics (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public BOOLEAN NOT NULL DEFAULT false,
  include_subtopics BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 13. Índices para shared_topics
CREATE INDEX shared_topics_token_idx ON shared_topics(share_token);
CREATE INDEX shared_topics_topic_id_idx ON shared_topics(topic_id);
CREATE INDEX shared_topics_user_id_idx ON shared_topics(user_id);

-- 14. RLS para shared_topics
ALTER TABLE shared_topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own shares" ON shared_topics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public shares" ON shared_topics
  FOR SELECT USING (is_public = true);

-- 15. Política para visualização pública de tópicos compartilhados
CREATE POLICY "Public can view shared topics" ON topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_topics
      WHERE shared_topics.topic_id = topics.id
      AND shared_topics.is_public = true
    )
  );
