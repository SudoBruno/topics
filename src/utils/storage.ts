import LZString from "lz-string";
import type { Topic } from "@/types";

const STORAGE_KEY = "political-notes-topics";
const STORAGE_VERSION = "1.0.0";

interface StorageData {
  version: string;
  topics: Topic[];
  lastSaved: number;
}

// Função para comprimir dados antes de salvar
function compressData(data: StorageData): string {
  const jsonString = JSON.stringify(data);
  return LZString.compress(jsonString) || jsonString;
}

// Função para descomprimir dados ao carregar
function decompressData(compressedData: string): StorageData | null {
  try {
    // Tenta descomprimir primeiro
    const decompressed = LZString.decompress(compressedData);
    if (decompressed) {
      return JSON.parse(decompressed);
    }

    // Se não conseguir descomprimir, tenta como JSON normal
    return JSON.parse(compressedData);
  } catch (error) {
    console.error("Erro ao descomprimir dados:", error);
    return null;
  }
}

// Salvar dados no localStorage
export function saveTopics(topics: Topic[]): void {
  try {
    const data: StorageData = {
      version: STORAGE_VERSION,
      topics,
      lastSaved: Date.now(),
    };

    const compressed = compressData(data);
    localStorage.setItem(STORAGE_KEY, compressed);
  } catch (error) {
    console.error("Erro ao salvar tópicos:", error);

    // Fallback: tentar salvar sem compressão
    try {
      const data: StorageData = {
        version: STORAGE_VERSION,
        topics,
        lastSaved: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (fallbackError) {
      console.error("Erro no fallback de salvamento:", fallbackError);
    }
  }
}

// Carregar dados do localStorage
export function loadTopics(): Topic[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data = decompressData(stored);
    if (!data) {
      return [];
    }

    // Verificar versão e migrar se necessário
    if (data.version !== STORAGE_VERSION) {
      console.log("Migrando dados para nova versão...");
      // Aqui você pode implementar migrações futuras
    }

    return data.topics || [];
  } catch (error) {
    console.error("Erro ao carregar tópicos:", error);
    return [];
  }
}

// Verificar se há dados salvos
export function hasStoredData(): boolean {
  return localStorage.getItem(STORAGE_KEY) !== null;
}

// Limpar todos os dados
export function clearTopics(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Obter informações sobre o armazenamento
export function getStorageInfo(): { size: number; lastSaved: number | null } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { size: 0, lastSaved: null };
    }

    const data = decompressData(stored);
    return {
      size: stored.length,
      lastSaved: data?.lastSaved || null,
    };
  } catch (error) {
    console.error("Erro ao obter informações do storage:", error);
    return { size: 0, lastSaved: null };
  }
}

// Debounce para auto-save
let saveTimeout: number | null = null;

export function debouncedSave(topics: Topic[], delay: number = 500): void {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(() => {
    saveTopics(topics);
  }, delay);
}
