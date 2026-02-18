import React, { useState, useEffect, useRef } from "react";
import { useFlowStore, type Node } from "../../stores/flowStore";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { X, RefreshCcw } from "lucide-react";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export function ChatPreview() {
  const { nodes, setMode } = useFlowStore();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentNode, setCurrentNode] = useState<Node | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    // Find root node (assuming first node or specific root)
    // In our data, rootId was in JSON but we loaded flatten nodes.
    // We can assume the first node is root, or find one with no incoming connections (not fully reliable if loops).
    // For now, let's pick the first node in the list as Start.
    if (nodes.length > 0) {
      processNode(nodes[0]);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const processNode = (node: Node) => {
    setCurrentNode(node);

    // Add bot message
    setHistory((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "bot",
        text: node.data.content || "...",
      },
    ]);

    // If it's a statement node (no options but maybe a direct link?), we might auto-proceed?
    // Current logic: Options drive navigation. If no options, it's a leaf node or dead end.
  };

  const handleOptionClick = (optionLabel: string, nextId?: string) => {
    // Add user message
    setHistory((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "user",
        text: optionLabel,
      },
    ]);

    if (nextId) {
      const nextNode = nodes.find((n) => n.id === nextId);
      if (nextNode) {
        setTimeout(() => processNode(nextNode), 500); // Small delay for realism
      } else {
        // End of flow or broken link
        setCurrentNode(null);
      }
    } else {
      setCurrentNode(null);
    }
  };

  const handleRestart = () => {
    setHistory([]);
    if (nodes.length > 0) processNode(nodes[0]);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between border-b p-4">
          <CardTitle className="text-lg">Bot Preview</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRestart}
              title="Restart"
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMode("editor")}
              title="Close"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-muted/30"
        >
          {history.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "max-w-[80%] rounded-lg p-3 text-sm animate-in slide-in-from-bottom-2 duration-300",
                msg.sender === "bot"
                  ? "bg-white border border-border text-text-main self-start rounded-tl-none"
                  : "bg-primary text-primary-foreground self-end ml-auto rounded-tr-none",
              )}
            >
              {msg.text}
            </div>
          ))}

          {/* Options Area */}
          {currentNode &&
            currentNode.type === "choice" &&
            currentNode.data.options && (
              <div className="flex flex-wrap gap-2 mt-4 justify-end">
                {currentNode.data.options.map((opt) => (
                  <Button
                    key={opt.id}
                    variant="secondary"
                    size="sm"
                    className="rounded-full animate-in fade-in duration-500"
                    onClick={() => handleOptionClick(opt.label, opt.nextId)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            )}

          {/* End of Conversation */}
          {!currentNode && history.length > 0 && (
            <div className="text-center text-xs text-text-muted mt-8">
              - Conversation Ended -
            </div>
          )}
        </CardContent>

        <CardFooter className="p-2 border-t text-center text-xs text-text-muted bg-surface">
          Preview Mode
        </CardFooter>
      </Card>
    </div>
  );
}
