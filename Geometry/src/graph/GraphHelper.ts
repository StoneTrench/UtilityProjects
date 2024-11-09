import { Vector, HashVector, Polygon } from "../geometry";
import { Graph, GraphSymbol, GraphEdge, GraphNode } from "./Graph";


export namespace GraphHelper {
	export function GraphFromSegments(segments: [Vector, Vector][], error: number = 0.05) {
		const result: Graph<Vector, any> = new Graph<Vector, any>();

		const invError = 1 / error;

		segments.forEach((seg) => {
			const hash0 = HashVector(seg[0].scaled(invError).floor().scale(error));
			const hash1 = HashVector(seg[1].scaled(invError).floor().scale(error));

			result.addNode(hash0, seg[0].clone());
			result.addNode(hash1, seg[1].clone());

			result.addEdge(hash0, hash1, undefined);
			result.addEdge(hash1, hash0, undefined);
		});

		return result;
	}
	export function GraphToPolygons(graph: Graph<Vector, any>) {
		const nodeConnectionCount = graph.reduce((res, e) => {
			res[e.id] = e.outgoing.length;
			return res;
		}, {} as { [id: GraphSymbol]: number });

		const polygons: Polygon[] = [];

		while (true) {
			const nodeKeys = Object.keys(nodeConnectionCount);
			const startNodeId = nodeKeys.find((e) => nodeConnectionCount[e] > 0) as GraphSymbol;

			if (startNodeId == undefined) break;

			let previousId = startNodeId;
			let previousNodeInfo = graph.get(previousId);

			let currentId = previousNodeInfo.outgoing[0].to;
			let currentNodeInfo = graph.get(currentId);

			const points: Vector[] = [];

			while (true) {
				graph.removeEdge(previousNodeInfo.id, currentNodeInfo.id);
				nodeConnectionCount[previousNodeInfo.id]--;

				points.push(currentNodeInfo.data.clone());

				if (currentId == startNodeId) break;
				const currentVector = previousNodeInfo.data.minus(currentNodeInfo.data);

				const directions = currentNodeInfo.outgoing
					.map<[GraphSymbol, number]>((e) => [
						e.to,
						currentVector.getAngle2D(graph.get(e.to).data.minus(currentNodeInfo.data)),
					])
					.filter((e) => e[0] !== previousId);

				const bestDirection =
					directions.length == 0
						? previousId
						: directions.length == 1
						? directions[0][0]
						: directions.reduce((a, b) => (a[1] < b[1] ? a : b))[0];

				previousId = currentId;
				previousNodeInfo = currentNodeInfo;

				currentId = bestDirection;
				currentNodeInfo = graph.get(bestDirection);
			}

			const poly = new Polygon(points);
			if (poly.getArea() > 0) polygons.push(poly);
		}

		return polygons;
	}
	export function FlipEdge(graph: Graph<any, any>, edge: GraphEdge<any>) {
		graph.removeEdge(edge);
		graph.addEdge(edge.to, edge.from, edge.data);
	}

	export function GetNeighbors<t1, t2>(node: GraphNode<t1, t2>) {
		return node.incoming
			.map((e) => e.from)
			.concat(node.outgoing.map((e) => e.to))
			.filter((e, i, a) => a.indexOf(e) === i);
	}
	export function GetNeighborsAndEdges<t1, t2>(node: GraphNode<t1, t2>) {
		return node.incoming
			.map<[t2, GraphSymbol]>((e) => [e.data, e.from])
			.concat(node.outgoing.map<[t2, GraphSymbol]>((e) => [e.data, e.to]))
	}
	export function GetAllEdges<t1, t2>(node: GraphNode<t1, t2>) {
		return node.incoming.concat(node.outgoing);
	}
	export function CalculateShortestEdgeDistance(graph: Graph<any, any>, initial: GraphSymbol): Map<GraphSymbol, number> {
		const distances = new Map<GraphSymbol, number>();
		const queue: GraphSymbol[] = [initial];

		// Initialize all nodes with a distance of Infinity, except for the initial node
		for (const node of graph.keys()) {
			distances.set(node, Infinity);
		}
		distances.set(initial, 0); // Distance to the initial node is 0

		// Perform a breadth-first search (BFS)
		while (queue.length > 0) {
			const current = queue.shift()!;
			const currentDistance = distances.get(current)!;

			const currentNode = graph.get(current);
			if (!currentNode) continue; // If the node doesn't exist, skip

			// Check all outgoing edges
			for (const neighbor of GetNeighbors(currentNode)) {
				// If a shorter path is found, update the distance and add to queue
				if (distances.get(neighbor)! > currentDistance + 1) {
					distances.set(neighbor, currentDistance + 1);
					queue.push(neighbor);
				}
			}
		}

		return distances;
	}
}
