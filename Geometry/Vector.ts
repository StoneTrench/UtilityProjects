import { Matrix } from "./Matrix";

const vectorElements = "xyzwabcdefgh";
export type Axies = "x" | "y" | "z" | "w" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h";
// const vectorElementsArray = ["x", "y", "z", "w", "a", "b", "c", "d", "e", "f", "g", "h"];

export class Vector {
	private size: number;
	private values: number[];
	get x() {
		return this.values[0] ?? 0;
	}
	set x(value: number) {
		this.values[0] = value;
	}
	get y() {
		return this.values[1] ?? 0;
	}
	set y(value: number) {
		this.values[1] = value;
	}
	get z() {
		return this.values[2] ?? 0;
	}
	set z(value: number) {
		this.values[2] = value;
	}

	// Checks if the vector is a zero vector within an error margin
	isZero(error: number = 0) {
		return this.values.every((e) => Math.abs(e) <= error);
	}
	equals(other: Vector, error: number = 0) {
		if (this.size !== other.size) return false;
		return this.values.every((e, i) => Math.abs(e - other.get(i)) <= error);
	}
	toString() {
		return `vec${this.size}(${this.values.map((e, i) => `${vectorElements[i] || i}:${e}`).join("; ")})`;
	}

	get(i: number): number {
		return this.values[i] ?? 0;
	}
	set(values: number[]) {
		this.values = [];

		this.size = values.length;
		for (let i = 0; i < this.size; i++) this.values.push(values[i]);
		return this;
	}

	add(other: Vector) {
		return this.set(this.values.map((e, i) => e + other.get(i)));
	}
	plus(other: Vector) {
		return new Vector(...this.values.map((e, i) => e + other.get(i)));
	}

	subtract(other: Vector) {
		return this.set(this.values.map((e, i) => e - other.get(i)));
	}
	minus(other: Vector) {
		return new Vector(...this.values.map((e, i) => e - other.get(i)));
	}

	scale(scalar: number) {
		return this.set(this.values.map((e, i) => e * scalar));
	}
	scaled(scalar: number) {
		return new Vector(...this.values.map((e, i) => e * scalar));
	}

	dot(other: Vector) {
		return this.values.map((e, i) => e * other.get(i)).reduce((a, b) => a + b);
	}
	cross(other: Vector) {
		if (this.size != 3 || other.size != 3)
			throw new Error("Vectors with sizes other then 3 or 7 have no cross product (no 7d implemented rn :/)");
		return new Vector().set(
			this.values.map((e, i) => {
				const i1 = (i + 1) % 3;
				const i2 = (i + 2) % 3;

				return this.get(i1) * other.get(i2) - this.get(i2) * other.get(i1);
			})
		);
	}
	lengthSqrt() {
		return this.values.map((e) => e * e).reduce((a, b) => a + b);
	}
	length() {
		return Math.sqrt(this.lengthSqrt());
	}
	unit() {
		return this.scaled(1 / this.length());
	}
	clone() {
		return new Vector(...this.values);
	}

	multMatrix(matrix: Matrix) {
		return matrix.multiplied(new Matrix(this.size, 1, this.values));
	}

	translate(...args: number[]) {
		return this.set(this.values.map((e, i) => e + (args[i] ?? 0)));
	}
	offset(...args: number[]) {
		return new Vector(...this.values.map((e, i) => e + (args[i] ?? 0)));
	}

	floor() {
		return this.set(this.values.map((e) => Math.floor(e)));
	}
	floored() {
		return new Vector(...this.values.map((e) => Math.floor(e)));
	}

	ceil() {
		return this.set(this.values.map((e) => Math.ceil(e)));
	}
	ceiled() {
		return new Vector(...this.values.map((e) => Math.ceil(e)));
	}

	round() {
		return this.set(this.values.map((e) => Math.round(e)));
	}
	rounded() {
		return new Vector(...this.values.map((e) => Math.round(e)));
	}

	multiply(other: Vector) {
		return this.set(this.values.map((e, i) => e * other.get(i)));
	}
	multiplied(other: Vector) {
		return new Vector(...this.values.map((e, i) => e * other.get(i)));
	}

	divide(other: Vector) {
		return this.set(this.values.map((e, i) => e / other.get(i)));
	}
	divided(other: Vector) {
		return new Vector(...this.values.map((e, i) => e / other.get(i)));
	}

	modulus(other: Vector) {
		return new Vector(...this.values.map((e, i) => e % other.get(i)));
	}
	min(other: Vector) {
		return new Vector(...this.values.map((e, i) => Math.min(other.get(i), e)));
	}
	max(other: Vector) {
		return new Vector(...this.values.map((e, i) => Math.max(other.get(i), e)));
	}
	abs() {
		return new Vector(...this.values.map((e) => Math.floor(e)));
	}
	static fromVec3(vec: { x: number; y: number; z: number }) {
		return new Vector(vec.x, vec.y, vec.z);
	}

	constructor(...args: number[]) {
		this.set([...args]);
	}
}
