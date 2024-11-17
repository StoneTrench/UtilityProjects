import { Vector } from "../math/Vector";
import { Grid } from "./Grid";

export namespace GridHelper {
	/**
	 * Full ASCII gradient used for rendering, providing a range of characters from light to dark.
	 */
	export const ASCII_GRADIENT_FULL =
		` .-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@` as const;
	/**
	 * A shorter ASCII gradient with 10 characters, useful for simpler rendering.
	 */
	export const ASCII_GRADIENT_SHORT10 = ` .:-=+*#%@` as const;

	/**
	 * Performs a flood fill from a starting point with a given value, replacing connected matching values.
	 * @param {Vector} startingPoint - The point to start the flood fill from.
	 * @param {T} value - The value to fill with.
	 * @param {readonly Vector[]} neighborLookupTable - The lookup table defining neighbor positions.
	 * @returns {Grid<T>} - Returns the updated grid.
	 */
	export function FloodFill<T>(grid: Grid<T>, startingPoint: Vector, value: T, neighborLookupTable: readonly Vector[]) {
		const parentValue = grid.get(startingPoint);
		if (parentValue == value) return grid;

		let points: Vector[] = [startingPoint];
		while (points.length > 0) {
			const current = points.pop();
			if (current == undefined) break;
			grid.set(current, value);

			points.push(
				...neighborLookupTable
					.map((e) => current.plus(e))
					.filter((e) => grid.isInside(e))
					.filter((e) => grid.get(e) == parentValue)
			);
		}

		return grid;
	}

	/**
	 * Calculates the sum of neighboring values around a given position.
	 * @param {Vector} pos - The position to get neighbors around.
	 * @param {readonly Vector[]} neighborLookupTable - The lookup table defining neighbor positions.
	 * @returns {number} - The sum of the neighboring values.
	 */
	export function GetNeighborsSum(grid: Grid<number>, pos: Vector, neighborLookupTable: readonly Vector[]): number {
		return neighborLookupTable.reduce((res, e) => res + grid.get(pos.plus(e)), 0);
	}

	/**
	 * Calculates the mean of neighboring values around a given position.
	 * @param {Vector} pos - The position to get neighbors around.
	 * @param {readonly Vector[]} neighborLookupTable - The lookup table defining neighbor positions.
	 * @returns {number} - The mean of the neighboring values.
	 */
	export function GetNeighborsMean(grid: Grid<number>, pos: Vector, neighborLookupTable: readonly Vector[]): number {
		return GetNeighborsSum(grid, pos, neighborLookupTable) / neighborLookupTable.length;
	}

	/**
	 * Calculates the gradient at a given position based on neighboring values.
	 * @param {Vector} pos - The position to calculate the gradient at.
	 * @param {number} [delta=1] - The step size for gradient calculation.
	 * @returns {Vector} - The gradient vector at the given position.
	 */
	export function GetGradient(grid: Grid<number>, pos: Vector, delta: number = 1) {
		return new Vector(
			(grid.get(pos.offset(delta, 0, 0)) - grid.get(pos)) / delta,
			(grid.get(pos.offset(0, delta, 0)) - grid.get(pos)) / delta,
			(grid.get(pos.offset(0, 0, delta)) - grid.get(pos)) / delta
		);
	}

	/**
	 * Calculates the normal vectors for each position in the grid based on neighboring values.
	 * @param {readonly Vector[]} neighborLookupTable - The lookup table defining neighbor positions.
	 * @returns {Grid<Vector>} - A new grid with normal vectors for each position.
	 */
	export function GetNormals(grid: Grid<number>, neighborLookupTable: readonly Vector[]) {
		return grid.mapClone((v, p, g) =>
			v != 0
				? grid
						.getNeighbors(p, neighborLookupTable)
						.map<[number, number]>((e, i) => [e, i])
						.filter((e) => e[0] != 0)
						.reduce((res, val) => res.add(neighborLookupTable[val[1]]), new Vector(0, 0, 0))
						.unit()
				: new Vector(0, 0, 0)
		);
	}

	/**
	 * Rotates the grid 90 degrees counter-clockwise around the Y-axis.
	 * @returns {Grid<T>} - Returns the updated grid after rotation.
	 */
	export function RotateCCW_YAxis<T>(grid: Grid<T>) {
		return grid.alterGridPositions((p) => new Vector(p.z, p.y, -p.x));
	}

	/**
	 * Rotates the grid 90 degrees clockwise around the Y-axis.
	 * @returns {Grid<T>} - Returns the updated grid after rotation.
	 */
	export function RotateCW_YAxis<T>(grid: Grid<T>) {
		return grid.alterGridPositions((p) => new Vector(-p.z, p.y, p.x));
	}

	/**
	 * Rotates the grid 180 degrees around the Y-axis.
	 * @returns {Grid<T>} - Returns the updated grid after rotation.
	 */
	export function Rotate180_YAxis<T>(grid: Grid<T>) {
		return grid.alterGridPositions((p) => new Vector(-p.x, p.y, -p.z));
	}

	/**
	 * Flips the grid along the X-axis.
	 * @returns {Grid<T>} - Returns the updated grid after flipping.
	 */
	export function FlipX_YAxis<T>(grid: Grid<T>) {
		const size = grid.getSize().offset(-1, -1, -1);
		return grid.alterGridPositions((p) => new Vector(size.x - p.x, p.y, p.z));
	}

	/**
	 * Flips the grid along the Z-axis.
	 * @returns {Grid<T>} - Returns the updated grid after flipping.
	 */
	export function FlipZ_YAxis<T>(grid: Grid<T>) {
		const size = grid.getSize().offset(-1, -1, -1);
		return grid.alterGridPositions((p) => new Vector(p.x, p.y, size.z - p.z));
	}

	/**
	 * Flips the grid along the Y-axis.
	 * @returns {Grid<T>} - Returns the updated grid after flipping.
	 */
	export function FlipY_ZAxis<T>(grid: Grid<T>) {
		const size = grid.getSize().offset(-1, -1, -1);
		return grid.alterGridPositions((p) => new Vector(p.x, size.y - p.y, p.z));
	}

	/**
	 * Gets the values along a specified side with optional trimming.
	 * @param {Vector} side - The side to get values from.
	 * @param {number} [trim=0] - The amount to trim from the edges.
	 * @returns {T[]} - An array of values along the specified side.
	 */
	export function GetSideValues<T>(grid: Grid<T>, side: Vector, trim: number = 0): T[] {
		const tmax = grid.getMax();
		const tmin = grid.getMin();

		const mask = side.abs();
		const offset = side.plus(mask).scale(0.5).multiply(tmax.minus(tmin));
		mask.scale(-1).translate(1, 1, 1);
		const min = tmin.multiply(mask).add(offset);
		const max = tmax.multiply(mask).add(offset);
		// Trim
		mask.scale(trim);
		min.add(mask);
		max.subtract(mask);

		const result: T[] = [];
		grid.forVolume(min, max, (e) => result.push(e));
		return result;
	}

	/**
	 * Prints a graph representation of values.
	 * @param {number[]} values - The values to print in the graph.
	 * @returns {string} - The printed graph as a string.
	 */
	export function PrintGraph(values: number[]) {
		const graph = new Grid<string>(" .");

		const min = Math.min(...values);
		const max = Math.max(...values);
		const spread = max - min;

		const sampleCount = 100;
		const scale = 100;
		const roundTo = 4;

		const stepSize = Math.floor(values.length / sampleCount);
		for (let i = 0; i < values.length; i += stepSize) {
			const dist = values[i];
			const value = (dist - min) / spread;
			const xPos = i / stepSize;

			const zPos = Math.round(value * scale);

			graph.set(new Vector(xPos, 0, zPos), "██");
			const axisIndex = `${i}`.padEnd(3).padStart(5);

			for (let a = 0; a < axisIndex.length; a++) {
				graph.set(new Vector(xPos, 0, -a - 1), axisIndex[a].padStart(2, " "));
			}
		}

		const roundingFactor = Math.pow(10, roundTo);
		const textSize = roundTo + 5;
		for (let i = 0; i <= scale; i++) {
			const value = Math.floor((min + (spread * i) / scale) * roundingFactor) / roundingFactor;
			const axisIndex = `${value}`;
			const text = axisIndex.padEnd(textSize);
			const textReverse = text.length - 1;

			for (let a = 0; a < text.length; a++) {
				graph.set(new Vector(-a - 1, 0, i), text[textReverse - a].padStart(2, " "));
			}
		}
		return graph.printY(0, true);
	}

	/**
	 * Iterates over subgrids of the specified size, applying a callback to each subgrid.
	 * @param size - The size of the subgrid.
	 * @param callback - A function to apply to each subgrid.
	 * @returns The grid instance.
	 */
	export function ForEachSubGrid<T>(
		grid: Grid<T>,
		size: Vector,
		callback: (values: T[], sub_pos: Vector, poss: Vector[], original: Grid<T>) => void
	) {
		size = size.rounded();
		const newSize = grid.getSize().divide(size).ceil();
		const small_min = grid.getMin().divide(size).floor();

		for (let x = 0; x <= newSize.x; x++) {
			for (let y = 0; y <= newSize.y; y++) {
				for (let z = 0; z <= newSize.z; z++) {
					const small_pos = small_min.offset(x, y, z);
					const scaled_pos = small_pos.clone().multiply(size);

					const values: T[] = [];
					const poss: Vector[] = [];
					for (let iy = 0; iy < size.y; iy++) {
						for (let iz = 0; iz < size.z; iz++) {
							for (let ix = 0; ix < size.x; ix++) {
								const self_pos = scaled_pos.offset(ix, iy, iz);
								values.push(grid.get(self_pos)!);
								poss.push(self_pos);
							}
						}
					}
					callback(values, small_pos, poss, grid);
				}
			}
		}
		return grid;
	}
}
