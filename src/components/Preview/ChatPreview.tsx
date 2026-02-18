import { useState, useEffect, useRef, useCallback } from "react";
import { useFlowStore } from "../../stores/flowStore";
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
import type { FlowNode } from "../../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ChatPreview() {
  const { nodes, setMode } = useFlowStore();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentNode, setCurrentNode] = useState<FlowNode | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const processNode = useCallback((node: FlowNode) => {
    setCurrentNode(node);
    setHistory((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "bot",
        text: node.data.content || "...",
      },
    ]);
  }, []);

  // Initialise with the first node
  useEffect(() => {
    if (nodes.length > 0) processNode(nodes[0]);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history]);

  const handleOptionClick = (optionLabel: string, optionId: string) => {
    setHistory((prev) => [
      ...prev,
      { id: crypto.randomUUID(), sender: "user", text: optionLabel },
    ]);

    const { connections } = useFlowStore.getState();
    const connection = connections.find(
      (c) => c.sourceId === currentNode?.id && c.sourceHandle === optionId,
    );

    const nextNodeId = connection?.targetId;
    if (nextNodeId) {
      const nextNode = nodes.find((n) => n.id === nextNodeId);
      if (nextNode) {
        setTimeout(() => processNode(nextNode), 500);
      } else {
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
                  ? "bg-surface border border-border text-text-main self-start rounded-tl-none"
                  : "bg-primary text-primary-foreground self-end ml-auto rounded-tr-none",
              )}
            >
              {msg.text}
            </div>
          ))}

          {/* Options */}
          {currentNode?.type === "choice" && currentNode.data.options && (
            <div className="flex flex-wrap gap-2 mt-4 justify-end">
              {currentNode.data.options.map((opt) => (
                <Button
                  key={opt.id}
                  variant="secondary"
                  size="sm"
                  className="rounded-full animate-in fade-in duration-500"
                  onClick={() => handleOptionClick(opt.label, opt.id)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          )}

          {/* End of conversation */}
          {!currentNode && history.length > 0 && (
            <div className="text-center text-xs text-text-muted mt-8">
              — Conversation Ended —
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
