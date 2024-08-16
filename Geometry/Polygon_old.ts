// import { DynamicGrid3D } from "./Grid3D";
// import { Vector } from "./Vector";

// function WrapIndex(i: number, length: number) {
// 	return i < 0 ? length + i : i >= length ? i % length : i;
// }
// function WrapGet(array: any[], i: number) {
// 	return array[WrapIndex(i, array.length)];
// }
// function IsPointInTriangleXZ(a: Vector, b: Vector, c: Vector, point: Vector, error: number = 0) {
// 	const ab = a.minus(b);
// 	const bc = b.minus(c);
// 	const ca = c.minus(a);

// 	const ap = point.minus(a);
// 	const bp = point.minus(b);
// 	const cp = point.minus(c);

// 	const cross1 = ab.cross(ap).y;
// 	const cross2 = bc.cross(bp).y;
// 	const cross3 = ca.cross(cp).y;

// 	return cross1 >= error && cross2 >= error && cross3 >= error; // if all are greater than_or_equal to 0 then point is inside or on the edge
// }
// function Clamp(value: number, min: number, max: number) {
//     return (value < min) ? min : ((value > max) ? max : value);
// }
// function GetAngle(a: Vector, b: Vector) {
// 	return Math.acos(a.dot(b));
// }
// function GetAngle360XZ(a: Vector, b: Vector) {
// 	const angle180 = Math.acos(Clamp(DotProductXZ(a, b), -1, 1));
// 	return CrossProductXZ(a, b) < 0 ? (Math.PI * 2) - angle180 : angle180;
// }
// function DotProductXZ(a: Vector, b: Vector) {
// 	return a.x * b.x + a.z * b.z;
// }
// function CrossProductXZ(a: Vector, b: Vector) {
// 	return a.x * b.z - a.z * b.x;
// }

// /**
//  * Clockwise winding
//  */
// export class PolygonXZ {
// 	private points: Vector[];

// 	constructor(points: Vector[]) {
// 		this.points = points.map((e) => new Vector(e.x, 0, e.z).clone());
// 	}

// 	//#region Get
// 	Get(i: number) {
// 		return WrapGet(this.points, i).clone();
// 	}
// 	GetArea() {
// 		let result = 0;
// 		this.forEachSide((curr, next) => (result += (curr.z + next.z) * (next.x - curr.x)));
// 		return result / 2;
// 	}
// 	GetCircumference() {
// 		let value = 0;
// 		this.forEachSide((c, n) => (value += c.distanceTo(n)));
// 		return value;
// 	}
// 	GetAvgPoint() {
// 		return this.points.reduce((a, b) => a.add(b), new Vector(0, 0, 0)).scaled(1 / this.points.length);
// 	}
// 	GetPoints() {
// 		return this.points.map((e) => e.clone());
// 	}
// 	GetSideCount() {
// 		return this.points.length;
// 	}
// 	GetIsConvex() {
// 		let sign: number = null;
// 		let result: boolean = true;
// 		this.forEachTriplet((a, b, c) => {
// 			const s = Math.sign((b.x - a.x) * (c.z - b.z) - (b.z - a.z) * (c.x - b.x));
// 			if (sign == null) sign = s;
// 			result = result && s === sign;
// 		});
// 		return result;
// 	}
// 	GetSideLength(i: number) {
// 		return this.Get(i).distanceTo(this.Get(i + 1));
// 	}
// 	GetSide(i: number) {
// 		return {
// 			pos1: this.Get(i),
// 			pos2: this.Get(i + 1),
// 		};
// 	}
// 	HasSelfIntersection() {
// 		return this.points.some((curr, i, arr) => {
// 			const next = WrapGet(arr, i + 1);
// 			return this.FindNearestIntersection(curr, next) != null;
// 		});
// 	}
// 	//#endregion

// 	GetValidOneTriangle(): PolygonXZ {
// 		const pointIndexes = this.points.map((e, i) => i);
// 		const triangles: Vector[] = [];

// 		for (let i = 0; i < pointIndexes.length; i++) {
// 			const prev_i = WrapGet(pointIndexes, i - 1);
// 			const curr_i = pointIndexes[i];
// 			const next_i = WrapGet(pointIndexes, i + 1);

// 			const prev = this.points[prev_i].clone();
// 			const curr = this.points[curr_i].clone();
// 			const next = this.points[next_i].clone();

// 			if (0 > prev.minus(curr).cross(next.minus(curr)).y) continue; // if concave continue;

// 			// we check if our "ear" (triangle) has another point inside it, if yes we break
// 			let isValid = true;
// 			for (let j = 0; j < this.points.length; j++) {
// 				if (j == prev_i || j == curr_i || j == next_i) continue; // we skip our current points

// 				const point = this.points[j].clone();

// 				if (IsPointInTriangleXZ(prev, curr, next, point)) {
// 					isValid = false;
// 					break;
// 				}
// 			}
// 			if (isValid) {
// 				triangles.push(prev, curr, next);
// 				pointIndexes.splice(i, 1);
// 				break;
// 			}
// 		}

// 		return new PolygonXZ(triangles);
// 	}
// 	/**
// 	 * Returns an array of new instances.
// 	 */
// 	Triangulate(failCountBreak: number = 100): PolygonXZ[] {
// 		const pointIndexes = this.points.map((e, i) => i);

// 		const triangles: Vector[] = [];

// 		let foundValidBreakCounter: number = 0;
// 		while (pointIndexes.length > 3) {
// 			if (foundValidBreakCounter > failCountBreak) return [];

// 			for (let i = 0; i < pointIndexes.length; i++) {
// 				const prev_i = WrapGet(pointIndexes, i - 1);
// 				const curr_i = pointIndexes[i];
// 				const next_i = WrapGet(pointIndexes, i + 1);

// 				const prev = this.points[prev_i].clone();
// 				const curr = this.points[curr_i].clone();
// 				const next = this.points[next_i].clone();

// 				if (0 > prev.minus(curr).cross(next.minus(curr)).y) {
// 					foundValidBreakCounter++;
// 					continue; // if concave continue;
// 				}

// 				// we check if our "ear" (triangle) has another point inside it, if yes we break
// 				let isValid = true;
// 				for (let j = 0; j < this.points.length; j++) {
// 					if (j == prev_i || j == curr_i || j == next_i) continue; // we skip our current points

// 					const point = this.points[j].clone();

// 					if (IsPointInTriangleXZ(prev, curr, next, point)) {
// 						isValid = false;
// 						break;
// 					}
// 				}
// 				if (isValid) {
// 					foundValidBreakCounter = 0;
// 					triangles.push(prev, curr, next);
// 					pointIndexes.splice(i, 1);
// 					break;
// 				} else foundValidBreakCounter++;
// 			}
// 		}

// 		triangles.push(...pointIndexes.map((e) => this.points[e].clone()));

// 		if (triangles.length % 3 != 0) return [];

// 		const polis: PolygonXZ[] = [];
// 		for (let i = 0; i < triangles.length; i += 3)
// 			polis.push(new PolygonXZ([triangles[i], triangles[i + 1], triangles[i + 2]]));

// 		return polis;
// 	}
// 	FindSharedEdgeIndex(other: PolygonXZ, error: number = 0.05) {
// 		let otherIndex = -1;
// 		return {
// 			self: this.points.findIndex((curr1, i1, a1) => {
// 				const next1 = WrapGet(a1, i1 + 1);

// 				otherIndex = other.points.findIndex((next2, i2, a2) => {
// 					const curr2 = WrapGet(a2, i2 + 1); // We need to check it backwards, think: gears rotating against eachother.
// 					return curr1.equals(curr2, error) && next1.equals(next2, error);
// 				});
// 				return otherIndex != -1;
// 			}),
// 			other: otherIndex,
// 		};
// 	}
// 	/**
// 	 * Return a new instance stitched together from them, if they share a face, otherwise null.
// 	 */
// 	TryMergeAtEdge(other: PolygonXZ, error: number = 0.05): PolygonXZ | null {
// 		const sharedEdges = this.FindSharedEdgeIndex(other, error);
// 		if (sharedEdges.self == -1) return null;

// 		const points: Vector[] = [
// 			...this.points.slice(0, sharedEdges.self),
// 			...other.points.slice(sharedEdges.other + 1),
// 			...other.points.slice(0, sharedEdges.other),
// 			...this.points.slice(sharedEdges.self + 1),
// 		];
// 		if (points.length != other.points.length + this.points.length - 2) throw new Error(`Merged incorrectly!`);

// 		return new PolygonXZ(points).RemoveInternalPoints();
// 	}
// 	/**
// 	 * Alters this instance.
// 	 */
// 	RemoveInternalPoints() {
// 		const internalPoints: number[] = [];

// 		this.forEachTriplet((prev, curr, next, i) => {
// 			if (prev.equals(next)) {
// 				internalPoints.push(i, WrapIndex(i + 1, this.points.length));
// 			}
// 		});

// 		internalPoints
// 			.sort()
// 			.reverse()
// 			.forEach((e) => this.removePoint(e));
// 		return this;
// 	}
// 	/**
// 	 * Alters this instance.
// 	 */
// 	RemoveFlatPoints(maxAngleDeviance: number = 0.2617994) {
// 		const flatPoints: number[] = [];

// 		const rangeMin = maxAngleDeviance;
// 		const rangeMax = Math.PI - maxAngleDeviance;

// 		this.forEachTriplet((prev, curr, next, i) => {
// 			const angle = GetAngle(prev.minus(curr).unit(), next.minus(curr).unit());
// 			if (angle < rangeMin || angle > rangeMax) {
// 				flatPoints.unshift(i);
// 			}
// 		});

// 		flatPoints.forEach((e) => this.removePoint(e));
// 		return this;
// 	}
// 	/**
// 	 * Alters this instance.
// 	 */
// 	RemoveSmallSides(treshhold: number = 1) {
// 		const points: number[] = [];
// 		const newPoints: Vector[] = [];

// 		const sqrt_tresh = treshhold * treshhold;

// 		this.forEachSide((curr, next, i) => {
// 			if (curr.distanceSquared(next) < sqrt_tresh) {
// 				points.unshift(i);
// 				newPoints.unshift(curr.plus(next).scale(0.5));
// 			}
// 		});

// 		points.forEach((sideIndex, i) => {
// 			this.insert(newPoints[i], sideIndex);
// 			if (sideIndex + 1 >= this.points.length) {
// 				this.removePoint(sideIndex + 1);
// 				this.removePoint(sideIndex);
// 			} else {
// 				this.removePoint(sideIndex);
// 				this.removePoint(sideIndex + 1);
// 			}
// 		});
// 		return this;
// 	}
// 	/**
// 	 * Returns an array of new instances.
// 	 */
// 	MergeTriangulate() {
// 		let mergedPolis: PolygonXZ[] = this.Triangulate();

// 		while (mergedPolis.length > 0) {
// 			const poli = mergedPolis.shift();
// 			if (poli.GetSideCount() != 3) {
// 				mergedPolis.push(poli);
// 				break;
// 			}

// 			let largestSideWith: number = -1;
// 			let largestSideLength: number = 0;

// 			for (let i = 0; i < mergedPolis.length; i++) {
// 				const other_poli = mergedPolis[i];
// 				const edge = poli.FindSharedEdgeIndex(other_poli);
// 				if (edge.self == -1) continue;

// 				const length = poli.GetSideLength(edge.self);
// 				if (largestSideWith != null && largestSideLength > length) continue;

// 				largestSideWith = i;
// 				largestSideLength = length;
// 			}

// 			if (largestSideWith == -1) {
// 				mergedPolis.push(poli);
// 				break;
// 			}

// 			mergedPolis.push(poli.TryMergeAtEdge(mergedPolis.splice(largestSideWith, 1)[0]));
// 		}
// 		return mergedPolis;
// 	}
// 	RemoveSelfIntersections() {
// 		/**
// 		 *  We go along edge:
// 		 *  If we intersect
// 		 *      we push intersection point,
// 		 *      make current side the intersected side,
// 		 *      reverse the ittertation direction
// 		 *  else just push the current side
// 		 */

// 		let newPoints: Vector[] = [this.points[0]];
// 		let reverseDir = false;

// 		let i = 1;
// 		while (true) {
// 			const line11 = newPoints[newPoints.length - 1].clone();
// 			const line12 = this.points[WrapIndex(i, this.points.length)].clone();

// 			// console.log(line11, line12, i)
// 			if (newPoints.length > 1 && line11.equals(newPoints[0])) break;

// 			// Find intersected sides
// 			const intersect = this.FindNearestIntersection(line11, line12, [i]);

// 			if (intersect != null) {
// 				// console.log("Intersection", i, nearestIntersectSideIndex, nearestIntersectPoint)

// 				if (reverseDir) intersect.side += 1;
// 				reverseDir = !reverseDir;
// 				i = intersect.side;
// 				newPoints.push(intersect.point);
// 			} else {
// 				// console.log("Straight")

// 				newPoints.push(line12);

// 				if (reverseDir) i--;
// 				else i++;
// 			}
// 		}
// 		this.points = newPoints.slice(0, -1);
// 		return this;
// 	}
// 	/**
// 	 * Returns two new instances.
// 	 */
// 	SplitPolygon(position: Vector, normal: Vector, error: number = 0.1) {
// 		normal = normal.unit();
// 		const normal90 = RotateVector90CW_YAxis(normal);

// 		const clonePolygon = this.mapClone((e) => e);

// 		const size = clonePolygon.points.reduce((a, b, i) => a.add(b.projectedOnto(normal90).abs()), new Vector(0, 0, 0));

// 		const line1 = normal90.scaled(size.length());
// 		const line2 = RotateVector180_YAxis(line1);

// 		line1.add(position);
// 		line2.add(position);

// 		clonePolygon
// 			.FindIntersections(line1, line2, [], error)
// 			.reverse()
// 			.forEach((e) => clonePolygon.insert(e.point, e.side));

// 		const points1: Vector[] = [];
// 		const points2: Vector[] = [];

// 		clonePolygon.forEach((e) => {
// 			const value = IsLeftOfLineXZ(line1, line2, e);
// 			if (value > error) points1.push(e);
// 			else if (value < -error) points2.push(e);
// 			else {
// 				points1.push(e);
// 				points2.push(e);
// 			}
// 		});

// 		const resultArray: PolygonXZ[] = [new PolygonXZ(points1), new PolygonXZ(points2)];

// 		return resultArray;
// 	}
// 	/**
// 	 * Returns two new instances.
// 	 */
// 	SplitPolygonAlongAxis(axis: Vector, t: number = 0, error: number = 0.1) {
// 		axis = axis.unit();

// 		const projectedPoints = this.map((e) => {
// 			const res = e.projectedOnto(axis);
// 			return {
// 				vec: res,
// 				len: res.sqrtLength(),
// 			};
// 		});

// 		let max = projectedPoints[0];
// 		let min = projectedPoints[0];

// 		for (const p of projectedPoints) {
// 			if (p.len > max.len) max = p;
// 			else if (p.len < min.len) min = p;
// 		}

// 		const projectionCenterPoint = LerpVector(min.vec, max.vec, t);

// 		return this.SplitPolygon(projectionCenterPoint, axis, error);
// 	}
// 	/**
// 	 * Alters this instance.
// 	 */
// 	ApplyPullForces(itter: number = 1, scalar: number = 1) {
// 		scalar = scalar * 0.1;
// 		for (let itt = 0; itt < itter; itt++) {
// 			this.mapSelf((curr, i, a) => {
// 				const prev = a[WrapIndex(i - 1, a.length)].minus(curr).scale(scalar);
// 				const next = a[WrapIndex(i + 1, a.length)].minus(curr).scale(scalar);

// 				return curr.plus(prev).plus(next);
// 			});
// 		}
// 		return this;
// 	}
// 	FindNearestIntersection(
// 		start: Vector,
// 		end: Vector,
// 		skip: number[] = [],
// 		error: number = 0.05
// 	): { point: Vector; side: number; distance: number } | null {
// 		let nearestIntersectPoint: Vector = null;
// 		let nearestIntersectSideIndex: number = -1;
// 		let nearestIntersectDist: number = Number.MAX_SAFE_INTEGER;
// 		this.forEachSide((line21, line22, i2) => {
// 			if (skip.includes(i2)) return;

// 			// if (
// 			//     line21.equals(start, error) ||
// 			//     line22.equals(start, error) ||
// 			//     line21.equals(end, error) ||
// 			//     line22.equals(end, error)
// 			// ) return;

// 			// console.log("Comparing", start, end, line21, line22)
// 			const inter = FindIntersectionXZ(start, end, line21, line22, error);
// 			if (
// 				!inter ||
// 				inter.equals(start, error)
// 				// inter.equals(end, error) ||
// 				// inter.equals(line21, error) ||
// 				// inter.equals(line22, error)
// 			)
// 				return;
// 			// console.log("Intersection", inter)

// 			const dist = start.distanceSquared(inter);
// 			if (nearestIntersectPoint != null && nearestIntersectDist < dist) return;

// 			nearestIntersectSideIndex = i2;
// 			nearestIntersectPoint = inter;
// 			nearestIntersectDist = dist;
// 		});

// 		if (nearestIntersectPoint == null) return null;

// 		return {
// 			point: nearestIntersectPoint,
// 			side: nearestIntersectSideIndex,
// 			distance: nearestIntersectDist,
// 		};
// 	}
// 	FindIntersections(start: Vector, end: Vector, skip: number[] = [], error: number = 0.05): { point: Vector; side: number }[] {
// 		return this.mapSides((line21, line22, i2) => {
// 			if (skip.includes(i2)) return null;
// 			const inter = FindIntersectionXZ(start, end, line21, line22, error);
// 			if (!inter) return null;
// 			return {
// 				point: inter,
// 				side: i2,
// 			};
// 		}).filter((e) => e);
// 	}
// 	DrawToGrid<T>(grid: DynamicGrid3D<T>, value: T, yPos: number = 0, pos: Vector = new Vector(0, 0, 0)) {
// 		const final_pos = pos.offset(0, yPos, 0);
// 		return this.forEachSide((a, b) =>
// 			BresenhamLine(a.plus(final_pos).floor(), b.plus(final_pos).floor()).forEach((e) => grid.setValue(e, value))
// 		);
// 	}
// 	DeRasterizePolygon<T>(grid: DynamicGrid3D<T>, value: T, pos1: Vector, pos2: Vector) {
// 		throw new Error("Unimplemented exception!");
// 	}

// 	/**
// 	 * Alters this instance.
// 	 */
// 	DeflatePolygon(scalar: number) {
// 		const vectors: Vector[] = [];

// 		this.forEach((curr, index) => {
// 			vectors.push(
// 				this.GetSideNormal(index)
// 					.unit()
// 					.add(this.GetSideNormal(index - 1).unit())
// 					.unit()
// 			);
// 		});

// 		return this.mapSelf((p, i) => p.minus(vectors[i].scale(scalar)));
// 	}
// 	FixWinding() {
// 		if (this.GetArea() < 0) this.points.reverse(); // is counter clockwise then reverse
// 		return this;
// 	}

// 	//#region pretend your an array
// 	forEachTriplet(callback: (prev: Vector, curr: Vector, next: Vector, index: number) => void) {
// 		for (let i = 0; i < this.points.length; i++) {
// 			const prev = this.points[i - 1] ?? this.points[this.points.length - 1];
// 			const curr = this.points[i];
// 			const next = this.points[i + 1] ?? this.points[0];

// 			callback(prev.clone(), curr.clone(), next.clone(), i);
// 		}
// 		return this;
// 	}
// 	forEachSide(callback: (curr: Vector, next: Vector, index: number, array: Vector[]) => void) {
// 		const arrayClone = this.GetPoints();
// 		for (let i = 0; i < this.points.length; i++) {
// 			const curr = this.points[i];
// 			const next = this.points[i + 1] ?? this.points[0];

// 			callback(curr.clone(), next.clone(), i, arrayClone);
// 		}
// 		return this;
// 	}
// 	forEachSideNormal(callback: (curr: Vector, next: Vector, normal: Vector, index: number, array: Vector[]) => void) {
// 		const arrayClone = this.GetPoints();
// 		const eY = new Vector(0, 1, 0);
// 		for (let i = 0; i < this.points.length; i++) {
// 			const curr = this.points[i];
// 			const next = this.points[i + 1] ?? this.points[0];
// 			const normal = next.minus(curr).cross(eY);

// 			callback(curr.clone(), next.clone(), normal, i, arrayClone);
// 		}
// 		return this;
// 	}
// 	forEach(callback: (pos: Vector, index: number, array: Vector[]) => void) {
// 		const arrayClone = this.GetPoints();
// 		for (let i = 0; i < this.points.length; i++) {
// 			callback(this.points[i].clone(), i, arrayClone);
// 		}
// 		return this;
// 	}
// 	map<T>(callback: (pos: Vector, index: number, array: Vector[]) => T): T[] {
// 		const result: T[] = [];
// 		this.forEach((p, i, a) => {
// 			result.push(callback(p, i, a));
// 		});
// 		return result;
// 	}
// 	mapClone(callback: (pos: Vector, index: number, array: Vector[]) => Vector): PolygonXZ {
// 		return new PolygonXZ(this.map(callback));
// 	}
// 	mapSides<T>(callback: (curr: Vector, next: Vector, index: number, array: Vector[]) => T) {
// 		const result: T[] = [];
// 		const arrayClone = this.GetPoints();
// 		this.forEachSide((a, b, i) => {
// 			result.push(callback(a, b, i, arrayClone));
// 		});
// 		return result;
// 	}
// 	insert(pos: Vector, sideIndex: number) {
// 		sideIndex = WrapIndex(sideIndex, this.points.length);
// 		this.points = [...this.points.slice(0, sideIndex + 1), new Vector(pos.x, 0, pos.z), ...this.points.slice(sideIndex + 1)];
// 		return this;
// 	}
// 	push(pos: Vector) {
// 		this.points.push(new Vector(pos.x, 0, pos.z));
// 		return this;
// 	}
// 	removePoint(i: number) {
// 		return this.points.splice(WrapIndex(i, this.points.length), 1);
// 	}
// 	mapSelf(callback: (pos: Vector, index: number, array: Vector[]) => Vector) {
// 		this.points = this.map(callback).map((e) => e.clone());
// 		return this;
// 	}
// 	find(callback: (pos: Vector, index: number, array: Vector[]) => boolean) {
// 		const arrayClone = this.GetPoints();
// 		for (let i = 0; i < this.points.length; i++) {
// 			if (callback(this.points[i].clone(), i, arrayClone)) {
// 				return this.points[i].clone();
// 			}
// 		}
// 		return null;
// 	}
// 	findIndex(callback: (pos: Vector, index: number, array: Vector[]) => boolean) {
// 		const arrayClone = this.GetPoints();
// 		for (let i = 0; i < this.points.length; i++) {
// 			if (callback(this.points[i].clone(), i, arrayClone)) {
// 				return i;
// 			}
// 		}
// 		return -1;
// 	}
// 	//#endregion

// 	toString() {
// 		return `[\n${this.map((e) => `   new Vector${e.toString()}`).join(",\n")}\n]`;
// 	}
// }
