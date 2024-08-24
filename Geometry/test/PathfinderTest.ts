import { writeFileSync } from "fs";
import { Benchmark, BenchmarkSilent } from "../src/class/benchmark/Benchmark";
import { Goals } from "../src/class/constraints/Goals";
import { Pathfinder } from "../src/class/constraints/Pathfinder";
import Grid from "../src/class/Grid3D";
import Vector from "../src/class/Vector";

export function TestPathfinderWFC() {
	console.log("Pathfinder WFC test started!");

	const tiles = [
		{
			value: "║ ",
			edges: ["#", " ", "#", " "],
		},
		{
			value: "══",
			edges: [" ", "#", " ", "#"],
		},
		{
			value: "╔═",
			edges: [" ", "#", "#", " "],
		},
		{
			value: "╗ ",
			edges: [" ", " ", "#", "#"],
		},
		{
			value: "╚═",
			edges: ["#", "#", " ", " "],
		},
		{
			value: "╝ ",
			edges: ["#", " ", " ", "#"],
		},
		{
			value: "╬═",
			edges: ["#", "#", "#", "#"],
		},
		{
			value: "  ",
			edges: [" ", " ", " ", " "],
		},
        // Slim =======================================
		{
			value: "│ ",
			edges: ["I", " ", "I", " "],
		},
		{
			value: "──",
			edges: [" ", "I", " ", "I"],
		},
		{
			value: "┌─",
			edges: [" ", "I", "I", " "],
		},
		{
			value: "┐ ",
			edges: [" ", " ", "I", "I"],
		},
		{
			value: "└─",
			edges: ["I", "I", " ", " "],
		},
		{
			value: "┘ ",
			edges: ["I", " ", " ", "I"],
		},
		{
			value: "┼─",
			edges: ["I", "I", "I", "I"],
		},
	];

    function Generate(goal: Goals.GoalWFC) {
		const path = Pathfinder.FindPath(goal); // 83.73 ms for 8x8 // 0.589 ms for 2x2 // 10.418 ms for 4x4

		const debugGrid = new Grid<string>("  ");

		debugGrid.setValues(
			new Vector(0, 0),
			goal.size.mapClone((e) => e - 1),
			"  "
		);

		debugGrid.forEach((_, p) => {
			const hash = new Vector(p.x, p.y).toString();
			const tile = goal.tiles[path.lastState.values[hash]];
			if (tile != undefined) debugGrid.set(p, tile.value);
		});

		debugGrid.alterGridPositions((e) => new Vector(e.x, 0, e.y)).print(0, false);
        
        writeFileSync("./TestPathfinder.graphml", path.graph.exportToGraphML())
	}


    Generate(new Goals.GoalWFC(new Vector(48, 48), tiles))

    // let csv = ""
	// for (let i = 0; i < 10; i++) {
	// 	csv += `${i * i},${BenchmarkSilent(100, Generate, new Goals.GoalWFC(new Vector(i, i), tiles))},${BenchmarkSilent(100, Generate, new Goals.GoalWFC(new Vector(i, i), tiles))},${BenchmarkSilent(100, Generate, new Goals.GoalWFC(new Vector(i, i), tiles))},${BenchmarkSilent(100, Generate, new Goals.GoalWFC(new Vector(i, i), tiles))}`;
    //     csv += "\n"
    //     console.log(csv)
    // }
    // console.log("FINAL")
    // console.log(csv)

}
