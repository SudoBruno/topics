import { useState, useEffect } from "react";
import { useTopicsStore } from "@/store/topicsStore";

export function useSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const initialize = useTopicsStore((state) => state.initialize);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const reloadTopics = async () => {
    try {
      await initialize();
    } catch (error) {
      console.error("Erro ao recarregar tópicos:", error);
    }
  };

  return {
    isOnline,
    reloadTopics,
  };
}
