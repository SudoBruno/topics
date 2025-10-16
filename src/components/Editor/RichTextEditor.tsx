import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { Image } from "@tiptap/extension-image";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Highlight } from "@tiptap/extension-highlight";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Underline } from "@tiptap/extension-underline";
import { Strike } from "@tiptap/extension-strike";
import { TextAlign } from "@tiptap/extension-text-align";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";
import { useEffect, useState } from "react";
import { EditorToolbar } from "./EditorToolbar";
import { SlashCommand } from "./SlashCommand";
import { Callout } from "./CalloutExtension";
import { useSlashCommand } from "@/hooks/useSlashCommand";
import "./editor-styles.css";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  showWordCount?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Comece a escrever...",
  className = "",
  showWordCount = true,
  autoSave = false,
  autoSaveDelay = 2000,
}: RichTextEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
        horizontalRule: false, // Usaremos a extensão separada
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      HorizontalRule,
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
      Underline,
      Strike,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Superscript,
      Subscript,
      Callout,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);

      // Atualizar contadores
      const text = editor.getText();
      setWordCount(
        text
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length
      );
      setCharCount(text.length);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  const slashCommand = useSlashCommand(editor);

  // Atualizar conteúdo quando prop mudar
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  // Auto-save
  useEffect(() => {
    if (!autoSave || !editor) return;

    const timeoutId = setTimeout(() => {
      onChange(editor.getHTML());
    }, autoSaveDelay);

    return () => clearTimeout(timeoutId);
  }, [content, autoSave, autoSaveDelay, editor, onChange]);

  if (!editor) {
    return (
      <div className="border border-border rounded-md bg-card">
        <div className="p-4 text-muted-foreground">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div
      className={`border border-border rounded-md bg-card ${className} relative`}
    >
      <EditorToolbar editor={editor} />
      <div className="relative">
        <EditorContent editor={editor} className="min-h-[200px]" />
        {slashCommand.isOpen && slashCommand.position && (
          <div
            ref={slashCommand.slashCommandRef}
            className="absolute z-50"
            style={{
              top: slashCommand.position.top,
              left: slashCommand.position.left,
            }}
          >
            <SlashCommand
              editor={editor}
              onClose={slashCommand.closeSlashCommand}
            />
          </div>
        )}
      </div>
      {showWordCount && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30">
          <div className="flex items-center gap-4">
            <span>{wordCount} palavras</span>
            <span>{charCount} caracteres</span>
          </div>
          {autoSave && <span className="text-green-600">Auto-salvo</span>}
        </div>
      )}
    </div>
  );
}
