import { Vector } from "./class/math/Vector";

/**
 * Wraps an index within a given length, ensuring it stays within the valid range.
 * This function handles negative indices and large positive indices by wrapping them around.
 *
 * @param {number} i - The index to wrap.
 * @param {number} length - The length of the range to wrap the index within.
 * @returns {number} The wrapped index.
 */
export function WrapIndex(i: number, length: number): number {
	return ((i % length) + length) % length;
}
/**
 * Wraps a vector within a defined range, ensuring it stays within the minimum and maximum boundaries.
 *
 * @param vec - The vector to wrap.
 * @param min - The minimum boundary vector.
 * @param size - The size vector, representing the maximum boundary.
 * @returns A new vector wrapped within the specified range.
 */
export function WrapVector(vec: Vector, min: Vector, size: Vector): Vector {
	return vec.mapClone((e, i) => WrapIndex(e, size.get(i)) + min.get(i));
}

/**
 * Calculates the area of a triangle formed by three vectors in 2D space.
 * The result is positive for clockwise order and negative for counterclockwise order.
 *
 * @param {Vector} p1 - The first vertex of the triangle.
 * @param {Vector} p2 - The second vertex of the triangle.
 * @param {Vector} p3 - The third vertex of the triangle.
 * @returns {number} The signed area of the triangle.
 */
export function TriangleArea(p1: Vector, p2: Vector, p3: Vector): number {
	return (p1.x * (p3.y - p2.y) + p2.x * (p1.y - p3.y) + p3.x * (p2.y - p1.y)) / 2;
}
/**
 * Clamps a value within a specified minimum and maximum range.
 *
 * @param {number} value - The value to clamp.
 * @param {number} min - The minimum boundary.
 * @param {number} max - The maximum boundary.
 * @returns {number} The clamped value.
 */
export function Clamp(value: number, min: number, max: number): number {
	return value < min ? min : value > max ? max : value;
}

export namespace MConst {
	export const rad360 = Math.PI * 2;
	export const rad270 = Math.PI * 1.5;
	export const rad180 = Math.PI;
	export const rad90 = Math.PI / 2;
	export const rad60 = Math.PI / 3;
	export const rad45 = Math.PI / 4;
	export const rad36 = Math.PI / 5;
	export const rad30 = Math.PI / 6;
	export const rad15 = Math.PI / 12;
	export const rad5 = Math.PI / 36;
	export const rad1 = Math.PI / 180;
	/**
	 * The golden ratio, often denoted by the Greek letter φ (phi).
	 * It is an irrational number approximately equal to 1.618033988749894.
	 * The golden ratio has many interesting properties and appears in various aspects of art, architecture, and nature.
	 *
	 * @constant {number} phi - The golden ratio.
	 */
	export const phi = 1.618033988749894;
}
