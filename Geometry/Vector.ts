import { Matrix } from "./Matrix";

const vectorElements = "xyzwabcdefgh";
export type Axies = "x" | "y" | "z" | "w" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";

/**
 * Represents a mathematical vector of variable size.
 */
export class Vector {
	private size: number;
	private values: number[];

	/**
	 * The x component of the vector.
	 */
	get x() {
		return this.values[0] ?? 0;
	}

	/**
	 * Sets the x component of the vector.
	 * @param value - The new x value.
	 */
	set x(value: number) {
		this.values[0] = value;
	}

	/**
	 * The y component of the vector.
	 */
	get y() {
		return this.values[1] ?? 0;
	}

	/**
	 * Sets the y component of the vector.
	 * @param value - The new y value.
	 */
	set y(value: number) {
		this.values[1] = value;
	}

	/**
	 * The z component of the vector.
	 */
	get z() {
		return this.values[2] ?? 0;
	}

	/**
	 * Sets the z component of the vector.
	 * @param value - The new z value.
	 */
	set z(value: number) {
		this.values[2] = value;
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
		if (this.size !== other.size) return false;
		return this.values.every((e, i) => Math.abs(e - other.get(i)) <= error);
	}

	/**
	 * Converts the vector to a string representation.
	 * @returns A string representing the vector.
	 */
	toString(): string {
		return `vec${this.size}(${this.values.map((e, i) => `${vectorElements[i] || i}:${e}`).join("; ")})`;
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
	 * Sets the values of the vector.
	 * @param values - An array of values to assign to the vector.
	 * @returns This vector with updated values.
	 */
	set(values: number[]): this {
		this.values = [];
		this.size = values.length;
		for (let i = 0; i < this.size; i++) this.values.push(values[i]);
		return this;
	}

	/**
	 * Adds another vector to this one.
	 * @param other - The vector to add.
	 * @returns This vector with the result of the addition.
	 */
	add(other: Vector): this {
		return this.set(this.values.map((e, i) => e + other.get(i)));
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
		return this.set(this.values.map((e, i) => e - other.get(i)));
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
		return this.set(this.values.map((e, i) => e * scalar));
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
	cross(other: Vector): Vector {
		if (this.size != 3 || other.size != 3)
			throw new Error("Vectors with sizes other than 3 or 7 have no cross product (no 7D implemented)");
		return new Vector().set(
			this.values.map((e, i) => {
				const i1 = (i + 1) % 3;
				const i2 = (i + 2) % 3;

				return this.get(i1) * other.get(i2) - this.get(i2) * other.get(i1);
			})
		);
	}

	/**
	 * Computes the squared length (magnitude) of the vector.
	 * @returns The squared length of the vector.
	 */
	lengthSqrt(): number {
		return this.values.map((e) => e * e).reduce((a, b) => a + b);
	}

	/**
	 * Computes the length (magnitude) of the vector.
	 * @returns The length of the vector.
	 */
	length(): number {
		return Math.sqrt(this.lengthSqrt());
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
	multMatrix(matrix: Matrix): Matrix {
		return matrix.multiplied(new Matrix(this.size, 1, this.values));
	}
	/**
	 * Translates the vector by the given arguments.
	 * @param args - A list of numbers to translate each component by.
	 * @returns This vector translated by the given values.
	 */
	translate(...args: number[]): this {
		return this.set(this.values.map((e, i) => e + (args[i] ?? 0)));
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
		return this.set(this.values.map((e) => Math.floor(e)));
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
		return this.set(this.values.map((e) => Math.ceil(e)));
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
		return this.set(this.values.map((e) => Math.round(e)));
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
		return this.set(this.values.map((e, i) => e * other.get(i)));
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
		return this.set(this.values.map((e, i) => e / other.get(i)));
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

	/**
	 * Creates a vector from an object with x, y, and z properties.
	 * @param vec - An object with x, y, and z properties.
	 * @returns A new vector created from the input object.
	 */
	static fromVec3(vec: { x: number; y: number; z: number }): Vector {
		return new Vector(vec.x, vec.y, vec.z);
	}

	/**
	 * Creates a new vector with the given components.
	 * @param args - The components of the vector.
	 */
	constructor(...args: number[]) {
		this.set([...args]);
	}
}

export function TestVector() {
    function assert(condition: boolean, message: string) {
        if (!condition) throw new Error(`Assertion failed: ${message}`);
    }
    
    console.log("Vector testing started!")

    // Test vector creation
    const vector1 = new Vector(1, 2, 3);
    assert(vector1.toString() === "vec3(x:1; y:2; z:3)", "Vector 1 creation failed");

    const vector2 = new Vector(4, 5, 6);
    assert(vector2.toString() === "vec3(x:4; y:5; z:6)", "Vector 2 creation failed");

    // Test vector addition
    const sumVector = vector1.plus(vector2);
    assert(sumVector.toString() === "vec3(x:5; y:7; z:9)", "Vector addition failed");

    // Test vector subtraction
    const differenceVector = vector1.minus(vector2);
    assert(differenceVector.toString() === "vec3(x:-3; y:-3; z:-3)", "Vector subtraction failed");

    // Test vector scaling
    const scaledVector = vector1.scaled(2);
    assert(scaledVector.toString() === "vec3(x:2; y:4; z:6)", "Vector scaling failed");

    // Test vector dot product
    const dotProduct = vector1.dot(vector2);
    assert(dotProduct === 32, "Vector dot product failed");

    // Test vector cross product
    const crossProduct = vector1.cross(vector2);
    assert(crossProduct.toString() === "vec3(x:-3; y:6; z:-3)", "Vector cross product failed");

    // Test vector length
    const length = vector1.length();
    assert(Math.abs(length - 3.741) < 0.001, "Vector length calculation failed");

    // Test unit vector
    const unitVector = vector1.unit();
    const expectedUnitVector = "vec3(x:0.267; y:0.534; z:0.801)";
    assert(
        unitVector.toString().startsWith("vec3(x:0.267"),
        "Vector unit calculation failed"
    );
    
    console.log("Vector testing finished!")
}