import { CreateTransformMatrix4x4, InvertMatrix4x4, MultiplyMatrix4x4, PrintMatrix4x4 } from "../src/class/SimpleMatrix";
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

	console.log("Simple Matrix testing finished!");
}
