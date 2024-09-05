import {
	BreakPredicateFunction,
	ForEachFunction,
	IArrayLikeHelper,
	IArrayLikeMapping,
	MapFunction,
	SHOULD_BREAK,
} from "../../IArrayFunctions";

export type ColorChannels = "r" | "g" | "b" | "a";

export class Color implements IArrayLikeMapping<number, ColorChannels> {
	constructor(public r: number, public g: number, public b: number, public a: number) {}

	mapClone<t>(func: MapFunction<number, ColorChannels, t, this>): Color {
		return IArrayLikeHelper.MapClone(this, new Color(0, 0, 0, 0), func);
	}
	map<t>(func: MapFunction<number, ColorChannels, t, this>): t[] {
		return IArrayLikeHelper.Map(this, func);
	}
	forEach(func: ForEachFunction<number, ColorChannels, this>): this {
		func(this.r, "r", this);
		func(this.g, "g", this);
		func(this.b, "b", this);
		func(this.a, "a", this);
		return this;
	}
	forEachBreak(func: BreakPredicateFunction<number, ColorChannels, this>): ColorChannels {
		if (func(this.r, "r", this) == SHOULD_BREAK.YES) return "r";
		if (func(this.g, "g", this) == SHOULD_BREAK.YES) return "g";
		if (func(this.b, "b", this) == SHOULD_BREAK.YES) return "b";
		if (func(this.a, "a", this) == SHOULD_BREAK.YES) return "a";
		return undefined;
	}
	get(index: ColorChannels): number {
		return this[index];
	}
	set(index: ColorChannels, value: number): this {
		this[index] = value;
		return this;
	}

	applyGammaSRGB() {
		return this.mapClone((linearValue) => {
			if (linearValue <= 0.0031308) {
				return 12.92 * linearValue;
			} else {
				return 1.055 * Math.pow(linearValue, 1 / 2.4) - 0.055;
			}
		});
	}

	removeGammaSRGB() {
		return this.mapClone((srgbValue) => {
			if (srgbValue <= 0.04045) {
				return srgbValue / 12.92;
			} else {
				return Math.pow((srgbValue + 0.055) / 1.055, 2.4);
			}
		});
	}

	plus(other: Color) {
		return this.mapClone((e, i) => e + other.get(i));
	}
	minus(other: Color) {
		return this.mapClone((e, i) => e - other.get(i));
	}
	scale(scalar: number){
		return this.mapClone((e, i) => e * scalar);
	}
}
