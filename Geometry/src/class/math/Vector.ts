import {
	IArrayLikeMapping,
	MapFunction,
	IArrayLikeHelper,
	ForEachFunction,
	BreakPredicateFunction,
	SHOULD_BREAK,
} from "../../IArrayFunctions";
import { WrapIndex } from "../../MathUtils";
import { AdvancedMatrix } from "./AdvancedMatrix";

const vectorElements = "xyzwabcdefgh";
export type Axies = "x" | "y" | "z" | "w" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
const TAU = 6.28318530718;

/**
 * Represents a mathematical vector of variable size.
 */
export class Vector implements IArrayLikeMapping<number, number> {
	/**
	 * The values of the vector.
	 */
	private values: number[];

	/**
	 * The x component of the vector.
	 */
	get x() {
		return this.get(0);
	}

	/**
	 * Sets the x component of the vector.
	 * @param value - The new x value.
	 */
	set x(value: number) {
		this.set(0, value);
	}

	/**
	 * The y component of the vector.
	 */
	get y() {
		return this.get(1);
	}

	/**
	 * Sets the y component of the vector.
	 * @param value - The new y value.
	 */
	set y(value: number) {
		this.set(1, value);
	}

	/**
	 * The z component of the vector.
	 */
	get z() {
		return this.get(2);
	}

	/**
	 * Sets the z component of the vector.
	 * @param value - The new z value.
	 */
	set z(value: number) {
		this.set(2, value);
	}

	/**
	 * The w component of the vector.
	 */
	get w() {
		return this.get(3);
	}

	/**
	 * Sets the z component of the vector.
	 * @param value - The new z value.
	 */
	set w(value: number) {
		this.set(3, value);
	}

	/**
	 * Returns the max number of elements the vector can have, also known as it's dimensions.
	 * @returns - The number of elements in the vector.
	 */
	getDimensions() {
		return this.values.length;
	}

	/**
	 * Checks if the vector is a zero vector within a margin of error.
	 * @param error - The acceptable error margin for zero comparison.
	 * @returns Whether the vector is a zero vector.
	 */
	isZero(error: number = 0): boolean {
		return this.values.every((e) => Math.abs(e) <= error);
	}

	/**
	 * Compares this vector with another to check for equality within a margin of error.
	 * @param other - The vector to compare with.
	 * @param error - The acceptable error margin for comparison.
	 * @returns Whether the vectors are equal.
	 */
	equals(other: Vector, error: number = 0): boolean {
		if (other == undefined) return false;
		if (this.getDimensions() !== other.getDimensions()) return false;
		return this.values.every((e, i) => Math.abs(e - other.get(i)) <= error);
	}

	/**
	 * Converts the vector to a string representation.
	 * @returns A string representing the vector.
	 */
	toString(): string {
		return `Vec${this.getDimensions()}(${this.values.map((e, i) => `${e}`).join(", ")})`;
	}

	/**
	 * Retrieves the value at the specified index.
	 * @param i - The index to retrieve the value from.
	 * @returns The value at the given index.
	 */
	get(i: number): number {
		return this.values[i] ?? 0;
	}

	/**
	 * Sets a value of the vector.
	 * @param index - The index to write the value to.
	 * @param value - A value to assign to the vector.
	 * @returns This vector with updated values.
	 */
	set(index: number, value: number): this {
		while (index >= this.getDimensions()) this.values.push(0);
		this.values[WrapIndex(index, this.values.length)] = value;
		return this;
	}

	/**
	 * Sets the values of the vector.
	 * @param values - An array of values to assign to the vector.
	 * @returns This vector with updated values.
	 */
	update(values: number[]): this {
		this.values = [];
		for (let i = 0; i < values.length; i++) this.values.push(values[i]);
		return this;
	}

	/**
	 * Adds another vector to this one.
	 * @param other - The vector to add.
	 * @returns This vector with the result of the addition.
	 */
	add(other: Vector): this {
		return this.update(this.values.map((e, i) => e + other.get(i)));
	}

	/**
	 * Returns a new vector that is the sum of this vector and another.
	 * @param other - The vector to add.
	 * @returns A new vector with the result of the addition.
	 */
	plus(other: Vector): Vector {
		return new Vector(...this.values.map((e, i) => e + other.get(i)));
	}

	/**
	 * Subtracts another vector from this one.
	 * @param other - The vector to subtract.
	 * @returns This vector with the result of the subtraction.
	 */
	subtract(other: Vector): this {
		return this.update(this.values.map((e, i) => e - other.get(i)));
	}

	/**
	 * Returns a new vector that is the difference between this vector and another.
	 * @param other - The vector to subtract.
	 * @returns A new vector with the result of the subtraction.
	 */
	minus(other: Vector): Vector {
		return new Vector(...this.values.map((e, i) => e - other.get(i)));
	}

	/**
	 * Scales the vector by a scalar value.
	 * @param scalar - The value to scale by.
	 * @returns This vector scaled by the scalar value.
	 */
	scale(scalar: number): this {
		return this.update(this.values.map((e, i) => e * scalar));
	}

	/**
	 * Returns a new vector that is scaled by a scalar value.
	 * @param scalar - The value to scale by.
	 * @returns A new vector scaled by the scalar value.
	 */
	scaled(scalar: number): Vector {
		return new Vector(...this.values.map((e, i) => e * scalar));
	}

	/**
	 * Computes the dot product of this vector and another.
	 * @param other - The vector to compute the dot product with.
	 * @returns The dot product of the two vectors.
	 */
	dot(other: Vector): number {
		return this.values.map((e, i) => e * other.get(i)).reduce((a, b) => a + b);
	}

	/**
	 * Computes the cross product of this vector and another (3D vectors only).
	 * @param other - The vector to compute the cross product with.
	 * @returns A new vector representing the cross product.
	 * @throws Error if vectors are not 3D.
	 */
	cross(other: Vector): Vector | undefined {
		// https://en.wikipedia.org/wiki/Seven-dimensional_cross_product

		const size = other.getDimensions();
		const self = this.getDimensions() != size ? this.matchedDimensions(size) : this;

		if (size <= 3) {
			return new Vector(
				self.y * other.z - self.z * other.y,
				self.z * other.x - self.x * other.z,
				self.x * other.y - self.y * other.x
			);
		} else if (size <= 7) {
			return self.mapClone((_, i) => {
				const i2 = (i + 1) % 7;
				const i3 = (i + 2) % 7;
				const i4 = (i + 3) % 7;
				const i5 = (i + 4) % 7;
				const i6 = (i + 5) % 7;
				const i7 = (i + 6) % 7;

				return (
					self.get(i2) * other.get(i4) -
					self.get(i4) * other.get(i2) +
					self.get(i3) * other.get(i7) -
					self.get(i7) * other.get(i3) +
					self.get(i5) * other.get(i6) -
					self.get(i6) * other.get(i5)
				);
			});
		}

		return undefined;
		// if (this.size != 3 || other.size != 3)
		// 	throw new Error("Vectors with sizes other than 3 or 7 have no cross product (no 7D implemented)");
		// return new Vector().update(
		// 	this.values.map((e, i) => {
		// 		const i1 = (i + 1) % 3;
		// 		const i2 = (i + 2) % 3;

		// 		return this.get(i1) * other.get(i2) - this.get(i2) * other.get(i1);
		// 	})
		// );
	}

	/**
	 * Computes the length (magnitude) of the vector.
	 * @returns The length of the vector.
	 */
	length(): number {
		return Math.sqrt(this.lengthSqrt());
	}

	/**
	 * Computes the squared length (magnitude) of the vector.
	 * @returns The squared length of the vector.
	 */
	lengthSqrt(): number {
		return this.values.map((e) => e * e).reduce((a, b) => a + b);
	}

	/**
	 * Computes the manhattan length of the vector.
	 * @returns The manhattan length of the vector.
	 */
	lengthManhattan(): number {
		return this.values.reduce((res, e) => res + Math.abs(e), 0);
	}

	/**
	 * Computes the max length of the vector.
	 * @returns The max length of the vector.
	 */
	lengthMax(): number {
		return this.values.reduce((res, e) => Math.max(res, Math.abs(e)), 0);
	}

	/**
	 * Returns a new vector that is the unit vector (normalized version) of this vector.
	 * @returns A unit vector.
	 */
	unit(): Vector {
		return this.scaled(1 / this.length());
	}

	/**
	 * Creates a copy of this vector.
	 * @returns A new vector that is a clone of this one.
	 */
	clone(): Vector {
		return new Vector(...this.values);
	}

	/**
	 * Multiplies the vector by a matrix.
	 * @param matrix - The matrix to multiply with.
	 * @returns The resulting matrix.
	 */
	multMatrix(matrix: AdvancedMatrix): AdvancedMatrix | undefined {
		return matrix.multiplied(new AdvancedMatrix(this.getDimensions(), 1, this.values));
	}
	/**
	 * Translates the vector by the given arguments.
	 * @param args - A list of numbers to translate each component by.
	 * @returns This vector translated by the given values.
	 */
	translate(...args: number[]): this {
		return this.update(this.values.map((e, i) => e + (args[i] ?? 0)));
	}

	/**
	 * Returns a new vector translated by the given arguments.
	 * @param args - A list of numbers to translate each component by.
	 * @returns A new vector translated by the given values.
	 */
	offset(...args: number[]): Vector {
		return new Vector(...this.values.map((e, i) => e + (args[i] ?? 0)));
	}

	/**
	 * Floors each component of the vector.
	 * @returns This vector with each component floored.
	 */
	floor(): this {
		return this.update(this.values.map((e) => Math.floor(e)));
	}

	/**
	 * Returns a new vector with each component floored.
	 * @returns A new vector with each component floored.
	 */
	floored(): Vector {
		return new Vector(...this.values.map((e) => Math.floor(e)));
	}

	/**
	 * Ceils each component of the vector.
	 * @returns This vector with each component ceiled.
	 */
	ceil(): this {
		return this.update(this.values.map((e) => Math.ceil(e)));
	}

	/**
	 * Returns a new vector with each component ceiled.
	 * @returns A new vector with each component ceiled.
	 */
	ceiled(): Vector {
		return new Vector(...this.values.map((e) => Math.ceil(e)));
	}

	/**
	 * Rounds each component of the vector.
	 * @returns This vector with each component rounded.
	 */
	round(): this {
		return this.update(this.values.map((e) => Math.round(e)));
	}

	/**
	 * Returns a new vector with each component rounded.
	 * @returns A new vector with each component rounded.
	 */
	rounded(): Vector {
		return new Vector(...this.values.map((e) => Math.round(e)));
	}

	/**
	 * Multiplies each component of this vector by the corresponding component of another vector.
	 * @param other - The vector to multiply with.
	 * @returns This vector after component-wise multiplication.
	 */
	multiply(other: Vector): this {
		return this.update(this.values.map((e, i) => e * other.get(i)));
	}

	/**
	 * Returns a new vector resulting from component-wise multiplication with another vector.
	 * @param other - The vector to multiply with.
	 * @returns A new vector after component-wise multiplication.
	 */
	multiplied(other: Vector): Vector {
		return new Vector(...this.values.map((e, i) => e * other.get(i)));
	}

	/**
	 * Divides each component of this vector by the corresponding component of another vector.
	 * @param other - The vector to divide by.
	 * @returns This vector after component-wise division.
	 */
	divide(other: Vector): this {
		return this.update(this.values.map((e, i) => e / other.get(i)));
	}

	/**
	 * Returns a new vector resulting from component-wise division with another vector.
	 * @param other - The vector to divide by.
	 * @returns A new vector after component-wise division.
	 */
	divided(other: Vector): Vector {
		return new Vector(...this.values.map((e, i) => e / other.get(i)));
	}

	/**
	 * Performs component-wise modulus operation with another vector.
	 * @param other - The vector to perform modulus operation with.
	 * @returns A new vector after the modulus operation.
	 */
	modulus(other: Vector): Vector {
		return new Vector(...this.values.map((e, i) => e % other.get(i)));
	}

	/**
	 * Returns a new vector with the minimum value of each component compared with another vector.
	 * @param other - The vector to compare with.
	 * @returns A new vector with the minimum value for each component.
	 */
	min(other: Vector): Vector {
		return new Vector(...this.values.map((e, i) => Math.min(other.get(i), e)));
	}

	/**
	 * Returns a new vector with the maximum value of each component compared with another vector.
	 * @param other - The vector to compare with.
	 * @returns A new vector with the maximum value for each component.
	 */
	max(other: Vector): Vector {
		return new Vector(...this.values.map((e, i) => Math.max(other.get(i), e)));
	}

	/**
	 * Returns a new vector with the absolute values of each component.
	 * @returns A new vector with absolute values for each component.
	 */
	abs(): Vector {
		return new Vector(...this.values.map((e) => Math.abs(e)));
	}

	distanceTo(other: Vector) {
		return this.minus(other).length();
	}

	distanceSquared(other: Vector) {
		return this.minus(other).lengthSqrt();
	}

	projectedOnto(other: Vector) {
		return other.scaled(this.dot(other) / other.dot(other));
	}
	rejectOnto(other: Vector) {
		return this.minus(this.projectedOnto(other));
	}

	/**
	 * Creates a vector from an object with x, y, and z properties.
	 * @param vec - An object with x, y, and z properties.
	 * @returns A new vector created from the input object.
	 */
	static fromVec3(vec: { x: number, y: number, z: number }): Vector {
		return new Vector(vec.x, vec.y, vec.z);
	}

	/**
	 * Creates a new vector with the given components.
	 * @param args - The components of the vector.
	 */
	constructor(...args: number[]) {
		this.update([...args]);
	}

	mapClone<t>(func: MapFunction<number, number, t, this>) {
		return new Vector(...this.values.map((a, b) => func(a, b, this) as number));
	}
	map<t>(func: MapFunction<number, number, t, this>): t[] {
		return IArrayLikeHelper.Map(this, func);
	}
	forEach(func: ForEachFunction<number, number, this>): this {
		for (let i = 0; i < this.values.length; i++) {
			func(this.values[i], i, this);
		}
		return this;
	}
	forEachBreak(func: BreakPredicateFunction<number, number, this>): number | undefined {
		for (let i = 0; i < this.values.length; i++) {
			const value = this.values[i];
			if (func(value, i, this) == SHOULD_BREAK.YES) return i;
		}
		return undefined;
	}
	toArray() {
		return [...this.values];
	}
	closestAxisVector() {
		const largest = this.map<[number, number, number]>((e, i) => [i, Math.abs(e), e]).reduce((prev, curr) =>
			prev[1] > curr[1] ? prev : curr
		);

		return this.mapClone((e, i, s) => (largest[0] == i ? (largest[2] > 0 ? 1 : -1) : 0));
	}
	matchedDimensions(dimensions: number) {
		if (this.getDimensions() > dimensions) return new Vector(...this.values.slice(0, dimensions));
		if (this.getDimensions() < dimensions)
			return new Vector(...this.values.concat(new Array(dimensions - this.getDimensions()).fill(0)));
		return this.clone();
	}
	getAngle2D(other: Vector) {
		const dot = this.x * other.x + this.y * other.y;
		const det = this.x * other.y - this.y * other.x;
		return (Math.atan2(det, dot) + TAU) % TAU;
	}

	hash() {
		let seed = this.getDimensions();
		this.forEach((x) => {
			x = ((x >> 16) ^ x) * 0x45d9f3b;
			x = ((x >> 16) ^ x) * 0x45d9f3b;
			x = (x >> 16) ^ x;
			seed ^= x + 0x9e3779b9 + (seed << 6) + (seed >> 2);
		});
		return seed;
	}

	volume() {
		return this.map((e) => e).reduce((a, b) => a * b);
	}
	sum() {
		return this.map((e) => e).reduce((a, b) => a + b);
	}
}
