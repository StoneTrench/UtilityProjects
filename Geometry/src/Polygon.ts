import { InsertIntoArray, WrapGet } from "./ArrayUtils";
import {
	BreakPredicateFunction,
	ForEachFunction,
	IArrayLike,
	IArrayLikeComparison,
	IArrayLikeDelete,
	IArrayLikeFiltering,
	IArrayLikeHelper,
	IArrayLikeMapping,
	IArrayLikeSearch,
	IArrayLikeStack,
	MapFunction,
	PredicateFunction,
	ReduceFunction,
	SHOULD_BREAK,
} from "./IArrayFunctions";
import { WrapIndex } from "./MathUtils";
import { Segment } from "./Segment";
import { Vector } from "./math/Vector";

const ERROR_INCORRECT_DIMENSIONS = "You can only have 2D vectors in a polygon!";

/**
 * Clockwise
 */
export class Polygon
	implements
		IArrayLikeMapping<Vector, number>,
		IArrayLikeStack<Vector, number>,
		IArrayLikeFiltering<Vector, number>,
		IArrayLikeComparison<Vector, number>,
		IArrayLikeDelete<Vector, number>,
		IArrayLikeSearch<Vector, number>
{
	private points: Vector[];
	private max: Vector;
	private min: Vector;

	constructor(points: Vector[]) {
		if (points.some((e) => e.getDimensions() != 2)) throw new Error(ERROR_INCORRECT_DIMENSIONS);
		this.points = [];
		points.forEach((e) => this.push(e));
	}

	//#region Interface
	find(predicate: PredicateFunction<Vector, number, this>): [number, Vector] {
		return IArrayLikeHelper.Find(this, predicate);
	}
	findElement(predicate: PredicateFunction<Vector, number, this>): Vector {
		return IArrayLikeHelper.FindElement(this, predicate);
	}
	findIndex(predicate: PredicateFunction<Vector, number, this>): number | undefined {
		return IArrayLikeHelper.FindIndex(this, predicate);
	}

	every(predicate: PredicateFunction<Vector, number, this>): boolean {
		return IArrayLikeHelper.Every(this, predicate);
	}
	some(predicate: PredicateFunction<Vector, number, this>): boolean {
		return IArrayLikeHelper.Some(this, predicate);
	}

	reduce<t>(func: ReduceFunction<Vector, number, t, this>, initialValue: t): t {
		return IArrayLikeHelper.Reduce(this, initialValue, func);
	}
	filter(predicate: PredicateFunction<Vector, number, this>): IArrayLike<Vector, number> {
		return IArrayLikeHelper.FilterPush(this, new Polygon([]), predicate);
	}

	mapClone<t>(func: MapFunction<Vector, number, t, this>): Polygon {
		return IArrayLikeHelper.MapClone(this, new Polygon([]), func);
	}
	map<t>(func: MapFunction<Vector, number, t, this>): t[] {
		return IArrayLikeHelper.Map(this, func);
	}

	forEach(func: ForEachFunction<Vector, number, this>): this {
		for (let i = 0; i < this.length; i++) {
			func(this.get(i), i, this);
		}
		return this;
	}
	forEachBreak(func: BreakPredicateFunction<Vector, number, this>): number | undefined {
		for (let i = 0; i < this.length; i++) {
			if (func(this.get(i), i, this) == SHOULD_BREAK.YES) return i;
		}
		return undefined;
	}

	push(value: Vector) {
		this.set(this.length, value);
		return this;
	}
	unshift(value: Vector): this {
		this.set(-1, value);
		return this;
	}
	pop(): Vector | undefined {
		return this.deleteAt(-1);
	}
	shift(): Vector | undefined {
		return this.deleteAt(0);
	}

	get length(): number {
		return this.points.length;
	}
	get first(): Vector | undefined {
		return this.get(0);
	}
	get last(): Vector | undefined {
		return this.get(-1);
	}

	deleteAt(index?: number): Vector {
		return this.points.splice(WrapIndex(index, this.points.length), 1)[0];
	}

	get(index: number) {
		return WrapGet(this.points, index).clone();
	}
	set(index: number, value: Vector) {
		if (value.getDimensions() != 2) throw new Error(ERROR_INCORRECT_DIMENSIONS);

		if (index == this.length) this.points.push(value.clone());
		else if (index == -1) this.points.unshift(value.clone());
		else this.points[WrapIndex(index, this.points.length)] = value.clone();

		if (this.max == undefined || this.min == undefined) {
			this.max = value.clone();
			this.min = value.clone();
		} else {
			this.max.update(this.max.max(value).toArray());
			this.min.update(this.min.min(value).toArray());
		}

		return this;
	}
	//#endregion

	forEachSide(func: ForEachFunction<[Vector, Vector], number, this>): this {
		return this.forEach((e, i, a) => func([e, this.get(i + 1)], i, a));
	}
	forEachTriplet(func: ForEachFunction<[Vector, Vector, Vector], number, this>): this {
		return this.forEach((e, i, a) => func([this.get(i - 1), e, this.get(i + 1)], i, a));
	}
	getMeanVector() {
		return this.reduce((a, b) => a.plus(b), new Vector(0, 0)).scale(1 / this.length);
	}
	getArea() {
		let result = 0;
		this.forEachSide(([curr, next]) => (result += (curr.y + next.y) * (next.x - curr.x)));
		return result / 2;
	}
	getCircumference() {
		let value = 0;
		this.forEachSide(([c, n]) => (value += c.distanceTo(n)));
		return value;
	}
	get aabb_min() {
		return this.min.clone();
	}
	get aabb_max() {
		return this.max.clone();
	}
	get aabb_size() {
		return this.max.minus(this.min);
	}

	isInsideBoundingBox(point: Vector) {
		return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y;
	}
	isInternal(point: Vector, error: number = 0.05) {
		if (!this.isInsideBoundingBox(point)) return false;

		const lineEnd = point.offset(this.aabb_size.x, Math.random());

		const intersectionCount = this.reduce((res, curr, i, s) => {
			const next = s.get(i + 1);

			// if (curr.equals(point, error) || curr.equals(lineEnd, error) || next.equals(point, error) || next.equals(lineEnd, error))
			// 	return res + 1;

			const intersection1 = Segment.Intersection2D(curr, next, point, lineEnd, error);
			if (intersection1 == undefined) return res;

			return res + 1;
		}, 0);

		if (intersectionCount > 0 && intersectionCount % 2 == 1) return true;
		return false;
	}

	splitLargeSides(max_length: number) {
		const max_length2 = max_length * max_length;

		let newPoints: Vector[] = [this.first];
		let new_i = 0;
		let poly_i = 0;
		while (true) {
			const curr: Vector = newPoints[new_i];
			let next: Vector | undefined = newPoints[new_i + 1];

			if (next == undefined) {
				poly_i++;
				if (poly_i >= this.length) break;
				next = this.get(poly_i);
				newPoints.push(next);
			}

			if (curr.distanceSquared(next) > max_length2) InsertIntoArray(newPoints, new_i + 1, curr.plus(next).scale(0.5));
			else new_i++;
		}

		return new Polygon(newPoints);
	}

	getSegments() {
		const segments = this.reduce((res, curr) => {
			res.push([curr, undefined]);
			if (res.length == 1) return res;

			res[res.length - 2][1] = curr.clone();
			return res;
		}, [] as [Vector, Vector][]);

		segments[segments.length - 1][1] = this.first.clone();

		return segments;
	}

	/**
	 * @returns [this index, other index]
	 */
	findSharedSegment(other: Polygon, error: number = 0.05): [number, number] | undefined {
		let otherIndex = undefined;
		const selfIndex = this.findIndex((curr1, i1, a1) => {
			const next1 = a1.get(i1 + 1);

			otherIndex = other.findIndex((next2, i2, a2) => {
				const curr2 = a2.get(i2 + 1); // We need to check it backwards, think: gears rotating against eachother.
				return curr1.equals(curr2, error) && next1.equals(next2, error);
			});
			return otherIndex != undefined;
		});

		if (selfIndex == undefined || otherIndex == undefined) return undefined;
		return [selfIndex, otherIndex];
	}

	mergedAtSharedSegment(other: Polygon, error: number = 0.05): Polygon | undefined {
		const sharedEdges = this.findSharedSegment(other, error);
		if (sharedEdges == undefined) return undefined;

		const points: Vector[] = [
			...this.points.slice(0, sharedEdges[0]),
			...other.points.slice(sharedEdges[1] + 1),
			...other.points.slice(0, sharedEdges[1]),
			...this.points.slice(sharedEdges[0] + 1),
		];
		if (points.length != other.points.length + this.points.length - 2) throw new Error(`Polygons merged incorrectly!`);

		return new Polygon(points);
	}

	removeInternalPoints() {
		while (true) {
			const internalPoints: number[] = [];

			this.forEachTriplet(([prev, curr, next], i) => {
				if (prev.equals(next)) internalPoints.push(i, WrapIndex(i + 1, this.points.length));
			});

			if (internalPoints.length == 0) break;
			internalPoints.sort((a, b) => b - a).forEach((e) => this.deleteAt(e));
		}
		return this;
	}
}
