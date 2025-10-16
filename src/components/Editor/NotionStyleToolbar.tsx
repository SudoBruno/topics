import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  CheckSquare,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  Minus,
  Image,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Highlighter,
  Superscript,
  Subscript,
  Undo,
  Redo,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface NotionStyleToolbarProps {
  editor: Editor | null;
}

export function NotionStyleToolbar({ editor }: NotionStyleToolbarProps) {
  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive,
    children,
    title,
    disabled,
  }: {
    onClick: () => void;
    isActive: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
      disabled={disabled}
    >
      {children}
    </Button>
  );

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-card">
      {/* Desfazer/Refazer */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          disabled={!editor.can().undo()}
          title="Desfazer (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          disabled={!editor.can().redo()}
          title="Refazer (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Cabeçalhos */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
          title="Título 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Listas */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Lista com marcadores"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive("taskList")}
          title="Lista de tarefas"
        >
          <CheckSquare className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Formatação Básica */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Negrito (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Itálico (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Sublinhado (Ctrl+U)"
        >
          <Underline className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Riscado"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive("highlight")}
          title="Destaque"
        >
          <Highlighter className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Alinhamento */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          isActive={editor.isActive({ textAlign: "left" })}
          title="Alinhar à esquerda"
        >
          <AlignLeft className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          isActive={editor.isActive({ textAlign: "center" })}
          title="Centralizar"
        >
          <AlignCenter className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          isActive={editor.isActive({ textAlign: "right" })}
          title="Alinhar à direita"
        >
          <AlignRight className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          isActive={editor.isActive({ textAlign: "justify" })}
          title="Justificar"
        >
          <AlignJustify className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Elementos Especiais */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Código inline"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Citação"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          isActive={false}
          title="Linha horizontal"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Callouts */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().setCallout({ type: "info" }).run()
          }
          isActive={false}
          title="Caixa de informação"
        >
          <Info className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().setCallout({ type: "warning" }).run()
          }
          isActive={false}
          title="Caixa de aviso"
        >
          <AlertTriangle className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().setCallout({ type: "success" }).run()
          }
          isActive={false}
          title="Caixa de sucesso"
        >
          <CheckCircle className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Mídia e Links */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Digite a URL da imagem:");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          isActive={false}
          title="Inserir imagem"
        >
          <Image className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => {
            const url = window.prompt("Digite a URL:");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          isActive={editor.isActive("link")}
          title="Adicionar link"
        >
          <Link className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Sobrescrito e Subscrito */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive("superscript")}
          title="Sobrescrito"
        >
          <Superscript className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive("subscript")}
          title="Subscrito"
        >
          <Subscript className="h-4 w-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}
