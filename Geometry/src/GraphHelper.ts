import Graph from "./class/Graph";
import { HashVector } from "./class/Grid3D";
import Vector from "./class/Vector";

export namespace GraphHelper {
	export function GraphFromSegments(segments: [Vector, Vector][], error: number = 0.05) {
		const result: Graph<Vector, undefined> = new Graph<Vector, undefined>(true);

		const invError = 1 / error;

		segments.forEach((seg) => {
			const hash0 = HashVector(seg[0].scaled(invError).floor().scale(error));
			const hash1 = HashVector(seg[1].scaled(invError).floor().scale(error));

			result.addNode(hash0, 0, seg[0].clone().scale(100));
			result.addNode(hash1, 0, seg[1].clone().scale(100));

			result.addEdge(hash0, hash1, undefined);
			result.addEdge(hash1, hash0, undefined);
		});

		return result;
	}

	// export async function GraphToPolygons(graph: Graph) {
	// 	const graphLengths = Object.fromEntries(
	// 		Object.entries(graph).map((e) => {
	// 			return [e[0], e[1].connections.length];
	// 		})
	// 	);

	// 	function GetBestDirection(prev: GraphElement, current: GraphElement) {
	// 		const selfVector = prev.pos.minus(current.pos).unit();

	// 		let connections = current.connections;
	// 		if (connections.length == 1) return connections[0]; // Dead end

	// 		connections = connections.filter((e) => e != prev.key);
	// 		if (connections.length == 0) return null; //throw new Error(`Point with no connections! \nkey: ${current.key}\nconnections: ${current.connections}`);

	// 		const heuristic = connections.map((e) => {
	// 			return { 0: e, 1: GetAngle360XZ(selfVector, graph[e].pos.minus(current.pos).unit()) };
	// 		});
	// 		return heuristic.reduce((a, b) => (a[1] < b[1] ? a : b))[0];
	// 	}

	// 	async function TraversePolygonEdge(previous: GraphElement, current: GraphElement) {
	// 		const startingKey = current.key;

	// 		const polygon: string[] = [];

	// 		while (true) {
	// 			let nextPointKey = GetBestDirection(previous, current);

	// 			if (nextPointKey == null) break;

	// 			if (nextPointKey == previous.key && graphLengths[current.key] == 1) {
	// 				polygon.push(current.key);
	// 				// nextPointKey = previous.key;
	// 			}

	// 			let nextPoint = graph[nextPointKey];
	// 			polygon.push(current.key);
	// 			previous = current;
	// 			current = nextPoint;

	// 			if (current.key == startingKey) break;
	// 		}

	// 		return polygon;
	// 	}

	// 	const graphKeys = Object.keys(graph);
	// 	const resultPolygons: PolygonXZ[] = [];

	// 	let failedPolygonStartKeys: string[] = [];

	// 	while (true) {
	// 		let currentPoint =
	// 			graph[graphKeys.find((key) => graph[key].connections.length >= 1 && !failedPolygonStartKeys.includes(key))];

	// 		if (!currentPoint) break;

	// 		const startingPointVectors = currentPoint.connections.map((e) => graph[e].pos.minus(currentPoint.pos).unit());
	// 		let previousPoint =
	// 			graph[
	// 				startingPointVectors.length > 1
	// 					? CrossProductXZ(startingPointVectors[0], startingPointVectors[1]) > 0
	// 						? currentPoint.connections[0]
	// 						: currentPoint.connections[1]
	// 					: currentPoint.connections[0]
	// 			];

	// 		const result = await TraversePolygonEdge(previousPoint, currentPoint);

	// 		if (result.length > 0) {
	// 			const poly = new PolygonXZ(result.map((e) => graph[e].pos));
	// 			if (poly.GetArea() > 0) {
	// 				// const printGrid = new DynamicGrid3D<string>("  ");
	// 				// poly.DrawToGrid(printGrid, "██")
	// 				// printGrid.print(0);
	// 				resultPolygons.push(poly);
	// 			}
	// 			// Remove polygon path from graph
	// 			result.forEach((e, i, a) => graph[e].connections.splice(graph[e].connections.indexOf(a.getWrap(i + 1)), 1));
	// 		} else {
	// 			console.log("Failed polygon!");
	// 			failedPolygonStartKeys.push(currentPoint.key);
	// 		}
	// 	}

	// 	return resultPolygons;
	// }
}
