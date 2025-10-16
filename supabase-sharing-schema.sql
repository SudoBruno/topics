-- Script para criar tabelas de compartilhamento no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar tabela shared_topics para compartilhamento
CREATE TABLE IF NOT EXISTS shared_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  share_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  is_public BOOLEAN NOT NULL DEFAULT false,
  include_subtopics BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 2. Índices para shared_topics
CREATE INDEX IF NOT EXISTS shared_topics_token_idx ON shared_topics(share_token);
CREATE INDEX IF NOT EXISTS shared_topics_topic_id_idx ON shared_topics(topic_id);
CREATE INDEX IF NOT EXISTS shared_topics_user_id_idx ON shared_topics(user_id);

-- 3. RLS para shared_topics
ALTER TABLE shared_topics ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para shared_topics
CREATE POLICY "Users can manage their own shares" ON shared_topics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public shares" ON shared_topics
  FOR SELECT USING (is_public = true);

-- 5. Política para visualização pública de tópicos compartilhados
CREATE POLICY "Public can view shared topics" ON topics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM shared_topics
      WHERE shared_topics.topic_id = topics.id
      AND shared_topics.is_public = true
    )
  );
