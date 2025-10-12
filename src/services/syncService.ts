import { supabase } from "@/lib/supabase";
import type { Topic } from "@/types";

// Helper para normalizar timestamp para ISO string (PostgreSQL)
const normalizeTimestamp = (timestamp: number | null): string => {
  if (!timestamp) return new Date().toISOString();

  // Se timestamp é muito grande (milissegundos), usar diretamente
  if (timestamp > 10000000000) {
    return new Date(timestamp).toISOString();
  }

  // Se está em segundos, converter para milissegundos primeiro
  return new Date(timestamp * 1000).toISOString();
};

// Helper para converter timestamp do Supabase para Unix
const parseSupabaseTimestamp = (timestamp: string | number): number => {
  if (typeof timestamp === "number") return timestamp;

  // Se é string ISO, converter para Unix timestamp
  return Math.floor(new Date(timestamp).getTime() / 1000);
};

// Mapear dados do Supabase para formato local
const mapTopicsFromSupabase = (topics: any[]): Topic[] => {
  return topics.map((topic: any) => ({
    id: topic.id,
    title: topic.title,
    content: topic.content,
    tags: topic.tags || [],
    parentId: topic.parent_id,
    user_id: topic.user_id,
    created_at: parseSupabaseTimestamp(topic.created_at),
    updated_at: parseSupabaseTimestamp(topic.updated_at),
    collapsed: false, // Sempre começa fechado - estado de UI local
  }));
};

class SyncService {
  // Obter tópicos do Supabase
  async getTopics(): Promise<Topic[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: topics, error } = await supabase
        .from("topics")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      return mapTopicsFromSupabase(topics || []);
    } catch (error) {
      console.error("Erro ao obter tópicos:", error);
      return [];
    }
  }

  // Salvar tópico no Supabase
  async saveTopic(topic: Topic): Promise<void> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const topicData = {
        id: topic.id,
        title: topic.title,
        content: topic.content,
        tags: topic.tags,
        parent_id: topic.parentId,
        user_id: user.id,
        created_at: normalizeTimestamp(topic.created_at),
        updated_at: normalizeTimestamp(topic.updated_at),
      };

      const { error } = await supabase
        .from("topics")
        .upsert(topicData, { onConflict: "id" });

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao salvar tópico:", error);
      throw error;
    }
  }

  // Deletar tópico do Supabase
  async deleteTopic(id: string): Promise<void> {
    try {
      const { error } = await supabase.from("topics").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error("Erro ao deletar tópico:", error);
      throw error;
    }
  }
}

// Instância singleton
export const syncService = new SyncService();
