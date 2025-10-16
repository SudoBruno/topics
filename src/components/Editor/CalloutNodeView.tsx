import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/core";
import { Button } from "@/components/ui/button";
import {
  Info,
  AlertTriangle,
  XCircle,
  CheckCircle,
  Lightbulb,
  X,
} from "lucide-react";

const calloutIcons = {
  info: Info,
  warning: AlertTriangle,
  error: XCircle,
  success: CheckCircle,
  tip: Lightbulb,
};

const calloutColors = {
  info: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-100",
  warning:
    "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-100",
  error:
    "bg-red-50 border-red-200 text-red-900 dark:bg-red-950 dark:border-red-800 dark:text-red-100",
  success:
    "bg-green-50 border-green-200 text-green-900 dark:bg-green-950 dark:border-green-800 dark:text-green-100",
  tip: "bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-950 dark:border-purple-800 dark:text-purple-100",
};

export function CalloutNodeView({ node, deleteNode }: NodeViewProps) {
  const type = node.attrs.type || "info";
  const Icon = calloutIcons[type as keyof typeof calloutIcons] || Info;
  const colorClass =
    calloutColors[type as keyof typeof calloutColors] || calloutColors.info;

  return (
    <NodeViewWrapper className="my-4">
      <div
        className={`callout ${colorClass} border rounded-lg p-4 relative group`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <NodeViewContent className="prose prose-sm max-w-none" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 flex-shrink-0"
            onClick={deleteNode}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
