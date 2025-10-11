import { supabase } from "@/lib/supabase";
import { db } from "@/lib/db";
import type { Topic } from "@/types";
import { loadTopics } from "@/utils/storage";

export interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: number | null;
  error: string | null;
}

class SyncService {
  private syncStatus: SyncStatus = {
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    error: null,
  };

  private listeners: ((status: SyncStatus) => void)[] = [];
  private syncInProgress = false; // Flag para evitar múltiplas sincronizações

  constructor() {
    // Monitorar status de conexão
    window.addEventListener("online", () => {
      this.syncStatus.isOnline = true;
      this.notifyListeners();
      this.syncToCloud();
    });

    window.addEventListener("offline", () => {
      this.syncStatus.isOnline = false;
      this.notifyListeners();
    });
  }

  // Adicionar listener para mudanças de status
  addStatusListener(listener: (status: SyncStatus) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  // Notificar listeners sobre mudanças
  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.syncStatus));
  }

  // Obter status atual
  getStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  // Sincronizar dados do localStorage para IndexedDB
  async migrateFromLocalStorage(): Promise<void> {
    try {
      // Verificar se já foi migrado
      const existingTopics = await db.topics.toArray();
      if (existingTopics.length > 0) {
        console.log("Migração já realizada, pulando...");
        return;
      }

      const localTopics = loadTopics();
      if (localTopics.length === 0) {
        console.log("Nenhum tópico no localStorage para migrar");
        return;
      }

      console.log(
        `Migrando ${localTopics.length} tópicos do localStorage para IndexedDB...`
      );

      // Salvar no IndexedDB
      await db.topics.bulkPut(localTopics);

      console.log("✅ Migração concluída com sucesso!");
    } catch (error) {
      console.error("❌ Erro na migração:", error);
      throw error;
    }
  }

  // Sincronizar do IndexedDB para Supabase
  async syncToCloud(): Promise<void> {
    if (
      !this.syncStatus.isOnline ||
      this.syncStatus.isSyncing ||
      this.syncInProgress
    ) {
      console.log("Sincronização já em andamento ou offline, pulando...");
      return;
    }

    this.syncInProgress = true;
    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;
    this.notifyListeners();

    try {
      // Obter tópicos do IndexedDB
      const localTopics = await db.topics.toArray();
      console.log(`Encontrados ${localTopics.length} tópicos no IndexedDB`);

      if (localTopics.length === 0) {
        console.log(
          "Nenhum tópico local encontrado, tentando carregar da nuvem..."
        );
        // Se não há dados locais, tentar carregar do Supabase
        // Mas não chamar syncFromCloud diretamente para evitar loop
        await this.syncFromCloudInternal();
        return;
      }

      // Obter usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      console.log(`Usuário autenticado: ${user.id}`);

      // Preparar dados para upload (adicionar user_id e filtrar campos)
      const topicsToUpload = localTopics.map((topic) => ({
        id: topic.id,
        title: topic.title,
        content: topic.content,
        tags: topic.tags,
        parent_id: topic.parentId,
        user_id: user.id,
        created_at: topic.created_at,
        updated_at: topic.updated_at,
        // collapsed não é salvo no banco - é apenas estado de UI
      }));

      console.log("Enviando tópicos para Supabase:", topicsToUpload);

      // Upload para Supabase
      const { error } = await supabase.from("topics").upsert(topicsToUpload, {
        onConflict: "id",
        ignoreDuplicates: false,
      });

      if (error) {
        console.error("Erro do Supabase:", error);
        throw error;
      }

      this.syncStatus.lastSync = Date.now();
      console.log(
        `✅ Sincronizados ${topicsToUpload.length} tópicos para a nuvem`
      );
    } catch (error) {
      console.error("❌ Erro na sincronização para nuvem:", error);
      this.syncStatus.error =
        error instanceof Error ? error.message : "Erro desconhecido";
    } finally {
      this.syncStatus.isSyncing = false;
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  // Sincronizar do Supabase para IndexedDB (método interno sem controle de status)
  private async syncFromCloudInternal(): Promise<void> {
    try {
      // Obter usuário atual
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Buscar tópicos do Supabase
      const { data: cloudTopics, error } = await supabase
        .from("topics")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;

      if (cloudTopics && cloudTopics.length > 0) {
        // Mapear dados do Supabase para o formato local
        const mappedTopics = cloudTopics.map((topic: any) => ({
          id: topic.id,
          title: topic.title,
          content: topic.content,
          tags: topic.tags || [],
          parentId: topic.parent_id,
          user_id: topic.user_id,
          created_at: topic.created_at,
          updated_at: topic.updated_at,
          collapsed: false, // Sempre começa fechado - estado de UI local
        }));

        // Salvar no IndexedDB
        await db.topics.bulkPut(mappedTopics);

        console.log(
          `✅ Sincronizados ${mappedTopics.length} tópicos da nuvem (interno)`
        );
      }
    } catch (error) {
      console.error("Erro na sincronização interna da nuvem:", error);
      throw error;
    }
  }

  // Sincronizar do Supabase para IndexedDB
  async syncFromCloud(): Promise<void> {
    if (
      !this.syncStatus.isOnline ||
      this.syncStatus.isSyncing ||
      this.syncInProgress
    ) {
      console.log("Sincronização já em andamento ou offline, pulando...");
      return;
    }

    this.syncInProgress = true;
    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;
    this.notifyListeners();

    try {
      // Usar método interno para evitar loops
      await this.syncFromCloudInternal();
      this.syncStatus.lastSync = Date.now();
    } catch (error) {
      console.error("Erro na sincronização da nuvem:", error);
      this.syncStatus.error =
        error instanceof Error ? error.message : "Erro desconhecido";
    } finally {
      this.syncStatus.isSyncing = false;
      this.syncInProgress = false;
      this.notifyListeners();
    }
  }

  // Sincronização bidirecional completa
  async fullSync(): Promise<void> {
    if (!this.syncStatus.isOnline) {
      throw new Error("Sem conexão com a internet");
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.error = null;
    this.notifyListeners();

    try {
      // Primeiro, tentar sincronizar dados locais para nuvem
      await this.syncToCloud();

      // Depois, sincronizar dados da nuvem para local
      await this.syncFromCloud();
    } catch (error) {
      console.error("Erro na sincronização completa:", error);
      this.syncStatus.error =
        error instanceof Error ? error.message : "Erro desconhecido";
      throw error;
    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  // Obter tópicos do IndexedDB
  async getTopics(): Promise<Topic[]> {
    try {
      return await db.topics.toArray();
    } catch (error) {
      console.error("Erro ao obter tópicos do IndexedDB:", error);
      return [];
    }
  }

  // Salvar tópico no IndexedDB
  async saveTopic(topic: Topic): Promise<void> {
    try {
      await db.topics.put(topic);

      // Tentar sincronizar para nuvem se online
      if (this.syncStatus.isOnline) {
        this.syncToCloud();
      }
    } catch (error) {
      console.error("Erro ao salvar tópico:", error);
      throw error;
    }
  }

  // Deletar tópico do IndexedDB
  async deleteTopic(id: string): Promise<void> {
    try {
      await db.topics.delete(id);

      // Tentar deletar da nuvem se online
      if (this.syncStatus.isOnline) {
        const { error } = await supabase.from("topics").delete().eq("id", id);

        if (error) throw error;
      }
    } catch (error) {
      console.error("Erro ao deletar tópico:", error);
      throw error;
    }
  }

  // Limpar todos os dados
  async clearAllData(): Promise<void> {
    try {
      await db.topics.clear();
      this.syncStatus.lastSync = null;
      this.notifyListeners();
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      throw error;
    }
  }
}

// Instância singleton
export const syncService = new SyncService();
