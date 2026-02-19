import { MessageCircle, RefreshCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useFlowStore } from "../../stores/flowStore";
import type { FlowNode } from "../../types";
import { Button } from "../ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "../ui/card";
import { ChatBubble } from "./ChatBubble";
import type { ChatMessage } from "./chatPreviewTypes";
import {
	findNextMessageNode,
	findRootNode,
	getTypingDelay,
} from "./chatPreviewUtils";
import { TypingIndicator } from "./TypingIndicator";

export function ChatPreview() {
	const { nodes, setMode } = useFlowStore();
	const [history, setHistory] = useState<ChatMessage[]>([]);
	const [currentNode, setCurrentNode] = useState<FlowNode | null>(null);
	const [isTyping, setIsTyping] = useState(false);
	const [showOptions, setShowOptions] = useState(false);
	const [flowEnded, setFlowEnded] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const initRef = useRef(false);

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

			const typingDelay = getTypingDelay(node.data.content);

			setTimeout(() => {
				setIsTyping(false);
				addBotMessage(node);

				if (node.type === "message") {
					const { connections } = useFlowStore.getState();
					const next = findNextMessageNode(node.id, nodes, connections);
					if (next) {
						setTimeout(() => processNode(next), 400);
					} else {
						setTimeout(() => endConversation(), 300);
					}
				} else if (node.type === "choice") {
					setTimeout(() => setShowOptions(true), 200);
				}
			}, typingDelay);
		},
		[addBotMessage, endConversation, nodes],
	);

	const startFlow = useCallback(() => {
		if (nodes.length === 0) return;
		const { connections } = useFlowStore.getState();
		const rootNode = findRootNode(nodes, connections);
		if (rootNode) {
			processNode(rootNode);
		}
	}, [nodes, processNode]);

	useEffect(() => {
		if (initRef.current) return;
		initRef.current = true;
		startFlow();
	}, [startFlow]);

	useEffect(() => {
		scrollRef.current?.scrollTo({
			top: scrollRef.current.scrollHeight,
			behavior: "smooth",
		});
	});

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
			startFlow();
		}, 100);
	};

	return (
		<div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center p-4">
			<Card className="w-full max-w-md h-[600px] flex flex-col shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 border-border/50">
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

				<CardContent
					ref={scrollRef}
					className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface-muted/20"
				>
					{history.map((msg) => (
						<ChatBubble key={msg.id} msg={msg} />
					))}

					{isTyping && <TypingIndicator />}

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
