// row x column
// i x j

// m x n
export class Matrix {
	n: number; // column
	m: number; // row
	matrix: number[];

	constructor(m: number, n: number, numbers: number[] = undefined) {
		this.n = n; // column
		this.m = m; // row
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

	getElement(i: number, j: number) {
		return this.matrix[j + i * this.n];
	}
	setElement(i: number, j: number, e: number) {
		this.matrix[j + i * this.n] = e;
	}
	getHarbinger(i: number, j: number) {
		return (i + j) % 2 == 0 ? +1 : -1;
	}
	getIJ(index: number) {
		return [Math.floor(index / this.m), Math.floor(index % this.m)];
	}
    isIdentity(error: number = 0){
        return this.every((v, i, j) => {
            if (i === j) return Math.abs(v - 1) <= error;
            return Math.abs(v) <= error;
        })
    }

	forEachBreak(callback: (value: number, i: number, j: number) => boolean) {
		for (let j = 0; j < this.n; j++) {
			for (let i = 0; i < this.m; i++) {
				if (callback(this.getElement(i, j), i, j) === true) break;
			}
		}
        return this;
	}
	forEach(callback: (value: number, i: number, j: number) => void) {
		for (let j = 0; j < this.n; j++) {
			for (let i = 0; i < this.m; i++) {
				callback(this.getElement(i, j), i, j);
			}
		}
        return this;
	}
    every(callback: (value: number, i: number, j: number) => boolean){
        let bol = true;
        this.forEachBreak((v, i, j) => {
            bol &&= callback(v, i, j)
            if (bol == false) return true;
        })
        return bol;
    }
    some(callback: (value: number, i: number, j: number) => boolean){
        let bol = false;
        this.forEachBreak((v, i, j) => {
            bol ||= callback(v, i, j)
            if (bol == true) return true;
        })
        return bol;
    }

	plus(other: Matrix) {
		if (this.n == other.n && this.m == other.m)
			return new Matrix(
				this.m,
				this.n,
				this.matrix.map((e, i) => e + other.matrix[i])
			);
		else return undefined;
	}
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

	mainDiagonal() {
		return this.matrix.filter((e, index) => {
			let [i, j] = this.getIJ(index);
			return i == j;
		});
	}
	antiDiagonal() {
		return this.matrix.filter((e, index) => {
			let [i, j] = this.getIJ(index);
			return i + j == this.n;
		});
	}
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

	scale(value: number) {
		return new Matrix(
			this.m,
			this.n,
			this.matrix.map((e) => e * value)
		);
	}

	adjugated() {
		let numbers = new Array(this.m * this.n);
		for (let i = 0; i < this.m; i++) {
			for (let j = 0; j < this.n; j++) {
				numbers[j + i * this.n] = this.getMinorMatix(i, j).determinant() * this.getHarbinger(i, j);
			}
		}
		return new Matrix(this.m, this.n, numbers);
	}
	invert() {
		const Det = this.determinant();
		if (Det == 0) return undefined;
		const DJI = this.adjugated().transposed();
		return DJI.scale(1 / Det);
	}

	toString() {
		return (
			`${this.m}x${this.n}\n` +
			this.matrix.map((e, i) => Math.floor(e * 100) / 100 + (i % this.n == this.n - 1 ? "\t\n" : "\t")).join("")
		);
		// (() => {
		//     for (var denominator = 1; (e * denominator) % 1 !== 0; denominator++);
		//     if (denominator == 1) return (e).toString();
		//     return (e * denominator) + "/" + denominator;
		// })()
	}
	equals(other: Matrix, error: number = 0) {
		return this.m == other.m && this.n == other.n && this.matrix.every((e, i) => Math.abs(e - other.matrix[i]) <= error);
	}
	clone() {
		return new Matrix(this.m, this.n, [...this.matrix]);
	}

	gaussElliminate(row: number, number: number) {
		const result = this.clone();

		if (result.getElement(row, number) == 0) return result;

		const starter = result.getElement(row, number);
		const mult = starter / result.getElement(number, number);

		for (let j = number; j < this.n; j++) {
			// Goes through each column in the row
			const subtractor = result.getElement(number, j);
			result.setElement(row, j, result.getElement(row, j) - subtractor * mult);
		}
		return result;
	}
	gaussEllimination() {
		return this.clone().gaussElliminate(1, 0).gaussElliminate(2, 0).gaussElliminate(2, 1);
	}

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
    console.log("TESTING MATRIX")
    const matrix1 = new Matrix(4, 4, [
        1, 0, 0, 1,
        0, 1, 0, 2,
        0, 0, 1, 3,
        0, 0, 0, 1,
    ])
    const matrix2 = new Matrix(4, 1, [
        1,
        2,
        0,
        1,
    ])

    console.log(matrix1.toString())
    console.log(matrix2.toString())
    console.log(matrix1.multiplied(matrix2).toString())
}
