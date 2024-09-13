import { Grid } from "../src/grid/Grid";
import { Vector } from "../src/math/Vector";
import { Bezier } from "../src/rasterization/Bezier";
import { Bresenham } from "../src/rasterization/Bresenham";
import { SubdivisionRasterize } from "../src/rasterization/SubdivisionRasterize";

export function TestRasterizer() {
	console.log("Starting Rasterizer Test!");
	const grid = new Grid<string>(". ");

	const vectors = [
		"86.580643,85.516129",
		"87.822579,113.90322",

		"7.4516127,93.322581",
		"59.080645,81.435484",
		"110.70968,69.548387",

		"190.90322,63.693547",
		"120.64516,99.177418",
		"50.387096,134.66129",

		"-26.080645,160.74193",
		"26.258064,111.59677",
		"78.596772,62.451612",

		"119.40322,4.967742",
		"130.40323,55.532257",
		"141.40322,106.09677",

		"177.95161,87.290322",
		"133.41935,116.3871",
		"88.887095,145.48387",

		"96.870966,163.93548",
		"74.516127,144.59677",
		"52.161289,125.25806",

		"41.693549,147.6129",
		"47.903225,118.69355",
		"54.112903,89.774193",

		"48.258063,84.80645",
		"72.032256,79.129032",
		"95.806449,73.451613",

		"87.64516,48.612903",
		"110.53226,79.48387",
	].map((e) => {
		const values = e.split(",").map((m) => parseFloat(m));
		const vec = new Vector(values[0], 0, values[1]);
		console.log(`new Vector(${vec.x}, ${vec.y}, ${vec.z})`);
		return vec;
	});

	SubdivisionRasterize((t) => Bezier.Splines(vectors, t)).forEach((e) => {
		grid.set(e, "[]");
	});
	Bresenham.Line3D(new Vector(110, 0, 79), new Vector(86, 0, 85)).forEach((e) => {
		grid.set(e.offset(0, 1), "[]");
	});

	grid.printY(0, false);
	grid.printY(1, false);
}
