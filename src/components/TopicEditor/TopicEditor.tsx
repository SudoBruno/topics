import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTopicsStore } from "@/store/topicsStore";
import { useAuth } from "@/contexts/AuthContext";
import { NotionStyleEditor } from "@/components/Editor/NotionStyleEditor";
import { TagInput } from "@/components/TagInput/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save, Maximize, Minimize } from "lucide-react";
import { animations } from "@/lib/animations";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export function TopicEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const {
    getTopicById,
    updateTopic,
    createTopic,
    getAllTags,
    initialize,
    topics,
  } = useTopicsStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const topic = id ? getTopicById(id) : null;
  const isNewTopic = !id;
  const parentId = searchParams.get("parent");
  const parentTopic = parentId ? getTopicById(parentId) : null;

  // Inicializar store quando usuário estiver autenticado
  useEffect(() => {
    if (user) {
      initialize();
    }
  }, [user, initialize]);

  // Aguardar carregamento dos tópicos antes de tentar encontrar o tópico
  useEffect(() => {
    if (!user) return;

    // Se é um tópico novo, pode editar imediatamente
    if (isNewTopic) {
      setTitle("");
      setContent("");
      setTags([]);
      setIsEditing(true);
      setIsLoading(false);
      return;
    }

    // Se é um tópico existente, aguardar carregamento
    if (id && topics.length > 0) {
      const foundTopic = getTopicById(id);
      if (foundTopic) {
        setTitle(foundTopic.title);
        setContent(foundTopic.content);
        setTags(foundTopic.tags);
        setIsEditing(true);
        setIsLoading(false);
      } else {
        // Tópico não encontrado, redirecionar para dashboard
        navigate("/");
      }
    }
  }, [user, id, isNewTopic, topics, getTopicById, navigate]);

  const handleSave = () => {
    if (!title.trim()) {
      alert("Por favor, insira um título para o tópico.");
      return;
    }

    if (topic) {
      // Atualizar tópico existente
      updateTopic(topic.id, {
        title: title.trim(),
        content,
        tags,
      });
    } else {
      // Criar novo tópico
      createTopic({
        title: title.trim(),
        content,
        tags,
        parentId: parentId,
        collapsed: false,
      });
    }

    navigate("/");
  };

  const availableTags = getAllTags();

  // Configurar atalhos de teclado
  useKeyboardShortcuts({
    onSave: handleSave,
    onFocusMode: () => setIsFocusMode(!isFocusMode),
    onEscape: () => {
      if (isFocusMode) {
        setIsFocusMode(false);
      } else {
        navigate("/");
      }
    },
  });

  if (isLoading || !isEditing) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando tópico...</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`max-w-4xl mx-auto space-y-6 ${
        isFocusMode ? "focus-mode" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={animations.smooth}
    >
      {/* Header */}
      {!isFocusMode && (
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
            <div>
              <h1 className="text-2xl font-bold">
                {isNewTopic
                  ? parentId
                    ? "Novo Subtópico"
                    : "Novo Tópico"
                  : "Editar Tópico"}
              </h1>
              {parentTopic && (
                <p className="text-sm text-muted-foreground mt-1">
                  Subtópico de:{" "}
                  <span className="font-medium">{parentTopic.title}</span>
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsFocusMode(true)}
              className="gap-2"
              title="Modo Foco (Ctrl+Shift+F)"
            >
              <Maximize className="h-4 w-4" />
              Foco
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </div>
        </div>
      )}

      {/* Header do Modo Foco */}
      {isFocusMode && (
        <div className="flex items-center justify-between py-2 border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setIsFocusMode(false)}
              className="gap-2"
            >
              <Minimize className="h-4 w-4" />
              Sair do Foco
            </Button>
            <h1 className="text-lg font-semibold truncate">
              {title || "Sem título"}
            </h1>
          </div>
          <Button onClick={handleSave} className="gap-2" size="sm">
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      )}

      {/* Title Input */}
      {!isFocusMode && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Título</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Digite o título do tópico..."
            className="text-lg"
          />
        </div>
      )}

      {/* Tags */}
      {!isFocusMode && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags</label>
          <TagInput
            tags={tags}
            onTagsChange={setTags}
            availableTags={availableTags}
            placeholder="Digite para buscar ou criar uma tag..."
            maxTags={10}
          />
        </div>
      )}

      {/* Content Editor */}
      <div className="space-y-2">
        {!isFocusMode && (
          <label className="text-sm font-medium">Conteúdo</label>
        )}
        <div className={isFocusMode ? "editor-content" : ""}>
          <NotionStyleEditor
            content={content}
            onChange={setContent}
            placeholder="Digite '/' para comandos..."
            showWordCount={true}
            autoSave={false}
          />
        </div>
      </div>
    </motion.div>
  );
}
