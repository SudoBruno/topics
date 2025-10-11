import { useEffect, useCallback } from "react";

interface KeyboardShortcutsOptions {
  onOpenCommandPalette?: () => void;
  onNewTopic?: () => void;
  onSave?: () => void;
  onEscape?: () => void;
  onFocusMode?: () => void;
}

export function useKeyboardShortcuts({
  onOpenCommandPalette,
  onNewTopic,
  onSave,
  onEscape,
  onFocusMode,
}: KeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Não executar atalhos se estiver digitando em inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.contentEditable === "true"
      ) {
        // Permitir apenas Escape e Ctrl+Shift+F em inputs
        if (event.key === "Escape") {
          onEscape?.();
        } else if (
          (event.ctrlKey || event.metaKey) &&
          event.shiftKey &&
          event.key === "F"
        ) {
          event.preventDefault();
          onFocusMode?.();
        }
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      // Cmd/Ctrl + K: Abrir Command Palette
      if (ctrlOrCmd && event.key === "k") {
        event.preventDefault();
        onOpenCommandPalette?.();
      }
      // Cmd/Ctrl + N: Novo Tópico
      else if (ctrlOrCmd && event.key === "n") {
        event.preventDefault();
        onNewTopic?.();
      }
      // Cmd/Ctrl + S: Salvar
      else if (ctrlOrCmd && event.key === "s") {
        event.preventDefault();
        onSave?.();
      }
      // Ctrl + Shift + F: Modo Foco
      else if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "F"
      ) {
        event.preventDefault();
        onFocusMode?.();
      }
      // Escape: Fechar dialogs, sair de modo foco
      else if (event.key === "Escape") {
        onEscape?.();
      }
    },
    [onOpenCommandPalette, onNewTopic, onSave, onEscape, onFocusMode]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
