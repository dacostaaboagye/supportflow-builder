import { Bot } from "lucide-react";

export function TypingIndicator() {
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
