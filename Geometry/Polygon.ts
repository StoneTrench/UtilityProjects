import {
	IArrayLikeMapping,
	IArrayLikeStack,
	IArrayLikeFiltering,
	ReduceFunction,
	IArrayLikeHelper,
	PredicateFunction,
	IArrayLike,
	MapFunction,
	ForEachFunction,
	BreakPredicateFunction,
	SHOULD_BREAK,
	IArrayLikeComparison,
	IArrayLikeDelete,
} from "./IArrayFunctions";
import { WrapGet, WrapIndex } from "./MathUtils";
import { Segment } from "./Segment";
import Vector from "./Vector";

const ERROR_INCORRECT_DIMENSIONS = "You can only have 2D vectors in a polygon!";

/**
 * Counter-Clockwise
 */
export default class Polygon
	implements
		IArrayLikeMapping<Vector, number>,
		IArrayLikeStack<Vector, number>,
		IArrayLikeFiltering<Vector, number>,
		IArrayLikeComparison<Vector, number>,
		IArrayLikeDelete<Vector, number>
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
		return IArrayLikeHelper.Filter(this, new Polygon([]), predicate);
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
		this.forEachSide(([curr, next]) => (result += (curr.y + next.y) * (curr.x - next.x)));
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

		const lineEnd = point.offset(this.aabb_size.x);

		const intersectionCount = this.reduce((res, curr, i, s) => {
			const next = s.get(i + 1);

			const intersection = Segment.Intersection2D(curr, next, point, lineEnd, error);
			if (intersection === undefined) return res;

			return res + 1;
		}, 0);

		if (intersectionCount % 2 == 1) return true;
		return false;
	}
}
