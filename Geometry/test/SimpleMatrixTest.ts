import { CreateTransformMatrix4x4, MConst, InvertMatrix4x4, PrintMatrix4x4, Vector, MatrixMultiplyVector4x4, MatrixMultiplyMatrix4x4 } from "../src/geometry";


export function TestSimpleMatrix() {
	function assert(condition: boolean, message: string) {
		if (!condition) throw new Error(`Assertion failed: ${message}`);
	}
	console.log("Simple Matrix testing started!");

	const mat = CreateTransformMatrix4x4(7, 5, 100, MConst.rad30);
	const inverse = InvertMatrix4x4(mat);
	const res = MatrixMultiplyMatrix4x4(mat, inverse);
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
