// row x column
// i x j

// m x n
export class Matrix {
    /**
     * Column count.
     */
	n: number;
    /**
     * Row count.
     */
	m: number;
    /**
     * Flattened matrix values
     */
	matrix: number[];

	/**
	 * Constructs a new matrix.
	 * @param m - The number of rows.
	 * @param n - The number of columns.
	 * @param numbers - An optional array of matrix values. If not provided, initializes with zeros.
	 */
	constructor(m: number, n: number, numbers: number[] = undefined) {
		this.n = n;
		this.m = m;
		this.matrix = numbers;

		if (numbers == undefined) {
			this.matrix = [];
			this.forEach((i, j) => this.matrix.push(0));
		} else {
			this.matrix = [];
			this.forEach((i, j) => numbers[i + j * this.m]);
			for (let j = 0; j < this.n; j++) {
				for (let i = 0; i < this.m; i++) {
					this.matrix.push(numbers[i + j * this.m] ?? 0);
				}
			}
		}
	}

	/**
	 * Gets the element at the specified row (i) and column (j).
	 * @param i - The row index.
	 * @param j - The column index.
	 * @returns The matrix element at the given position.
	 */
	getElement(i: number, j: number) {
		return this.matrix[j + i * this.n];
	}

	/**
	 * Sets the element at the specified row (i) and column (j) to the given value.
	 * @param i - The row index.
	 * @param j - The column index.
	 * @param e - The value to set.
	 */
	setElement(i: number, j: number, e: number) {
		this.matrix[j + i * this.n] = e;
	}

	/**
	 * Returns the Harbinger sign based on the row (i) and column (j).
	 * @param i - The row index.
	 * @param j - The column index.
	 * @returns +1 for even index sums, -1 for odd.
	 */
	getHarbinger(i: number, j: number) {
		return (i + j) % 2 == 0 ? +1 : -1;
	}

	/**
	 * Converts a flattened array index to row and column indices.
	 * @param index - The flattened array index.
	 * @returns An array containing [i, j] representing row and column indices.
	 */
	getIJ(index: number) {
		return [Math.floor(index / this.m), Math.floor(index % this.m)];
	}

	/**
	 * Checks if the matrix is an identity matrix within a given error margin.
	 * @param error - The acceptable error margin.
	 * @returns True if the matrix is an identity matrix, false otherwise.
	 */
	isIdentity(error: number = 0) {
		return this.every((v, i, j) => {
			if (i === j) return Math.abs(v - 1) <= error;
			return Math.abs(v) <= error;
		});
	}

	/**
	 * Iterates over each matrix element and invokes a callback.
	 * Breaks if the callback returns true.
	 * @param callback - The function to call for each element, taking value, row index, and column index as arguments.
	 * @returns The matrix instance.
	 */
	forEachBreak(callback: (value: number, i: number, j: number) => boolean) {
		for (let j = 0; j < this.n; j++) {
			for (let i = 0; i < this.m; i++) {
				if (callback(this.getElement(i, j), i, j) === true) break;
			}
		}
		return this;
	}

	/**
	 * Iterates over each matrix element and invokes a callback.
	 * @param callback - The function to call for each element, taking value, row index, and column index as arguments.
	 * @returns The matrix instance.
	 */
	forEach(callback: (value: number, i: number, j: number) => void) {
		for (let j = 0; j < this.n; j++) {
			for (let i = 0; i < this.m; i++) {
				callback(this.getElement(i, j), i, j);
			}
		}
		return this;
	}

	/**
	 * Tests whether all elements in the matrix pass the provided function.
	 * @param callback - The function to test each element.
	 * @returns True if all elements pass the test, false otherwise.
	 */
	every(callback: (value: number, i: number, j: number) => boolean) {
		let bol = true;
		this.forEachBreak((v, i, j) => {
			bol &&= callback(v, i, j);
			if (bol == false) return true;
		});
		return bol;
	}

	/**
	 * Tests whether at least one element in the matrix passes the provided function.
	 * @param callback - The function to test each element.
	 * @returns True if any element passes the test, false otherwise.
	 */
	some(callback: (value: number, i: number, j: number) => boolean) {
		let bol = false;
		this.forEachBreak((v, i, j) => {
			bol ||= callback(v, i, j);
			if (bol == true) return true;
		});
		return bol;
	}

	/**
	 * Adds two matrices element-wise.
	 * @param other - The matrix to add.
	 * @returns A new matrix with the result or undefined if the dimensions don't match.
	 */
	plus(other: Matrix) {
		if (this.n == other.n && this.m == other.m)
			return new Matrix(
				this.m,
				this.n,
				this.matrix.map((e, i) => e + other.matrix[i])
			);
		else return undefined;
	}

	/**
	 * Multiplies this matrix by another matrix.
	 * @param other - The matrix to multiply by.
	 * @returns A new matrix with the result or undefined if the dimensions don't match.
	 */
	multiplied(other: Matrix) {
		if (this.n == other.m) {
			let aNumRows = this.m;
			let aNumCols = this.n;
			let bNumCols = other.n;

			let numbers: number[] = new Array(aNumRows * bNumCols);

			for (let r = 0; r < aNumRows; r++) {
				for (let c = 0; c < bNumCols; c++) {
					numbers[c + r * bNumCols] = 0;
					for (let i = 0; i < aNumCols; i++) {
						numbers[c + r * bNumCols] += this.getElement(r, i) * other.getElement(i, c);
					}
				}
			}

			return new Matrix(aNumRows, bNumCols, numbers);
		} else return undefined;
	}

	/**
	 * Returns the transpose of the matrix.
	 * @returns A new matrix that is the transpose of this matrix.
	 */
	transposed() {
		return new Matrix(
			this.n,
			this.m,
			this.matrix.map((e, index) => {
				let [i, j] = this.getIJ(index);
				return this.getElement(j, i);
			})
		);
	}

	/**
	 * Extracts the main diagonal elements of the matrix.
	 * @returns An array containing the main diagonal elements.
	 */
	mainDiagonal() {
		return this.matrix.filter((e, index) => {
			let [i, j] = this.getIJ(index);
			return i == j;
		});
	}

	/**
	 * Extracts the anti-diagonal elements of the matrix.
	 * @returns An array containing the anti-diagonal elements.
	 */
	antiDiagonal() {
		return this.matrix.filter((e, index) => {
			let [i, j] = this.getIJ(index);
			return i + j == this.n;
		});
	}

	/**
	 * Returns a submatrix by removing the specified row (i) and column (j).
	 * @param i - The row to remove.
	 * @param j - The column to remove.
	 * @returns A new minor matrix with one less row and column.
	 */
	getMinorMatix(i: number, j: number) {
		return new Matrix(
			this.m - 1,
			this.n - 1,
			this.matrix.filter((e, index) => {
				let [_i, _j] = this.getIJ(index);
				return !(i == _i || j == _j);
			})
		);
	}
	/**
	 * Calculates the determinant of the matrix.
	 * @returns The determinant value or undefined if the matrix is not square.
	 */
	determinant() {
		if (this.m == 1 && this.n == 1) {
			return this.matrix[0];
		} else if (this.m == 2 && this.n == 2) {
			return this.matrix[0] * this.matrix[3] - this.matrix[1] * this.matrix[2];
		} else if (this.m == this.n) {
			let result = 0;
			for (let j = 0; j < this.n; j++) {
				const A = this.getElement(0, j);
				const Harbinger = this.getHarbinger(0, j);
				const Minor = this.getMinorMatix(0, j);
				result += A * Harbinger * Minor.determinant();
			}
			return result;
		} else return undefined;
	}

	/**
	 * Scales the matrix by a given value.
	 * @param value - The scaling factor.
	 * @returns A new scaled matrix.
	 */
	scale(value: number) {
		return new Matrix(
			this.m,
			this.n,
			this.matrix.map((e) => e * value)
		);
	}

	/**
	 * Computes the adjugate (classical adjoint) of the matrix.
	 * @returns A new adjugated matrix.
	 */
	adjugated() {
		let numbers = new Array(this.m * this.n);
		for (let i = 0; i < this.m; i++) {
			for (let j = 0; j < this.n; j++) {
				numbers[j + i * this.n] = this.getMinorMatix(i, j).determinant() * this.getHarbinger(i, j);
			}
		}
		return new Matrix(this.m, this.n, numbers);
	}

	/**
	 * Inverts the matrix if possible.
	 * @returns The inverted matrix or undefined if the determinant is zero.
	 */
	invert() {
		const Det = this.determinant();
		if (Det == 0) return undefined;
		const DJI = this.adjugated().transposed();
		return DJI.scale(1 / Det);
	}

	/**
	 * Converts the matrix to a string representation.
	 * @returns A string showing the matrix dimensions and formatted values.
	 */
	toString() {
		return (
			`${this.m}x${this.n}\n` +
			this.matrix.map((e, i) => Math.floor(e * 100) / 100 + (i % this.n == this.n - 1 ? "\t\n" : "\t")).join("")
		);
	}

	/**
	 * Compares this matrix to another matrix.
	 * @param other - The matrix to compare.
	 * @param error - The acceptable error margin for element comparisons.
	 * @returns True if the matrices are equal within the given error margin.
	 */
	equals(other: Matrix, error: number = 0) {
		return this.m == other.m && this.n == other.n && this.matrix.every((e, i) => Math.abs(e - other.matrix[i]) <= error);
	}

	/**
	 * Clones the current matrix into a new instance.
	 * @returns A new matrix that is a clone of the current matrix.
	 */
	clone() {
		return new Matrix(this.m, this.n, [...this.matrix]);
	}

	/**
	 * Performs Gaussian elimination on a row.
	 * @param row - The row to perform elimination on.
	 * @param number - The pivot column index.
	 * @returns A new matrix after the row is reduced.
	 */
	gaussElliminate(row: number, number: number) {
		const result = this.clone();

		if (result.getElement(row, number) == 0) return result;

		const starter = result.getElement(row, number);
		const mult = starter / result.getElement(number, number);

		for (let j = number; j < this.n; j++) {
			const subtractor = result.getElement(number, j);
			result.setElement(row, j, result.getElement(row, j) - subtractor * mult);
		}
		return result;
	}

	/**
	 * Performs full Gaussian elimination on the matrix.
	 * @returns A new matrix after Gaussian elimination.
	 */
	gaussEllimination() {
		return this.clone().gaussElliminate(1, 0).gaussElliminate(2, 0).gaussElliminate(2, 1);
	}

	/**
	 * Solves a system of linear equations using Cramer's rule.
	 * @param b - The array representing the constant terms.
	 * @returns The solution vector or undefined if the determinant is zero.
	 */
	cramerLaw(b: number[]) {
		const det = this.determinant();

		if (det == 0 || det == undefined) return undefined;

		const result: number[] = [];

		for (let j = 0; j < this.n; j++) {
			const mx = this.clone();

			for (let i = 0; i < this.m; i++) {
				mx.setElement(i, j, b[i]);
			}

			result.push(mx.determinant() / det);
		}

		return result;
	}
}

export function TestMatrix() {
    function assert(condition: boolean, message: string) {
        if (!condition) throw new Error(`Assertion failed: ${message}`);
    }
    console.log("Matrix testing started!")

    // Test matrix creation
    const matrix1 = new Matrix(2, 2, [1, 2, 3, 4]);
    assert(matrix1.toString() === "2x2\n1\t2\t\n3\t4\t\n", "Matrix 1 creation failed");

    const matrix2 = new Matrix(2, 2, [5, 6, 7, 8]);
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
    const identityMatrix = new Matrix(2, 2, [1, 0, 0, 1]);
    assert(identityMatrix.isIdentity(), "Identity matrix check failed");

    console.log("Matrix testing finished!")
}