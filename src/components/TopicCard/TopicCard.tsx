import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Topic } from "@/types";
import { Calendar, Edit, Trash2, Plus, Tag, FolderOpen } from "lucide-react";
import { variants, animations } from "@/lib/animations";

interface TopicCardProps {
  topic: Topic;
  onEdit?: (topic: Topic) => void;
  onDelete?: (topicId: string) => void;
  onAddChild?: (parentId: string) => void;
  showActions?: boolean;
  className?: string;
  hasChildren?: boolean;
  childrenCount?: number;
}

export const TopicCard = memo(function TopicCard({
  topic,
  onEdit,
  onDelete,
  onAddChild,
  showActions = true,
  className = "",
  hasChildren = false,
  childrenCount = 0,
}: TopicCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const stripHtml = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const getPreview = (content: string, maxLength: number = 150) => {
    const text = stripHtml(content);
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const handleEdit = () => {
    onEdit?.(topic);
  };

  const handleDelete = () => {
    if (window.confirm(`Tem certeza que deseja excluir "${topic.title}"?`)) {
      onDelete?.(topic.id);
    }
  };

  const handleAddChild = () => {
    onAddChild?.(topic.id);
  };

  return (
    <motion.div
      variants={variants.slideUp}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={animations.smooth}
    >
      <Card
        className={`h-60 hover:shadow-lg transition-shadow duration-200 ${
          hasChildren ? "border-l-4 border-l-primary" : ""
        } ${className}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <CardTitle className="text-lg font-semibold line-clamp-2 flex items-center gap-2">
                {hasChildren && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <FolderOpen className="h-4 w-4 flex-shrink-0" />
                    <span className="text-xs">({childrenCount})</span>
                  </div>
                )}
                {topic.title}
              </CardTitle>
            </div>
            {showActions && (
              <motion.div
                className="flex items-center gap-1 ml-2"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="h-8 w-8 p-0"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddChild}
                    className="h-8 w-8 p-0"
                    title="Adicionar subtópico"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0 flex flex-col h-full">
          <div className="flex-1">
            {topic.content && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                {getPreview(topic.content)}
              </p>
            )}

            {topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {topic.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Criado em {formatDate(topic.created_at)}</span>
            </div>
            {topic.updated_at !== topic.created_at && (
              <div className="flex items-center gap-1">
                <Edit className="h-3 w-3" />
                <span>Editado em {formatDate(topic.updated_at)}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});
