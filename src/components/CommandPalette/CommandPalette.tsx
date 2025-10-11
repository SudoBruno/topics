import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useTopicsStore } from "@/store/topicsStore";
import {
  FileText,
  Plus,
  TreePine,
  Search,
  Tag,
  ArrowRight,
} from "lucide-react";
import { animations } from "@/lib/animations";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  keywords: string[];
  action: () => void;
  type: "action" | "topic";
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { topics, getAllTags } = useTopicsStore();
  const [search, setSearch] = useState("");

  // Ações rápidas
  const quickActions: CommandAction[] = useMemo(
    () => [
      {
        id: "new-topic",
        title: "Novo Tópico",
        description: "Criar um novo tópico",
        icon: <Plus className="h-4 w-4" />,
        keywords: ["novo", "criar", "tópico", "add"],
        action: () => {
          navigate("/topic/new");
          onClose();
        },
        type: "action",
      },
      {
        id: "view-tree",
        title: "Ver Árvore",
        description: "Visualizar tópicos em formato de árvore",
        icon: <TreePine className="h-4 w-4" />,
        keywords: ["árvore", "tree", "hierarquia", "visualizar"],
        action: () => {
          navigate("/tree");
          onClose();
        },
        type: "action",
      },
      {
        id: "dashboard",
        title: "Dashboard",
        description: "Voltar para o painel principal",
        icon: <Search className="h-4 w-4" />,
        keywords: ["dashboard", "painel", "principal", "home"],
        action: () => {
          navigate("/");
          onClose();
        },
        type: "action",
      },
    ],
    [navigate, onClose]
  );

  // Tópicos filtrados
  const filteredTopics: CommandAction[] = useMemo(() => {
    if (!search.trim()) return [];

    const query = search.toLowerCase();
    return topics
      .filter(
        (topic) =>
          topic.title.toLowerCase().includes(query) ||
          topic.content.toLowerCase().includes(query) ||
          topic.tags.some((tag) => tag.toLowerCase().includes(query))
      )
      .map((topic) => ({
        id: topic.id,
        title: topic.title,
        description: topic.content
          ? topic.content.replace(/<[^>]*>/g, "").substring(0, 100) + "..."
          : "Sem conteúdo",
        icon: <FileText className="h-4 w-4" />,
        keywords: [topic.title, ...topic.tags],
        action: () => {
          navigate(`/topic/${topic.id}`);
          onClose();
        },
        type: "topic" as const,
      }));
  }, [topics, search, navigate, onClose]);

  // Tags filtradas
  const filteredTags = useMemo(() => {
    if (!search.trim()) return [];

    const query = search.toLowerCase();
    const allTags = getAllTags();

    return allTags
      .filter((tag) => tag.toLowerCase().includes(query))
      .slice(0, 5)
      .map((tag) => ({
        id: `tag-${tag}`,
        title: `Filtrar por "${tag}"`,
        description: `Ver todos os tópicos com a tag ${tag}`,
        icon: <Tag className="h-4 w-4" />,
        keywords: [tag, "tag", "filtrar"],
        action: () => {
          navigate(`/?tag=${encodeURIComponent(tag)}`);
          onClose();
        },
        type: "action" as const,
      }));
  }, [search, getAllTags, navigate, onClose]);

  // Combinar todos os resultados
  const allResults = useMemo(() => {
    const results: CommandAction[] = [];

    // Adicionar ações rápidas se não há busca específica
    if (!search.trim()) {
      results.push(...quickActions);
    } else {
      // Filtrar ações rápidas baseado na busca
      const filteredActions = quickActions.filter((action) =>
        action.keywords.some((keyword) =>
          keyword.toLowerCase().includes(search.toLowerCase())
        )
      );
      results.push(...filteredActions);
    }

    // Adicionar tópicos encontrados
    results.push(...filteredTopics);

    // Adicionar tags encontradas
    results.push(...filteredTags);

    return results;
  }, [search, quickActions, filteredTopics, filteredTags]);

  // Resetar busca quando abrir
  useEffect(() => {
    if (isOpen) {
      setSearch("");
    }
  }, [isOpen]);

  // Fechar com Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl p-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={animations.quick}
        >
          <Command className="rounded-lg border shadow-md">
            <CommandInput
              placeholder="Digite um comando ou busque por tópicos..."
              value={search}
              onValueChange={setSearch}
              className="h-12"
            />
            <CommandList className="max-h-96">
              <CommandEmpty>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Search className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum resultado encontrado para "{search}"
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tente buscar por tópicos, tags ou use os comandos rápidos
                  </p>
                </div>
              </CommandEmpty>

              <AnimatePresence>
                {allResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={animations.quick}
                  >
                    <CommandGroup>
                      {allResults.map((result, index) => (
                        <motion.div
                          key={result.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <CommandItem
                            onSelect={result.action}
                            className="flex items-center gap-3 p-3 cursor-pointer"
                          >
                            <div className="flex-shrink-0 text-muted-foreground">
                              {result.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">
                                  {result.title}
                                </span>
                                {result.type === "topic" && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Tópico
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate">
                                {result.description}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </CommandItem>
                        </motion.div>
                      ))}
                    </CommandGroup>
                  </motion.div>
                )}
              </AnimatePresence>
            </CommandList>
          </Command>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
