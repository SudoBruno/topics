import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, X, Plus, Check } from "lucide-react";
import { animations } from "@/lib/animations";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
  placeholder?: string;
  maxTags?: number;
}

export function TagInput({
  tags,
  onTagsChange,
  availableTags,
  placeholder = "Adicionar tag...",
  maxTags = 10,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filtrar tags disponíveis baseado no input
  const filteredTags = availableTags.filter(
    (tag) =>
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(tag)
  );

  const allSuggestions = [
    ...filteredTags,
    ...(inputValue.trim() && !availableTags.includes(inputValue)
      ? [inputValue]
      : []),
  ];

  const handleAddTag = (tag: string) => {
    if (tag.trim() && !tags.includes(tag.trim()) && tags.length < maxTags) {
      onTagsChange([...tags, tag.trim()]);
      setInputValue("");
      setShowSuggestions(false);
      setSelectedIndex(-1);
      inputRef.current?.focus();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
        handleAddTag(allSuggestions[selectedIndex]);
      } else if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < allSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev > 0 ? prev - 1 : allSuggestions.length - 1
      );
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setShowSuggestions(value.length > 0);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (inputValue.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Fechar sugestões quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Tags existentes */}
      {tags.length > 0 && (
        <motion.div
          className="flex flex-wrap gap-2"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={animations.smooth}
        >
          <AnimatePresence>
            {tags.map((tag) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={animations.quick}
              >
                <Badge variant="secondary" className="pr-1">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Input com sugestões */}
      <div className="relative">
        <Input
          ref={inputRef}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          className="w-full"
        />

        {/* Lista de sugestões */}
        <AnimatePresence>
          {showSuggestions && allSuggestions.length > 0 && (
            <motion.div
              className="absolute top-full left-0 right-0 z-50 mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={animations.quick}
            >
              {allSuggestions.map((tag, index) => {
                const isExisting = availableTags.includes(tag);
                const isSelected = index === selectedIndex;

                return (
                  <motion.div
                    key={tag}
                    className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-border last:border-b-0 ${
                      isSelected ? "bg-accent" : "hover:bg-accent/50"
                    }`}
                    onClick={() => handleAddTag(tag)}
                    whileHover={{ backgroundColor: "hsl(0 0% 10%)" }}
                    transition={animations.quick}
                  >
                    <div className="flex items-center gap-2">
                      {isExisting ? (
                        <Tag className="h-3 w-3" />
                      ) : (
                        <Plus className="h-3 w-3" />
                      )}
                      <span className={isExisting ? "" : "text-primary"}>
                        {isExisting ? tag : `Criar "${tag}"`}
                      </span>
                    </div>
                    {isExisting && <Check className="h-3 w-3 opacity-50" />}
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contador de tags */}
      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {tags.length}/{maxTags} tags
        </p>
      )}
    </div>
  );
}
