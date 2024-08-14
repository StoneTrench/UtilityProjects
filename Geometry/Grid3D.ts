import { Axies, Vector } from "./Vector";

export function HashVec3(vec: Vector) {
	const n = 46340;
	return vec.x + vec.y * n + vec.z * n * n;
}
export function WrapVector(vec: Vector, min: Vector, size: Vector) {
	return vec.minus(min).modulus(size).plus(size).modulus(size).plus(min);
}

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
export const neighboursCheckAxisY: readonly Vector[] = [
	new Vector(0, 0, 1),
	new Vector(1, 0, 0),
	new Vector(0, 0, -1),
	new Vector(-1, 0, 0),
] as const;
export const neighboursCheck3D: readonly Vector[] = [
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

export const ASCII_GRADIENT_FULL =
	` .-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@` as const;
export const ASCII_GRADIENT_SHORT10 = ` .:-=+*#%@` as const;

/**
Stores an array of numbers in multiple dimensions, and has utility function for manipulating them. (it can also be an array of any, but it's not recommended unless you know what you're doing)
@deprecated Use DynamicGrid3D instead
*/
export class Grid3D {
	private grid: any[][][];
	private width: number;
	private height: number;
	private length: number;

	// height   width   length
	// y        x       z

	constructor(width: number, height: number, length: number) {
		this.width = width;
		this.length = length;
		this.height = height;

		this.grid = this.createGrid(width, height, length);
	}

	createGrid(width: number, height: number, length: number) {
		const grid = [];
		for (let y = 0; y < height; y++) {
			grid[y] = [];
			for (let x = 0; x < width; x++) {
				grid[y][x] = new Array(length).fill(0);
			}
		}
		return grid;
	}

	forEach(func: (val: any, pos: Vector, grid: Grid3D) => void) {
		for (let y = 0; y < this.grid.length; y++) {
			for (let x = 0; x < this.grid[y].length; x++) {
				for (let z = 0; z < this.grid[y][x].length; z++) {
					func(this.grid[y][x][z], new Vector(x, y, z), this);
				}
			}
		}

		return this;
	}

	isInside(pos: Vector) {
		return (
			this.width > pos.x && // x
			0 <= pos.x &&
			this.height > pos.y && // y
			0 <= pos.y &&
			this.length > pos.z && // z
			0 <= pos.z
		);
	}
	getValue(pos: Vector): any | null {
		if (!this.isInside(pos)) return null;
		return this.grid[pos.y][pos.x][pos.z];
	}
	setValue(pos: Vector, value: any) {
		if (value == null) return this;
		if (!this.isInside(pos)) return this;
		this.grid[pos.y][pos.x][pos.z] = value;
		return this;
	}
	/**
	 * Clockwise from the top most tile, 8 of them.
	 * @param pos
	 */
	getNeighbours(pos: Vector, neighbourLookupTable: readonly Vector[]) {
		return neighbourLookupTable.map((e) => this.getValue(pos.plus(e)));
	}

	clone() {
		return new Grid3D(this.width, this.height, this.length).forEach((e, p, g) => {
			g.setValue(p, this.getValue(p));
		});
	}

	printf(y: number, replacements: string[] = null) {
		if (replacements)
			console.log(this.grid[y].map((a) => a.map((b) => replacements[b % replacements.length]).join("")).join("\n"));
		else console.log(this.grid[y].map((a) => a.join("")).join("\n"));
	}

	expand(values: Vector) {
		const new_width = this.width + values.x * 2;
		const new_height = this.height + values.y * 2;
		const new_length = this.length + values.z * 2;

		const new_grid = this.createGrid(new_width, new_height, new_length);

		this.forEach((v, pos, g) => {
			const p = pos.plus(values);
			new_grid[p.y][p.x][p.z] = v;
		});

		this.grid = new_grid;

		this.width = new_width;
		this.height = new_height;
		this.length = new_length;

		return this;
	}
}

export class DynamicGrid3D<T> {
	private grid: { [vechash: string]: T };
	private min: Vector;
	private max: Vector;
	private firstElement: boolean;
	private defaultElement: T;

	private doesWrap: boolean;

	// height   width   length
	// y        x       z

	//#region Create
	constructor(defaultElement: T) {
		this.min = new Vector(0, 0, 0);
		this.max = new Vector(0, 0, 0);
		this.firstElement = true;
		this.defaultElement = defaultElement;
		this.grid = {};
		this.doesWrap = false;
	}

	static fromMatrix<T>(values: T[][], defaultValue: T = undefined) {
		return new DynamicGrid3D<T>(defaultValue).forVolume(
			new Vector(0, 0, 0),
			new Vector(values.length - 1, 0, values[0].length - 1),
			(v, p, g) => g.setValue(p, values[p.x][p.z])
		);
	}
	static fromStringArray(values: string[], defaultValue: string = undefined) {
		return new DynamicGrid3D<string>(defaultValue).forVolume(
			new Vector(0, 0, 0),
			new Vector(values[0].length - 1, 0, values.length - 1),
			(v, p, g) => g.setValue(p, values[p.z][p.x])
		);
	}
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
	setWrapping(value: boolean) {
		this.doesWrap = value;
		return this;
	}

	getValues() {
		return Object.values(this.grid);
	}

	getSize() {
		return this.firstElement ? new Vector(0, 0, 0) : this.max.minus(this.min).offset(1, 1, 1);
	}
	getMin() {
		return this.min.clone();
	}
	getMax() {
		return this.max.clone();
	}
	//#endregion

	//#region ForEach
	forEach(func: (value: T, pos: Vector, grid: this) => void) {
		for (let x = this.min.x; x <= this.max.x; x++) {
			for (let y = this.min.y; y <= this.max.y; y++) {
				for (let z = this.min.z; z <= this.max.z; z++) {
					const pos = new Vector(x, y, z);
					func(this.getValue(pos), pos, this);
				}
			}
		}

		return this;
	}

	find(predicate: (value: T, pos: Vector, grid: this) => boolean): [T, Vector] | undefined {
		for (let x = this.min.x; x <= this.max.x; x++) {
			for (let y = this.min.y; y <= this.max.y; y++) {
				for (let z = this.min.z; z <= this.max.z; z++) {
					const pos = new Vector(x, y, z);
					if (predicate(this.getValue(pos), pos, this)) return [this.getValue(pos), pos];
				}
			}
		}

		return undefined;
	}
	/**
	 *
	 * @param pos1
	 * @param pos2
	 * @param func
	 * @returns
	 */
	forVolume(pos1: Vector, pos2: Vector, func: (value: T, pos: Vector, grid: this) => void) {
		const min: Vector = pos1.min(pos2);
		const max: Vector = pos1.max(pos2);

		for (let x = min.x; x <= max.x; x++) {
			for (let y = min.y; y <= max.y; y++) {
				for (let z = min.z; z <= max.z; z++) {
					const pos = new Vector(x, y, z);
					func(this.getValue(pos), pos, this);
				}
			}
		}
		return this;
	}
	/**
	 * Returns a new instance of the Grid with the values
	 * @param func
	 * @param defaultValue
	 * @returns
	 */
	map<t>(func: (val: T, pos: Vector, grid: this) => t, defaultValue: t = undefined): DynamicGrid3D<t> {
		const result = new DynamicGrid3D<t>(defaultValue);
		this.forEach((v, p, g) => result.setValue(p, func(v, p, g)));
		return result;
	}
	/**
	 * @param size integer in the range of [1, +inf)
	 * @param values x + (z * size) + (y * size * size)
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
								values.push(this.getValue(self_pos));
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
	isInsideXZ(pos: Vector) {
		return (
			this.max.x >= pos.x && // x
			this.min.x <= pos.x &&
			this.max.z >= pos.z && // z
			this.min.z <= pos.z
		);
	}
	getValue(pos: Vector): T {
		if (this.doesWrap && !this.isInside(pos)) pos = WrapVector(pos, this.min, this.getSize());
		return this.grid[HashVec3(pos)] ?? this.defaultElement;
	}
	getValueT<t>(pos: Vector): t {
		return this.getValue(pos) as any;
	}
	deletePoint(pos: Vector) {
		if (this.doesWrap && !this.isInside(pos)) pos = WrapVector(pos, this.min, this.getSize());
		const value = this.grid[HashVec3(pos)];
		delete this.grid[HashVec3(pos)];
		return value;
	}
	setValue(pos: Vector, value: T) {
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
		this.grid[HashVec3(pos)] = value;
		return this;
	}
	setValues(pos1: Vector, pos2: Vector, value: T) {
		this.forVolume(pos1, pos2, (v, pos) => this.setValue(pos, value));
		return this;
	}
	/**
	 * Clockwise from the top most tile, 8 of them.
	 * @param pos
	 */
	getNeighbours(pos: Vector, neighbourLookupTable: readonly Vector[]) {
		return neighbourLookupTable.map((e) => this.getValue(pos.plus(e)));
	}
	findNeighbourIndex(
		pos: Vector,
		predicate: (value: T, pos: Vector, grid: DynamicGrid3D<T>) => boolean,
		neighbourLookupTable: readonly Vector[]
	) {
		return neighbourLookupTable.findIndex((e) => {
			const npos = pos.plus(e);
			return predicate(this.getValue(npos), npos, this);
		});
	}
	floodfill(startingPoint: Vector, value: T, neighbourLookupTable: readonly Vector[]) {
		const parentValue = this.getValue(startingPoint);
		if (parentValue == value) return this;

		let points: Vector[] = [startingPoint];
		while (points.length > 0) {
			const current = points.pop();
			this.setValue(current, value);

			points.push(
				...neighbourLookupTable
					.map((e) => current.plus(e))
					.filter((e) => this.isInside(e))
					.filter((e) => this.getValue(e) == parentValue)
			);
		}

		return this;
	}

	//#region Math (Only works if type of Grid is number)
	getNeighboursSum(pos: Vector, neighbourLookupTable: readonly Vector[]): number {
		return neighbourLookupTable.reduce((res, e) => res + this.getValueT<number>(pos.plus(e)), 0);
	}
	getNeighboursMean(pos: Vector, neighbourLookupTable: readonly Vector[]): number {
		return this.getNeighboursSum(pos, neighbourLookupTable) / neighbourLookupTable.length;
	}
	getGradient(pos: Vector, delta: number = 1) {
		return new Vector(
			((this.getValueT<number>(pos.offset(delta, 0, 0)) - this.getValueT<number>(pos)) as number) / delta,
			((this.getValueT<number>(pos.offset(0, delta, 0)) - this.getValueT<number>(pos)) as number) / delta,
			((this.getValueT<number>(pos.offset(0, 0, delta)) - this.getValueT<number>(pos)) as number) / delta
		);
	}
	getNormals(neighbourLookupTable: readonly Vector[]): DynamicGrid3D<Vector> {
		return this.map((v, p, g) =>
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

	alterGridPositions(func: (pos: Vector) => Vector) {
		const gridCopy = this.grid;
		this.grid = {};
		this.firstElement = true;

		const min = this.getMin();
		const max = this.getMax();

		this.forVolume(min, max, (_, p) => {
			const value = gridCopy[HashVec3(p)];
			if (value === undefined || value === this.defaultElement) return;
			this.setValue(func(p), value);
		});

		return this;
	}
	realign() {
		const min = this.getMin();
		return this.alterGridPositions((p) => p.minus(min));
	}
	rotateCCW_YAxis() {
		return this.alterGridPositions((p) => new Vector(p.z, p.y, -p.x)).realign();
	}
	rotateCW_YAxis() {
		return this.alterGridPositions((p) => new Vector(-p.z, p.y, p.x)).realign();
	}
	rotate180_YAxis() {
		return this.alterGridPositions((p) => new Vector(-p.x, p.y, -p.z)).realign();
	}
	flipX_YAxis() {
		const size = this.getSize().offset(-1, -1, -1);
		return this.alterGridPositions((p) => new Vector(size.x - p.x, p.y, p.z));
	}
	flipZ_YAxis() {
		const size = this.getSize().offset(-1, -1, -1);
		return this.alterGridPositions((p) => new Vector(p.x, p.y, size.z - p.z));
	}
	//#endregion

	//#region Clone and Paste
	clone(): DynamicGrid3D<T> {
		const result = new DynamicGrid3D<T>(this.defaultElement);
		this.forEach((e, p, g) => {
			const value = this.getValue(p);
			if (value === this.defaultElement) return;
			result.setValue(p, value);
		});
		return result;
	}
	paste(pos: Vector, other: DynamicGrid3D<T>): DynamicGrid3D<T> {
		if (this.defaultElement === other.defaultElement) {
			other.forEach((v, p, g) => {
				if (v !== this.defaultElement) this.setValue(p.plus(pos), v);
			});
		} else {
			other.forEach((v, p, g) => {
				this.setValue(p.plus(pos), v);
			});
		}
		return this;
	}
	//#endregion

	//#region Print
	static printGraph(values: number[]) {
		const graph = new DynamicGrid3D<string>(" .");

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

			graph.setValue(new Vector(xPos, 0, zPos), "██");
			const axisIndex = `${i}`.padEnd(3).padStart(5);

			for (let a = 0; a < axisIndex.length; a++) {
				graph.setValue(new Vector(xPos, 0, -a - 1), axisIndex[a].padStart(2, " "));
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
				graph.setValue(new Vector(-a - 1, 0, i), text[textReverse - a].padStart(2, " "));
			}
		}
		return graph.print(0, true);
	}
	print(y: number, pretty: boolean = true, replacements: string[] = null, stringify: (v: T) => string = (v: T) => `${v}`) {
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
			// if (!replacements) replacements = ASCII_GRADIENT_FULL.split("").map(e => e + e)
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
	equals(other: DynamicGrid3D<T>) {
		if (!this.getMin().equals(other.getMin())) return false;
		if (!this.getMax().equals(other.getMax())) return false;
		if (this.defaultElement != other.defaultElement) return false;

		return JSON.stringify(this.grid) === JSON.stringify(other.grid);
	}
}
