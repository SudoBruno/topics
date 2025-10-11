import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTopicsStore } from "@/store/topicsStore";
import { Plus } from "lucide-react";
import type { TopicTemplate } from "@/types";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null;
}

export function TemplateSelector({
  isOpen,
  onClose,
  parentId,
}: TemplateSelectorProps) {
  const navigate = useNavigate();
  const { getAllTemplates, createTopicFromTemplate } = useTopicsStore();
  const [selectedTemplate, setSelectedTemplate] =
    useState<TopicTemplate | null>(null);

  const templates = getAllTemplates();
  const defaultTemplates = templates.filter((t) => !t.isCustom);
  const customTemplates = templates.filter((t) => t.isCustom);

  const handleSelectTemplate = (template: TopicTemplate) => {
    setSelectedTemplate(template);
  };

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return;

    const newTopic = await createTopicFromTemplate(selectedTemplate.id, parentId);
    if (newTopic) {
      navigate(`/topic/${newTopic.id}`);
      onClose();
    }
  };

  const handleCreateBlank = () => {
    navigate("/topic/new");
    onClose();
  };

  const handleCreateCustomTemplate = () => {
    // TODO: Implementar editor de templates customizados
    console.log("Criar template customizado");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Escolher Template
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template em branco */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Criar do Zero</h3>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.1, ease: "easeOut" }}
            >
              <Button
                variant="outline"
                className="w-full h-30 flex flex-col items-center justify-center gap-2 border border-gray-400 dark:border-gray-600 hover:border-gray-800 dark:hover:border-gray-300 transition-all duration-150"
                onClick={handleCreateBlank}
              >
                <Plus className="h-6 w-6" />
                <span className="font-medium">Tópico em Branco</span>
                <span className="text-sm text-muted-foreground">
                  Começar sem template
                </span>
              </Button>
            </motion.div>
          </div>

          {/* Templates pré-definidos */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Templates Pré-definidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AnimatePresence>
                {defaultTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ${
                        selectedTemplate?.id === template.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-400 dark:border-gray-600 hover:border-gray-800 dark:hover:border-gray-300"
                      }`}
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{template.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">
                            {template.name}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {template.defaultTags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {template.defaultTags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.defaultTags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Templates customizados */}
          {customTemplates.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Meus Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {customTemplates.map((template, index) => (
                    <motion.div
                      key={template.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: (defaultTemplates.length + index) * 0.05,
                        duration: 0.2,
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 ${
                          selectedTemplate?.id === template.id
                            ? "border-primary bg-primary/5"
                            : "border-foreground/60 dark:border-foreground/20 hover:border-foreground dark:hover:border-foreground/40"
                        }`}
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="text-2xl">{template.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium truncate">
                              {template.name}
                            </h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.defaultTags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {template.defaultTags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{template.defaultTags.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Botão para criar template customizado */}
          <div className="pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleCreateCustomTemplate}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              Criar Template Personalizado
            </Button>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            {selectedTemplate && (
              <Button onClick={handleCreateFromTemplate}>
                Criar com "{selectedTemplate.name}"
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
