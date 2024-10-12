import { Vector } from "../geometry";

export namespace SVGHelper {
	export function ConvertSVGPathDataToSpline(data: string): Vector[] {
		const numbers = data
			.replace(/[^0-9.-]/g, " ")
			.split(/\s/g)
			.filter((e) => e)
			.map((e) => parseFloat(e));

		const vectors: Vector[] = [];
		while (numbers.length > 0) {
			vectors.push(new Vector(numbers.shift(), numbers.shift()));
		}

		if ((vectors.length - 1) % 3 != 0) throw new Error(`Incorrectly formatted svg path data! ${data} ${vectors}`);

		/**
        So we should have { (n - 1) % 3 == 0 } vectors.

            Move vectors into spline array until the vectors array is empty.
            If we reached the end of a group, take note of the last vector, and offset the following vectors by that.
            Every time we move a vec we increment group counter, if { groupCounter == 3 } then remember the last vector to be added.
         */

		const spline: Vector[] = [vectors.shift()];
		let offsetVector = spline[0];

		while (vectors.length > 0) {
			// So we're doing the next group's first ([0]) element
			const vec = vectors.shift().add(offsetVector);
			spline.push(vec);

			if ((spline.length - 1) % 3 == 0) {
				offsetVector = vec.clone();
			}
		}
		return spline.map((e) => e);
	}
	export function ConvertSplineToSVGPathData(spline: Vector[]): string {
		if ((spline.length - 1) % 3 != 0) throw new Error("Incorrectly formatted spline data!");

		let pathData = `m ${spline[0].x.toFixed(6)},${spline[0].y.toFixed(6)} c `;
		const pathVectors: string[] = [];
		let offsetVector = spline[0];

		for (let i = 1; i < spline.length; i += 3) {
			const controlPrevEnd = spline[i].minus(offsetVector);
			const controlCurrStart = spline[i + 1].minus(offsetVector);
			const NodeCurr = spline[i + 2].minus(offsetVector);

			pathVectors.push(
				`${controlPrevEnd.x.toFixed(6)},${controlPrevEnd.y.toFixed(6)}`,
				`${controlCurrStart.x.toFixed(6)},${controlCurrStart.y.toFixed(6)}`,
				`${NodeCurr.x.toFixed(6)},${NodeCurr.y.toFixed(6)}`
			);

			offsetVector = spline[i + 2].clone();
		}

		return pathData + pathVectors.join(" ");
	}
}
