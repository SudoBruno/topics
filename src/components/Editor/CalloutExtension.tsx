import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CalloutNodeView } from "./CalloutNodeView";

export interface CalloutOptions {
  types: string[];
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes: { type: string }) => ReturnType;
      toggleCallout: (attributes: { type: string }) => ReturnType;
    };
  }
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  addOptions() {
    return {
      types: ["info", "warning", "error", "success", "tip"],
      HTMLAttributes: {},
    };
  },

  group: "block",

  content: "block+",

  addAttributes() {
    return {
      type: {
        default: "info",
        rendered: false,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `div[data-type="callout"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(
        { "data-type": "callout" },
        this.options.HTMLAttributes,
        HTMLAttributes,
        {
          class: `callout callout-${node.attrs.type}`,
        }
      ),
      0,
    ];
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes);
        },
      toggleCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes);
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutNodeView);
  },
});
