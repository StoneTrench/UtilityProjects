import { Vector } from "../math/Vector";

export function SubdivisionRasterize(func: (t: number) => Vector) {
	// 	So we start by getting the vector at `0` and at `1`
	//	We loop until `minT` is > `1`
	// 	If the vectors at `minT` and `maxT` have a max-distance (Literally the max distance function) greater than 1
	//		We add `maxT` (`1`) to `arr_maxT`
	// 		Then we split the `maxT` (`1`) in half, and get that vector
	//		We set `maxT` to the half and then we loop
	//	else
	//		We set `minT` to the previous `maxT`
	//		We pop the last element from `arr_maxT` and set `maxT` to that

	const relations: Map<number, number> = new Map();
	const vectors: Map<number, Vector> = new Map();

	const insertVector = (parent: Vector, child: Vector) => {
		// [0, 1, 2, 3, 4, 5] (2, x) => [0, 1, 2, x, 3, 4, 5]
		// forwards = [0 -> 1 -> 2 -> 3 -> 4 -> 5]

		const pHash = parent.hash();
		const cHash = child.hash();

		if (vectors.has(pHash)) relations.set(cHash, relations.get(pHash));
		relations.set(pHash, cHash);

		vectors.set(pHash, parent);
		vectors.set(cHash, child);
	};

	let minT = 0;
	let maxT = 1;

	let minVector: Vector = func(minT).rounded();
	let maxVector: Vector = func(maxT).rounded();

	const firstVector = minVector.hash();

	const arr_maxT: number[] = [1];
	const arr_maxVec: Vector[] = [maxVector];

	insertVector(minVector, maxVector);
	while (minT <= 1) {
		if (arr_maxT.length == 0) break;

		if (maxVector.minus(minVector).lengthMax() > 1) {
			arr_maxT.push(maxT);
			arr_maxVec.push(maxVector);

			maxT = (maxT - minT) * 0.5 + minT;
			maxVector = func(maxT).rounded();
			insertVector(minVector, maxVector);
		} else {
			minT = maxT;
			minVector = maxVector;

			maxT = arr_maxT.pop();
			maxVector = arr_maxVec.pop();
		}
	}

	const result: Vector[] = [vectors.get(firstVector)];
	while (true) {
		const next = relations.get(result[result.length - 1].hash());
		if (next == undefined) break;
		result.push(vectors.get(next));
	}

	return result;
}