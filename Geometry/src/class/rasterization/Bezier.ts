import { Vector } from "../math/Vector";
import { BezierCurve4, BezierCurve4Derivative } from "./Interpolation";

/**
 *
 * @param splinePoints first two and last two make a spline, then all the others have 3 vectors per spline [0,0, 1,1,1, 2,2,2, 3,3]
 * @param t
 */
export function BezierSplines(splinePoints: Vector[], t: number): Vector {
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

	return BezierCurve4(
		splinePoints[splineIndex],
		splinePoints[splineIndex + 1],
		splinePoints[splineIndex + 2],
		splinePoints[splineIndex + 3],
		splineT
	);
}
export function BezierSplinesWithDerivative(splinePoints: Vector[], t: number): [Vector, Vector] {
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
		BezierCurve4(
			splinePoints[splineIndex],
			splinePoints[splineIndex + 1],
			splinePoints[splineIndex + 2],
			splinePoints[splineIndex + 3],
			splineT
		),
		BezierCurve4Derivative(
			splinePoints[splineIndex],
			splinePoints[splineIndex + 1],
			splinePoints[splineIndex + 2],
			splinePoints[splineIndex + 3],
			splineT
		),
	];
}
