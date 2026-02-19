export interface ChatMessage {
	id: string;
	sender: "bot" | "user" | "system";
	text: string;
	nodeLabel?: string;
}
