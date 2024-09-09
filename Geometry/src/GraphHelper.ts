import { HashVector } from "./class/Grid3D";
import {Polygon} from "./class/Polygon";
import { Graph } from "./class/graph/Graph";
import { GraphSymbol } from "./class/graph/GraphTypes";
import { Vector } from "./class/math/Vector";

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
}
