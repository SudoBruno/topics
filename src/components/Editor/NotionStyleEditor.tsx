import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { Typography } from "@tiptap/extension-typography";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Underline } from "@tiptap/extension-underline";
import { Strike } from "@tiptap/extension-strike";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import { NotionStyleToolbar } from "./NotionStyleToolbar";
import { SlashCommand } from "./SlashCommand";
import { Callout } from "./CalloutExtension";
import { useSlashCommand } from "@/hooks/useSlashCommand";
import "./notion-editor-styles.css";

interface NotionStyleEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  showWordCount?: boolean;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function NotionStyleEditor({
  content,
  onChange,
  placeholder = "Digite '/' para comandos...",
  className = "",
  showWordCount = true,
  autoSave = false,
  autoSaveDelay = 2000,
}: NotionStyleEditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Main content area, start typing to enter text.",
        class: "notion-editor",
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Underline,
      Strike,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "link",
        },
      }),
      Placeholder.configure({
        placeholder,
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
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
    <div className={`notion-editor-wrapper ${className}`}>
      <NotionStyleToolbar editor={editor} />
      <div className="notion-editor-content-wrapper">
        <EditorContent editor={editor} />
        {slashCommand.isOpen && slashCommand.position && (
          <div
            ref={slashCommand.slashCommandRef}
            className="slash-command-container"
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
        <div className="notion-editor-footer">
          <div className="word-count">
            <span>{wordCount} palavras</span>
            <span>{charCount} caracteres</span>
          </div>
          {autoSave && <span className="auto-save">Auto-salvo</span>}
        </div>
      )}
    </div>
  );
}
