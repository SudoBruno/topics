import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTopicsStore } from "@/store/topicsStore";
import { TopicCard } from "@/components/TopicCard/TopicCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { Topic } from "@/types";
import {
  Plus,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  X,
} from "lucide-react";
import { variants, animations } from "@/lib/animations";

export function Dashboard() {
  const navigate = useNavigate();
  const {
    getFilteredTopics,
    getAllTags,
    setSearchQuery,
    setSelectedTags,
    setSortBy,
    searchQuery,
    selectedTags,
    sortBy,
    deleteTopic,
  } = useTopicsStore();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const filteredTopics = getFilteredTopics();
  const allTags = getAllTags();
  const { topics } = useTopicsStore();

  // Função para verificar se um tópico tem filhos
  const hasChildren = (topicId: string) => {
    return topics.some((topic) => topic.parentId === topicId);
  };

  // Função para contar quantos filhos um tópico tem
  const getChildrenCount = (topicId: string) => {
    return topics.filter((topic) => topic.parentId === topicId).length;
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSortChange = () => {
    const sortOptions: Array<"recent" | "alphabetical" | "mostEdited"> = [
      "recent",
      "alphabetical",
      "mostEdited",
    ];
    const currentIndex = sortOptions.indexOf(sortBy);
    const nextIndex = (currentIndex + 1) % sortOptions.length;
    setSortBy(sortOptions[nextIndex]);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case "recent":
        return "Mais recentes";
      case "alphabetical":
        return "Alfabética";
      case "mostEdited":
        return "Mais editados";
      default:
        return "Mais recentes";
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  const handleEditTopic = (topic: Topic) => {
    navigate(`/topic/${topic.id}`);
  };

  const handleAddTopic = () => {
    navigate("/topic/new");
  };

  const handleAddChildTopic = (parentId: string) => {
    // Criar um novo tópico com parentId
    navigate(`/topic/new?parent=${parentId}`);
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={animations.smooth}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold">Anotações Políticas</h1>
          <motion.p
            className="text-muted-foreground"
            key={filteredTopics.length}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {filteredTopics.length} tópico
            {filteredTopics.length !== 1 ? "s" : ""}
          </motion.p>
        </motion.div>
        <Button onClick={handleAddTopic} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Tópico
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tópicos..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button
            variant="outline"
            onClick={handleSortChange}
            className="gap-2"
          >
            {sortBy === "alphabetical" ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
            {getSortLabel()}
          </Button>
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 border border-border rounded-md bg-card space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Filtros</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Limpar
              </Button>
            </div>

            {allTags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={
                        selectedTags.includes(tag) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Topics Grid/List */}
      {filteredTopics.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">
            {searchQuery || selectedTags.length > 0 ? (
              <>
                <p className="text-lg font-medium">Nenhum tópico encontrado</p>
                <p className="text-sm">Tente ajustar os filtros de busca</p>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">
                  Nenhum tópico criado ainda
                </p>
                <p className="text-sm">Comece criando seu primeiro tópico</p>
              </>
            )}
          </div>
          <Button onClick={handleAddTopic} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Primeiro Tópico
          </Button>
        </div>
      ) : (
        <motion.div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
          }
          variants={variants.stagger}
          initial="initial"
          animate="animate"
        >
          <AnimatePresence mode="popLayout">
            {filteredTopics.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onEdit={handleEditTopic}
                onDelete={deleteTopic}
                onAddChild={handleAddChildTopic}
                hasChildren={hasChildren(topic.id)}
                childrenCount={getChildrenCount(topic.id)}
                className={viewMode === "list" ? "max-w-none" : ""}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
