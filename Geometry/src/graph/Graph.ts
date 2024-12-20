import { create } from "xmlbuilder2";
import {
	IArrayLikeFiltering,
	IArrayLikeMapping,
	MapFunction,
	IArrayLikeHelper,
	ReduceFunction,
	PredicateFunction,
	ForEachFunction,
	BreakPredicateFunction,
	SHOULD_BREAK,
} from "../geometry";

export type GraphSymbol = string | number | symbol;

export type EdgeSymbol = number;

export type GraphEdge<T> = {
	id: EdgeSymbol;
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

export class Graph<TNode, TEdge>
	implements IArrayLikeFiltering<GraphNode<TNode, TEdge>, GraphSymbol>, IArrayLikeMapping<GraphNode<TNode, TEdge>, GraphSymbol>
{
	private nodes: Map<GraphSymbol, GraphNode<TNode, TEdge>>;

	constructor() {
		this.nodes = new Map();
	}

	values() {
		return this.nodes.values();
	}
	keys() {
		return this.nodes.keys();
	}
	//#region Interface
	mapClone<t>(func: MapFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>): Graph<TNode, TEdge> {
		return IArrayLikeHelper.MapClone(this, new Graph<TNode, TEdge>(), func);
	}
	map<t>(func: MapFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>): t[] {
		return IArrayLikeHelper.Map(this, func);
	}

	reduce<t>(func: ReduceFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>, initialValue: t): t {
		return IArrayLikeHelper.Reduce(this, initialValue, func);
	}
	filter(predicate: PredicateFunction<GraphNode<TNode, TEdge>, GraphSymbol, this>): Graph<TNode, TEdge> {
		return IArrayLikeHelper.FilterSet(this, new Graph<TNode, TEdge>(), predicate);
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

		if (value.id == undefined) throw new Error(`Node must have an id value! Got: ${value}`);

		const outgoingLength = exists?.outgoing.length ?? 0;
		const incomingLength = exists?.incoming.length ?? 0;

		if (outgoingLength > 0) value.outgoing.forEach((e) => (e.id += outgoingLength));
		if (incomingLength > 0) value.incoming.forEach((e) => (e.id += incomingLength));

		this.nodes.set(index, {
			id: value.id,
			data: value.data,
			outgoing: (exists?.outgoing ?? []).concat(value.outgoing),
			incoming: (exists?.incoming ?? []).concat(value.incoming),
		});
		return this;
	}
	//#endregion

	addNode(id: GraphSymbol, data: TNode) {
		// if (!this.nodes.has(id)) {
		this.set(id, { id, data, outgoing: [], incoming: [] });
		// }
		return this;
	}

	addEdge(from: GraphSymbol, to: GraphSymbol, data: TEdge) {
		const fromNode = this.nodes.get(from);
		const toNode = this.nodes.get(to);
		if (fromNode === undefined || toNode === undefined) {
			throw new Error(`Both nodes must exist in the network! ${from?.toString()} --> ${to?.toString()}`);
		}

		// if (fromNode.outgoing.some((edge) => edge.to === to)) {
		// 	return this; // Edge already exists
		// }
		const prevId = fromNode.outgoing[fromNode.outgoing.length - 1]?.id ?? -1;

		const newEdge: GraphEdge<TEdge> = { id: prevId + 1, from, to, data };

		fromNode.outgoing.push(newEdge);
		toNode.incoming.push(newEdge);
		return this;
	}

	getEdge(from: GraphSymbol, to: GraphSymbol) {
		return this.get(from)?.outgoing.find((e) => e.to === to);
	}

	getEdges(from: GraphSymbol, to: GraphSymbol) {
		return this.get(from)?.outgoing.filter((e) => e.to == to);
	}

	removeEdge(edge: GraphEdge<TEdge>): this;
	removeEdge(from: GraphSymbol, to: GraphSymbol): this;
	removeEdge(arg1: GraphSymbol | GraphEdge<TEdge>, arg2?: GraphSymbol): this {
		if (arg2 != undefined) {
			const from = arg1 as GraphSymbol;
			const to = arg2 as GraphSymbol;

			const fromNode = this.nodes.get(from);
			const toNode = this.nodes.get(to);

			if (!fromNode || !toNode) {
				console.warn(`One or both nodes are missing: from ${from.toString()}, to ${to.toString()}`);
				return this;
			}

			const indexOut = fromNode.outgoing.findIndex((e) => e.to === to);
			const indexIn = toNode.incoming.findIndex((e) => e.from === from);

			if (indexOut > -1) fromNode.outgoing.splice(indexOut, 1);
			else console.warn(`Outgoing edge from ${from.toString()} to ${to.toString()} not found.`);

			if (indexIn > -1) toNode.incoming.splice(indexIn, 1);
			else console.warn(`Incoming edge from ${from.toString()} to ${to.toString()} not found.`);
		} else if (arg1["from"] !== undefined && arg1["to"] !== undefined && arg1["id"] !== undefined) {
			const edge = arg1 as GraphEdge<TEdge>;
			const from = edge.from;
			const to = edge.to;

			const fromNode = this.nodes.get(from);
			const toNode = this.nodes.get(to);

			if (!fromNode || !toNode) {
				console.warn(`One or both nodes are missing: from ${from.toString()}, to ${to.toString()}`);
				return this;
			}

			const indexOut = fromNode.outgoing.findIndex((e) => e.to === to && e.id === edge.id);
			const indexIn = toNode.incoming.findIndex((e) => e.from === from && e.id === edge.id);

			if (indexOut > -1) fromNode.outgoing.splice(indexOut, 1);
			else console.warn(`Outgoing edge from ${from.toString()} to ${to.toString()} with id ${edge.id} not found.`);

			if (indexIn > -1) toNode.incoming.splice(indexIn, 1);
			else console.warn(`Incoming edge from ${from.toString()} to ${to.toString()} with id ${edge.id} not found.`);
		}
		return this;
	}

	removeNode(id: GraphSymbol) {
		const node = this.nodes.get(id);

		for (const edge of [...node.outgoing]) this.removeEdge(edge);
		for (const edge of [...node.incoming]) this.removeEdge(edge);

		this.nodes.delete(id);
		return this;
	}

	printNetwork() {
		console.log(this.toString());
		return this;
	}

	toString() {
		return Array.from(this.nodes.values())
			.map((self) => {
				return `${self.outgoing.map((other) => `${self.id.toString()} --> ${other.to.toString()};`).join("\n")}`;
			})
			.join("\n");
	}

	serialize() {
		return {
			nodes: Array.from(this.nodes.entries()),
		};
	}

	// Deserialization
	static deserialize<TNode, TEdge>(obj: any): Graph<TNode, TEdge> {
		const res = new Graph<TNode, TEdge>();

		res.nodes = new Map(obj.nodes);

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
			let data = edge.data ?? {};

			const edgeLabel: string = data["label"] ?? "";
			const fillColor: string = data["fillColor"] ?? "#000000";
			const borderColor: string = data["borderColor"] ?? "#000000";
			const type: string = data["type"] ?? "line";
			const width: number = data["width"] ?? 3;

			doc.ele("edge", { source: edge.from, target: edge.to }) // no up
				.ele("data", { key: "d10" }) // no up
				.ele("y:GenericEdge", { configuration: "com.yworks.edge.framed" })
				.ele("y:LineStyle", { color: borderColor, type: type, width: `${width}` })
				.up()
				.ele("y:Arrows", { source: "none", target: "standard" })
				.up()
				.ele("y:EdgeLabel", { alignment: "center", fontFamily: "Dialog", fontSize: "12", fontStyle: "plain" })
				.txt(edgeLabel)
				.up()
				.ele("y:StyleProperties")
				.ele("y:Property", { class: "java.awt.Color", name: "FramedEdgePainter.fillColor", value: fillColor });
		}

		// Add nodes
		this.nodes.forEach((node) => {
			let data = node.data ?? {};

			const label: string = data["label"] ?? "";
			const shape: string = data["shape"] ?? "rectangle"; // Default shape
			const alignment: string = data["alignment"] ?? "center"; // Default shape
			const fillColor: string = data["fillColor"] ?? "#CCCCFF"; // Default fill color
			const borderColor: string = data["borderColor"] ?? "#000000"; // Default border color
			const x: string = data["x"] ?? 0; // Default border color
			const y: string = data["y"] ?? 0; // Default border color

			const lines = label.split("\n");

			const nodeWidth = data["width"] ?? lines.reduce((a, b) => (a.length > b.length ? a : b)).length * 6 + 30;
			const nodeHeight = data["height"] ?? lines.length * 16 + 30;

			doc.ele("node", { id: node.id }) // no up
				.ele("data", { key: "d5" }) // no up
				.ele(`y:ShapeNode`) // no up
				.ele(`y:Geometry`, { height: `${nodeHeight}`, width: `${nodeWidth}`, x: `${x}`, y: `${y}` })
				.up()
				.ele("y:NodeLabel", {
					alignment: alignment,
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
