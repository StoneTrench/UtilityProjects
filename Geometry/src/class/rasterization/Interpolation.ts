import { Vector } from "../Vector";

export function Lerp(a: number, b: number, t: number) {
	return a * (1 - t) + b * t;
}
export function LerpVector(a: Vector, b: Vector, t: number): Vector {
	return a.mapClone((e, i) => Lerp(e, b.get(i), t));
}

export function BezierLerp4(n0: number, n1: number, n2: number, n3: number, t: number) {
	// f(x) = ((((((n_0) * (1 - x)) + ((n_1) * x)) * (1 - x)) + ((((n_1) * (1 - x)) + ((n_2) * x)) * x)) * (1 - x)) + ((((((n_1) * (1 - x)) + ((n_2) * x)) * (1 - x)) + ((((n_2) * (1 - x)) + ((n_3) * x)) * x)) * x)

	const t2 = t * t;
	const t3 = t2 * t;
	return n0 - n0 * t3 + 3 * t2 * n2 - 3 * t3 * n2 + 3 * t * n1 + 3 * t3 * n1 + t3 * n3 - 3 * t * n0 + 3 * t2 * n0 - 6 * t2 * n1;
}
export function BezierLerp4Derivative(n0: number, n1: number, n2: number, n3: number, t: number) {
	// f(x)' = 9n_1x^2+3n_3x^2-3n_0x^2-9n_2x^2+6n_0x+6n_2x-12n_1x+3n_1-3n_0

	const t2 = t * t;
	return 9 * n1 * t2 + 3 * n3 * t2 - 3 * n0 * t2 - 9 * n2 * t2 + 6 * n0 * t + 6 * n2 * t - 12 * n1 * t + 3 * n1 - 3 * n0;
}
export function BezierCurve4(n0: Vector, n1: Vector, n2: Vector, n3: Vector, t: number) {
	return n0.mapClone((n0e, i) => BezierLerp4(n0e, n1.get(i), n2.get(i), n3.get(i), t));
}
export function BezierCurve4Derivative(n0: Vector, n1: Vector, n2: Vector, n3: Vector, t: number) {
	return n0.mapClone((n0e, i) => BezierLerp4Derivative(n0e, n1.get(i), n2.get(i), n3.get(i), t));
}