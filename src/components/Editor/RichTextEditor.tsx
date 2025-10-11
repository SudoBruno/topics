import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { EditorToolbar } from "./EditorToolbar";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Comece a escrever...",
  className = "",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[200px] p-4",
      },
    },
  });

  // Atualizar conteúdo quando prop mudar
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="border border-border rounded-md bg-card">
        <div className="p-4 text-muted-foreground">Carregando editor...</div>
      </div>
    );
  }

  return (
    <div className={`border border-border rounded-md bg-card ${className}`}>
      <EditorToolbar editor={editor} />
      <EditorContent
        editor={editor}
        className="min-h-[200px]"
        placeholder={placeholder}
      />
    </div>
  );
}
