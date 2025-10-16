<!-- af23cd20-a5a6-4121-a429-815ce7ca0e30 1e7eae41-eabe-466f-ab6f-d16585053ccf -->
# Sistema de Tags Simplificado

## 1. Estrutura de Banco de Dados

### 1.1 Criar tabelas de tags

Adicionar ao `supabase-schema.sql`:

```sql
-- Tabela de tags (apenas id e nome)
CREATE TABLE IF NOT EXISTS tags (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  UNIQUE(name, user_id)
);

-- Tabela de relacionamento many-to-many
CREATE TABLE IF NOT EXISTS topic_tags (
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (topic_id, tag_id)
);

-- Índices para performance
CREATE INDEX tags_name_idx ON tags(name);
CREATE INDEX tags_user_id_idx ON tags(user_id);
CREATE INDEX topic_tags_topic_id_idx ON topic_tags(topic_id);
CREATE INDEX topic_tags_tag_id_idx ON topic_tags(tag_id);

-- RLS Policies
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE topic_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own tags" ON tags
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage topic-tag relationships" ON topic_tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM topics 
      WHERE topics.id = topic_tags.topic_id 
      AND topics.user_id = auth.uid()
    )
  );
```

### 1.2 Remover coluna tags da tabela topics

```sql
-- Remover coluna antiga de tags
ALTER TABLE topics DROP COLUMN IF EXISTS tags;
```

## 2. Types e Interfaces

### 2.1 Atualizar `src/types/index.ts`

Adicionar tipo Tag:

```typescript
export interface Tag {
  id: string;
  name: string;
  user_id: string;
}

// Topic continua igual, mas tags serão gerenciadas via relacionamento
export interface Topic {
  id: string;
  title: string;
  content: string;
  tags: string[]; // Mantém interface para compatibilidade
  parentId: string | null;
  user_id?: string;
  created_at: number;
  updated_at: number;
  collapsed: boolean;
}
```

## 3. Serviço de Tags

### 3.1 Criar `src/services/tagService.ts`

Novo arquivo para gerenciar tags:

```typescript
import { supabase } from "@/lib/supabase";
import { Tag } from "@/types";

class TagService {
  // Criar ou obter tag existente (upsert)
  async createOrGetTag(tagName: string): Promise<Tag> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    // Tentar encontrar tag existente
    const { data: existingTag } = await supabase
      .from("tags")
      .select("*")
      .eq("name", tagName)
      .eq("user_id", user.id)
      .single();

    if (existingTag) {
      return existingTag;
    }

    // Criar nova tag se não existir
    const { data, error } = await supabase
      .from("tags")
      .insert({
        name: tagName,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Obter todas as tags do usuário
  async getUserTags(): Promise<Tag[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (error) throw error;
    return data || [];
  }

  // Buscar tags por nome (para autocomplete)
  async searchTags(query: string): Promise<Tag[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("user_id", user.id)
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  // Salvar tags de um tópico (chamado ao salvar tópico)
  async saveTopicTags(topicId: string, tagNames: string[]): Promise<void> {
    // Remover todas as tags atuais do tópico
    await supabase
      .from("topic_tags")
      .delete()
      .eq("topic_id", topicId);

    if (tagNames.length === 0) return;

    // Criar/obter todas as tags
    const tags = await Promise.all(
      tagNames.map(name => this.createOrGetTag(name))
    );

    // Criar relacionamentos
    const relationships = tags.map(tag => ({
      topic_id: topicId,
      tag_id: tag.id,
    }));

    const { error } = await supabase
      .from("topic_tags")
      .insert(relationships);

    if (error) throw error;
  }

  // Obter tags de um tópico
  async getTopicTags(topicId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from("topic_tags")
      .select(`
        tags (
          id,
          name,
          user_id
        )
      `)
      .eq("topic_id", topicId);

    if (error) throw error;
    return data?.map(item => item.tags).filter(Boolean) || [];
  }
}

export const tagService = new TagService();
```

## 4. Atualizar SyncService

### 4.1 Modificar `src/services/syncService.ts`

Integrar tagService no fluxo de salvar/carregar:

```typescript
import { tagService } from "./tagService";

class SyncService {
  // Salvar tópico no Supabase
  async saveTopic(topic: Topic): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const topicData = {
        id: topic.id,
        title: topic.title,
        content: topic.content,
        // Remover tags - gerenciadas em tabela separada
        parent_id: topic.parentId,
        user_id: user.id,
        created_at: normalizeTimestamp(topic.created_at),
        updated_at: normalizeTimestamp(topic.updated_at),
      };

      const { error } = await supabase
        .from("topics")
        .upsert(topicData, { onConflict: "id" });

      if (error) throw error;

      // Salvar tags separadamente
      await tagService.saveTopicTags(topic.id, topic.tags);
    } catch (error) {
      console.error("Erro ao salvar tópico:", error);
      throw error;
    }
  }

  // Obter tópicos do Supabase
  async getTopics(): Promise<Topic[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: topics, error } = await supabase
        .from("topics")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      // Buscar tags para cada tópico
      const topicsWithTags = await Promise.all(
        (topics || []).map(async (topic) => {
          const tags = await tagService.getTopicTags(topic.id);
          return {
            id: topic.id,
            title: topic.title,
            content: topic.content,
            tags: tags.map(tag => tag.name), // Converter para string[]
            parentId: topic.parent_id,
            user_id: topic.user_id,
            created_at: parseSupabaseTimestamp(topic.created_at),
            updated_at: parseSupabaseTimestamp(topic.updated_at),
            collapsed: false,
          };
        })
      );

      return topicsWithTags;
    } catch (error) {
      console.error("Erro ao obter tópicos:", error);
      return [];
    }
  }
}
```

## 5. Atualizar TopicsStore

### 5.1 Adicionar métodos de busca de tags em `src/store/topicsStore.ts`

```typescript
import { tagService } from "@/services/tagService";

export interface TopicsActions {
  // ... existing actions
  getAvailableTags: () => Promise<string[]>;
  searchTags: (query: string) => Promise<string[]>;
}

export const useTopicsStore = create<TopicsStore>((set, get) => ({
  // ... existing code

  getAllTags: () => {
    const { topics } = get();
    const allTags = topics.flatMap((topic) => topic.tags);
    return Array.from(new Set(allTags)).sort();
  },

  // Buscar tags disponíveis do banco
  getAvailableTags: async () => {
    try {
      const tags = await tagService.getUserTags();
      return tags.map(tag => tag.name);
    } catch (error) {
      console.error("Erro ao buscar tags:", error);
      return [];
    }
  },

  // Buscar tags com autocomplete
  searchTags: async (query: string) => {
    try {
      const tags = await tagService.searchTags(query);
      return tags.map(tag => tag.name);
    } catch (error) {
      console.error("Erro ao buscar tags:", error);
      return [];
    }
  },
}));
```

## 6. Atualizar TagInput (Opcional)

### 6.1 Melhorar autocomplete em `src/components/TagInput/TagInput.tsx`

Integrar busca assíncrona de tags:

```typescript
import { useTopicsStore } from "@/store/topicsStore";
import { useState, useEffect, useRef } from "react";

export function TagInput({
  tags,
  onTagsChange,
  placeholder = "Adicionar tag...",
  maxTags = 10,
}: TagInputProps) {
  const { searchTags } = useTopicsStore();
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Buscar sugestões quando input muda
  useEffect(() => {
    if (inputValue.trim().length >= 2) {
      searchTags(inputValue).then(setSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [inputValue, searchTags]);

  const filteredSuggestions = suggestions.filter(
    (tag) => !tags.includes(tag)
  );

  const allSuggestions = [
    ...filteredSuggestions,
    ...(inputValue.trim() && !suggestions.includes(inputValue)
      ? [inputValue]
      : []),
  ];

  // ... rest of component logic remains the same
}
```

## 7. Testes e Validação

### 7.1 Verificar funcionalidades

- Tags são criadas automaticamente ao salvar tópico
- Tags existentes são reutilizadas corretamente
- Autocomplete funciona com tags existentes
- Remoção de tags funciona corretamente
- Performance está adequada

### To-dos

- [ ] Criar tabelas tags e topic_tags no Supabase
- [ ] Remover coluna tags da tabela topics
- [ ] Adicionar interface Tag em src/types/index.ts
- [ ] Criar src/services/tagService.ts com métodos CRUD
- [ ] Integrar tagService no syncService para salvar/carregar tags
- [ ] Adicionar métodos getAvailableTags e searchTags no topicsStore
- [ ] Atualizar TagInput para usar busca assíncrona de tags (opcional)
- [ ] Testar criação automática, reutilização e autocomplete de tags