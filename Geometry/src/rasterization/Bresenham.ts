import { Vector } from "../math/Vector";

export namespace Bresenham {
	export function Line3D(a: Vector, b: Vector) {
		let x0 = a.x;
		let y0 = a.y;
		let z0 = a.z;
		let x1 = b.x;
		let y1 = b.y;
		let z1 = b.z;

		const dx = Math.abs(x1 - x0);
		const sx = x0 < x1 ? 1 : -1;
		const dy = Math.abs(y1 - y0);
		const sy = y0 < y1 ? 1 : -1;
		const dz = Math.abs(z1 - z0);
		const sz = z0 < z1 ? 1 : -1;
		const dm = Math.max(dx, dy, dz);

		const result: Vector[] = [];

		x1 = dm / 2;
		y1 = x1;
		z1 = y1;
		for (let i = dm; i >= 0; i--) {
			/* loop */
			result.push(new Vector(x0, y0, z0));
			x1 -= dx;
			if (x1 < 0) {
				x1 += dm;
				x0 += sx;
			}
			y1 -= dy;
			if (y1 < 0) {
				y1 += dm;
				y0 += sy;
			}
			z1 -= dz;
			if (z1 < 0) {
				z1 += dm;
				z0 += sz;
			}
		}

		return result;
	}
}
