import { create } from "xmlbuilder2";

export namespace GraphNetwork {
	export type GraphEdge<T> = {
		from: GraphSymbol;
		to: GraphSymbol;
		data: T;
	};

	export type GraphNode<T> = {
		id: GraphSymbol;
		type: GraphSymbol;
		data: T;
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

	export type GraphSymbol = string | number | boolean;

	export class Graph<TNode, TEdge> {
		private nodes: Map<GraphSymbol, GraphNode<TNode>>;
		private outgoingEdges: Map<GraphSymbol, GraphEdge<TEdge>[]>;
		private incomingEdges: Map<GraphSymbol, GraphEdge<TEdge>[]>;
		private allowSameConnections: boolean;

		constructor(allowSameConnections: boolean = false) {
			this.nodes = new Map();
			this.outgoingEdges = new Map();
			this.incomingEdges = new Map();
			this.allowSameConnections = allowSameConnections;
		}

		addNode(id: GraphSymbol, type: GraphSymbol, data: TNode) {
			if (!this.nodes.has(id)) {
				this.nodes.set(id, { id, type, data });
				this.outgoingEdges.set(id, []);
				this.incomingEdges.set(id, []);
			}
			return this;
		}

		addEdge(from: GraphSymbol, to: GraphSymbol, data: TEdge) {
			if (!this.nodes.has(from) || !this.nodes.has(to)) {
				throw new Error("Both nodes must exist in the network!");
			}

			const fromNode = this.nodes.get(from)!;
			const toNode = this.nodes.get(to)!;

			if (!this.allowSameConnections && fromNode.type === toNode.type) {
				throw new Error("Nodes of the same type cannot be connected to each other!");
			}

			const outgoingEdges = this.outgoingEdges.get(from)!;
			if (outgoingEdges.some((edge) => edge.to === to && edge.data === data)) {
				return; // Edge already exists
			}

			const newEdge: GraphEdge<TEdge> = { from, to, data };
			outgoingEdges.push(newEdge);
			this.incomingEdges.get(to)!.push(newEdge);
			return this;
		}

		removeEdge(from: GraphSymbol, to: GraphSymbol) {
			if (this.outgoingEdges.has(from)) {
				this.outgoingEdges.set(
					from,
					this.outgoingEdges.get(from)!.filter((edge) => edge.to !== to)
				);
			}
			if (this.incomingEdges.has(to)) {
				this.incomingEdges.set(
					to,
					this.incomingEdges.get(to)!.filter((edge) => edge.from !== from)
				);
			}
			return this;
		}

		removeNode(id: GraphSymbol) {
			this.nodes.delete(id);
			this.outgoingEdges.delete(id);
			this.incomingEdges.delete(id);

			this.outgoingEdges.forEach((edges, nodeId) => {
				this.outgoingEdges.set(
					nodeId,
					edges.filter((edge) => edge.to !== id)
				);
			});

			this.incomingEdges.forEach((edges, nodeId) => {
				this.incomingEdges.set(
					nodeId,
					edges.filter((edge) => edge.from !== id)
				);
			});
			return this;
		}

		getNode(id: GraphSymbol): GraphNode<TNode> | undefined {
			return this.nodes.get(id);
		}

		getOutgoingNeighbors(id: GraphSymbol): GraphEdge<TEdge>[] | undefined {
			return this.outgoingEdges.get(id);
		}

		getIncomingNeighbors(id: GraphSymbol): GraphEdge<TEdge>[] | undefined {
			return this.incomingEdges.get(id);
		}

		printNetwork() {
			this.nodes.forEach((node, id) => {
				const outgoingEdges = this.outgoingEdges.get(id)!;
				const outgoingEdgesStr = outgoingEdges
					.map((edge) => `${edge.to} (data: ${edge.data.toString ? edge.data.toString() : edge.data})`)
					.join(", ");
				console.log(`${node.type} ${id} -> ${outgoingEdgesStr}`);

				const incomingEdges = this.incomingEdges.get(id)!;
				const incomingEdgesStr = incomingEdges
					.map((edge) => `${edge.from} (data: ${edge.data.toString ? edge.data.toString() : edge.data})`)
					.join(", ");
				console.log(`   <- ${incomingEdgesStr}`);
			});
			return this;
		}

		serialize() {
			return {
				nodes: Array.from(this.nodes.entries()),
				outgoingEdges: Array.from(this.outgoingEdges.entries()),
				incomingEdges: Array.from(this.incomingEdges.entries()),
				allowSameConnections: this.allowSameConnections,
			};
		}

		// Deserialization
		static deserialize<TNode, TEdge>(obj: any): Graph<TNode, TEdge> {
			const res = new Graph<TNode, TEdge>();

			res.nodes = new Map(obj.nodes);
			res.outgoingEdges = new Map(obj.outgoingEdges);
			res.incomingEdges = new Map(obj.incomingEdges);
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

			// Add nodes
			this.nodes.forEach((node, id) => {
				const label: string = node.data["label"] ?? "";
				const shape: string = node.data["shape"] ?? "rectangle"; // Default shape
				const fillColor: string = node.data["fillColor"] ?? "#FFCC00"; // Default fill color
				const borderColor: string = node.data["borderColor"] ?? "#000000"; // Default border color
				const x: string = node.data["x"] ?? 0; // Default border color
				const y: string = node.data["y"] ?? 0; // Default border color

				const lines = label.split("\n");

				const nodeWidth = node.data["width"] ?? lines.reduce((a, b) => (a.length > b.length ? a : b)).length * 6 + 30;
				const nodeHeight = node.data["height"] ?? lines.length * 16 + 30;

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
			});

			// Add edges
			this.outgoingEdges.forEach((edges, from) => {
				edges.forEach((edge) => {
					const edgeLabel: string = edge.data["label"] ?? "";
					const lineStyleColor: string = edge.data["lineStyleColor"] ?? "#000000"; // Default line style color

					doc.ele("edge", { source: edge.from, target: edge.to }) // no up
						.ele("data", { key: "d10" }) // no up
						.ele("y:GenericEdge", { configuration: "com.yworks.edge.framed" })
						.ele("y:LineStyle", { color: lineStyleColor, type: "line", width: "3.0" })
						.up()
						.ele("y:Arrows", { source: "none", target: "standard" })
						.up()
						.ele("y:EdgeLabel", { alignment: "center", fontFamily: "Dialog", fontSize: "12", fontStyle: "plain" })
						.txt(edgeLabel);
				});
			});

			doc.up().ele("data", { key: "d6" }).ele("y:Resources").up().up();

			return doc.end({ prettyPrint: true });
		}
	}
}
