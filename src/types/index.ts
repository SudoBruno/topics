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

  // UI state
  setSelectedTopic: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setSortBy: (sortBy: TopicsState["sortBy"]) => void;

  // Computed getters
  getTopicTree: () => TopicTree[];
  getFilteredTopics: () => Topic[];
  getRootTopics: () => Topic[];
  getChildren: (parentId: string) => Topic[];
  hasChildren: (id: string) => boolean;
  getChildrenCount: (id: string) => number;
  getTopicById: (id: string) => Topic | null;
  getAllTags: () => string[];

  // Template operations
  getTemplates: () => TopicTemplate[];
  saveCustomTemplate: (template: TopicTemplate) => void;
  deleteCustomTemplate: (id: string) => void;
  createTopicFromTemplate: (
    template: TopicTemplate,
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

export interface SharedTopic {
  id: string; // UUID como string
  topic_id: string; // UUID como string
  share_token: string;
  is_public: boolean;
  include_subtopics: boolean;
  user_id: string; // UUID como string
  created_at: string; // ISO string do Supabase
  updated_at: string; // ISO string do Supabase
}

export interface SharedTopicView extends Topic {
  shared_by?: string; // email ou nome do usuário
  share_info?: SharedTopic;
}

export type TopicsStore = TopicsState & TopicsActions;
