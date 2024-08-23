import {
	BreakPredicateFunction,
	ForEachFunction,
	IArrayLikeHelper,
	IArrayLikeMapping,
	MapFunction,
	SHOULD_BREAK,
} from "../IArrayFunctions";
import Vector from "./Vector";

export default class TensorGrid<T> implements IArrayLikeMapping<T, Vector> {
	private values: { [hash: string | number | symbol]: T };
	private defaultValue: T;

	private min?: Vector;
	private max?: Vector;

	constructor(defaultValue: T) {
		this.values = {};
		this.defaultValue = defaultValue;
	}

	getMin() {
		return this.min?.clone() ?? new Vector();
	}
	getMax() {
		return this.min?.clone() ?? new Vector();
	}
	getSize() {
		return this.getMax()
			.subtract(this.getMin())
			.mapClone((e) => e + 1);
	}
	getDimensions() {
		return this.min?.getDimensions() ?? 0;
	}

	private hashVector(vec: Vector) {
		return vec.hash();
	}

	mapClone<t>(func: MapFunction<T, Vector, t, this>, defaultValue?: t): TensorGrid<t> {
		return IArrayLikeHelper.MapClone(this, new TensorGrid<t>(defaultValue), func);
	}
	map<t>(func: MapFunction<T, Vector, t, this>): t[] {
		return IArrayLikeHelper.Map(this, func);
	}
	forEach(func: ForEachFunction<T, Vector, this>): this {
		const current = this.min.clone(); // Start with the minimum values
		const dimensionCount = this.min.getDimensions();

		while (true) {
			// Call the callback with the current vector
			func(this.get(current), current.clone(), this);

			// Increment the dimensions
			let dimension = 0;
			while (dimension < dimensionCount) {
				current.set(dimension, current.get(dimension) + 1);

				// If current[dimension] exceeds max[dimension], reset it to min[dimension] and carry over to the next dimension
				if (current.get(dimension) > this.max.get(dimension)) {
					current[dimension] = this.min.get(dimension);
					dimension++;
				} else {
					break; // No carry over to the next dimension needed
				}
			}

			// If we've carried over through all dimensions, break the loop
			if (dimension === dimensionCount) {
				break;
			}
		}

		return this;
	}
	forEachBreak(func: BreakPredicateFunction<T, Vector, this>): Vector {
		const current = this.min.clone(); // Start with the minimum values
		const dimensionCount = this.min.getDimensions();

		while (true) {
			// Call the callback with the current vector
			if (func(this.get(current), current.clone(), this) == SHOULD_BREAK.YES) return current;

			// Increment the dimensions
			let dimension = 0;
			while (dimension < dimensionCount) {
				current.set(dimension, current.get(dimension) + 1);

				// If current[dimension] exceeds max[dimension], reset it to min[dimension] and carry over to the next dimension
				if (current.get(dimension) > this.max.get(dimension)) {
					current[dimension] = this.min.get(dimension);
					dimension++;
				} else {
					break; // No carry over to the next dimension needed
				}
			}

			// If we've carried over through all dimensions, break the loop
			if (dimension === dimensionCount) {
				break;
			}
		}

		return undefined;
	}
	get(index: Vector): T {
		return this.values[this.hashVector(index)] ?? this.defaultValue;
	}
	set(index: Vector, value: T): this {
		if (index == undefined) return this;

		if (this.min == undefined || this.max == undefined) {
			this.min = index.clone();
			this.max = index.clone();
		} else {
			// So remember to handle vector dimensions correctly!
			if (index.getDimensions() > this.min.getDimensions()) {
				this.min.matchedDimensions(index.getDimensions());
				this.max.matchedDimensions(index.getDimensions());
			}

			this.min = this.min.min(index);
			this.max = this.max.max(index);
		}

		if (value == undefined) return this;

		this.values[this.hashVector(index)] = value;
		return this;
	}
}
