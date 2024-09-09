// import { create } from "xmlbuilder2";
// import {
// 	BreakPredicateFunction,
// 	ForEachFunction,
// 	IArrayLikeFiltering,
// 	IArrayLikeHelper,
// 	IArrayLikeMapping,
// 	MapFunction,
// 	PredicateFunction,
// 	ReduceFunction,
// 	SHOULD_BREAK,
// } from "../../IArrayFunctions";
// import { GraphNode, GraphEdge, GraphSymbol } from "./GraphTypes";
// import { TreeMap } from "../TreeMap";

// export class NestedGraph<TNode, TEdge>
// 	implements IArrayLikeFiltering<GraphNode<TNode, TEdge>, GraphSymbol>, IArrayLikeMapping<GraphNode<TNode, TEdge>, GraphSymbol>
// {
// 	private treeNodes: TreeMap<GraphSymbol, GraphNode<TNode, TEdge>>;

// 	constructor() {
// 		this.treeNodes = new TreeMap();
// 	}
// 	//#region Interface
// 	mapClone<t>(func: MapFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>): NestedGraph<TNode, TEdge> {
// 		return IArrayLikeHelper.MapClone(this, new NestedGraph<TNode, TEdge>(), func);
// 	}
// 	map<t>(func: MapFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>): t[] {
// 		return IArrayLikeHelper.Map(this, func);
// 	}

// 	reduce<t>(func: ReduceFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>, initialValue: t): t {
// 		return IArrayLikeHelper.Reduce(this, initialValue, func);
// 	}
// 	filter(predicate: PredicateFunction<GraphNode<TNode, TEdge>, GraphSymbol, this>): NestedGraph<TNode, TEdge> {
// 		return IArrayLikeHelper.FilterSet(this, new NestedGraph<TNode, TEdge>(), predicate);
// 	}

// 	forEach(func: ForEachFunction<GraphNode<TNode, TEdge>, GraphSymbol, this>): this {
// 		this.treeNodes.forEach((value, key) => func(value, key, this));
// 		return this;
// 	}
// 	forEachBreak(func: BreakPredicateFunction<GraphNode<TNode, TEdge>, GraphSymbol, this>): GraphSymbol {
// 		for (const [key, value] of this.treeNodes.entries()) {
// 			if (func(value, key, this) == SHOULD_BREAK.YES) return key;
// 		}
// 		return undefined;
// 	}
// 	get(index: GraphSymbol): GraphNode<TNode, TEdge> {
// 		return this.treeNodes.get(index);
// 	}
// 	set(index: GraphSymbol, value: GraphNode<TNode, TEdge>): this {
// 		const exists = this.treeNodes.get(index);

// 		if (value.id == undefined)
// 			throw new Error(`Node must have an id value! Got: ${value}`);

// 		this.treeNodes.set(index, {
// 			id: value.id,
// 			data: value.data,
// 			outgoing: (exists?.outgoing ?? []).concat(value.outgoing),
// 			incoming: (exists?.incoming ?? []).concat(value.incoming),
// 		});
// 		return this;
// 	}
// 	//#endregion

// 	addNode(id: GraphSymbol, data: TNode) {
// 		// if (!this.nodes.has(id)) {
// 		this.set(id, { id, data, outgoing: [], incoming: [] });
// 		// }
// 		return this;
// 	}

// 	addEdge(from: GraphSymbol, to: GraphSymbol, data: TEdge) {
// 		const fromNode = this.treeNodes.get(from);
// 		const toNode = this.treeNodes.get(to);
// 		if (fromNode === undefined || toNode === undefined) {
// 			throw new Error("Both nodes must exist in the network!");
// 		}

// 		fromNode.outgoing.some((edge) => edge.to === to);
// 		if (fromNode.outgoing.some((edge) => edge.to === to)) {
// 			return this; // Edge already exists
// 		}

// 		const newEdge: GraphEdge<TEdge> = { from, to, data };

// 		fromNode.outgoing.push(newEdge);
// 		toNode.incoming.push(newEdge);
// 		return this;
// 	}

// 	getEdge(from: GraphSymbol, to: GraphSymbol) {
// 		return this.get(from)?.outgoing.find((e) => e.to == to);
// 	}

// 	removeEdge(from: GraphSymbol, to: GraphSymbol) {
// 		const fromNode = this.treeNodes.get(from);
// 		const toNode = this.treeNodes.get(to);
// 		if (fromNode === undefined || toNode === undefined) {
// 			return this;
// 		}

// 		const indexOut = fromNode.outgoing.findIndex((edge) => edge.to === to);
// 		const indexIn = toNode.incoming.findIndex((edge) => edge.from === from);

// 		if (indexOut != -1) fromNode.outgoing.splice(indexOut, 1);
// 		if (indexIn != -1) toNode.incoming.splice(indexIn, 1);
// 		return this;
// 	}

// 	removeNode(id: GraphSymbol) {
// 		const node = this.treeNodes.get(id);

// 		node.outgoing.forEach((edge) => {
// 			this.removeEdge(edge.from, edge.to);
// 		});
// 		node.incoming.forEach((edge) => {
// 			this.removeEdge(edge.from, edge.to);
// 		});

// 		this.treeNodes.delete(id);
// 		return this;
// 	}

// 	getOutgoingNeighbors(id: GraphSymbol): GraphEdge<TEdge>[] | undefined {
// 		return this.treeNodes.get(id)?.outgoing;
// 	}

// 	getIncomingNeighbors(id: GraphSymbol): GraphEdge<TEdge>[] | undefined {
// 		return this.treeNodes.get(id)?.incoming;
// 	}

// 	printNetwork() {
// 		console.log(this.toString())
// 		return this;
// 	}

//     toString() {
// 		return Array.from(this.treeNodes.values())
// 			.map((self) => {
// 				return `${self.outgoing
// 					.map(
// 						(other) =>
// 							`${self.id.toString()} --> ${other.to.toString()};`
// 					)
// 					.join("\n")}`;
// 			})
// 			.join("\n");
// 	}

// 	serialize() {
// 		return {
// 			nodes: Array.from(this.treeNodes.entries()),
// 		};
// 	}

// 	// Deserialization
// 	static deserialize<TNode, TEdge>(obj: any): NestedGraph<TNode, TEdge> {
// 		const res = new NestedGraph<TNode, TEdge>();

// 		res.treeNodes = new Map(obj.nodes);

// 		return res;
// 	}

// 	exportToGraphML() {
// 		const doc = create({ version: "1.0", encoding: "UTF-8", standalone: false })
// 			.ele("graphml", {
// 				xmlns: "http://graphml.graphdrawing.org/xmlns",
// 				"xmlns:java": "http://www.yworks.com/xml/yfiles-common/1.0/java",
// 				"xmlns:sys": "http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0",
// 				"xmlns:x": "http://www.yworks.com/xml/yfiles-common/markup/2.0",
// 				"xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
// 				"xmlns:y": "http://www.yworks.com/xml/graphml",
// 				"xmlns:yed": "http://www.yworks.com/xml/yed/3",
// 				"xsi:schemaLocation":
// 					"http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd",
// 			})
// 			.ele("key", { id: "d0", for: "port", "yfiles.type": "portgraphics" })
// 			.up()
// 			.ele("key", { id: "d1", for: "port", "yfiles.type": "portgeometry" })
// 			.up()
// 			.ele("key", { id: "d2", for: "port", "yfiles.type": "portuserdata" })
// 			.up()
// 			.ele("key", { id: "d3", "attr.name": "url", "attr.type": "string", for: "node" })
// 			.up()
// 			.ele("key", { id: "d4", "attr.name": "description", "attr.type": "string", for: "node" })
// 			.up()
// 			.ele("key", { id: "d5", for: "node", "yfiles.type": "nodegraphics" })
// 			.up()
// 			.ele("key", { id: "d6", for: "graphml", "yfiles.type": "resources" })
// 			.up()
// 			.ele("key", { id: "d7", "attr.name": "url", "attr.type": "string", for: "edge" })
// 			.up()
// 			.ele("key", { id: "d8", "attr.name": "description", "attr.type": "string", for: "edge" })
// 			.up()
// 			.ele("key", { id: "d9", for: "edge", "yfiles.type": "edgegraphics" })
// 			.up()
// 			.ele("key", { id: "d10", "yfiles.type": "edgegraphics", for: "edge" })
// 			.up()
// 			.ele("graph", { id: "G", edgedefault: "directed" });

// 		function AppendEdge(edge: GraphEdge<TEdge>) {
// 			let data = edge.data ?? {};

// 			const edgeLabel: string = data["label"] ?? "";
// 			const fillColor: string = data["fillColor"] ?? "#000000";
// 			const borderColor: string = data["borderColor"] ?? "#000000";
// 			const type: string = data["type"] ?? "line";
// 			const width: number = data["width"] ?? 3;

// 			doc.ele("edge", { source: edge.from, target: edge.to }) // no up
// 				.ele("data", { key: "d10" }) // no up
// 				.ele("y:GenericEdge", { configuration: "com.yworks.edge.framed" })
// 				.ele("y:LineStyle", { color: borderColor, type: type, width: `${width}` })
// 				.up()
// 				.ele("y:Arrows", { source: "none", target: "standard" })
// 				.up()
// 				.ele("y:EdgeLabel", { alignment: "center", fontFamily: "Dialog", fontSize: "12", fontStyle: "plain" })
// 				.txt(edgeLabel)
// 				.up()
// 				.ele("y:StyleProperties")
// 				.ele("y:Property", { class: "java.awt.Color", name: "FramedEdgePainter.fillColor", value: fillColor });
// 		}

// 		// Add nodes
// 		this.treeNodes.forEach((node) => {
// 			let data = node.data ?? {};

// 			const label: string = data["label"] ?? "";
// 			const shape: string = data["shape"] ?? "rectangle"; // Default shape
// 			const alignment: string = data["alignment"] ?? "center"; // Default shape
// 			const fillColor: string = data["fillColor"] ?? "#CCCCFF"; // Default fill color
// 			const borderColor: string = data["borderColor"] ?? "#000000"; // Default border color
// 			const x: string = data["x"] ?? 0; // Default border color
// 			const y: string = data["y"] ?? 0; // Default border color

// 			const lines = label.split("\n");

// 			const nodeWidth = data["width"] ?? lines.reduce((a, b) => (a.length > b.length ? a : b)).length * 6 + 30;
// 			const nodeHeight = data["height"] ?? lines.length * 16 + 30;

// 			doc.ele("node", { id: node.id }) // no up
// 				.ele("data", { key: "d5" }) // no up
// 				.ele(`y:ShapeNode`) // no up
// 				.ele(`y:Geometry`, { height: `${nodeHeight}`, width: `${nodeWidth}`, x: `${x}`, y: `${y}` })
// 				.up()
// 				.ele("y:NodeLabel", {
// 					alignment: alignment,
// 					autoSizePolicy: "content",
// 					fontFamily: "Dialog",
// 					fontSize: "12",
// 					fontStyle: "plain",
// 				})
// 				.txt(label)
// 				.up()
// 				.ele(`y:Shape`, { type: shape })
// 				.up()
// 				.ele("y:Fill", { color: fillColor, transparent: "false" })
// 				.up()
// 				.ele("y:BorderStyle", { color: borderColor, type: "line", width: "1.0" });

// 			node.outgoing.forEach(AppendEdge);
// 		});

// 		doc.up().ele("data", { key: "d6" }).ele("y:Resources").up().up();

// 		return doc.end({ prettyPrint: true });
// 	}
// }
