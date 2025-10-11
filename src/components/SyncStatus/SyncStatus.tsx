import { useSync } from "@/hooks/useSync";
import { motion } from "framer-motion";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Cloud,
  CloudOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SyncStatus() {
  const { fullSync, isOnline, isSyncing, lastSync, error } = useSync();

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return "Nunca";

    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Agora";
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  const getStatusIcon = () => {
    if (error) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (isSyncing)
      return <RefreshCw className="h-4 w-4 animate-spin text-primary" />;
    if (isOnline && lastSync)
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (isOnline) return <Cloud className="h-4 w-4 text-muted-foreground" />;
    return <CloudOff className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (error) return "Erro na sincronização";
    if (isSyncing) return "Sincronizando...";
    if (isOnline && lastSync) return `Sincronizado ${formatLastSync(lastSync)}`;
    if (isOnline) return "Online - não sincronizado";
    return "Offline";
  };

  const getStatusColor = () => {
    if (error) return "text-destructive";
    if (isSyncing) return "text-primary";
    if (isOnline && lastSync) return "text-green-500";
    return "text-muted-foreground";
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-2"
          >
            {/* Ícone de conexão */}
            <div className="flex items-center gap-1">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            {/* Status de sincronização */}
            <Button
              variant="ghost"
              size="sm"
              onClick={fullSync}
              disabled={!isOnline || isSyncing}
              className="h-8 px-2 gap-1 text-xs"
            >
              {getStatusIcon()}
              <span className={`hidden sm:inline ${getStatusColor()}`}>
                {getStatusText()}
              </span>
            </Button>
          </motion.div>
        </TooltipTrigger>

        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium">
                {isOnline ? "Conectado" : "Desconectado"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className="text-sm">{getStatusText()}</span>
            </div>

            {error && (
              <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            {isOnline && !isSyncing && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fullSync}
                  className="w-full h-8 text-xs"
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Sincronizar Agora
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("🔍 Debug: Verificando dados locais...");
                    // Debug: verificar dados no IndexedDB
                    import("@/lib/db").then(({ db }) => {
                      db.topics.toArray().then((topics) => {
                        console.log("📊 Tópicos no IndexedDB:", topics);
                      });
                    });
                  }}
                  className="w-full h-6 text-xs"
                >
                  🔍 Debug Local
                </Button>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
