import { readFileSync, writeFileSync } from "fs";
import { LSystem } from "../src/constraints/LSystem";
import { Graph } from "../src/graph/Graph";
import { TNodeGraphML, TEdgeGraphML } from "../src/graph/GraphTypes";
import { MatrixMultiplyVector3x3, Create3DRotationMatrix3x3 } from "../src/math/SimpleMatrix";
import { Vector } from "../src/math/Vector";
import { MConst } from "../src/MathUtils";

export function TestLSystem() {
	console.log("Started LSystem Test");

	const rules = LSystem.ParseRules(readFileSync("./lsystemRules.txt", "utf-8"));
	const graph = new Graph<TNodeGraphML, TEdgeGraphML>();

	console.log(rules);

	for (let i = 0; i < 1; i++) {
		const graphID = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
		const str = LSystem.GenerateString("F+F+F+F", rules, 5);
		LSystem.ParseString(
			str,
			new Vector(0, 1, 0),
			(pos, dir, s, a) => {
				if (s == "F") {
					pos.add(dir);
				} else if (s == "r") {
					dir = MatrixMultiplyVector3x3(
						dir,
						Create3DRotationMatrix3x3(a[0] * MConst.rad1, a[1] * MConst.rad1, a[2] * MConst.rad1)
					);
				} else if (s == "+") {
					a = [0, 0, 90];
					dir = MatrixMultiplyVector3x3(
						dir,
						Create3DRotationMatrix3x3(a[0] * MConst.rad1, a[1] * MConst.rad1, a[2] * MConst.rad1)
					);
				} else if (s == "-") {
					a = [0, 0, -90];
					dir = MatrixMultiplyVector3x3(
						dir,
						Create3DRotationMatrix3x3(a[0] * MConst.rad1, a[1] * MConst.rad1, a[2] * MConst.rad1)
					);
				} else {
					return undefined;
				}

				return [pos, dir] as [Vector, Vector];
			},
			(a, b) => {
				const idA = `B->${a.toString()}_${graphID}`;
				const idB = `A->${b.toString()}_${graphID}`;
				graph.addNode(idA, {
					x: a.x * 100 + i * 3000,
					y: -a.y * 100,
					width: 0,
					height: 0,
				});
				graph.addNode(idB, {
					x: b.x * 100 + i * 3000,
					y: -b.y * 100,
					width: 0,
					height: 0,
				});
				graph.addEdge(idA, idB, {});
			}
		);
	}

	console.log("Writing LSystem");
	writeFileSync("./graphMLSystem.graphml", graph.exportToGraphML());
}
