import { useState, useEffect } from "react";

const EXPANDED_NODES_KEY = "topics-expanded-nodes";

export function useExpandedNodes() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Carregar estado salvo do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(EXPANDED_NODES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setExpandedNodes(new Set(parsed));
      }
    } catch (error) {
      console.error("Erro ao carregar nós expandidos:", error);
    }
  }, []);

  // Salvar estado no localStorage quando mudar
  useEffect(() => {
    try {
      localStorage.setItem(
        EXPANDED_NODES_KEY,
        JSON.stringify([...expandedNodes])
      );
    } catch (error) {
      console.error("Erro ao salvar nós expandidos:", error);
    }
  }, [expandedNodes]);

  const toggleExpand = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const expandAll = (nodeIds: string[]) => {
    setExpandedNodes(new Set(nodeIds));
  };

  const collapseAll = () => {
    setExpandedNodes(new Set());
  };

  return {
    expandedNodes,
    toggleExpand,
    expandAll,
    collapseAll,
  };
}
