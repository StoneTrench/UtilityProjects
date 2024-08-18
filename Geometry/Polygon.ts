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
} from "./IArrayFunctions";
import { WrapGet, WrapIndex } from "./MathUtils";
import Vector from "./Vector";

const ERROR_INCORRECT_DIMENSIONS = "You can only have 2D vectors in a polygon!";

export default class Polygon
	implements IArrayLikeMapping<Vector, number>, IArrayLikeStack<Vector, number>, IArrayLikeFiltering<Vector, number>
{
	private points: Vector[];

	constructor(points: Vector[]) {
		if (points.some((e) => e.getDimensions() != 2)) throw new Error(ERROR_INCORRECT_DIMENSIONS);
		this.points = points.map((e) => e.clone());
	}

	//#region Interface
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
		if (value.getDimensions() != 2) throw new Error(ERROR_INCORRECT_DIMENSIONS);
		this.points.push(value);
		return this;
	}
	unshift(value: Vector): this {
		if (value.getDimensions() != 2) throw new Error(ERROR_INCORRECT_DIMENSIONS);
		this.points.unshift(value);
		return this;
	}
	pop(): Vector | undefined {
		return this.points.pop();
	}
	shift(): Vector | undefined {
		return this.points.shift();
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

	get(index: number) {
		return WrapGet(this.points, index);
	}
	set(index: number, value: Vector) {
		if (value.getDimensions() != 2) throw new Error(ERROR_INCORRECT_DIMENSIONS);
		if (index == this.length) {
			this.points.push(value);
			return this;
		}
		this.points[WrapIndex(index, this.points.length)] = value;
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
        this.forEachSide(([curr, next]) => result += (curr.y + next.y) * (next.x - curr.x))
        return result / 2;
    }
    getCircumference() {
        let value = 0;
        this.forEachSide(([c, n]) => value += c.distanceTo(n))
        return value;
    }
}
