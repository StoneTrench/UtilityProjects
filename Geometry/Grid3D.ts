import { IArrayLikeSearch, IArrayLikeDelete, SHOULD_BREAK, IArrayLikeHelper, IArrayLikeMapping } from "./IArrayFunctions";
import { WrapVector } from "./MathUtils";
import Vector, { Axies } from "./Vector";

/**
 * Generates a unique hash string for a given 3D vector.
 * The hash is based on the vector's x, y, and z components.
 *
 * @param vec - The vector to hash.
 * @returns A string representing the hash of the vector.
 */
export function HashVector(vec: Vector): string {
	const n = 46340;
	return `${vec.x + vec.y * n + vec.z * n * n}`;
}

/**
 * An array of vectors representing neighbors in the Y axis plane.
 */
export const neighboursCheckY: readonly Vector[] = [
	new Vector(0, 0, 1),
	new Vector(1, 0, 1),
	new Vector(1, 0, 0),
	new Vector(1, 0, -1),
	new Vector(0, 0, -1),
	new Vector(-1, 0, -1),
	new Vector(-1, 0, 0),
	new Vector(-1, 0, 1),
] as const;

/**
 * An array of vectors representing axis-aligned neighbors in the Y axis plane.
 */
export const neighboursCheckAxisY: readonly Vector[] = [
	new Vector(0, 0, 1),
	new Vector(1, 0, 0),
	new Vector(0, 0, -1),
	new Vector(-1, 0, 0),
] as const;

/**
 * An array of vectors representing 3D neighbors for a given point.
 */
export const neighboursCheck3D: readonly Vector[] = [
	// List of vectors representing all possible neighbors in 3D space.
	new Vector(-1, -1, 0),
	new Vector(-1, 0, 0),
	new Vector(-1, 1, 0),
	new Vector(-1, 1, -1),
	new Vector(-1, 1, 1),
	new Vector(-1, -1, 1),
	new Vector(0, -1, 1),
	new Vector(1, -1, 1),
	new Vector(1, -1, -1),
	new Vector(1, -1, 0),
	new Vector(-1, -1, -1),
	new Vector(0, -1, -1),
	new Vector(1, 0, -1),
	new Vector(1, 1, -1),
	new Vector(0, 0, -1),
	new Vector(0, 1, -1),
	new Vector(0, 1, 0),
	new Vector(0, 1, 1),
	new Vector(-1, 0, 1),
	new Vector(0, 0, 1),
	new Vector(1, 0, 1),
	new Vector(1, 0, 0),
	new Vector(1, 1, 0),
	new Vector(1, 1, 1),
];

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
 * A dynamic 3D grid class that allows for flexible storage and manipulation of elements in a 3D space.
 *
 * @template T - The type of elements stored in the grid.
 */
export default class Grid<T>
	implements
		IArrayLikeMapping<T | undefined, Vector>,
		IArrayLikeSearch<T | undefined, Vector>,
		IArrayLikeDelete<T | undefined, Vector>
{
	private grid: { [vechash: string]: T };
	private min: Vector;
	private max: Vector;
	private firstElement: boolean;
	private defaultElement: T | undefined;
	private doesWrap: boolean;
	private cloningFunction?: (value: T) => T;

	/**
	 * Clones a value if a cloning function is provided, otherwise returns the value as is.
	 *
	 * @param value - The value to clone.
	 * @returns The cloned value or the original value if no cloning function is defined.
	 */
	cloneValue(value?: T): T | undefined {
		if (value === undefined) return undefined;
		return this.cloningFunction ? this.cloningFunction(value) : value;
	}

	//#region Create
	/**
	 * Creates an instance of DynamicGrid3D with a specified default element.
	 *
	 * @param defaultElement - The default element used for uninitialized grid points.
	 */
	constructor(defaultElement?: T) {
		this.min = new Vector(0, 0, 0);
		this.max = new Vector(0, 0, 0);
		this.firstElement = true;
		this.defaultElement = defaultElement;
		this.grid = {};
		this.doesWrap = false;
		this.cloningFunction = undefined;
	}

	/**
	 * Creates a DynamicGrid3D from a 2D matrix, mapping values to a 3D grid.
	 *
	 * @template T - The type of elements in the grid.
	 * @param values - The 2D matrix of values.
	 * @param defaultValue - The default value for uninitialized grid points.
	 * @returns A new DynamicGrid3D instance with the mapped values.
	 */
	static fromMatrix<T>(values: T[][], defaultValue?: T): Grid<T> {
		return new Grid<T>(defaultValue).forVolume(
			new Vector(0, 0, 0),
			new Vector(values.length - 1, 0, values[0].length - 1),
			(v, p, g) => g.set(p, values[p.x][p.z])
		);
	}

	/**
	 * Creates a DynamicGrid3D from an array of strings, mapping each character to a 3D grid.
	 *
	 * @param values - The array of strings.
	 * @param defaultValue - The default value for uninitialized grid points.
	 * @returns A new DynamicGrid3D instance with the mapped values.
	 */
	static fromStringArray(values: string[], defaultValue?: string): Grid<string> {
		return new Grid<string>(defaultValue).forVolume(
			new Vector(0, 0, 0),
			new Vector(values[0].length - 1, 0, values.length - 1),
			(v, p, g) => g.set(p, values[p.z][p.x])
		);
	}

	/**
	 * Generates a list of neighboring vectors based on the specified axes and size.
	 *
	 * @param axies - The axes to consider for neighbor generation.
	 * @param size - The size or distance to the neighbors.
	 * @param axisAligned - Whether the neighbors should be axis-aligned.
	 * @returns An array of vectors representing neighboring positions.
	 */
	static GenerateNeighboursMap(axies: Axies[], size: number = 1, axisAligned: boolean = false): Vector[] {
		const neighborVectors: Vector[] = [];

		if (axisAligned) {
			for (let j = -size; j <= size; j++) {
				if (j == 0) continue;
				for (const axis of axies) {
					const vec = new Vector(0, 0, 0);
					vec[axis] = j;
					neighborVectors.push(vec.clone());
				}
			}
		} else {
			const vec = new Vector(0, 0, 0);
			for (let i = -size; i <= size; i++) {
				for (const axisi of axies) {
					vec[axisi] = i;
					for (const axisj of axies) {
						if (axisi == axisj) continue;
						for (let j = -size; j <= size; j++) {
							vec[axisj] = j;
							if (!vec.isZero() && !neighborVectors.some((a) => a.equals(vec))) neighborVectors.push(vec.clone());
						}
					}
				}
			}
		}

		return neighborVectors;
	}
	//#endregion

	//#region Get and Settings

	/**
	 * Sets whether the grid should wrap around the edges when accessing values outside the bounds.
	 *
	 * @param value - Whether to enable wrapping.
	 * @returns The instance of the grid with updated wrapping behavior.
	 */
	setWrapping(value: boolean): this {
		this.doesWrap = value;
		return this;
	}

	/**
	 * Sets the cloning function for the grid, ensuring it's defined only once.
	 * @param func - A function that clones a value of type T.
	 * @returns The grid instance.
	 */
	setValueCloningFunction(func: (value: T) => T) {
		if (this.cloningFunction) throw new Error("You've already defined a cloning function for this grid!");
		this.cloningFunction = func;
		return this;
	}

	/**
	 * Returns an array of all the values in the grid.
	 * @returns An array of values stored in the grid.
	 */
	getValues() {
		return Object.values(this.grid);
	}

	/**
	 * Gets the size of the grid based on its bounds.
	 * @returns A vector representing the grid's size.
	 */
	getSize() {
		return this.firstElement ? new Vector(0, 0, 0) : this.max.minus(this.min).offset(1, 1, 1);
	}

	/**
	 * Retrieves the minimum bound of the grid.
	 * @returns A clone of the vector representing the minimum bound.
	 */
	getMin() {
		return this.min.clone();
	}

	/**
	 * Retrieves the maximum bound of the grid.
	 * @returns A clone of the vector representing the maximum bound.
	 */
	getMax() {
		return this.max.clone();
	}
	//#endregion

	//#region ForEach

	/**
	 * Gets the value at the specified position.
	 * If wrapping is enabled and the position is outside the bounds, the position is wrapped.
	 * @param {Vector} pos - The position to get the value from.
	 * @returns {T} - Returns the value at the position, or the default element if undefined.
	 */
	get(pos: Vector) {
		if (this.doesWrap && !this.isInside(pos)) pos = WrapVector(pos, this.min, this.getSize());
		return this.grid[HashVector(pos)] ?? this.defaultElement;
	}
	/**
	 * Sets the value at the specified position.
	 * Updates the bounds of the grid accordingly.
	 * @param {Vector} pos - The position to set the value at.
	 * @param {T} value - The value to set.
	 * @returns {Grid<T>} - Returns the updated grid.
	 * @throws Will throw an error if the value is undefined.
	 */
	set(pos: Vector, value?: T): this {
		if (value == undefined) throw new Error("Value was undefined!");
		if (this.doesWrap && !this.isInside(pos)) pos = WrapVector(pos, this.min, this.getSize());
		if (this.firstElement) {
			this.firstElement = false;
			this.min = pos.clone();
			this.max = pos.clone();
		} else {
			this.max = this.max.max(pos);
			this.min = this.min.min(pos);
		}
		if (value == undefined) return this;
		this.grid[HashVector(pos)] = this.cloneValue(value)!;
		return this;
	}
	/**
	 * Iterates over each element in the grid, executing the provided function for each.
	 * @param func - The function to be executed for each element, receiving value, position, and grid as arguments.
	 * @returns The grid instance.
	 */
	forEach(func: (value: T, pos: Vector, grid: this) => void) {
		for (let x = this.min.x; x <= this.max.x; x++) {
			for (let y = this.min.y; y <= this.max.y; y++) {
				for (let z = this.min.z; z <= this.max.z; z++) {
					const pos = new Vector(x, y, z);
					func(this.get(pos)!, pos, this);
				}
			}
		}
		return this;
	}
	forEachBreak(predicate: (value: T, pos: Vector, grid: this) => SHOULD_BREAK) {
		for (let x = this.min.x; x <= this.max.x; x++) {
			for (let y = this.min.y; y <= this.max.y; y++) {
				for (let z = this.min.z; z <= this.max.z; z++) {
					const pos = new Vector(x, y, z);
					if (predicate(this.get(pos)!, pos, this) == SHOULD_BREAK.YES) return pos;
				}
			}
		}
		return undefined;
	}

	/**
	 * Maps the grid's values to a new grid using the provided function.
	 * @param func - A function to map each value to a new type.
	 * @param defaultValue - The default value for the new grid.
	 * @returns A new grid with mapped values.
	 */
	mapClone<t>(func: (val: T, pos: Vector, grid: this) => t, defaultValue?: t) {
		return IArrayLikeHelper.MapClone(this, new Grid<t>(defaultValue), func) as Grid<t>;
	}
	map<t>(func: (val: T, pos: Vector, grid: this) => t, defaultValue?: t) {
		return IArrayLikeHelper.Map(this, func);
	}

	/**
	 * Finds the first element that satisfies the predicate function.
	 * @param predicate - The function to test each value and position.
	 * @returns A tuple containing the value and position, or undefined if not found.
	 */
	find(predicate: (value: T, pos: Vector, grid: this) => boolean) {
		return IArrayLikeHelper.Find(this, predicate);
	}
	findElement(predicate: (value: T, pos: Vector, grid: this) => boolean) {
		return IArrayLikeHelper.FindElement(this, predicate);
	}
	findIndex(predicate: (value: T, pos: Vector, grid: this) => boolean) {
		return IArrayLikeHelper.FindIndex(this, predicate);
	}

	/**
	 * Gets the value at the specified position with a specific type.
	 * @template t
	 * @param {Vector} pos - The position to get the value from.
	 * @returns {t} - Returns the value at the position, casted to the specified type.
	 */
	getT<t>(pos: Vector): t {
		return this.get(pos) as any;
	}
	/**
	 * Deletes the point at the specified position.
	 * If wrapping is enabled and the position is outside the bounds, the position is wrapped.
	 * @param {Vector} pos - The position of the point to delete.
	 * @returns {T} - Returns the value of the deleted point.
	 */
	deleteAt(pos: Vector): T {
		if (this.doesWrap && !this.isInside(pos)) pos = WrapVector(pos, this.min, this.getSize());
		const value = this.grid[HashVector(pos)];
		delete this.grid[HashVector(pos)];
		return value;
	}

	/**
	 * Iterates over the grid volume between two positions, applying a function to each value.
	 * @param pos1 - The starting position.
	 * @param pos2 - The ending position.
	 * @param func - The function to execute for each value.
	 * @returns The grid instance.
	 */
	forVolume(pos1: Vector, pos2: Vector, func: (value: T, pos: Vector, grid: this) => void) {
		const min: Vector = pos1.min(pos2);
		const max: Vector = pos1.max(pos2);

		for (let x = min.x; x <= max.x; x++) {
			for (let y = min.y; y <= max.y; y++) {
				for (let z = min.z; z <= max.z; z++) {
					const pos = new Vector(x, y, z);
					func(this.get(pos)!, pos, this);
				}
			}
		}
		return this;
	}
	/**
	 * Iterates over subgrids of the specified size, applying a callback to each subgrid.
	 * @param size - The size of the subgrid.
	 * @param callback - A function to apply to each subgrid.
	 * @returns The grid instance.
	 */
	forEachSubGrid(size: Vector, callback: (values: T[], sub_pos: Vector, poss: Vector[], original: this) => void) {
		size = size.rounded();
		const newSize = this.getSize().divide(size).ceil();
		const small_min = this.getMin().divide(size).floor();

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
								values.push(this.get(self_pos)!);
								poss.push(self_pos);
							}
						}
					}
					callback(values, small_pos, poss, this);
				}
			}
		}
		return this;
	}
	//#endregion
	//#region Voxels
	/**
	 * Checks if the given position is inside the 3D grid.
	 * @param {Vector} pos - The position to check.
	 * @returns {boolean} - Returns true if the position is inside the grid, otherwise false.
	 */
	isInside(pos: Vector) {
		return (
			this.max.x >= pos.x && // x
			this.min.x <= pos.x &&
			this.max.y >= pos.y && // y
			this.min.y <= pos.y &&
			this.max.z >= pos.z && // z
			this.min.z <= pos.z
		);
	}

	/**
	 * Checks if the given position is inside the grid based on X and Z coordinates only.
	 * @param {Vector} pos - The position to check.
	 * @returns {boolean} - Returns true if the XZ coordinates are inside the grid, otherwise false.
	 */
	isInsideXZ(pos: Vector) {
		return (
			this.max.x >= pos.x && // x
			this.min.x <= pos.x &&
			this.max.z >= pos.z && // z
			this.min.z <= pos.z
		);
	}

	/**
	 * Sets the value for all positions in a volume defined by two corner positions.
	 * @param {Vector} pos1 - The first corner position of the volume.
	 * @param {Vector} pos2 - The second corner position of the volume.
	 * @param {T} value - The value to set for the volume.
	 * @returns {Grid<T>} - Returns the updated grid.
	 */
	setValues(pos1: Vector, pos2: Vector, value: T) {
		this.forVolume(pos1, pos2, (v, pos) => this.set(pos, value));
		return this;
	}

	/**
	 * Gets the neighboring values around a position based on a lookup table.
	 * @param {Vector} pos - The position to get neighbors from.
	 * @param {readonly Vector[]} neighbourLookupTable - The table that defines relative neighbor positions.
	 * @returns {T[]} - Returns an array of neighboring values.
	 */
	getNeighbours(pos: Vector, neighbourLookupTable: readonly Vector[]) {
		return neighbourLookupTable.map((e) => this.get(pos.plus(e)));
	}

	/**
	 * Finds the index of a neighbor that matches a predicate.
	 * @param {Vector} pos - The position to search neighbors from.
	 * @param {(value: T, pos: Vector, grid: Grid<T>) => boolean} predicate - The function to match a neighbor.
	 * @param {readonly Vector[]} neighbourLookupTable - The lookup table defining neighbor positions.
	 * @returns {number} - Returns the index of the matching neighbor, or -1 if none match.
	 */
	findNeighbourIndex(
		pos: Vector,
		predicate: (value: T, pos: Vector, grid: Grid<T>) => boolean,
		neighbourLookupTable: readonly Vector[]
	) {
		return neighbourLookupTable.findIndex((e) => {
			const npos = pos.plus(e);
			return predicate(this.get(npos)!, npos, this);
		});
	}

	/**
	 * Performs a flood fill from a starting point with a given value, replacing connected matching values.
	 * @param {Vector} startingPoint - The point to start the flood fill from.
	 * @param {T} value - The value to fill with.
	 * @param {readonly Vector[]} neighbourLookupTable - The lookup table defining neighbor positions.
	 * @returns {Grid<T>} - Returns the updated grid.
	 */
	floodfill(startingPoint: Vector, value: T, neighbourLookupTable: readonly Vector[]) {
		const parentValue = this.get(startingPoint);
		if (parentValue == value) return this;

		let points: Vector[] = [startingPoint];
		while (points.length > 0) {
			const current = points.pop();
			if (current == undefined) break;
			this.set(current, value);

			points.push(
				...neighbourLookupTable
					.map((e) => current.plus(e))
					.filter((e) => this.isInside(e))
					.filter((e) => this.get(e) == parentValue)
			);
		}

		return this;
	}
	//#region Math (Only works if type of Grid is number)

	/**
	 * Calculates the sum of neighboring values around a given position.
	 * @param {Vector} pos - The position to get neighbors around.
	 * @param {readonly Vector[]} neighbourLookupTable - The lookup table defining neighbor positions.
	 * @returns {number} - The sum of the neighboring values.
	 */
	getNeighboursSum(pos: Vector, neighbourLookupTable: readonly Vector[]): number {
		return neighbourLookupTable.reduce((res, e) => res + this.getT<number>(pos.plus(e)), 0);
	}

	/**
	 * Calculates the mean of neighboring values around a given position.
	 * @param {Vector} pos - The position to get neighbors around.
	 * @param {readonly Vector[]} neighbourLookupTable - The lookup table defining neighbor positions.
	 * @returns {number} - The mean of the neighboring values.
	 */
	getNeighboursMean(pos: Vector, neighbourLookupTable: readonly Vector[]): number {
		return this.getNeighboursSum(pos, neighbourLookupTable) / neighbourLookupTable.length;
	}

	/**
	 * Calculates the gradient at a given position based on neighboring values.
	 * @param {Vector} pos - The position to calculate the gradient at.
	 * @param {number} [delta=1] - The step size for gradient calculation.
	 * @returns {Vector} - The gradient vector at the given position.
	 */
	getGradient(pos: Vector, delta: number = 1) {
		return new Vector(
			((this.getT<number>(pos.offset(delta, 0, 0)) - this.getT<number>(pos)) as number) / delta,
			((this.getT<number>(pos.offset(0, delta, 0)) - this.getT<number>(pos)) as number) / delta,
			((this.getT<number>(pos.offset(0, 0, delta)) - this.getT<number>(pos)) as number) / delta
		);
	}

	/**
	 * Calculates the normal vectors for each position in the grid based on neighboring values.
	 * @param {readonly Vector[]} neighbourLookupTable - The lookup table defining neighbor positions.
	 * @returns {Grid<Vector>} - A new grid with normal vectors for each position.
	 */
	getNormals(neighbourLookupTable: readonly Vector[]) {
		return this.mapClone((v, p, g) =>
			v != 0
				? this.getNeighbours(p, neighbourLookupTable)
						.map((e, i) => [e, i])
						.filter((e) => e[0] != 0)
						.reduce((res, val) => res.add(neighbourLookupTable[val[1] as any]), new Vector(0, 0, 0))
						.unit()
				: new Vector(0, 0, 0)
		);
	}
	//#endregion

	//#region Grid Manipulation

	/**
	 * Applies a transformation function to each position in the grid.
	 * @param {function(Vector): Vector} func - The function to apply to each position.
	 * @returns {Grid<T>} - Returns the updated grid with transformed positions.
	 */
	alterGridPositions(func: (pos: Vector) => Vector) {
		const gridCopy = this.grid;
		this.grid = {};
		this.firstElement = true;

		const min = this.getMin();
		const max = this.getMax();

		this.forVolume(min, max, (_, p) => {
			const value = gridCopy[HashVector(p)];
			if (value === undefined || value === this.defaultElement) return;
			this.set(func(p), value);
		});

		return this;
	}

	/**
	 * Realigns the grid positions so that the minimum position is at (0, 0, 0).
	 * @returns {Grid<T>} - Returns the updated grid with realigned positions.
	 */
	realign() {
		const min = this.getMin();
		return this.alterGridPositions((p) => p.minus(min));
	}

	/**
	 * Rotates the grid 90 degrees counter-clockwise around the Y-axis.
	 * @returns {Grid<T>} - Returns the updated grid after rotation.
	 */
	rotateCCW_YAxis() {
		return this.alterGridPositions((p) => new Vector(p.z, p.y, -p.x)).realign();
	}

	/**
	 * Rotates the grid 90 degrees clockwise around the Y-axis.
	 * @returns {Grid<T>} - Returns the updated grid after rotation.
	 */
	rotateCW_YAxis() {
		return this.alterGridPositions((p) => new Vector(-p.z, p.y, p.x)).realign();
	}

	/**
	 * Rotates the grid 180 degrees around the Y-axis.
	 * @returns {Grid<T>} - Returns the updated grid after rotation.
	 */
	rotate180_YAxis() {
		return this.alterGridPositions((p) => new Vector(-p.x, p.y, -p.z)).realign();
	}

	/**
	 * Flips the grid along the X-axis.
	 * @returns {Grid<T>} - Returns the updated grid after flipping.
	 */
	flipX_YAxis() {
		const size = this.getSize().offset(-1, -1, -1);
		return this.alterGridPositions((p) => new Vector(size.x - p.x, p.y, p.z));
	}

	/**
	 * Flips the grid along the Z-axis.
	 * @returns {Grid<T>} - Returns the updated grid after flipping.
	 */
	flipZ_YAxis() {
		const size = this.getSize().offset(-1, -1, -1);
		return this.alterGridPositions((p) => new Vector(p.x, p.y, size.z - p.z));
	}
	//#endregion

	//#region Clone and Paste

	/**
	 * Creates a deep copy of the grid.
	 * @returns {Grid<T>} - A new grid that is a copy of the current grid.
	 */
	clone(): Grid<T> {
		const result = new Grid<T>(this.defaultElement);
		this.forEach((e, p, g) => {
			const value = this.get(p);
			if (value === this.defaultElement) return;
			result.set(p, value);
		});
		return result;
	}

	/**
	 * Pastes another grid's values into this grid at the specified position.
	 * @param {Vector} pos - The position to paste the other grid into.
	 * @param {Grid<T>} other - The grid to paste from.
	 * @returns {Grid<T>} - Returns the updated grid after pasting.
	 */
	paste(pos: Vector, other: Grid<T>): Grid<T> {
		if (this.defaultElement === other.defaultElement) {
			other.forEach((v, p, g) => {
				if (v !== this.defaultElement) this.set(p.plus(pos), v);
			});
		} else {
			other.forEach((v, p, g) => {
				this.set(p.plus(pos), v);
			});
		}
		return this;
	}
	//#endregion

	//#region Print

	/**
	 * Prints a graph representation of values.
	 * @param {number[]} values - The values to print in the graph.
	 * @returns {string} - The printed graph as a string.
	 */
	static printGraph(values: number[]) {
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
		return graph.print(0, true);
	}

	/**
	 * Prints the grid as a 2D slice at a specified Y-coordinate.
	 * @param {number} y - The Y-coordinate of the slice to print.
	 * @param {boolean} [pretty=true] - Whether to print in a pretty format.
	 * @param {string[]} [replacements=null] - Optional replacements for values in the grid.
	 * @param {(v: T) => string} [stringify=(v: T) => `${v}`] - Function to convert values to strings.
	 * @returns {Grid<T>} - Returns the grid after printing.
	 */
	print(y: number, pretty: boolean = true, replacements?: string[], stringify: (v: T) => string = (v: T) => `${v}`) {
		const min = this.getMin();
		let result: string[][] = [];
		this.forEach((v, p, g) => {
			const pof = p.minus(min);
			if (p.y == y) {
				result[pof.z] = result[pof.z] ?? [];
				result[pof.z][pof.x] = stringify(v);
			}
		});
		result.reverse();

		if (pretty) {
			if (replacements) result = result.map((a) => a.map((b) => replacements[b] ?? b.padEnd(2, b[0])));

			console.log(` -----> x+`);
			const Yaxis1 = "z^|| 0 ";
			const Yaxis2 = "+      ";
			const len = Yaxis1.length - 1;
			console.log(result.map((e, i) => `${Yaxis1[Math.min(i, len)]}${Yaxis2[Math.min(i, len)]} ${e.join("")}`).join("\n"));
		} else {
			console.log(result.map((e, i) => e.join("")).join("\n"));
		}
		return this;
	}
	//#endregion

	/**
	 * Gets the values along a specified side with optional trimming.
	 * @param {Vector} side - The side to get values from.
	 * @param {number} [trim=0] - The amount to trim from the edges.
	 * @returns {T[]} - An array of values along the specified side.
	 */
	getSideValues(side: Vector, trim: number = 0): T[] {
		const tmax = this.getMax();
		const tmin = this.getMin();

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
		this.forVolume(min, max, (e) => result.push(e));
		return result;
	}

	/**
	 * Checks if this grid is equal to another grid.
	 * @param {Grid<T>} other - The other grid to compare with.
	 * @returns {boolean} - Returns true if the grids are equal, otherwise false.
	 */
	equals(other: Grid<T>) {
		if (!this.getMin().equals(other.getMin())) return false;
		if (!this.getMax().equals(other.getMax())) return false;
		if (this.defaultElement != other.defaultElement) return false;

		return JSON.stringify(this.grid) === JSON.stringify(other.grid);
	}
	//#endregion
}
