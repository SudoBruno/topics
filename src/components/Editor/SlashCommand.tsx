import { useState, useEffect, useRef } from "react";
import { Editor } from "@tiptap/react";
import { Button } from "@/components/ui/button";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Code,
  Minus,
  Table,
  Image,
  Type,
} from "lucide-react";

interface SlashCommandProps {
  editor: Editor;
  onClose: () => void;
}

interface Command {
  title: string;
  description: string;
  icon: React.ReactNode;
  command: () => void;
}

export function SlashCommand({ editor, onClose }: SlashCommandProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: Command[] = [
    {
      title: "Texto",
      description: "Começar a escrever texto simples",
      icon: <Type className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().setParagraph().run();
        onClose();
      },
    },
    {
      title: "Título 1",
      description: "Cabeçalho grande",
      icon: <Heading1 className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().toggleHeading({ level: 1 }).run();
        onClose();
      },
    },
    {
      title: "Título 2",
      description: "Cabeçalho médio",
      icon: <Heading2 className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().toggleHeading({ level: 2 }).run();
        onClose();
      },
    },
    {
      title: "Título 3",
      description: "Cabeçalho pequeno",
      icon: <Heading3 className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().toggleHeading({ level: 3 }).run();
        onClose();
      },
    },
    {
      title: "Lista com marcadores",
      description: "Criar uma lista com marcadores",
      icon: <List className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().toggleBulletList().run();
        onClose();
      },
    },
    {
      title: "Lista numerada",
      description: "Criar uma lista numerada",
      icon: <ListOrdered className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().toggleOrderedList().run();
        onClose();
      },
    },
    {
      title: "Lista de tarefas",
      description: "Criar uma lista de tarefas",
      icon: <CheckSquare className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().toggleTaskList().run();
        onClose();
      },
    },
    {
      title: "Citação",
      description: "Criar uma citação",
      icon: <Quote className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().toggleBlockquote().run();
        onClose();
      },
    },
    {
      title: "Código",
      description: "Criar um bloco de código",
      icon: <Code className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().toggleCodeBlock().run();
        onClose();
      },
    },
    {
      title: "Linha divisória",
      description: "Adicionar uma linha horizontal",
      icon: <Minus className="h-4 w-4" />,
      command: () => {
        editor.chain().focus().setHorizontalRule().run();
        onClose();
      },
    },
    {
      title: "Tabela",
      description: "Inserir uma tabela",
      icon: <Table className="h-4 w-4" />,
      command: () => {
        editor
          .chain()
          .focus()
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
        onClose();
      },
    },
    {
      title: "Imagem",
      description: "Inserir uma imagem",
      icon: <Image className="h-4 w-4" />,
      command: () => {
        // Disparar evento para abrir o dialog de upload
        const event = new CustomEvent("openImageUpload");
        window.dispatchEvent(event);
        onClose();
      },
    },
  ];

  const filteredCommands = commands;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredCommands.length - 1 ? prev + 1 : 0
        );
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredCommands.length - 1
        );
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].command();
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, filteredCommands, onClose]);

  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (filteredCommands.length === 0) {
    return null;
  }

  return (
    <div className="absolute z-50 w-80 bg-card border border-border rounded-lg shadow-lg p-2">
      <div className="text-xs text-muted-foreground px-2 py-1 mb-1">
        Comandos disponíveis
      </div>
      <div ref={listRef} className="max-h-64 overflow-y-auto">
        {filteredCommands.map((command, index) => (
          <Button
            key={command.title}
            variant={index === selectedIndex ? "default" : "ghost"}
            className="w-full justify-start gap-3 h-auto p-3 text-left"
            onClick={command.command}
          >
            <div className="flex-shrink-0">{command.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{command.title}</div>
              <div className="text-xs text-muted-foreground truncate">
                {command.description}
              </div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
