export type GraphSymbol = string | number | symbol;

export type GraphEdge<T> = {
	from: GraphSymbol;
	to: GraphSymbol;
	data: T;
};

export type GraphNode<TNode, TEdge> = {
	id: GraphSymbol;
	data: TNode;
	incoming: GraphEdge<TEdge>[];
	outgoing: GraphEdge<TEdge>[];
};

export type TNodeGraphML = {
	label?: string;
	shape?: "rectangle" | "hexagon" | "ellipse" | "roundrectangle"; // Optional with default
	alignment?: "center" | "left" | "right";
	fillColor?: string; // Optional color
	borderColor?: string; // Optional border color
	x?: number;
	y?: number;
	width?: number;
	height?: number;
};
export type TEdgeGraphML = {
	label?: string;
	fillColor?: string;
	borderColor?: string;
	type?: "line" | "dashed";
	width?: number;
	arrows?: { source?: "none" | "standard"; target?: "none" | "standard" }; // Optional arrow styles
};