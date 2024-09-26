import { IArrayLikeSearch, IArrayLikeDelete, SHOULD_BREAK, IArrayLikeHelper, IArrayLikeMapping } from "../IArrayFunctions";
import { WrapVector } from "../MathUtils";
import { Axes, Vector } from "../math/Vector";

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
 * A dynamic 3D grid class that allows for flexible storage and manipulation of elements in a 3D space.
 *
 * @template T - The type of elements stored in the grid.
 */
export class Grid<T>
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
	static FromMatrix<T>(values: T[][], defaultValue?: T): Grid<T> {
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
	static FromStringArray(values: string[], defaultValue?: string): Grid<string> {
		return new Grid<string>(defaultValue).forVolume(
			new Vector(0, 0, 0),
			new Vector(values[0].length - 1, 0, values.length - 1),
			(v, p, g) => g.set(p, values[p.z][p.x])
		);
	}

	/**
	 * Generates a list of neighboring vectors based on the specified axes and size.
	 *
	 * @param axes - The axes to consider for neighbor generation.
	 * @param size - The size or distance to the neighbors.
	 * @param axisAligned - Whether the neighbors should be axis-aligned.
	 * @returns An array of vectors representing neighboring positions.
	 */
	static GenerateNeighboursMap(axes: Axes[], size: number = 1, axisAligned: boolean = false): Vector[] {
		const neighborVectors: Vector[] = [];

		if (axisAligned) {
			for (let j = -size; j <= size; j++) {
				if (j == 0) continue;
				for (const axis of axes) {
					const vec = new Vector(0, 0, 0);
					vec[axis] = j;
					neighborVectors.push(vec.clone());
				}
			}
		} else {
			const vec = new Vector(0, 0, 0);
			for (let i = -size; i <= size; i++) {
				for (const axisi of axes) {
					vec[axisi] = i;
					for (const axisj of axes) {
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
	values() {
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
		// if (value == undefined) throw new Error("Value was undefined!");
		// if (pos == undefined) return this;
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
	forEach(func: (value: T | undefined, pos: Vector, grid: this) => void) {
		for (let x = this.min.x; x <= this.max.x; x++) {
			for (let y = this.min.y; y <= this.max.y; y++) {
				for (let z = this.min.z; z <= this.max.z; z++) {
					const pos = new Vector(x, y, z);
					func(this.get(pos), pos, this);
				}
			}
		}
		return this;
	}
	forEachBreak(predicate: (value: T | undefined, pos: Vector, grid: this) => SHOULD_BREAK) {
		for (let x = this.min.x; x <= this.max.x; x++) {
			for (let y = this.min.y; y <= this.max.y; y++) {
				for (let z = this.min.z; z <= this.max.z; z++) {
					const pos = new Vector(x, y, z);
					if (predicate(this.get(pos), pos, this) == SHOULD_BREAK.YES) return pos;
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
	//#endregion

	//#region Clone and Paste

	/**
	 * Creates a deep copy of the grid.
	 * @returns {Grid<T>} - A new grid that is a copy of the current grid.
	 */
	clone(): Grid<T> {
		return this.copy(this.min, this.max);
	}

	copy(pos1: Vector, pos2: Vector) {
		const result = new Grid<T>(this.defaultElement).setValueCloningFunction(this.cloningFunction);
		this.forVolume(pos1, pos2, (v, p) => {
			if (v === this.defaultElement) return;
			result.set(p, v);
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
			other.forEach((v, p) => {
				if (v === this.defaultElement) return;
				this.set(p.plus(pos), v);
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

	printY(y: number = 0, pretty: boolean = true, stringify?: (v: T) => string) {
		this.print("x", "z", "y", y, pretty, stringify);
	}
	/**
	 * Prints the grid as a 2D slice at a specified Y-coordinate.
	 * @param {number} y - The Y-coordinate of the slice to print.
	 * @param {boolean} [pretty=true] - Whether to print in a pretty format.
	 * @param {string[]} [replacements=null] - Optional replacements for values in the grid.
	 * @param {(v: T) => string} [stringify=(v: T) => `${v}`] - Function to convert values to strings.
	 * @returns {Grid<T>} - Returns the grid after printing.
	 */
	print(
		xAxis: Axes = "x",
		yAxis: Axes = "y",
		zAxis: Axes = "z",
		zSlice: number = 0,
		drawAxisArrows: boolean = true,
		stringify?: (v: T) => string
	) {
		stringify ??= (v: T) => {
			if (v.toString) return v.toString();
			return `${v}`;
		};

		const min = this.getMin();
		let result: string[][] = [];
		this.forEach((v, p, g) => {
			const pof = p.minus(min);
			if (p[zAxis] == zSlice) {
				result[pof[yAxis]] = result[pof[yAxis]] ?? [];
				result[pof[yAxis]][pof[xAxis]] = stringify(v);
			}
		});
		result.reverse();

		if (drawAxisArrows) {
			console.log(` -----> ${xAxis}+`);
			const Yaxis1 = `${yAxis}^|| 0 `;
			const Yaxis2 = `+      `;
			const len = Yaxis1.length - 1;
			console.log(result.map((e, i) => `${Yaxis1[Math.min(i, len)]}${Yaxis2[Math.min(i, len)]} ${e.join("")}`).join("\n"));
		} else {
			console.log(result.map((e, i) => e.join("")).join("\n"));
		}
		return this;
	}
	//#endregion

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
