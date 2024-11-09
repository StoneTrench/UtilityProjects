import { AdvancedMatrix } from "../src/geometry";


export function TestMatrix() {
	function assert(condition: boolean, message: string) {
		if (!condition) throw new Error(`Assertion failed: ${message}`);
	}
	console.log("Matrix testing started!");

	// Test matrix creation
	const matrix1 = new AdvancedMatrix(2, 2, [1, 2, 3, 4]);
	assert(matrix1.toString() === "2x2\n1\t2\t\n3\t4\t\n", "Matrix 1 creation failed");

	const matrix2 = new AdvancedMatrix(2, 2, [5, 6, 7, 8]);
	assert(matrix2.toString() === "2x2\n5\t6\t\n7\t8\t\n", "Matrix 2 creation failed");

	// Test matrix addition
	const sumMatrix = matrix1.plus(matrix2);
	assert(sumMatrix?.toString() === "2x2\n6\t8\t\n10\t12\t\n", "Matrix addition failed");

	// Test matrix multiplication
	const multipliedMatrix = matrix1.multiplied(matrix2);
	assert(multipliedMatrix?.toString() === "2x2\n19\t22\t\n43\t50\t\n", "Matrix multiplication failed");

	// Test transpose
	const transposedMatrix = matrix1.transposed();
	assert(transposedMatrix.toString() === "2x2\n1\t3\t\n2\t4\t\n", "Matrix transposition failed");

	// Test determinant
	const determinant = matrix1.determinant();
	assert(determinant === -2, "Matrix determinant failed");

	// Test matrix inversion
	const invertedMatrix = matrix1.invert();
	const expectedInverted = "2x2\n-2\t1\t\n1.5\t-0.5\t\n";
	assert(invertedMatrix?.toString() === expectedInverted, "Matrix inversion failed");

	// Test if matrix is identity
	const identityMatrix = new AdvancedMatrix(2, 2, [1, 0, 0, 1]);
	assert(identityMatrix.isIdentity(), "Identity matrix check failed");

	console.log("Matrix testing finished!");
}
