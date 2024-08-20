import Vector from "./class/Vector";

export namespace Segment {
	export function Intersection2D(
		startA: Vector,
		endA: Vector,
		startB: Vector,
		endB: Vector,
		error: number = 0.05,

	): Vector | undefined {
		if (startA.equals(startB, error) || endA.equals(startB, error) || startA.equals(endB, error) || endA.equals(endB, error))
			return undefined;

		// if (startA.equals(startB, error)) {
		// 	return startA.clone();
		// }
		// if (endA.equals(startB, error)) {
		// 	return endA.clone();
		// }
		// if (startA.equals(endB, error)) {
		// 	return startA.clone();
		// }
		// if (endA.equals(endB, error)) {
		// 	return endA.clone();
		// }

		const errorMin = -error;
		const errorMax = error;

		function orientation(p: Vector, q: Vector, r: Vector) {
			let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
			if (val > errorMax) return 1; // clock- or counterclockwise
			else if (val < errorMin) return 2;
			else return 0; // collinear
		}

		function onSegment(p: Vector, q: Vector, r: Vector) {
			if (
				q.x <= Math.max(p.x, r.x) &&
				q.x >= Math.min(p.x, r.x) &&
				q.y <= Math.max(p.y, r.y) &&
				q.y >= Math.min(p.y, r.y)
			) {
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

		const p1 = startA;
		const q1 = endA;
		const p2 = startB;
		const q2 = endB;

		if (!doIntersect(p1, q1, p2, q2)) {
			return undefined;
		}

		const a1 = q1.y - p1.y;
		const b1 = p1.x - q1.x;

		const a2 = q2.y - p2.y;
		const b2 = p2.x - q2.x;

		const determinant = a1 * b2 - a2 * b1;

		if (Math.abs(determinant) <= error) {
			return undefined;
		} else {
			const c1 = a1 * p1.x + b1 * p1.y;
			const c2 = a2 * p2.x + b2 * p2.y;

			const x = (b2 * c1 - b1 * c2) / determinant;
			const y = (a1 * c2 - a2 * c1) / determinant;
			const result = new Vector(x, y);
			return result;
		}
	}
	export function IsLeftOfLine2D(line1: Vector, line2: Vector, point: Vector) {
		return (line2.x - line1.x) * (point.y - line1.y) - (line2.y - line1.y) * (point.x - line1.x) > 0;
	}
	export function CutSegmentsAtIntersections2D(segments: [Vector, Vector][], error: number = 0.05) {
		// const oldSegments = segments;
		segments = [...segments];

		const result: [Vector, Vector][] = [];

		while (segments.length > 0) {
			const seg = segments.shift();

			let intersectionPoint: Vector = null;
			let intersectionIndex: number = -1;

			for (let otherI = 0; otherI < segments.length; otherI++) {
				const intersection = Intersection2D(seg[0], seg[1], segments[otherI][0], segments[otherI][1], error);
				if (!intersection) continue;
				intersectionPoint = intersection;
				intersectionIndex = otherI;
				break;
			}

			if (intersectionPoint != undefined) {
				const otherSegment = segments.splice(intersectionIndex, 1)[0];
				if (!seg[0].equals(intersectionPoint, error)) segments.push([seg[0].clone(), intersectionPoint.clone()]);

				if (!seg[1].equals(intersectionPoint, error)) segments.push([intersectionPoint.clone(), seg[1].clone()]);

				if (!otherSegment[0].equals(intersectionPoint, error))
					segments.push([otherSegment[0].clone(), intersectionPoint.clone()]);

				if (!otherSegment[1].equals(intersectionPoint, error))
					segments.push([intersectionPoint.clone(), otherSegment[1].clone()]);
			} else result.push(seg);
		}

		return result;
	}
}
