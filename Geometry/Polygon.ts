import { DynamicGrid3D } from "./Grid3D";

/**
 * Clockwise winding
 */
export class PolygonXZ {
	private points: Vec3[];

	constructor(points: Vec3[]) {
		this.points = points.map((e) => new Vec3(e.x, 0, e.z).clone());
	}

	//#region Get
	GetArea() {
		let result = 0;
		this.forEachSide((curr, next) => (result += (curr.z + next.z) * (next.x - curr.x)));
		return result / 2;
	}
	GetCircumference() {
		let value = 0;
		this.forEachSide((c, n) => (value += c.distanceTo(n)));
		return value;
	}
	GetAvgPoint() {
		return this.points.reduce((a, b) => a.add(b), new Vec3(0, 0, 0)).scaled(1 / this.points.length);
	}
	GetPoints() {
		return this.points.map((e) => e.clone());
	}
	GetSideCount() {
		return this.points.length;
	}
	GetIsConvex() {
		let sign: number = null;
		let result: boolean = true;
		this.forEachTriplet((a, b, c) => {
			const s = Math.sign((b.x - a.x) * (c.z - b.z) - (b.z - a.z) * (c.x - b.x));
			if (sign == null) sign = s;
			result = result && s === sign;
		});
		return result;
	}
	GetSideLength(i: number) {
		return this.Get(i).distanceTo(this.Get(i + 1));
	}
	GetSide(i: number) {
		return {
			pos1: this.Get(i),
			pos2: this.Get(i + 1),
		};
	}
	GetSideNormal(i: number) {
		const sideNormal = this.Get(i + 1).minus(this.Get(i));
		return RotateVector90CW_YAxis(sideNormal);
	}
	Get(i: number) {
		return this.points[WrapIndex(i, this.points.length)].clone();
	}
	HasSelfIntersection() {
		return this.points.some((curr, i, arr) => {
			const next = arr.getWrap(i + 1);
			return this.FindNearestIntersection(curr, next) != null;
		});
	}
	//#endregion

	GetValidOneTriangle(): PolygonXZ {
		const pointIndexes = this.points.map((e, i) => i);
		const tris: Vec3[] = [];

		for (let i = 0; i < pointIndexes.length; i++) {
			const prev_i = pointIndexes[WrapIndex(i - 1, pointIndexes.length)];
			const curr_i = pointIndexes[i];
			const next_i = pointIndexes[WrapIndex(i + 1, pointIndexes.length)];

			const prev = this.points[prev_i].clone();
			const curr = this.points[curr_i].clone();
			const next = this.points[next_i].clone();

			if (0 > CrossProductXZ(prev.minus(curr), next.minus(curr))) continue; // if concave continue;

			// we check if our "ear" (triangle) has another point inside it, if yes we break
			let isValid = true;
			for (let j = 0; j < this.points.length; j++) {
				if (j == prev_i || j == curr_i || j == next_i) continue; // we skip our current points

				const point = this.points[j].clone();

				if (IsPointInTriangleXZ(prev, curr, next, point)) {
					isValid = false;
					break;
				}
			}
			if (isValid) {
				tris.push(prev, curr, next);
				pointIndexes.splice(i, 1);
				break;
			}
		}

		return new PolygonXZ(tris);
	}
	/**
	 * Returns an array of new instances.
	 */
	Triangulate(failCountBreak: number = 100): PolygonXZ[] {
		const pointIndexes = this.points.map((e, i) => i);

		const tris: Vec3[] = [];

		let foundValidBreakCounter: number = 0;
		while (pointIndexes.length > 3) {
			if (foundValidBreakCounter > failCountBreak) return [];

			for (let i = 0; i < pointIndexes.length; i++) {
				const prev_i = pointIndexes[WrapIndex(i - 1, pointIndexes.length)];
				const curr_i = pointIndexes[i];
				const next_i = pointIndexes[WrapIndex(i + 1, pointIndexes.length)];

				const prev = this.points[prev_i].clone();
				const curr = this.points[curr_i].clone();
				const next = this.points[next_i].clone();

				if (0 > CrossProductXZ(prev.minus(curr), next.minus(curr))) {
					foundValidBreakCounter++;
					continue; // if concave continue;
				}

				// we check if our "ear" (triangle) has another point inside it, if yes we break
				let isValid = true;
				for (let j = 0; j < this.points.length; j++) {
					if (j == prev_i || j == curr_i || j == next_i) continue; // we skip our current points

					const point = this.points[j].clone();

					if (IsPointInTriangleXZ(prev, curr, next, point)) {
						isValid = false;
						break;
					}
				}
				if (isValid) {
					foundValidBreakCounter = 0;
					tris.push(prev, curr, next);
					pointIndexes.splice(i, 1);
					break;
				} else foundValidBreakCounter++;
			}
		}

		tris.push(...pointIndexes.map((e) => this.points[e].clone()));

		if (tris.length % 3 != 0) return [];

		const polis: PolygonXZ[] = [];
		for (let i = 0; i < tris.length; i += 3) polis.push(new PolygonXZ([tris[i], tris[i + 1], tris[i + 2]]));

		return polis;
	}
	FindSharedEdgeIndex(other: PolygonXZ, error: number = 0.05) {
		let otherIndex = -1;
		return {
			self: this.points.findIndex((curr1, i1, a1) => {
				const next1 = a1.getWrap(i1 + 1);

				otherIndex = other.points.findIndex((next2, i2, a2) => {
					const curr2 = a2.getWrap(i2 + 1); // We need to check it backwards, think: gears rotating against eachother.
					return curr1.equals(curr2, error) && next1.equals(next2, error);
				});
				return otherIndex != -1;
			}),
			other: otherIndex,
		};
	}
	/**
	 * Return a new instance stitched together from them, if they share a face, otherwise null.
	 */
	TryMergeAtEdge(other: PolygonXZ, error: number = 0.05): PolygonXZ | null {
		const sharedEdges = this.FindSharedEdgeIndex(other, error);
		if (sharedEdges.self == -1) return null;

		const points: Vec3[] = [
			...this.points.slice(0, sharedEdges.self),
			...other.points.slice(sharedEdges.other + 1),
			...other.points.slice(0, sharedEdges.other),
			...this.points.slice(sharedEdges.self + 1),
		];
		if (points.length != other.points.length + this.points.length - 2) throw new Error(`Merged incorrectly!`);

		return new PolygonXZ(points).RemoveInternalPoints();
	}
	/**
	 * Alters this instance.
	 */
	RemoveInternalPoints() {
		const internalPoints: number[] = [];

		this.forEachTriplet((prev, curr, next, i) => {
			if (prev.equals(next)) {
				internalPoints.push(i, WrapIndex(i + 1, this.points.length));
			}
		});

		internalPoints
			.sort()
			.reverse()
			.forEach((e) => this.removePoint(e));
		return this;
	}
	/**
	 * Alters this instance.
	 */
	RemoveFlatPoints(maxAngleDeviance: number = 0.2617994) {
		const flatPoints: number[] = [];

		const rangeMin = maxAngleDeviance;
		const rangeMax = Math.PI - maxAngleDeviance;

		this.forEachTriplet((prev, curr, next, i) => {
			const angle = GetAngle(prev.minus(curr).unit(), next.minus(curr).unit());
			if (angle < rangeMin || angle > rangeMax) {
				flatPoints.unshift(i);
			}
		});

		flatPoints.forEach((e) => this.removePoint(e));
		return this;
	}
	/**
	 * Alters this instance.
	 */
	RemoveSmallSides(treshhold: number = 1) {
		const points: number[] = [];
		const newPoints: Vec3[] = [];

		const sqrt_tresh = treshhold * treshhold;

		this.forEachSide((curr, next, i) => {
			if (curr.distanceSquared(next) < sqrt_tresh) {
				points.unshift(i);
				newPoints.unshift(curr.plus(next).scale(0.5));
			}
		});

		points.forEach((sideIndex, i) => {
			this.insert(newPoints[i], sideIndex);
			if (sideIndex + 1 >= this.points.length) {
				this.removePoint(sideIndex + 1);
				this.removePoint(sideIndex);
			} else {
				this.removePoint(sideIndex);
				this.removePoint(sideIndex + 1);
			}
		});
		return this;
	}
	/**
	 * Returns an array of new instances.
	 */
	MergeTriangulate() {
		let mergedPolis: PolygonXZ[] = this.Triangulate();

		while (mergedPolis.length > 0) {
			const poli = mergedPolis.shift();
			if (poli.GetSideCount() != 3) {
				mergedPolis.push(poli);
				break;
			}

			let largestSideWith: number = -1;
			let largestSideLength: number = 0;

			for (let i = 0; i < mergedPolis.length; i++) {
				const other_poli = mergedPolis[i];
				const edge = poli.FindSharedEdgeIndex(other_poli);
				if (edge.self == -1) continue;

				const length = poli.GetSideLength(edge.self);
				if (largestSideWith != null && largestSideLength > length) continue;

				largestSideWith = i;
				largestSideLength = length;
			}

			if (largestSideWith == -1) {
				mergedPolis.push(poli);
				break;
			}

			mergedPolis.push(poli.TryMergeAtEdge(mergedPolis.splice(largestSideWith, 1)[0]));
		}
		return mergedPolis;
	}
	RemoveSelfIntersections() {
		/**
		 *  We go along edge:
		 *  If we intersect
		 *      we push intersection point,
		 *      make current side the intersected side,
		 *      reverse the ittertation direction
		 *  else just push the current side
		 */

		let newPoints: Vec3[] = [this.points[0]];
		let reverseDir = false;

		let i = 1;
		while (true) {
			const line11 = newPoints[newPoints.length - 1].clone();
			const line12 = this.points[WrapIndex(i, this.points.length)].clone();

			// console.log(line11, line12, i)
			if (newPoints.length > 1 && line11.equals(newPoints[0])) break;

			// Find intersected sides
			const intersect = this.FindNearestIntersection(line11, line12, [i]);

			if (intersect != null) {
				// console.log("Intersection", i, nearestIntersectSideIndex, nearestIntersectPoint)

				if (reverseDir) intersect.side += 1;
				reverseDir = !reverseDir;
				i = intersect.side;
				newPoints.push(intersect.point);
			} else {
				// console.log("Straight")

				newPoints.push(line12);

				if (reverseDir) i--;
				else i++;
			}
		}
		this.points = newPoints.slice(0, -1);
		return this;
	}
	/**
	 * Returns two new instances.
	 */
	SplitPolygon(position: Vec3, normal: Vec3, error: number = 0.1) {
		normal = normal.unit();
		const normal90 = RotateVector90CW_YAxis(normal);

		const clonePolygon = this.mapClone((e) => e);

		const size = clonePolygon.points.reduce((a, b, i) => a.add(b.projectedOnto(normal90).abs()), new Vec3(0, 0, 0));

		const line1 = normal90.scaled(size.norm());
		const line2 = RotateVector180_YAxis(line1);

		line1.add(position);
		line2.add(position);

		clonePolygon
			.FindIntersections(line1, line2, [], error)
			.reverse()
			.forEach((e) => clonePolygon.insert(e.point, e.side));
		// clonePolygon.FindIntersections(line2, line1, [], error).reverse().forEach(e => clonePolygon.insert(e.point, e.side))

		const points1: Vec3[] = [];
		const points2: Vec3[] = [];

		clonePolygon.forEach((e) => {
			const value = IsLeftOfLineXZ(line1, line2, e);
			if (value > error) points1.push(e);
			else if (value < -error) points2.push(e);
			else {
				points1.push(e);
				points2.push(e);
			}
		});

		const resultArray: PolygonXZ[] = [new PolygonXZ(points1), new PolygonXZ(points2)];

		// const debugGrid = new DynamicGrid3D<string>(" .");
		// clonePolygon.DrawToGrid(debugGrid, "[]")
		// resultArray[0]?.DrawToGrid(debugGrid, "[]")
		// resultArray[1]?.DrawToGrid(debugGrid, "[]")
		// BresenhamLine(
		//     normal90.scaled(10).plus(position),
		//     RotateVector180_YAxis(normal90.scaled(10)).plus(position)
		// ).forEach(e => debugGrid.setValue(e.floor(), "XX"))
		// BresenhamLine(
		//     position,
		//     position.plus(normal.scaled(10))
		// ).forEach(e => debugGrid.setValue(e.floor(), "??"))
		// debugGrid.print(0)

		return resultArray;
	}
	/**
	 * Returns two new instances.
	 */
	SplitPolygonAlongAxis(axis: Vec3, t: number = 0, error: number = 0.1) {
		axis = axis.unit();

		const projectedPoints = this.map((e) => {
			const res = e.projectedOnto(axis);
			return {
				vec: res,
				len: res.sqrtLength(),
			};
		});

		let max = projectedPoints[0];
		let min = projectedPoints[0];

		for (const p of projectedPoints) {
			if (p.len > max.len) max = p;
			else if (p.len < min.len) min = p;
		}

		const projectionCenterPoint = LerpVector(min.vec, max.vec, t);

		return this.SplitPolygon(projectionCenterPoint, axis, error);

		// axis = axis.unit()
		// const axis90 = RotateVector90CW_YAxis(axis);

		// const clonePolygon = this.mapClone(e => e)

		// const projectedPoints = clonePolygon.points.map(e => {
		//     const res = e.projectedOnto(axis);
		//     return {
		//         vec: res,
		//         len: res.sqrtLength()
		//     }
		// })

		// let max = projectedPoints[0]
		// let min = projectedPoints[0]

		// for (const p of projectedPoints) {
		//     if (p.len > max.len) max = p;
		//     else if (p.len < min.len) min = p;
		// }
		// const size = projectedPoints.reduce((a, b, i) => a.add(clonePolygon.points[i].minus(b.vec).abs()), new Vec3(0, 0, 0))

		// const projectionCenterPoint = LerpVector(min.vec, max.vec, t);
		// const line1 = axis90.scaled(size.norm() / 2);
		// const line2 = RotateVector180_YAxis(line1);

		// line1.add(projectionCenterPoint)
		// line2.add(projectionCenterPoint)

		// const intersection1 = clonePolygon.FindNearestIntersection(line1, line2, [], error)
		// if (intersection1) clonePolygon.insert(intersection1.point, intersection1.side)

		// const intersection2 = clonePolygon.FindNearestIntersection(line2, line1, [], error)
		// if (intersection2) clonePolygon.insert(intersection2.point, intersection2.side)

		// const points1: Vec3[] = []
		// const points2: Vec3[] = []

		// clonePolygon.forEach(e => {
		//     const value = IsLeftOfLineXZ(line1, line2, e);
		//     if (value > error) points1.push(e)
		//     else if (value < -error) points2.push(e)
		//     else {
		//         points1.push(e)
		//         points2.push(e)
		//     }
		// })

		// const resultArray: PolygonXZ[] = []

		// if (points1.length >= 3) resultArray.push(new PolygonXZ(points1))
		// if (points2.length >= 3) resultArray.push(new PolygonXZ(points2))
		// if (resultArray.length <= 0) resultArray.push(this)

		// return resultArray
	}
	/**
	 * Alters this instance.
	 */
	ApplyPullForces(itter: number = 1, scalar: number = 1) {
		scalar = scalar * 0.1;
		for (let itt = 0; itt < itter; itt++) {
			this.mapSelf((curr, i, a) => {
				const prev = a[WrapIndex(i - 1, a.length)].minus(curr).scale(scalar);
				const next = a[WrapIndex(i + 1, a.length)].minus(curr).scale(scalar);

				return curr.plus(prev).plus(next);
			});
		}
		return this;
	}
	FindNearestIntersection(
		start: Vec3,
		end: Vec3,
		skip: number[] = [],
		error: number = 0.05
	): { point: Vec3; side: number; distance: number } | null {
		let nearestIntersectPoint: Vec3 = null;
		let nearestIntersectSideIndex: number = -1;
		let nearestIntersectDist: number = Number.MAX_SAFE_INTEGER;
		this.forEachSide((line21, line22, i2) => {
			if (skip.includes(i2)) return;

			// if (
			//     line21.equals(start, error) ||
			//     line22.equals(start, error) ||
			//     line21.equals(end, error) ||
			//     line22.equals(end, error)
			// ) return;

			// console.log("Comparing", start, end, line21, line22)
			const inter = FindIntersectionXZ(start, end, line21, line22, error);
			if (
				!inter ||
				inter.equals(start, error)
				// inter.equals(end, error) ||
				// inter.equals(line21, error) ||
				// inter.equals(line22, error)
			)
				return;
			// console.log("Intersection", inter)

			const dist = start.distanceSquared(inter);
			if (nearestIntersectPoint != null && nearestIntersectDist < dist) return;

			nearestIntersectSideIndex = i2;
			nearestIntersectPoint = inter;
			nearestIntersectDist = dist;
		});

		if (nearestIntersectPoint == null) return null;

		return {
			point: nearestIntersectPoint,
			side: nearestIntersectSideIndex,
			distance: nearestIntersectDist,
		};
	}
	FindIntersections(start: Vec3, end: Vec3, skip: number[] = [], error: number = 0.05): { point: Vec3; side: number }[] {
		return this.mapSides((line21, line22, i2) => {
			if (skip.includes(i2)) return null;
			const inter = FindIntersectionXZ(start, end, line21, line22, error);
			if (!inter) return null;
			return {
				point: inter,
				side: i2,
			};
		}).filter((e) => e);
	}
	DrawToGrid<T>(grid: DynamicGrid3D<T>, value: T, yPos: number = 0, pos: Vec3 = new Vec3(0, 0, 0)) {
		const final_pos = pos.offset(0, yPos, 0);
		return this.forEachSide((a, b) =>
			BresenhamLine(a.plus(final_pos).floor(), b.plus(final_pos).floor()).forEach((e) => grid.setValue(e, value))
		);
	}
	DeRasterizePolygon<T>(grid: DynamicGrid3D<T>, value: T, pos1: Vec3, pos2: Vec3) {
		throw new Error("Unimplemented exception!");
	}

	/**
	 * Alters this instance.
	 */
	DeflatePolygon(scalar: number) {
		const vectors: Vec3[] = [];

		this.forEach((curr, index) => {
			vectors.push(
				this.GetSideNormal(index)
					.unit()
					.add(this.GetSideNormal(index - 1).unit())
					.unit()
			);
		});

		return this.mapSelf((p, i) => p.minus(vectors[i].scale(scalar)));
	}
	FixWinding() {
		if (this.GetArea() < 0) this.points.reverse(); // is counter clockwise then reverse
		return this;
	}

	//#region pretend your an array
	forEachTriplet(callback: (prev: Vec3, curr: Vec3, next: Vec3, index: number) => void) {
		for (let i = 0; i < this.points.length; i++) {
			const prev = this.points[i - 1] ?? this.points[this.points.length - 1];
			const curr = this.points[i];
			const next = this.points[i + 1] ?? this.points[0];

			callback(prev.clone(), curr.clone(), next.clone(), i);
		}
		return this;
	}
	forEachSide(callback: (curr: Vec3, next: Vec3, index: number, array: Vec3[]) => void) {
		const arrayClone = this.GetPoints();
		for (let i = 0; i < this.points.length; i++) {
			const curr = this.points[i];
			const next = this.points[i + 1] ?? this.points[0];

			callback(curr.clone(), next.clone(), i, arrayClone);
		}
		return this;
	}
	forEachSideNormal(callback: (curr: Vec3, next: Vec3, normal: Vec3, index: number, array: Vec3[]) => void) {
		const arrayClone = this.GetPoints();
		const eY = new Vec3(0, 1, 0);
		for (let i = 0; i < this.points.length; i++) {
			const curr = this.points[i];
			const next = this.points[i + 1] ?? this.points[0];
			const normal = next.minus(curr).cross(eY);

			callback(curr.clone(), next.clone(), normal, i, arrayClone);
		}
		return this;
	}
	forEach(callback: (pos: Vec3, index: number, array: Vec3[]) => void) {
		const arrayClone = this.GetPoints();
		for (let i = 0; i < this.points.length; i++) {
			callback(this.points[i].clone(), i, arrayClone);
		}
		return this;
	}
	map<T>(callback: (pos: Vec3, index: number, array: Vec3[]) => T): T[] {
		const result: T[] = [];
		this.forEach((p, i, a) => {
			result.push(callback(p, i, a));
		});
		return result;
	}
	mapClone(callback: (pos: Vec3, index: number, array: Vec3[]) => Vec3): PolygonXZ {
		return new PolygonXZ(this.map(callback));
	}
	mapSides<T>(callback: (curr: Vec3, next: Vec3, index: number, array: Vec3[]) => T) {
		const result: T[] = [];
		const arrayClone = this.GetPoints();
		this.forEachSide((a, b, i) => {
			result.push(callback(a, b, i, arrayClone));
		});
		return result;
	}
	insert(pos: Vec3, sideIndex: number) {
		sideIndex = WrapIndex(sideIndex, this.points.length);
		this.points = [...this.points.slice(0, sideIndex + 1), new Vec3(pos.x, 0, pos.z), ...this.points.slice(sideIndex + 1)];
		return this;
	}
	push(pos: Vec3) {
		this.points.push(new Vec3(pos.x, 0, pos.z));
		return this;
	}
	removePoint(i: number) {
		return this.points.splice(WrapIndex(i, this.points.length), 1);
	}
	mapSelf(callback: (pos: Vec3, index: number, array: Vec3[]) => Vec3) {
		this.points = this.map(callback).map((e) => e.clone());
		return this;
	}
	find(callback: (pos: Vec3, index: number, array: Vec3[]) => boolean) {
		const arrayClone = this.GetPoints();
		for (let i = 0; i < this.points.length; i++) {
			if (callback(this.points[i].clone(), i, arrayClone)) {
				return this.points[i].clone();
			}
		}
		return null;
	}
	findIndex(callback: (pos: Vec3, index: number, array: Vec3[]) => boolean) {
		const arrayClone = this.GetPoints();
		for (let i = 0; i < this.points.length; i++) {
			if (callback(this.points[i].clone(), i, arrayClone)) {
				return i;
			}
		}
		return -1;
	}
	//#endregion

	toString() {
		return `[\n${this.map((e) => `   new Vec3${e.toString()}`).join(",\n")}\n]`;
	}
}
