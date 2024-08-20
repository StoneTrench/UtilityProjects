import { create } from "xmlbuilder2";
import {
	BreakPredicateFunction,
	ForEachFunction,
	IArrayLike,
	IArrayLikeFiltering,
	IArrayLikeHelper,
	IArrayLikeMapping,
	MapFunction,
	PredicateFunction,
	ReduceFunction,
	SHOULD_BREAK,
} from "../IArrayFunctions";

export type GraphEdge<T> = {
	from: GraphSymbol;
	to: GraphSymbol;
	data: T;
};

export type GraphNode<TNode, TEdge> = {
	id: GraphSymbol;
	type: GraphSymbol;
	data: TNode;
	incoming: GraphEdge<TEdge>[];
	outgoing: GraphEdge<TEdge>[];
};

export type TNodeGraphML = {
	label?: string;
	shape?: "rectangle" | "hexagon" | "ellipse" | "roundrectangle"; // Optional with default
	fillColor?: string; // Optional color
	borderColor?: string; // Optional border color
	x?: number;
	y?: number;
	width?: number;
	height?: number;
};
export type TEdgeGraphML = {
	label?: string;
	lineStyle?: {
		color?: string;
		type?: "line" | "dashed"; // Optional line type
		width?: number; // Optional width
	};
	arrows?: { source?: "none" | "standard"; target?: "none" | "standard" }; // Optional arrow styles
};

export type GraphSymbol = string | number | symbol;

export default class Graph<TNode, TEdge>
	implements IArrayLikeFiltering<GraphNode<TNode, TEdge>, GraphSymbol>, IArrayLikeMapping<GraphNode<TNode, TEdge>, GraphSymbol>
{
	private nodes: Map<GraphSymbol, GraphNode<TNode, TEdge>>;
	private allowSameConnections: boolean;

	constructor(allowSameConnections: boolean = false) {
		this.nodes = new Map();
		this.allowSameConnections = allowSameConnections;
	}
	//#region Interface
	mapClone<t>(func: MapFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>): Graph<TNode, TEdge> {
		return IArrayLikeHelper.MapClone(this, new Graph<TNode, TEdge>(this.allowSameConnections), func);
	}
	map<t>(func: MapFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>): t[] {
		return IArrayLikeHelper.Map(this, func);
	}

	reduce<t>(func: ReduceFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>, initialValue: t): t {
		return IArrayLikeHelper.Reduce(this, initialValue, func);
	}
	filter(predicate: PredicateFunction<GraphNode<TNode, TEdge>, GraphSymbol, this>): Graph<TNode, TEdge> {
		return IArrayLikeHelper.Filter(this, new Graph<TNode, TEdge>(this.allowSameConnections), predicate);
	}

	forEach(func: ForEachFunction<GraphNode<TNode, TEdge>, GraphSymbol, this>): this {
		this.nodes.forEach((value, key) => func(value, key, this));
		return this;
	}
	forEachBreak(func: BreakPredicateFunction<GraphNode<TNode, TEdge>, GraphSymbol, this>): GraphSymbol {
		for (const [key, value] of this.nodes.entries()) {
			if (func(value, key, this) == SHOULD_BREAK.YES) return key;
		}
		return undefined;
	}
	get(index: GraphSymbol): GraphNode<TNode, TEdge> {
		return this.nodes.get(index);
	}
	set(index: GraphSymbol, value: GraphNode<TNode, TEdge>): this {
		const exists = this.nodes.get(index);

		if (value.id == undefined || value.type == undefined) throw new Error(`Value must have id and type values! Got: ${value}`);

		this.nodes.set(index, {
			id: value.id,
			type: value.type,
			data: value.data,
			outgoing: (exists?.outgoing ?? []).concat(value.outgoing),
			incoming: (exists?.incoming ?? []).concat(value.incoming),
		});
		// value.outgoing.forEach((e) => {
		// 	this.addNode(e.to, 0, undefined);
		// 	this.addEdge(e.from, e.to, e.data);
		// });
		// value.incoming.forEach((e) => {
		// 	this.addNode(e.to, 0, undefined);
		// 	this.addEdge(e.from, e.to, e.data);
		// });
		return this;
	}
	//#endregion

	addNode(id: GraphSymbol, type: GraphSymbol, data: TNode) {
		if (!this.nodes.has(id)) {
			this.set(id, { id, type, data, outgoing: [], incoming: [] });
		}
		return this;
	}

	addEdge(from: GraphSymbol, to: GraphSymbol, data: TEdge) {
		const fromNode = this.nodes.get(from);
		const toNode = this.nodes.get(to);
		if (fromNode === undefined || toNode === undefined) {
			throw new Error("Both nodes must exist in the network!");
		}

		if (!this.allowSameConnections && fromNode.type === toNode.type) {
			throw new Error("Nodes of the same type cannot be connected to each other!");
		}

		fromNode.outgoing.some((edge) => edge.to === to);
		if (fromNode.outgoing.some((edge) => edge.to === to)) {
			return this; // Edge already exists
		}

		const newEdge: GraphEdge<TEdge> = { from, to, data };

		fromNode.outgoing.push(newEdge);
		toNode.incoming.push(newEdge);
		return this;
	}

	removeEdge(from: GraphSymbol, to: GraphSymbol) {
		const fromNode = this.nodes.get(from);
		const toNode = this.nodes.get(to);
		if (fromNode === undefined || toNode === undefined) {
			return this;
		}

		const indexOut = fromNode.outgoing.findIndex((edge) => edge.to === to);
		const indexIn = toNode.incoming.findIndex((edge) => edge.from === from);

		if (indexOut != -1) fromNode.outgoing.splice(indexOut, 1);
		if (indexIn != -1) toNode.incoming.splice(indexIn, 1);
		return this;

		// if (this.outgoingEdges.has(from)) {
		// 	this.outgoingEdges.set(
		// 		from,
		// 		this.outgoingEdges.get(from)!.filter((edge) => edge.to !== to)
		// 	);
		// }
		// if (this.incomingEdges.has(to)) {
		// 	this.incomingEdges.set(
		// 		to,
		// 		this.incomingEdges.get(to)!.filter((edge) => edge.from !== from)
		// 	);
		// // }
		// return this;
	}

	removeNode(id: GraphSymbol) {
		const node = this.nodes.get(id);

		node.outgoing.forEach((edge) => {
			this.removeEdge(edge.from, edge.to);
		});
		node.incoming.forEach((edge) => {
			this.removeEdge(edge.from, edge.to);
		});

		this.nodes.delete(id);
		return this;
	}

	getOutgoingNeighbors(id: GraphSymbol): GraphEdge<TEdge>[] | undefined {
		return this.nodes.get(id)?.outgoing;
	}

	getIncomingNeighbors(id: GraphSymbol): GraphEdge<TEdge>[] | undefined {
		return this.nodes.get(id)?.incoming;
	}

	printNetwork() {
		this.nodes.forEach((node, id) => {
			const outgoingEdgesStr = node.outgoing
				.map((edge) => `${edge.to.toString()} (data: ${edge.data.toString ? edge.data.toString() : edge.data})`)
				.join(", ");
			console.log(`${node.type.toString()} ${id.toString()} -> ${outgoingEdgesStr}`);

			const incomingEdgesStr = node.incoming
				.map((edge) => `${edge.from.toString()} (data: ${edge.data.toString ? edge.data.toString() : edge.data})`)
				.join(", ");
			console.log(`   <- ${incomingEdgesStr}`);
		});
		return this;
	}

	serialize() {
		return {
			nodes: Array.from(this.nodes.entries()),
			allowSameConnections: this.allowSameConnections,
		};
	}

	// Deserialization
	static deserialize<TNode, TEdge>(obj: any): Graph<TNode, TEdge> {
		const res = new Graph<TNode, TEdge>();

		res.nodes = new Map(obj.nodes);
		res.allowSameConnections = obj.allowSameConnections;

		return res;
	}

	exportToGraphML() {
		const doc = create({ version: "1.0", encoding: "UTF-8", standalone: false })
			.ele("graphml", {
				xmlns: "http://graphml.graphdrawing.org/xmlns",
				"xmlns:java": "http://www.yworks.com/xml/yfiles-common/1.0/java",
				"xmlns:sys": "http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0",
				"xmlns:x": "http://www.yworks.com/xml/yfiles-common/markup/2.0",
				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
				"xmlns:y": "http://www.yworks.com/xml/graphml",
				"xmlns:yed": "http://www.yworks.com/xml/yed/3",
				"xsi:schemaLocation":
					"http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd",
			})
			.ele("key", { id: "d0", for: "port", "yfiles.type": "portgraphics" })
			.up()
			.ele("key", { id: "d1", for: "port", "yfiles.type": "portgeometry" })
			.up()
			.ele("key", { id: "d2", for: "port", "yfiles.type": "portuserdata" })
			.up()
			.ele("key", { id: "d3", "attr.name": "url", "attr.type": "string", for: "node" })
			.up()
			.ele("key", { id: "d4", "attr.name": "description", "attr.type": "string", for: "node" })
			.up()
			.ele("key", { id: "d5", for: "node", "yfiles.type": "nodegraphics" })
			.up()
			.ele("key", { id: "d6", for: "graphml", "yfiles.type": "resources" })
			.up()
			.ele("key", { id: "d7", "attr.name": "url", "attr.type": "string", for: "edge" })
			.up()
			.ele("key", { id: "d8", "attr.name": "description", "attr.type": "string", for: "edge" })
			.up()
			.ele("key", { id: "d9", for: "edge", "yfiles.type": "edgegraphics" })
			.up()
			.ele("key", { id: "d10", "yfiles.type": "edgegraphics", for: "edge" })
			.up()
			.ele("graph", { id: "G", edgedefault: "directed" });

		function AppendEdge(edge: GraphEdge<TEdge>) {
			const data = edge.data ?? {};

			const edgeLabel: string = data["label"] ?? "";
			const lineStyleColor: string = data["lineStyleColor"] ?? "#000000"; // Default line style color

			doc.ele("edge", { source: edge.from, target: edge.to }) // no up
				.ele("data", { key: "d10" }) // no up
				.ele("y:GenericEdge", { configuration: "com.yworks.edge.framed" })
				.ele("y:LineStyle", { color: lineStyleColor, type: "line", width: "3.0" })
				.up()
				.ele("y:Arrows", { source: "none", target: "standard" })
				.up()
				.ele("y:EdgeLabel", { alignment: "center", fontFamily: "Dialog", fontSize: "12", fontStyle: "plain" })
				.txt(edgeLabel);
		}

		// Add nodes
		this.nodes.forEach((node, id) => {
			const data = node.data ?? {};

			const label: string = data["label"] ?? "";
			const shape: string = data["shape"] ?? "rectangle"; // Default shape
			const fillColor: string = data["fillColor"] ?? "#FFCC00"; // Default fill color
			const borderColor: string = data["borderColor"] ?? "#000000"; // Default border color
			const x: string = data["x"] ?? 0; // Default border color
			const y: string = data["y"] ?? 0; // Default border color

			const lines = label.split("\n");

			const nodeWidth = data["width"] ?? lines.reduce((a, b) => (a.length > b.length ? a : b)).length * 6 + 30;
			const nodeHeight = data["height"] ?? lines.length * 16 + 30;

			doc.ele("node", { id: node.id }) // no up
				.ele("data", { key: "d4" })
				.txt(node.type.toString())
				.up()
				.ele("data", { key: "d5" }) // no up
				.ele(`y:ShapeNode`) // no up
				.ele(`y:Geometry`, { height: `${nodeHeight}`, width: `${nodeWidth}`, x: `${x}`, y: `${y}` })
				.up()
				.ele("y:NodeLabel", {
					alignment: "center",
					autoSizePolicy: "content",
					fontFamily: "Dialog",
					fontSize: "12",
					fontStyle: "plain",
				})
				.txt(label)
				.up()
				.ele(`y:Shape`, { type: shape })
				.up()
				.ele("y:Fill", { color: fillColor, transparent: "false" })
				.up()
				.ele("y:BorderStyle", { color: borderColor, type: "line", width: "1.0" });

			node.outgoing.forEach(AppendEdge);
		});

		doc.up().ele("data", { key: "d6" }).ele("y:Resources").up().up();

		return doc.end({ prettyPrint: true });
	}
}
