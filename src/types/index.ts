export interface Topic {
  id: string;
  title: string;
  content: string; // HTML do Tiptap
  tags: string[];
  parentId: string | null; // null = raiz
  createdAt: number;
  updatedAt: number;
  collapsed: boolean; // para UI
}

export interface TopicTree extends Topic {
  children: TopicTree[];
}

export interface TopicsState {
  topics: Topic[];
  selectedTopic: string | null;
  searchQuery: string;
  selectedTags: string[];
  sortBy: "recent" | "alphabetical" | "mostEdited";
}

export interface TopicsActions {
  // CRUD operations
  createTopic: (topic: Omit<Topic, "id" | "createdAt" | "updatedAt">) => void;
  updateTopic: (id: string, updates: Partial<Topic>) => void;
  deleteTopic: (id: string) => void;

  // Tree operations
  moveTopic: (id: string, newParentId: string | null) => void;
  toggleCollapse: (id: string) => void;

  // UI state
  setSelectedTopic: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSortBy: (sortBy: TopicsState["sortBy"]) => void;

  // Computed getters
  getTopicTree: () => TopicTree[];
  getFilteredTopics: () => Topic[];
  getAllTags: () => string[];
  getTopicById: (id: string) => Topic | undefined;
}

export type TopicsStore = TopicsState & TopicsActions;
