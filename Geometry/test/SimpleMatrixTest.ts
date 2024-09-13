import {
	CreateTransformMatrix4x4,
	InvertMatrix4x4,
	MatrixMultiplyVector4x4,
	MultiplyMatrix4x4,
	PrintMatrix4x4,
} from "../src/math/SimpleMatrix";
import { Vector } from "../src/math/Vector";
import { MConst } from "../src/MathUtils";

export function TestSimpleMatrix() {
	function assert(condition: boolean, message: string) {
		if (!condition) throw new Error(`Assertion failed: ${message}`);
	}
	console.log("Simple Matrix testing started!");

	const mat = CreateTransformMatrix4x4(7, 5, 100, MConst.rad30);
	const inverse = InvertMatrix4x4(mat);
	const res = MultiplyMatrix4x4(mat, inverse);
	console.log("Matrix (A):");
	PrintMatrix4x4(mat);
	console.log("Inverse (B):");
	PrintMatrix4x4(inverse);
	console.log("A * B = ");
	PrintMatrix4x4(res);

	const vector = new Vector(1, 0, 0, 1);
	const rot_mat = CreateTransformMatrix4x4(0, 0, 0, 0, MConst.rad90);
	const inv_rot_mat = InvertMatrix4x4(rot_mat);

	console.log(MatrixMultiplyVector4x4(vector, rot_mat).toString());
	console.log(MatrixMultiplyVector4x4(vector, inv_rot_mat).toString());

	console.log("Simple Matrix testing finished!");
}
