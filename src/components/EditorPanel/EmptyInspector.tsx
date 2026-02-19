import { X } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";

interface EmptyInspectorProps {
	onClose: () => void;
}

export function EmptyInspector({ onClose }: Readonly<EmptyInspectorProps>) {
	return (
		<Card className="w-80 h-full border-l rounded-none border-border/50 bg-surface/95 backdrop-blur-sm shadow-none absolute right-0 top-0 pointer-events-auto flex flex-col">
			<CardHeader className="flex flex-row items-center justify-between border-b p-4 h-14">
				<span className="text-sm font-semibold">Inspector</span>
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0"
					onClick={onClose}
				>
					<X className="w-4 h-4" />
				</Button>
			</CardHeader>
			<CardContent className="pt-6 text-center text-text-muted text-sm">
				<p className="mt-8">Double-click a node to edit</p>
			</CardContent>
		</Card>
	);
}
