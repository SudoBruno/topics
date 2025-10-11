import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Topic, TopicTree, TopicsStore } from "@/types";
import { loadTopics, debouncedSave } from "@/utils/storage";

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

export const useTopicsStore = create<TopicsStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      topics: [],
      selectedTopic: null,
      searchQuery: "",
      selectedTags: [],
      sortBy: "recent",

      // CRUD operations
      createTopic: (topicData) => {
        const newTopic: Topic = {
          ...topicData,
          id: crypto.randomUUID(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => {
          const newTopics = [...state.topics, newTopic];
          debouncedSave(newTopics);
          return { topics: newTopics };
        });
      },

      updateTopic: (id, updates) => {
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === id
              ? { ...topic, ...updates, updatedAt: Date.now() }
              : topic
          );
          debouncedSave(newTopics);
          return { topics: newTopics };
        });
      },

      deleteTopic: (id) => {
        set((state) => {
          // Deletar o tópico e todos os seus descendentes
          const descendants = getAllDescendants(state.topics, id);
          const idsToDelete = [id, ...descendants];

          const newTopics = state.topics.filter(
            (topic) => !idsToDelete.includes(topic.id)
          );
          debouncedSave(newTopics);

          // Se o tópico selecionado foi deletado, limpar seleção
          const newSelectedTopic =
            state.selectedTopic === id ? null : state.selectedTopic;

          return {
            topics: newTopics,
            selectedTopic: newSelectedTopic,
          };
        });
      },

      // Tree operations
      moveTopic: (id, newParentId) => {
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === id
              ? { ...topic, parentId: newParentId, updatedAt: Date.now() }
              : topic
          );
          debouncedSave(newTopics);
          return { topics: newTopics };
        });
      },

      toggleCollapse: (id) => {
        set((state) => {
          const newTopics = state.topics.map((topic) =>
            topic.id === id ? { ...topic, collapsed: !topic.collapsed } : topic
          );
          debouncedSave(newTopics);
          return { topics: newTopics };
        });
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
            filtered.sort((a, b) => b.updatedAt - a.updatedAt);
            break;
          case "recent":
          default:
            filtered.sort((a, b) => b.createdAt - a.createdAt);
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
        return topics.find((topic) => topic.id === id);
      },
    }),
    {
      name: "topics-storage",
      partialize: (state) => ({
        topics: state.topics,
        selectedTopic: state.selectedTopic,
        sortBy: state.sortBy,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Carregar dados do localStorage como fallback
          const storedTopics = loadTopics();
          if (storedTopics.length > 0 && state.topics.length === 0) {
            state.topics = storedTopics;
          }
        }
      },
    }
  )
);
