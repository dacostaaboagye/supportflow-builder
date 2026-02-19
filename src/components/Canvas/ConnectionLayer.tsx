import { useCallback, useEffect, useId, useState } from "react";
import { useFlowStore } from "../../stores/flowStore";
import { ConnectionPath } from "./ConnectionPath";
import { ACTIVE_COLOR, CONNECTOR_COLOR } from "./connectionLayerUtils";
import { PendingConnectionPath } from "./PendingConnectionPath";

export function ConnectionLayer() {
	const { connections, nodes, ui, deleteConnection, setSelectedConnection } =
		useFlowStore();
	const [ready, setReady] = useState(false);
	const markerPrefix = useId();
	const markerId = `${markerPrefix}-arrowhead`;
	const markerActiveId = `${markerPrefix}-arrowhead-active`;
	const { selectedConnectionId } = ui;

	useEffect(() => {
		let cancelled = false;
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				if (!cancelled) setReady(true);
			});
		});
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		if (!selectedConnectionId) return;

		const onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Delete" || e.key === "Backspace") {
				e.preventDefault();
				deleteConnection(selectedConnectionId);
				setSelectedConnection(null);
			}
			if (e.key === "Escape") {
				setSelectedConnection(null);
			}
		};

		globalThis.addEventListener("keydown", onKeyDown);
		return () => globalThis.removeEventListener("keydown", onKeyDown);
	}, [selectedConnectionId, deleteConnection, setSelectedConnection]);

	const handleSelect = useCallback(
		(id: string) => {
			setSelectedConnection(selectedConnectionId === id ? null : id);
		},
		[selectedConnectionId, setSelectedConnection],
	);

	const handleDelete = useCallback(
		(id: string) => {
			deleteConnection(id);
			setSelectedConnection(null);
		},
		[deleteConnection, setSelectedConnection],
	);

	const handleSvgPointerDown = useCallback(() => {
		setSelectedConnection(null);
	}, [setSelectedConnection]);

	return (
		<svg
			className="absolute inset-0 pointer-events-none w-full h-full overflow-visible z-0"
			onPointerDown={handleSvgPointerDown}
		>
			<title>Connection layer</title>
			<defs>
				<marker
					id={markerId}
					viewBox="0 0 8 6"
					markerWidth="8"
					markerHeight="6"
					refX="8"
					refY="3"
					orient="auto"
					markerUnits="strokeWidth"
				>
					<path d="M 0 0 L 8 3 L 0 6 L 2 3 Z" fill={CONNECTOR_COLOR} />
				</marker>
				<marker
					id={markerActiveId}
					viewBox="0 0 8 6"
					markerWidth="8"
					markerHeight="6"
					refX="8"
					refY="3"
					orient="auto"
					markerUnits="strokeWidth"
				>
					<path d="M 0 0 L 8 3 L 0 6 L 2 3 Z" fill={ACTIVE_COLOR} />
				</marker>
			</defs>

			{ready &&
				connections.map((connection) => (
					<ConnectionPath
						key={connection.id}
						connection={connection}
						nodes={nodes}
						isSelected={selectedConnectionId === connection.id}
						defaultMarkerId={markerId}
						activeMarkerId={markerActiveId}
						onSelect={handleSelect}
						onDelete={handleDelete}
					/>
				))}

			{ready && ui.connectionPending && (
				<PendingConnectionPath
					pending={ui.connectionPending}
					nodes={nodes}
					activeMarkerId={markerActiveId}
				/>
			)}
		</svg>
	);
}
