import {
	BreakPredicateFunction,
	ForEachFunction,
	IArrayLike,
	IArrayLikeFiltering,
	IArrayLikeHelper,
	IArrayLikeMapping,
	IArrayLikeSearch,
	MapFunction,
	PredicateFunction,
	ReduceFunction,
	SHOULD_BREAK,
} from "../IArrayFunctions";

export type TreeMapValue<K, V> = TreeMap<K, V> | V;

export class TreeMap<K, V> implements IArrayLikeSearch<V, K[]>, IArrayLikeMapping<V, K[]>, IArrayLikeFiltering<V, K[]> {
	public children: Map<K, TreeMapValue<K, V>>;

	constructor() {
		this.children = new Map();
	}

	//#region Interface
    reduce<t>(func: ReduceFunction<V, K[], t, this>, initialValue: t): t {
        return IArrayLikeHelper.Reduce(this, initialValue, func);
    }
    filter(predicate: PredicateFunction<V, K[], this>): IArrayLike<V, K[]> {
        return IArrayLikeHelper.FilterSet(this, new TreeMap<K, V>, predicate);
    }
    mapClone<t>(func: MapFunction<V, K[], t, this>) {
		return IArrayLikeHelper.MapClone(this, new TreeMap<K, t>, func);
    }
    map<t>(func: MapFunction<V, K[], t, this>): t[] {
		return IArrayLikeHelper.Map(this, func);
    }
	find(predicate: PredicateFunction<V, K[], this>): [K[], V] {
		return IArrayLikeHelper.Find(this, predicate);
	}
	findElement(predicate: PredicateFunction<V, K[], this>): V {
		return IArrayLikeHelper.FindElement(this, predicate);
	}
	findIndex(predicate: PredicateFunction<V, K[], this>): K[] {
		return IArrayLikeHelper.FindIndex(this, predicate);
	}
	forEach(func: ForEachFunction<V, K[], this>, parentKeys?: K[]): this {
		for (const [key, value] of this.children) {
			if (value instanceof TreeMap) value.forEach(func, [...parentKeys, key]);
			else func(value, [...parentKeys, key], this);
		}
		return this;
	}
	forEachBreak(func: BreakPredicateFunction<V, K[], this>, parentKeys?: K[]): K[] {
		for (const [key, value] of this.children) {
			if (value instanceof TreeMap) {
				const child_key = value.forEachBreak(func, [...parentKeys, key]);
				if (child_key != undefined) return;
			} else if (func(value, [...parentKeys, key], this) == SHOULD_BREAK.YES) return [...parentKeys, key];
		}
		return undefined;
	}
	set(index: K[], value: TreeMapValue<K, V>) {
		if (index.length > 1) {
			const child = this.children.get(index[0]);
			if (child instanceof TreeMap) {
				child.set(index.slice(1), value);
			}
		} else if (index.length == 1) this.children.set(index[0], value);
		return this;
	}
	get(index: K[]) {
		if (index.length > 1) {
			const child = this.children.get(index[0]);
			if (child instanceof TreeMap) return child.get(index.slice(1));
		} else if (index.length == 1) return this.children.get(index[0]);
		return undefined;
	}
	//#endregion
}
