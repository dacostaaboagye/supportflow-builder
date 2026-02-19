interface CanvasControlsProps {
	zoom: number;
	onZoomIn: () => void;
	onZoomOut: () => void;
	onRun: () => void;
}

export function CanvasControls({
	zoom,
	onZoomIn,
	onZoomOut,
	onRun,
}: Readonly<CanvasControlsProps>) {
	return (
		<div className="absolute bottom-4 left-4 glass-panel p-1.5 rounded-xl shadow-float flex gap-1 items-center">
			<button
				type="button"
				className="w-8 h-8 flex items-center justify-center hover:bg-surface-muted rounded-lg text-text-muted hover:text-text-main transition-smooth font-medium"
				onClick={onZoomOut}
			>
				-
			</button>
			<span className="text-xs font-mono text-text-muted flex items-center min-w-[4ch] justify-center tabular-nums">
				{Math.round(zoom * 100)}%
			</span>
			<button
				type="button"
				className="w-8 h-8 flex items-center justify-center hover:bg-surface-muted rounded-lg text-text-muted hover:text-text-main transition-smooth font-medium"
				onClick={onZoomIn}
			>
				+
			</button>

			<div className="w-px h-5 bg-border mx-0.5" />

			<button
				type="button"
				className="px-3 h-8 bg-primary text-primary-foreground hover:bg-primary-hover rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-smooth"
				onClick={onRun}
			>
				<span className="text-[10px]">{">"}</span> Run
			</button>
		</div>
	);
}
