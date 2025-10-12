import { useTopicsStore } from "@/store/topicsStore";
import { motion } from "framer-motion";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SyncStatus() {
  const isOnline = navigator.onLine;

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

            {/* Botão de recarregar */}
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={handleReload}
              disabled={!isOnline}
              className="h-8 px-2 gap-1 text-xs"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isOnline ? "Recarregar" : "Offline"}
              </span>
            </Button> */}
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

            <div className="text-sm text-muted-foreground">
              {isOnline
                ? "Dados carregados do Supabase"
                : "Sem conexão com a internet"}
            </div>

            {/* {isOnline && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleReload}
                className="w-full h-8 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Recarregar Dados
              </Button>
            )} */}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
