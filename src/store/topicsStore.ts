import { create } from "zustand";
import type { Topic, TopicTemplate, TopicTree, TopicsStore } from "@/types";
import { defaultTemplates } from "@/data/templates";
import { syncService } from "@/services/syncService";

// Função para construir árvore hierárquica
function buildTopicTree(
  topics: Topic[],
  parentId: string | null = null
): TopicTree[] {
  return topics
    .filter((topic) => topic.parentId === parentId)
    .map((topic) => ({
      ...topic,
      children: buildTopicTree(topics, topic.id),
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

// Função para obter todos os descendentes de um tópico
function getAllDescendants(topics: Topic[], parentId: string): string[] {
  const children = topics.filter((topic) => topic.parentId === parentId);
  const descendants = children.map((child) => child.id);

  children.forEach((child) => {
    descendants.push(...getAllDescendants(topics, child.id));
  });

  return descendants;
}

export const useTopicsStore = create<TopicsStore>((set, get) => {
  // Helper functions
  const getRootTopics = () => {
    const { topics } = get();
    return topics.filter((topic) => !topic.parentId);
  };

  const getChildren = (parentId: string) => {
    const { topics } = get();
    return topics.filter((topic) => topic.parentId === parentId);
  };

  const hasChildren = (id: string) => {
    return getChildren(id).length > 0;
  };

  const getChildrenCount = (id: string) => {
    return getChildren(id).length;
  };

  const getParent = (id: string) => {
    const { topics } = get();
    const topic = topics.find((t) => t.id === id);
    if (!topic?.parentId) return null;
    return topics.find((t) => t.id === topic.parentId) || null;
  };

  const getPath = (id: string): Topic[] => {
    const path: Topic[] = [];
    let current = getParent(id);
    while (current) {
      path.unshift(current);
      current = getParent(current.id);
    }
    return path;
  };

  return {
    // Estado inicial
    topics: [],
    selectedTopic: null,
    searchQuery: "",
    selectedTags: [],
    sortBy: "recent",
    customTemplates: [],
    _initialized: false,

    // Tree helper methods
    getRootTopics,
    getChildren,
    hasChildren,
    getChildrenCount,
    getParent,
    getPath,

    // Inicializar store
    initialize: async () => {
      const { _initialized } = get();
      if (_initialized) {
        console.log("Store já inicializado, pulando...");
        return;
      }

      try {
        console.log("🚀 Inicializando store...");

        // Migrar dados do localStorage se necessário
        // Carregar tópicos do IndexedDB
        const topics = await syncService.getTopics();
        console.log(`📚 Carregados ${topics.length} tópicos do IndexedDB`);
        set({ topics, _initialized: true });

        // Tentar sincronizar com a nuvem apenas se há dados locais
      } catch (error) {
        console.error("❌ Erro ao inicializar store:", error);
      }
    },

    // CRUD operations
    createTopic: async (topicData) => {
      const newTopic: Topic = {
        ...topicData,
        id: crypto.randomUUID(),
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      try {
        // Salvar no IndexedDB
        await syncService.saveTopic(newTopic);

        // Atualizar estado local
        set((state) => ({
          topics: [...state.topics, newTopic],
          selectedTopic: newTopic.id,
        }));
      } catch (error) {
        console.error("Erro ao criar tópico:", error);
      }
    },

    updateTopic: async (id, updates) => {
      try {
        const { topics } = get();
        const topic = topics.find((t) => t.id === id);
        if (!topic) return;

        const updatedTopic = { ...topic, ...updates, updated_at: Date.now() };

        // Salvar no IndexedDB
        await syncService.saveTopic(updatedTopic);

        // Atualizar estado local
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === id ? updatedTopic : topic
          ),
        }));
      } catch (error) {
        console.error("Erro ao atualizar tópico:", error);
      }
    },

    deleteTopic: async (id) => {
      try {
        const { topics } = get();

        // Deletar o tópico e todos os seus descendentes
        const descendants = getAllDescendants(topics, id);
        const idsToDelete = [id, ...descendants];

        // Deletar do IndexedDB
        for (const topicId of idsToDelete) {
          await syncService.deleteTopic(topicId);
        }

        // Atualizar estado local
        set((state) => {
          const newTopics = state.topics.filter(
            (topic) => !idsToDelete.includes(topic.id)
          );

          // Se o tópico selecionado foi deletado, limpar seleção
          const newSelectedTopic =
            state.selectedTopic === id ? null : state.selectedTopic;

          return {
            topics: newTopics,
            selectedTopic: newSelectedTopic,
          };
        });
      } catch (error) {
        console.error("Erro ao deletar tópico:", error);
      }
    },

    // Tree operations
    moveTopic: async (id, newParentId) => {
      try {
        const { topics } = get();
        const topic = topics.find((t) => t.id === id);
        if (!topic) return;

        const updatedTopic = {
          ...topic,
          parentId: newParentId,
          updated_at: Date.now(),
        };

        // Salvar no IndexedDB
        await syncService.saveTopic(updatedTopic);

        // Atualizar estado local
        set((state) => ({
          topics: state.topics.map((topic) =>
            topic.id === id ? updatedTopic : topic
          ),
        }));
      } catch (error) {
        console.error("Erro ao mover tópico:", error);
      }
    },

    // UI state
    setSelectedTopic: (id) => set({ selectedTopic: id }),
    setSearchQuery: (query) => set({ searchQuery: query }),
    setSelectedTags: (tags) => set({ selectedTags: tags }),
    setSortBy: (sortBy) => set({ sortBy }),

    // Computed getters
    getTopicTree: () => {
      const { topics } = get();
      return buildTopicTree(topics);
    },

    getFilteredTopics: () => {
      const { topics, searchQuery, selectedTags, sortBy } = get();

      let filtered = topics;

      // Filtrar por busca
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (topic) =>
            topic.title.toLowerCase().includes(query) ||
            topic.content.toLowerCase().includes(query)
        );
      }

      // Filtrar por tags
      if (selectedTags.length > 0) {
        filtered = filtered.filter((topic) =>
          selectedTags.every((tag) => topic.tags.includes(tag))
        );
      }

      // Ordenar
      switch (sortBy) {
        case "alphabetical":
          filtered.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "mostEdited":
          filtered.sort((a, b) => b.updated_at - a.updated_at);
          break;
        case "recent":
        default:
          filtered.sort((a, b) => b.created_at - a.created_at);
          break;
      }

      return filtered;
    },

    getAllTags: () => {
      const { topics } = get();
      const allTags = topics.flatMap((topic) => topic.tags);
      return Array.from(new Set(allTags)).sort();
    },

    getTopicById: (id) => {
      const { topics } = get();
      return topics.find((topic) => topic.id === id) || null;
    },

    // Template operations
    getTemplates: () => {
      const { customTemplates } = get();
      return [...defaultTemplates, ...customTemplates];
    },
    addTemplate: (template: TopicTemplate) => {
      set((state) => ({
        customTemplates: [...state.customTemplates, template],
      }));
    },
    updateTemplate: (id: string, updates: Partial<TopicTemplate>) => {
      set((state) => ({
        customTemplates: state.customTemplates.map((template) =>
          template.id === id ? { ...template, ...updates } : template
        ),
      }));
    },
    deleteTemplate: (id: string) => {
      set((state) => ({
        customTemplates: state.customTemplates.filter(
          (template) => template.id !== id
        ),
      }));
    },
    createTopicFromTemplate: async (
      template: TopicTemplate,
      parentId: string | null = null
    ): Promise<Topic | null> => {
      const { getTemplates } = get();
      const templates = getTemplates();
      const templateMatch = templates.find((t) => t.id === template.id);

      if (!templateMatch) return null;

      const newTopic: Topic = {
        id: crypto.randomUUID(),
        title: template.defaultTitle,
        content: template.defaultContent,
        tags: template.defaultTags,
        parentId,
        collapsed: false,
        created_at: Date.now(),
        updated_at: Date.now(),
      };

      try {
        // Salvar no IndexedDB
        await syncService.saveTopic(newTopic);

        // Atualizar estado local
        set((state) => ({
          topics: [...state.topics, newTopic],
          selectedTopic: newTopic.id,
        }));

        return newTopic;
      } catch (error) {
        console.error("Erro ao criar tópico do template:", error);
        return null;
      }
    },

    // Custom template operations
    saveCustomTemplate: (template: TopicTemplate) => {
      set((state) => ({
        customTemplates: [...state.customTemplates, template],
      }));
    },

    deleteCustomTemplate: (id: string) => {
      set((state) => ({
        customTemplates: state.customTemplates.filter(
          (template) => template.id !== id
        ),
      }));
    },
  };
});
