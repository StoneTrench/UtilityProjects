export type ForEachFunction<T, I, self = IArrayLike<T, I>> = (element: T, index: I, self: self) => void;
export type PredicateFunction<T, I, self = IArrayLike<T, I>> = (element: T, index: I, self: self) => boolean;

export type BreakPredicateFunction<T, I, self = IArrayLike<T, I>> = (element: T, index: I, self: self) => SHOULD_BREAK;

export type MapFunction<T, I, t, self = IArrayLike<T, I>> = (element: T, index: I, self: self) => t;
export type ReduceFunction<T, I, t, self = IArrayLike<T, I>> = (previous: t, current: T, currentIndex: I, self: self) => t;

export enum SHOULD_BREAK {
	NO,
	YES,
}

export interface IArrayLike<Element, Index> {
	get(index: Index): Element | undefined;
	set(index: Index, value: Element): this;
}

export interface IArrayLikeDelete<Element, Index> extends IArrayLike<Element, Index> {
	deleteAt(index?: Index): Element | undefined;
}
export interface IArrayLikeStack<Element, Index> extends IArrayLike<Element, Index> {
	push(value: Element): this;
	unshift(value: Element): this;
	pop(): Element | undefined;
	shift(): Element | undefined;
	get length(): number;

	get first(): Element | undefined;
	get last(): Element | undefined;
}
export interface IArrayLikeLoop<Element, Index> extends IArrayLike<Element, Index> {
	forEach(func: ForEachFunction<Element, Index, this>): this;
	forEachBreak(func: BreakPredicateFunction<Element, Index, this>): Index | undefined;
}

export interface IArrayLikeFiltering<Element, Index> extends IArrayLikeLoop<Element, Index> {
	reduce<t>(func: ReduceFunction<Element, Index, t, this>, initialValue: t): t;
	filter(predicate: PredicateFunction<Element, Index, this>): IArrayLike<Element, Index>;
}
export interface IArrayLikeMapping<Element, Index> extends IArrayLikeLoop<Element, Index> {
	mapClone<t>(func: MapFunction<Element, Index, t, this>): any;
	map<t>(func: MapFunction<Element, Index, t, this>): t[];
}
export interface IArrayLikeComparison<Element, Index> extends IArrayLikeLoop<Element, Index> {
	every(predicate: PredicateFunction<Element, Index, this>): boolean;
	some(predicate: PredicateFunction<Element, Index, this>): boolean;
}
export interface IArrayLikeSearch<Element, Index> extends IArrayLikeLoop<Element, Index> {
	find(predicate: PredicateFunction<Element, Index, this>): [Index, Element];
	findElement(predicate: PredicateFunction<Element, Index, this>): Element;
	findIndex(predicate: PredicateFunction<Element, Index, this>): Index | undefined;
}
export namespace IArrayLikeHelper {
	export function Reduce<T, I, t>(self: IArrayLikeFiltering<T, I>, initialValue: t, func: ReduceFunction<T, I, t>) {
		let accumulator = initialValue;

		self.forEach((element, index, arr) => {
			accumulator = func(accumulator, element, index, arr);
		});

		return accumulator;
	}
	export function FilterSet<T, I>(self: IArrayLikeFiltering<T, I>, result: IArrayLike<T, I>, predicate: PredicateFunction<T, I>): any {
		self.forEach((element, index, arr) => {
			if (predicate(element, index, arr)) {
				result.set(index, element);
			}
		});
		return result;
	}
	export function FilterPush<T, I>(self: IArrayLikeFiltering<T, I>, result: IArrayLikeStack<T, I>, predicate: PredicateFunction<T, I>): any {
		self.forEach((element, index, arr) => {
			if (predicate(element, index, arr)) {
				result.push(element);
			}
		});
		return result;
	}
	export function MapClone<T, I, t, res>(self: IArrayLikeMapping<T, I>, result: res, func: MapFunction<T, I, t>): res {
		self.forEach((element, index, arr) => {
			result["set"](index, func(element, index, arr));
		});
		return result;
	}
	export function Map<T, I, t>(self: IArrayLikeMapping<T, I>, func: MapFunction<T, I, t>) {
		const result: t[] = [];
		self.forEach((element, index, arr) => {
			result.push(func(element, index, arr));
		});
		return result;
	}
	export function Every<T, I>(self: IArrayLikeComparison<T, I>, predicate: PredicateFunction<T, I>) {
		let result: boolean = true;
		self.forEachBreak((element, index, arr) => {
			if (!predicate(element, index, arr)) {
				result = false;
				return SHOULD_BREAK.YES;
			}
			return SHOULD_BREAK.NO;
		});
		return result;
	}
	export function Some<T, I>(self: IArrayLikeComparison<T, I>, predicate: PredicateFunction<T, I>) {
		let result: boolean = false;
		self.forEachBreak((element, index, arr) => {
			if (predicate(element, index, arr)) {
				result = true;
				return SHOULD_BREAK.YES;
			}
			return SHOULD_BREAK.NO;
		});
		return result;
	}
	export function Find<T, I>(self: IArrayLikeSearch<T, I>, predicate: PredicateFunction<T, I>): [I, T | undefined] | undefined {
		const index = self.forEachBreak((element, index, arr) => {
			if (predicate(element, index, arr)) {
				return SHOULD_BREAK.YES;
			}
			return SHOULD_BREAK.NO;
		});
		if (index == undefined) return undefined;
		return [index, self.get(index)];
	}
	export function FindElement<T, I>(self: IArrayLikeSearch<T, I>, predicate: PredicateFunction<T, I>): T | undefined {
		const index = self.forEachBreak((element, index, arr) => {
			if (predicate(element, index, arr)) {
				return SHOULD_BREAK.YES;
			}
			return SHOULD_BREAK.NO;
		});
		if (index == undefined) return undefined;
		return self.get(index);
	}
	export function FindIndex<T, I>(self: IArrayLikeSearch<T, I>, predicate: PredicateFunction<T, I>): I | undefined {
		return self.forEachBreak((element, index, arr) => {
			if (predicate(element, index, arr)) {
				return SHOULD_BREAK.YES;
			}
			return SHOULD_BREAK.NO;
		});
	}
}
