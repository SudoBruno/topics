import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTopicsStore } from "@/store/topicsStore";
import { RichTextEditor } from "@/components/Editor/RichTextEditor";
import { TagInput } from "@/components/TagInput/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Save } from "lucide-react";
import { animations } from "@/lib/animations";

export function TopicEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getTopicById, updateTopic, createTopic, getAllTags } =
    useTopicsStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  const topic = id ? getTopicById(id) : null;
  const isNewTopic = !id;
  const parentId = searchParams.get("parent");
  const parentTopic = parentId ? getTopicById(parentId) : null;

  useEffect(() => {
    if (topic) {
      setTitle(topic.title);
      setContent(topic.content);
      setTags(topic.tags);
      setIsEditing(true);
    } else if (isNewTopic) {
      setTitle("");
      setContent("");
      setTags([]);
      setIsEditing(true);
    }
  }, [topic, isNewTopic]);

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

  if (!isEditing) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Carregando...</p>
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
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar
        </Button>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Título</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Digite o título do tópico..."
          className="text-lg"
        />
      </div>

      {/* Tags */}
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

      {/* Content Editor */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Conteúdo</label>
        <RichTextEditor
          content={content}
          onChange={setContent}
          placeholder="Comece a escrever suas anotações..."
        />
      </div>
    </motion.div>
  );
}
