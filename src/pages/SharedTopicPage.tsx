import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { sharingService } from "@/services/sharingService";
import type { Topic, SharedTopic } from "@/types";
import { FileText, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SharedTopicPage() {
  const { token } = useParams<{ token: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [subtopics, setSubtopics] = useState<Topic[]>([]);
  const [shareInfo, setShareInfo] = useState<SharedTopic | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadSharedTopic();
  }, [token]);

  const loadSharedTopic = async () => {
    if (!token) return;

    try {
      const data = await sharingService.getSharedTopic(token);
      if (data) {
        setTopic(data.topic);
        setSubtopics(data.subtopics);
        setShareInfo(data.shareInfo);
        setSelectedTopicId(data.topic.id);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
    }
    setLoading(false);
  };

  const currentTopic =
    selectedTopicId === topic?.id
      ? topic
      : subtopics.find((t) => t.id === selectedTopicId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Tópico não encontrado</h1>
          <p className="text-muted-foreground">
            Este link pode estar inválido ou o tópico foi removido.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            <span className="font-semibold">Tópico Compartilhado</span>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          {shareInfo?.include_subtopics && subtopics.length > 0 && (
            <aside className="md:col-span-1">
              <div className="sticky top-24 space-y-2">
                <h3 className="font-semibold mb-4">Navegação</h3>

                <button
                  onClick={() => setSelectedTopicId(topic.id)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                    selectedTopicId === topic.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  {topic.title}
                </button>

                {subtopics.map((subtopic) => (
                  <button
                    key={subtopic.id}
                    onClick={() => setSelectedTopicId(subtopic.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors pl-6 ${
                      selectedTopicId === subtopic.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {subtopic.title}
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* Content */}
          <main
            className={
              shareInfo?.include_subtopics && subtopics.length > 0
                ? "md:col-span-3"
                : "md:col-span-4"
            }
          >
            <article className="prose dark:prose-invert max-w-none">
              <h1>{currentTopic?.title}</h1>

              <div className="flex gap-2 mb-6">
                {currentTopic?.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div
                className="notion-editor"
                dangerouslySetInnerHTML={{
                  __html: currentTopic?.content || "",
                }}
              />
            </article>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(topic.updated_at * 1000).toLocaleDateString()}
              </span>
            </div>
            <a href="/auth" className="hover:underline">
              Criar minha conta
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
