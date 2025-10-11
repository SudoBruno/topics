import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTopicsStore } from "@/store/topicsStore";
import type { TopicTree as TopicTreeType } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Edit,
  Plus,
  Trash2,
  Tag,
  FolderOpen,
} from "lucide-react";
import { animations } from "@/lib/animations";

interface TopicTreeItemProps {
  topic: TopicTreeType;
  level: number;
  expandedNodes: Set<string>;
  onToggleExpand: (nodeId: string) => void;
}

export const TopicTreeItem = memo(function TopicTreeItem({
  topic,
  level,
  expandedNodes,
  onToggleExpand,
}: TopicTreeItemProps) {
  const navigate = useNavigate();
  const { createTopic, deleteTopic } = useTopicsStore();

  const isExpanded = expandedNodes.has(topic.id);
  const hasChildren = topic.children.length > 0;

  const handleEdit = () => {
    navigate(`/topic/${topic.id}`);
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir "${topic.title}" e todos os seus subtópicos?`
      )
    ) {
      deleteTopic(topic.id);
    }
  };

  const handleAddChild = () => {
    createTopic({
      title: "Novo Subtópico",
      content: "",
      tags: [],
      parentId: topic.id,
      collapsed: false,
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <motion.div
      className="space-y-1"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: level * 0.1 }}
    >
      {/* Topic Node */}
      <motion.div
        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        whileHover={{ backgroundColor: "hsl(0 0% 10%)" }}
        transition={animations.quick}
      >
        {/* Expand/Collapse Button */}
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={animations.quick}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(topic.id)}
            className="h-6 w-6 p-0"
            disabled={!hasChildren}
          >
            {hasChildren ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="h-4 w-4" />
            )}
          </Button>
        </motion.div>

        {/* Topic Content */}
        <div className="flex-1 flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-medium flex items-center gap-2">
                {hasChildren && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FolderOpen className="h-3 w-3" />
                    <span className="text-xs">({topic.children.length})</span>
                  </div>
                )}
                {topic.title}
              </h3>
              {topic.tags.length > 0 && (
                <div className="flex gap-1">
                  {topic.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-2 w-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                  {topic.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{topic.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Criado em {formatDate(topic.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="h-8 w-8 p-0"
              title="Editar"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddChild}
              className="h-8 w-8 p-0"
              title="Adicionar subtópico"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              title="Excluir"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Children */}
      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            className="space-y-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={animations.smooth}
          >
            {topic.children.map((child) => (
              <TopicTreeItem
                key={child.id}
                topic={child}
                level={level + 1}
                expandedNodes={expandedNodes}
                onToggleExpand={onToggleExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
