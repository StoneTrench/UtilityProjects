import { Vector } from "./math/Vector";

export type BoundingBox = {
	min: Vector;
	max: Vector;
};

export namespace BoundingBoxHelper {
	export function IsInside(box: BoundingBox, vec: Vector) {
		return vec.toArray().every((e, i) => box.max.get(i) >= e && box.min.get(i) <= e);
	}
}
