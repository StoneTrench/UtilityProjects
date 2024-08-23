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
	];

	const goal16 = new Goals.GoalWFC(new Vector(16, 16), tiles);
	const goal10 = new Goals.GoalWFC(new Vector(10, 10), tiles);
	const goal8 = new Goals.GoalWFC(new Vector(8, 8), tiles);
	const goal4 = new Goals.GoalWFC(new Vector(4, 4), tiles);
	const goal3 = new Goals.GoalWFC(new Vector(3, 3), tiles);
	const goal2 = new Goals.GoalWFC(new Vector(2, 2), tiles);
	const goal1 = new Goals.GoalWFC(new Vector(1, 1), tiles);

	function Generate(goal: Goals.GoalWFC) {
		const path = Pathfinder.FindPath(goal); // 83.73 ms for 8x8 // 0.589 ms for 2x2 // 10.418 ms for 4x4
		/*
0,0.02
1,0.13
4,0.87
9,1.31
16,2.51
25,4.6
36,12.1
49,32.24
64,53.33
81,73.51
100,53.57
121,127.6
144,129.75
169,242.4
196,396.13
225,491.52
0,0
1,0.04
4,0.54
9,1.2
16,2.41
25,4.7
36,8.48
49,14.64
64,23.83
81,87.49
100,88.65
121,117.72
144,182.42
169,292.68
196,464.96
225,540.48
        */

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
	}

	for (let i = 0; i < 16; i++) {
		console.log(`${i * i},${BenchmarkSilent(100, Generate, new Goals.GoalWFC(new Vector(i, i), tiles))}`);
	}
	for (let i = 0; i < 16; i++) {
		console.log(`${i * i},${BenchmarkSilent(100, Generate, new Goals.GoalWFC(new Vector(i, i), tiles))}`);
	}

	// console.log(`${1*1},${BenchmarkSilent(1000, Generate, goal1)},`);
	// console.log(`${2*2},${BenchmarkSilent(1000, Generate, goal2)},`);
	// console.log(`${3*3},${BenchmarkSilent(1000, Generate, goal3)},`);
	// console.log(`${4*4},${BenchmarkSilent(1000, Generate, goal4)},`);
	// console.log(`${8*8},${BenchmarkSilent(100, Generate, goal8)},`);
	// console.log(`${10*10},${BenchmarkSilent(100, Generate, goal10)},`);
	// console.log(`${16*16},${BenchmarkSilent(100, Generate, goal16)},`);
}
