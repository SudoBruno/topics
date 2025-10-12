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
