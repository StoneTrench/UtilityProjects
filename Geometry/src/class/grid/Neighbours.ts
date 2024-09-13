import { Vector } from "../math/Vector";

/**
 * An array of vectors representing neighbors in the Y axis plane.
 */
export const neighboursCheckY: readonly Vector[] = [
	new Vector(0, 0, 1),
	new Vector(1, 0, 1),
	new Vector(1, 0, 0),
	new Vector(1, 0, -1),
	new Vector(0, 0, -1),
	new Vector(-1, 0, -1),
	new Vector(-1, 0, 0),
	new Vector(-1, 0, 1),
] as const;

/**
 * An array of vectors representing axis-aligned neighbors in the Y axis plane.
 */
export const neighboursCheckAxisY: readonly Vector[] = [
	new Vector(0, 0, 1),
	new Vector(1, 0, 0),
	new Vector(0, 0, -1),
	new Vector(-1, 0, 0),
] as const;

/**
 * An array of vectors representing 3D neighbors for a given point.
 */
export const neighboursCheck3D: readonly Vector[] = [
	// List of vectors representing all possible neighbors in 3D space.
	new Vector(-1, -1, 0),
	new Vector(-1, 0, 0),
	new Vector(-1, 1, 0),
	new Vector(-1, 1, -1),
	new Vector(-1, 1, 1),
	new Vector(-1, -1, 1),
	new Vector(0, -1, 1),
	new Vector(1, -1, 1),
	new Vector(1, -1, -1),
	new Vector(1, -1, 0),
	new Vector(-1, -1, -1),
	new Vector(0, -1, -1),
	new Vector(1, 0, -1),
	new Vector(1, 1, -1),
	new Vector(0, 0, -1),
	new Vector(0, 1, -1),
	new Vector(0, 1, 0),
	new Vector(0, 1, 1),
	new Vector(-1, 0, 1),
	new Vector(0, 0, 1),
	new Vector(1, 0, 1),
	new Vector(1, 0, 0),
	new Vector(1, 1, 0),
	new Vector(1, 1, 1),
];
