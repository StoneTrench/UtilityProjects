import { Vector } from "./Vector";

export class Polygon {
	private points: Vector[];

	constructor(points: Vector[]) {
        
    }
    push(point: Vector){
        if (point.getDimensions() > 2) throw new Error("")
    }
}
