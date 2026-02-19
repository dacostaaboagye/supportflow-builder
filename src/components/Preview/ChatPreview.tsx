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
import { X, RefreshCcw, Bot, MessageCircle } from "lucide-react";
import type { FlowNode } from "../../types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChatMessage {
  id: string;
  sender: "bot" | "user" | "system";
  text: string;
  nodeLabel?: string;
}

// ---------------------------------------------------------------------------
// Sub-component: Typing Indicator
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Bot className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="bg-surface-muted rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-text-muted/60 rounded-full animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 bg-text-muted/60 rounded-full animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 bg-text-muted/60 rounded-full animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: Chat Bubble
// ---------------------------------------------------------------------------

function ChatBubble({ msg }: Readonly<{ msg: ChatMessage }>) {
  if (msg.sender === "system") {
    return (
      <div className="flex items-center gap-2 justify-center my-2 animate-in fade-in duration-500">
        <div className="h-px flex-1 bg-border/50" />
        <span className="text-[11px] text-text-muted font-medium px-2">
          {msg.text}
        </span>
        <div className="h-px flex-1 bg-border/50" />
      </div>
    );
  }

  if (msg.sender === "bot") {
    return (
      <div className="flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Bot className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="max-w-[80%]">
          {msg.nodeLabel && (
            <span className="text-[10px] text-text-muted font-medium ml-1 mb-0.5 block">
              {msg.nodeLabel}
            </span>
          )}
          <div className="bg-surface-muted text-text-main rounded-2xl rounded-bl-md px-4 py-2.5 text-sm leading-relaxed">
            {msg.text}
          </div>
        </div>
      </div>
    );
  }

  // User bubble
  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed">
        {msg.text}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ChatPreview() {
  const { nodes, setMode } = useFlowStore();
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [currentNode, setCurrentNode] = useState<FlowNode | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [flowEnded, setFlowEnded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  /** Find the next node connected from the given node (for message nodes). */
  const findNextNode = useCallback(
    (nodeId: string): FlowNode | null => {
      const { connections } = useFlowStore.getState();
      const conn = connections.find((c) => c.sourceId === nodeId);
      if (!conn) return null;
      return nodes.find((n) => n.id === conn.targetId) ?? null;
    },
    [nodes],
  );

  const addBotMessage = useCallback((node: FlowNode) => {
    setHistory((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "bot",
        text: node.data.content || "...",
        nodeLabel: node.data.label,
      },
    ]);
  }, []);

  const endConversation = useCallback(() => {
    setCurrentNode(null);
    setFlowEnded(true);
    setHistory((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        sender: "system",
        text: "Conversation ended",
      },
    ]);
  }, []);

  const processNode = useCallback(
    (node: FlowNode) => {
      setCurrentNode(node);
      setShowOptions(false);
      setIsTyping(true);

      // Simulate typing delay
      const typingDelay = Math.min(600 + node.data.content.length * 8, 1500);

      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(node);

        if (node.type === "message") {
          const next = findNextNode(node.id);
          if (next) {
            // Chain to next node
            setTimeout(() => processNode(next), 400);
          } else {
            // Dead end
            setTimeout(() => endConversation(), 300);
          }
        } else if (node.type === "choice") {
          // Show options with a small delay for a staggered feel
          setTimeout(() => setShowOptions(true), 200);
        }
      }, typingDelay);
    },
    [findNextNode, addBotMessage, endConversation],
  );

  // Find the root node — the first node with no incoming connections
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    if (nodes.length === 0) return;

    const { connections } = useFlowStore.getState();
    const targetIds = new Set(connections.map((c) => c.targetId));
    const rootNode = nodes.find((n) => !targetIds.has(n.id)) ?? nodes[0];
    processNode(rootNode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll on changes
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history, isTyping, showOptions]);

  const handleOptionClick = (optionLabel: string, optionId: string) => {
    setShowOptions(false);
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
        setTimeout(() => processNode(nextNode), 400);
      } else {
        // Target node doesn't exist
        setTimeout(() => {
          setHistory((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              sender: "system",
              text: "Path not configured",
            },
          ]);
          endConversation();
        }, 400);
      }
    } else {
      // No connection from this option — dead end
      setTimeout(() => {
        setHistory((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            sender: "system",
            text: "No path configured for this option",
          },
        ]);
        endConversation();
      }, 400);
    }
  };

  const handleRestart = () => {
    setHistory([]);
    setCurrentNode(null);
    setIsTyping(false);
    setShowOptions(false);
    setFlowEnded(false);
    initRef.current = false;
    setTimeout(() => {
      initRef.current = true;
      if (nodes.length === 0) return;
      const { connections } = useFlowStore.getState();
      const targetIds = new Set(connections.map((c) => c.targetId));
      const rootNode = nodes.find((n) => !targetIds.has(n.id)) ?? nodes[0];
      processNode(rootNode);
    }, 100);
  };

  return (
    <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="w-full max-w-md h-[600px] flex flex-col shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-border/50">
        {/* Header */}
        <CardHeader className="flex flex-row items-center justify-between p-4 py-3 bg-gradient-to-r from-primary/5 via-surface to-primary/5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">
                Chat Preview
              </CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    flowEnded
                      ? "bg-text-muted/40"
                      : "bg-emerald-500 animate-pulse",
                  )}
                />
                <span className="text-[10px] text-text-muted">
                  {flowEnded
                    ? "Ended"
                    : isTyping
                      ? "Typing..."
                      : currentNode
                        ? currentNode.data.label
                        : "Starting..."}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-primary/10"
              onClick={handleRestart}
              title="Restart flow"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg hover:bg-primary/10"
              onClick={() => setMode("editor")}
              title="Close preview"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-muted/20"
        >
          {history.map((msg) => (
            <ChatBubble key={msg.id} msg={msg} />
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Choice options */}
          {showOptions &&
            currentNode?.type === "choice" &&
            currentNode.data.options && (
              <div className="flex flex-wrap gap-2 justify-end pl-9">
                {currentNode.data.options.map((opt, i) => (
                  <Button
                    key={opt.id}
                    variant="secondary"
                    size="sm"
                    className={cn(
                      "rounded-full border border-primary/20 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-200",
                      "animate-in fade-in slide-in-from-bottom-1",
                    )}
                    style={{
                      animationDelay: `${i * 80}ms`,
                      animationFillMode: "backwards",
                    }}
                    onClick={() => handleOptionClick(opt.label, opt.id)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            )}

          {/* Restart prompt at end */}
          {flowEnded && (
            <div className="flex flex-col items-center gap-3 mt-4 animate-in fade-in duration-500">
              <Button
                variant="secondary"
                size="sm"
                className="rounded-full gap-1.5 text-xs border-primary/30 hover:bg-primary/10"
                onClick={handleRestart}
              >
                <RefreshCcw className="w-3 h-3" />
                Restart Conversation
              </Button>
            </div>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter className="px-4 py-2.5 border-t border-border/50 flex items-center justify-between bg-surface">
          <span className="text-[11px] text-text-muted">Preview Mode</span>
          <span className="text-[10px] text-text-muted/60">
            {history.filter((m) => m.sender !== "system").length} messages
          </span>
        </CardFooter>
      </Card>
    </div>
  );
}
