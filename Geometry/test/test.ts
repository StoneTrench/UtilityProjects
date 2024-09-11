import { TestMatrix } from "./MatrixTest";
import { TestPathfinderWFC } from "./PathfinderTest";
import { TestRasterizer } from "./RasterizerTest";
import { TestSimpleMatrix } from "./SimpleMatrixTest";
import { TestVector } from "./VectorTest";

TestSimpleMatrix();

TestMatrix();
TestVector();

// TestPathfinderWFC();


TestRasterizer();

// const vec1 = new Vector(1, 2, 0);
// const vec2 = new Vector(0, 0, -1);
// console.log(vec1.cross(vec2));

// const poly = new Polygon([new Vector(0, 0), new Vector(0, 1), new Vector(1, 1), new Vector(1, 0)].reverse());
// console.log(poly.getArea());
// console.log(poly.getCircumference());
// console.log(poly.getMeanVector());
// console.log(poly.length);
// console.log(poly.aabb_max);
// console.log(poly.aabb_min);

// for (let x = -1; x <= 2; x += 0.1) {
// 	for (let y = -1; y <= 2; y += 0.1) {
// 		// console.log(
//         //     poly.isInternal(new Vector(x, y)),
//         //     poly.isInsideBoundingBox(new Vector(x, y)),
//         //     x, y
//         // )
// 	}
// }
