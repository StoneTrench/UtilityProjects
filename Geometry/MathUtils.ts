import Vector from "./Vector";

export function WrapIndex(i: number, length: number) {
	return ((i % length) + length) % length;
}
export function WrapGet<T>(arr: T[], i: number): T {
	return arr[WrapIndex(i, arr.length)];
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
	return vec.mapClone((e, i) => WrapIndex(e, size.get(i)) + min.get(i))
}
export function FindIntersectionXZ(line11: Vector, line12: Vector, line21: Vector, line22: Vector, error: number = 0.05): Vector | undefined {
	// ! Warning ! This code was written by abominable intelligence! Proceed with caution!

	if (line11.equals(line21, error) || line12.equals(line21, error) || line11.equals(line22, error) || line12.equals(line22, error)) return undefined;

	const errorMin = -error;
	const errorMax = error;

	function orientation(p: Vector, q: Vector, r: Vector) {
		let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
		if (val > errorMax) return 1; // clock or counterclock wise
		else if (val < errorMin) return 2;
		else return 0; // collinear
	}

	function onSegment(p: Vector, q: Vector, r: Vector) {
		if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) {
			return true;
		}
		return false;
	}

	function doIntersect(p1: Vector, q1: Vector, p2: Vector, q2: Vector) {
		let o1 = orientation(p1, q1, p2);
		let o2 = orientation(p1, q1, q2);
		let o3 = orientation(p2, q2, p1);
		let o4 = orientation(p2, q2, q1);

		if (o1 !== o2 && o3 !== o4) {
			return true;
		}

		if (o1 == 0 && onSegment(p1, p2, q1)) return true;
		if (o2 == 0 && onSegment(p1, q2, q1)) return true;
		if (o3 == 0 && onSegment(p2, p1, q2)) return true;
		if (o4 == 0 && onSegment(p2, q1, q2)) return true;

		return false;
	}

	const p1 = line11;
	const q1 = line12;
	const p2 = line21;
	const q2 = line22;

	if (!doIntersect(p1, q1, p2, q2)) {
		return undefined;
	}

	let a1 = q1.y - p1.y;
	let b1 = p1.x - q1.x;
	let c1 = a1 * p1.x + b1 * p1.y;

	let a2 = q2.y - p2.y;
	let b2 = p2.x - q2.x;
	let c2 = a2 * p2.x + b2 * p2.y;

	let determinant = a1 * b2 - a2 * b1;

	if (Math.abs(determinant) <= error) {
		return undefined;
	} else {
		let x = (b2 * c1 - b1 * c2) / determinant;
		let y = (a1 * c2 - a2 * c1) / determinant;
		const result = new Vector(x, y);
		return result;
	}
}