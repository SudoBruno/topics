import { useState, useEffect } from "react";
import { syncService, type SyncStatus } from "@/services/syncService";

export function useSync() {
  const [status, setStatus] = useState<SyncStatus>(syncService.getStatus());

  useEffect(() => {
    const unsubscribe = syncService.addStatusListener(setStatus);
    return unsubscribe;
  }, []);

  const syncToCloud = async () => {
    try {
      await syncService.syncToCloud();
    } catch (error) {
      console.error("Erro na sincronização:", error);
    }
  };

  const syncFromCloud = async () => {
    try {
      await syncService.syncFromCloud();
    } catch (error) {
      console.error("Erro na sincronização:", error);
    }
  };

  const fullSync = async () => {
    try {
      await syncService.fullSync();
    } catch (error) {
      console.error("Erro na sincronização:", error);
    }
  };

  const migrateFromLocalStorage = async () => {
    try {
      await syncService.migrateFromLocalStorage();
    } catch (error) {
      console.error("Erro na migração:", error);
    }
  };

  return {
    status,
    syncToCloud,
    syncFromCloud,
    fullSync,
    migrateFromLocalStorage,
    isOnline: status.isOnline,
    isSyncing: status.isSyncing,
    lastSync: status.lastSync,
    error: status.error,
  };
}
