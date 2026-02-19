import { Bot } from "lucide-react";
import type { ChatMessage } from "./chatPreviewTypes";

interface ChatBubbleProps {
	msg: ChatMessage;
}

export function ChatBubble({ msg }: Readonly<ChatBubbleProps>) {
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

	return (
		<div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
			<div className="max-w-[80%] bg-primary text-primary-foreground rounded-2xl rounded-br-md px-4 py-2.5 text-sm leading-relaxed">
				{msg.text}
			</div>
		</div>
	);
}
