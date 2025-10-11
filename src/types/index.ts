export interface Topic {
  id: string;
  title: string;
  content: string; // HTML do Tiptap
  tags: string[];
  parentId: string | null; // null = raiz
  user_id?: string; // ID do usuário (Supabase)
  created_at: number;
  updated_at: number;
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
  customTemplates: TopicTemplate[];
  _initialized: boolean;
}

export interface TopicsActions {
  // Initialization
  initialize: () => Promise<void>;

  // CRUD operations
  createTopic: (
    topic: Omit<Topic, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateTopic: (id: string, updates: Partial<Topic>) => Promise<void>;
  deleteTopic: (id: string) => Promise<void>;

  // Tree operations
  moveTopic: (id: string, newParentId: string | null) => Promise<void>;
  // toggleCollapse removido - gerenciado localmente

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

  // Template operations
  getAllTemplates: () => TopicTemplate[];
  addTemplate: (template: TopicTemplate) => void;
  updateTemplate: (id: string, updates: Partial<TopicTemplate>) => void;
  deleteTemplate: (id: string) => void;
  createTopicFromTemplate: (
    templateId: string,
    parentId?: string | null
  ) => Promise<Topic | null>;
}

export interface TopicTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultTitle: string;
  defaultContent: string;
  defaultTags: string[];
  isCustom: boolean;
}

export type TopicsStore = TopicsState & TopicsActions;
