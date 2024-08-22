import Vector from "./class/Vector";

export function WrapIndex(i: number, length: number) {
	return ((i % length) + length) % length;
}
export function WrapGet<T>(arr: T[], i: number): T {
	return arr[WrapIndex(i, arr.length)];
}
/**
 * Modified the existing array.
 */
export function InsertIntoArray<T>(array: T[], index: number, element: T): T[] {
	const end = array.splice(index);
	array.push(element, ...end);
	return array;
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
 * Clockwise
 */
export function TriangleArea(p1: Vector, p2: Vector, p3: Vector) {
	return (p1.x * (p3.y - p2.y) + p2.x * (p1.y - p3.y) + p3.x * (p2.y - p1.y)) / 2;
}

export function GetDateString() {
	const date = new Date();
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, "0");
	const day = `${date.getDate()}`.padStart(2, "0");
	const hour = `${date.getHours()}`.padStart(2, "0");
	const minute = `${date.getMinutes()}`.padStart(2, "0");
	const second = `${date.getSeconds()}`.padStart(2, "0");
	return `${year}_${month}_${day}-${hour}_${minute}_${second}`;
}
