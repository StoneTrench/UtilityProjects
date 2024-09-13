import { Vector } from "../math/Vector";

export namespace Bezier {
	/**
	 *
	 * @param splinePoints first two and last two make a spline, then all the others have 3 vectors per spline [0,0, 1,1,1, 2,2,2, 3,3]
	 * @param t
	 */
	export function Splines(splinePoints: Vector[], t: number): Vector {
		if ((splinePoints.length - 1) % 3 != 0)
			throw new Error("Incorrect spline point amount! Please refer to function description!");

		/**
		 * Determine which section t is in
		 * Scale t to be between 0 and 1 for that section
		 */

		if (t >= 1) return splinePoints[splinePoints.length - 1];
		if (t <= 0) return splinePoints[0];

		const splineMaxIndex = (splinePoints.length - 1) / 3;

		const totalSplineT = t * splineMaxIndex;
		let splineIndex = Math.floor(totalSplineT);
		const splineT = totalSplineT - splineIndex;
		splineIndex *= 3;

		return VectorCubic(
			splinePoints[splineIndex],
			splinePoints[splineIndex + 1],
			splinePoints[splineIndex + 2],
			splinePoints[splineIndex + 3],
			splineT
		);
	}
	export function SplinesWithDerivative(splinePoints: Vector[], t: number): [Vector, Vector] {
		if ((splinePoints.length - 1) % 3 != 0)
			throw new Error("Incorrect spline point amount! Please refer to function description!");

		/**
		 * Determine which section t is in
		 * Scale t to be between 0 and 1 for that section
		 */

		if (t >= 1) return [splinePoints[splinePoints.length - 1], new Vector()];
		if (t <= 0) return [splinePoints[0], new Vector()];

		const splineMaxIndex = (splinePoints.length - 1) / 3;

		const totalSplineT = t * splineMaxIndex;
		let splineIndex = Math.floor(totalSplineT);
		const splineT = totalSplineT - splineIndex;
		splineIndex *= 3;

		return [
			VectorCubic(
				splinePoints[splineIndex],
				splinePoints[splineIndex + 1],
				splinePoints[splineIndex + 2],
				splinePoints[splineIndex + 3],
				splineT
			),
			VectorCubicWithDerivative(
				splinePoints[splineIndex],
				splinePoints[splineIndex + 1],
				splinePoints[splineIndex + 2],
				splinePoints[splineIndex + 3],
				splineT
			),
		];
	}

	export function Cubic(n0: number, n1: number, n2: number, n3: number, t: number) {
		// f(x) = ((((((n_0) * (1 - x)) + ((n_1) * x)) * (1 - x)) + ((((n_1) * (1 - x)) + ((n_2) * x)) * x)) * (1 - x)) + ((((((n_1) * (1 - x)) + ((n_2) * x)) * (1 - x)) + ((((n_2) * (1 - x)) + ((n_3) * x)) * x)) * x)

		const t2 = t * t;
		const t3 = t2 * t;
		return (
			n0 - n0 * t3 + 3 * t2 * n2 - 3 * t3 * n2 + 3 * t * n1 + 3 * t3 * n1 + t3 * n3 - 3 * t * n0 + 3 * t2 * n0 - 6 * t2 * n1
		);
	}
	export function CubicWithDerivative(n0: number, n1: number, n2: number, n3: number, t: number) {
		// f(x)' = 9n_1x^2+3n_3x^2-3n_0x^2-9n_2x^2+6n_0x+6n_2x-12n_1x+3n_1-3n_0

		const t2 = t * t;
		return 9 * n1 * t2 + 3 * n3 * t2 - 3 * n0 * t2 - 9 * n2 * t2 + 6 * n0 * t + 6 * n2 * t - 12 * n1 * t + 3 * n1 - 3 * n0;
	}
	export function VectorCubic(n0: Vector, n1: Vector, n2: Vector, n3: Vector, t: number) {
		return n0.mapClone((n0e, i) => Cubic(n0e, n1.get(i), n2.get(i), n3.get(i), t));
	}
	export function VectorCubicWithDerivative(n0: Vector, n1: Vector, n2: Vector, n3: Vector, t: number) {
		return n0.mapClone((n0e, i) => CubicWithDerivative(n0e, n1.get(i), n2.get(i), n3.get(i), t));
	}
}
