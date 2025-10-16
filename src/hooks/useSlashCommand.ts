import { useEffect, useState, useRef } from "react";
import { Editor } from "@tiptap/react";

interface SlashCommandState {
  isOpen: boolean;
  query: string;
  position: { top: number; left: number } | null;
}

export function useSlashCommand(editor: Editor | null) {
  const [state, setState] = useState<SlashCommandState>({
    isOpen: false,
    query: "",
    position: null,
  });
  const slashCommandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Verificar se estamos digitando "/"
      if (event.key === "/" && !state.isOpen) {
        const { from } = editor.state.selection;
        const $from = editor.state.doc.resolve(from);
        const textBefore = $from.parent.textBetween(
          Math.max(0, $from.parentOffset - 10),
          $from.parentOffset,
          undefined,
          " "
        );

        // Se estamos no início de uma linha ou após um espaço
        if ($from.parentOffset === 0 || textBefore.endsWith(" ")) {
          event.preventDefault();

          // Obter posição do cursor
          const coords = editor.view.coordsAtPos(from);
          const editorElement = editor.view.dom;
          const editorRect = editorElement.getBoundingClientRect();

          setState({
            isOpen: true,
            query: "",
            position: {
              top: coords.top - editorRect.top + 20,
              left: coords.left - editorRect.left,
            },
          });
        }
      }

      // Fechar com Escape
      if (event.key === "Escape" && state.isOpen) {
        setState((prev) => ({ ...prev, isOpen: false }));
      }
    };

    const handleInput = () => {
      if (!state.isOpen) return;

      const { from } = editor.state.selection;
      const $from = editor.state.doc.resolve(from);
      const textBefore = $from.parent.textBetween(
        Math.max(0, $from.parentOffset - 20),
        $from.parentOffset,
        undefined,
        " "
      );

      // Encontrar a posição do "/"
      const slashIndex = textBefore.lastIndexOf("/");
      if (slashIndex === -1) {
        setState((prev) => ({ ...prev, isOpen: false }));
        return;
      }

      const query = textBefore.slice(slashIndex + 1);
      setState((prev) => ({ ...prev, query }));
    };

    const handleSelectionUpdate = () => {
      if (state.isOpen) {
        setState((prev) => ({ ...prev, isOpen: false }));
      }
    };

    // Usar addEventListener diretamente no DOM
    const editorElement = editor.view.dom;
    editorElement.addEventListener("keydown", handleKeyDown);
    editorElement.addEventListener("input", handleInput);
    editor.on("selectionUpdate", handleSelectionUpdate);

    return () => {
      editorElement.removeEventListener("keydown", handleKeyDown);
      editorElement.removeEventListener("input", handleInput);
      editor.off("selectionUpdate", handleSelectionUpdate);
    };
  }, [editor, state.isOpen]);

  const closeSlashCommand = () => {
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  const executeCommand = (command: () => void) => {
    if (!editor) return;

    const { from } = editor.state.selection;
    const $from = editor.state.doc.resolve(from);
    const textBefore = $from.parent.textBetween(
      Math.max(0, $from.parentOffset - 20),
      $from.parentOffset,
      undefined,
      " "
    );

    const slashIndex = textBefore.lastIndexOf("/");
    if (slashIndex !== -1) {
      // Remover o texto do slash command
      const startPos = from - (textBefore.length - slashIndex);
      editor.chain().focus().deleteRange({ from: startPos, to: from }).run();
    }

    command();
    closeSlashCommand();
  };

  return {
    ...state,
    closeSlashCommand,
    executeCommand,
    slashCommandRef,
  };
}
