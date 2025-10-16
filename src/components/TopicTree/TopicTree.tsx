import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTopicsStore } from "@/store/topicsStore";
import { useAuth } from "@/contexts/AuthContext";
import { useExpandedNodes } from "@/hooks/useExpandedNodes";
import { Button } from "@/components/ui/button";
import { TopicTreeItem } from "./TopicTreeItem";
import { Plus, ArrowLeft } from "lucide-react";
import { animations } from "@/lib/animations";

export function TopicTree() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTopicTree, createTopic, initialize, topics } = useTopicsStore();
  const { expandedNodes, toggleExpand } = useExpandedNodes();
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar store quando usuário estiver autenticado
  useEffect(() => {
    if (user) {
      initialize();
    }
  }, [user, initialize]);

  // Aguardar carregamento dos tópicos
  useEffect(() => {
    if (user && topics.length >= 0) {
      setIsLoading(false);
    }
  }, [user, topics]);

  const topicTree = getTopicTree();

  const handleAddRootTopic = () => {
    createTopic({
      title: "Novo Tópico",
      content: "",
      tags: [],
      parentId: null,
      collapsed: false,
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando árvore de tópicos...</p>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-4xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={animations.smooth}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Árvore de Tópicos</h1>
        </div>
        <Button onClick={handleAddRootTopic} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Tópico Raiz
        </Button>
      </div>

      {/* Tree */}
      {topicTree.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Nenhum tópico criado ainda
          </p>
          <Button onClick={handleAddRootTopic} className="gap-2">
            <Plus className="h-4 w-4" />
            Criar Primeiro Tópico
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {topicTree.map((topic) => (
            <TopicTreeItem
              key={topic.id}
              topic={topic}
              level={0}
              expandedNodes={expandedNodes}
              onToggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
