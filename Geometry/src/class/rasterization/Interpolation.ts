import { Vector } from "../math/Vector";

export function Lerp(a: number, b: number, t: number) {
	return a * (1 - t) + b * t;
}
export function LerpVector(a: Vector, b: Vector, t: number): Vector {
	return a.mapClone((e, i) => Lerp(e, b.get(i), t));
}
