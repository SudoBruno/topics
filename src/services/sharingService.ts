import { supabase } from "@/lib/supabase";
import type { SharedTopic, Topic } from "@/types";

class SharingService {
  // Criar compartilhamento
  async createShare(
    topicId: string,
    isPublic: boolean,
    includeSubtopics: boolean
  ): Promise<SharedTopic | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Não autenticado");

    const { data, error } = await supabase
      .from("shared_topics")
      .insert({
        topic_id: topicId,
        is_public: isPublic,
        include_subtopics: includeSubtopics,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Atualizar visibilidade
  async updateShareVisibility(
    shareId: string,
    isPublic: boolean
  ): Promise<void> {
    const { error } = await supabase
      .from("shared_topics")
      .update({ is_public: isPublic, updated_at: new Date().toISOString() })
      .eq("id", shareId);

    if (error) throw error;
  }

  // Obter compartilhamento por token
  async getShareByToken(token: string): Promise<SharedTopic | null> {
    const { data, error } = await supabase
      .from("shared_topics")
      .select("*")
      .eq("share_token", token)
      .eq("is_public", true)
      .single();

    if (error) return null;
    return data;
  }

  // Obter tópico compartilhado com sub-tópicos
  async getSharedTopic(token: string): Promise<{
    topic: Topic;
    subtopics: Topic[];
    shareInfo: SharedTopic;
  } | null> {
    const share = await this.getShareByToken(token);
    if (!share) return null;

    // Buscar tópico principal
    const { data: topic, error: topicError } = await supabase
      .from("topics")
      .select("*")
      .eq("id", share.topic_id)
      .single();

    if (topicError || !topic) return null;

    // Converter timestamps do Supabase para números
    const convertedTopic: Topic = {
      ...topic,
      created_at: new Date(topic.created_at).getTime() / 1000,
      updated_at: new Date(topic.updated_at).getTime() / 1000,
    };

    let subtopics: Topic[] = [];

    if (share.include_subtopics) {
      // Buscar todos os descendentes
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .eq("parent_id", share.topic_id);

      if (!error && data) {
        subtopics = data.map((t) => ({
          ...t,
          created_at: new Date(t.created_at).getTime() / 1000,
          updated_at: new Date(t.updated_at).getTime() / 1000,
        }));
      }
    }

    return {
      topic: convertedTopic,
      subtopics,
      shareInfo: share,
    };
  }

  // Obter compartilhamentos de um tópico
  async getTopicShares(topicId: string): Promise<SharedTopic[]> {
    const { data, error } = await supabase
      .from("shared_topics")
      .select("*")
      .eq("topic_id", topicId);

    if (error) return [];
    return data || [];
  }

  // Deletar compartilhamento
  async deleteShare(shareId: string): Promise<void> {
    const { error } = await supabase
      .from("shared_topics")
      .delete()
      .eq("id", shareId);

    if (error) throw error;
  }
}

export const sharingService = new SharingService();
