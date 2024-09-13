import { Vector } from "./Vector";

export type Matrix3x3 = {
	m11: number;
	m12: number;
	m13: number;

	m21: number;
	m22: number;
	m23: number;

	m31: number;
	m32: number;
	m33: number;
};
export type Matrix4x4 = {
	m11: number;
	m12: number;
	m13: number;
	m14: number;

	m21: number;
	m22: number;
	m23: number;
	m24: number;

	m31: number;
	m32: number;
	m33: number;
	m34: number;

	m41: number;
	m42: number;
	m43: number;
	m44: number;
};

export function MatrixMultiplyVector3x3(vec: Vector, mat: Matrix3x3) {
	return new Vector(
		vec.x * mat.m11 + vec.y * mat.m12 + vec.z * mat.m13,
		vec.x * mat.m21 + vec.y * mat.m22 + vec.z * mat.m23,
		vec.x * mat.m31 + vec.y * mat.m32 + vec.z * mat.m33
	);
}
export function MatrixMultiplyVector4x4(vec: Vector, mat: Matrix4x4) {
	return new Vector(
		vec.x * mat.m11 + vec.y * mat.m12 + vec.z * mat.m13 + vec.get(3) * mat.m14,
		vec.x * mat.m21 + vec.y * mat.m22 + vec.z * mat.m23 + vec.get(3) * mat.m24,
		vec.x * mat.m31 + vec.y * mat.m32 + vec.z * mat.m33 + vec.get(3) * mat.m34,
		vec.x * mat.m41 + vec.y * mat.m42 + vec.z * mat.m43 + vec.get(3) * mat.m44
	);
}

export function MultiplyMatrix4x4(a: Matrix4x4, b: Matrix4x4): Matrix4x4 {
	return {
		m11: a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31 + a.m14 * b.m41,
		m12: a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32 + a.m14 * b.m42,
		m13: a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33 + a.m14 * b.m43,
		m14: a.m11 * b.m14 + a.m12 * b.m24 + a.m13 * b.m34 + a.m14 * b.m44,

		m21: a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31 + a.m24 * b.m41,
		m22: a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32 + a.m24 * b.m42,
		m23: a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33 + a.m24 * b.m43,
		m24: a.m21 * b.m14 + a.m22 * b.m24 + a.m23 * b.m34 + a.m24 * b.m44,

		m31: a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31 + a.m34 * b.m41,
		m32: a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32 + a.m34 * b.m42,
		m33: a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33 + a.m34 * b.m43,
		m34: a.m31 * b.m14 + a.m32 * b.m24 + a.m33 * b.m34 + a.m34 * b.m44,

		m41: a.m41 * b.m11 + a.m42 * b.m21 + a.m43 * b.m31 + a.m44 * b.m41,
		m42: a.m41 * b.m12 + a.m42 * b.m22 + a.m43 * b.m32 + a.m44 * b.m42,
		m43: a.m41 * b.m13 + a.m42 * b.m23 + a.m43 * b.m33 + a.m44 * b.m43,
		m44: a.m41 * b.m14 + a.m42 * b.m24 + a.m43 * b.m34 + a.m44 * b.m44,
	};
}

export function ArrayToMatrix3x3(matrix: number[][]): Matrix3x3 {
	return {
		m11: matrix[0][0],
		m12: matrix[0][1],
		m13: matrix[0][2],
		m21: matrix[1][0],
		m22: matrix[1][1],
		m23: matrix[1][2],
		m31: matrix[2][0],
		m32: matrix[2][1],
		m33: matrix[2][2],
	};
}
export function ArrayToMatrix4x4(matrix: number[][]): Matrix4x4 {
	return {
		m11: matrix[0][0],
		m12: matrix[0][1],
		m13: matrix[0][2],
		m14: matrix[0][3],

		m21: matrix[1][0],
		m22: matrix[1][1],
		m23: matrix[1][2],
		m24: matrix[1][3],

		m31: matrix[2][0],
		m32: matrix[2][1],
		m33: matrix[2][2],
		m34: matrix[2][3],

		m41: matrix[3][0],
		m42: matrix[3][1],
		m43: matrix[3][2],
		m44: matrix[3][3],
	};
}
export function Create3DRotationMatrix3x3(x: number, y: number, z: number): Matrix3x3 {
	const ca = Math.cos(z);
	const cb = Math.cos(y);
	const cg = Math.cos(x);

	const sa = Math.sin(z);
	const sb = Math.sin(y);
	const sg = Math.sin(x);

	return ArrayToMatrix3x3([
		[ca * cb, ca * sb * sg - sa * cg, ca * sb * cg + sa * sg],
		[sa * cb, sa * sb * sg + ca * cg, sa * sb * cg - ca * sg],
		[-sb, cb * sg, cb * cg],
	]);
}
export function CreateTransformMatrix4x4(
	trans_x?: number,
	trans_y?: number,
	trans_z?: number,
	rot_x?: number,
	rot_y?: number,
	rot_z?: number
): Matrix4x4 {
	trans_x ??= 0;
	trans_y ??= 0;
	trans_z ??= 0;

	rot_x ??= 0;
	rot_y ??= 0;
	rot_z ??= 0;

	const ca = Math.cos(rot_z);
	const cb = Math.cos(rot_y);
	const cg = Math.cos(rot_x);

	const sa = Math.sin(rot_z);
	const sb = Math.sin(rot_y);
	const sg = Math.sin(rot_x);

	return ArrayToMatrix4x4([
		[ca * cb, ca * sb * sg - sa * cg, ca * sb * cg + sa * sg, trans_x],
		[sa * cb, sa * sb * sg + ca * cg, sa * sb * cg - ca * sg, trans_y],
		[-sb, cb * sg, cb * cg, trans_z],
		[0, 0, 0, 1],
	]);
}
export function CreatePerspectiveProjectionMatrix4x4(fieldOfView: number, z_far: number, z_near: number, aspect: number) {
	const f = 1 / Math.tan(fieldOfView / 2);
	const diff = z_far - z_near;

	return ArrayToMatrix4x4([
		[f * aspect, 0, 0, 0],
		[0, f, 0, 0],
		[0, 0, z_far / diff, 1],
		[0, 0, (-z_far * z_near) / diff, 0],
	]);
}

export function InvertMatrix4x4(matrix: Matrix4x4): Matrix4x4 | null {
	const m = matrix;

	// Calculate the determinant of the 4x4 matrix
	const det =
		m.m11 *
			(m.m22 * (m.m33 * m.m44 - m.m34 * m.m43) -
				m.m23 * (m.m32 * m.m44 - m.m34 * m.m42) +
				m.m24 * (m.m32 * m.m43 - m.m33 * m.m42)) -
		m.m12 *
			(m.m21 * (m.m33 * m.m44 - m.m34 * m.m43) -
				m.m23 * (m.m31 * m.m44 - m.m34 * m.m41) +
				m.m24 * (m.m31 * m.m43 - m.m33 * m.m41)) +
		m.m13 *
			(m.m21 * (m.m32 * m.m44 - m.m34 * m.m42) -
				m.m22 * (m.m31 * m.m44 - m.m34 * m.m41) +
				m.m24 * (m.m31 * m.m42 - m.m32 * m.m41)) -
		m.m14 *
			(m.m21 * (m.m32 * m.m43 - m.m33 * m.m42) -
				m.m22 * (m.m31 * m.m43 - m.m33 * m.m41) +
				m.m23 * (m.m31 * m.m42 - m.m32 * m.m41));

	if (det === 0) return null; // No inverse exists if determinant is 0

	const invDet = 1 / det;

	// Compute the inverse using the adjugate matrix and the determinant
	return {
		m11:
			(m.m22 * (m.m33 * m.m44 - m.m34 * m.m43) -
				m.m23 * (m.m32 * m.m44 - m.m34 * m.m42) +
				m.m24 * (m.m32 * m.m43 - m.m33 * m.m42)) *
			invDet,
		m12:
			-(
				m.m12 * (m.m33 * m.m44 - m.m34 * m.m43) -
				m.m13 * (m.m32 * m.m44 - m.m34 * m.m42) +
				m.m14 * (m.m32 * m.m43 - m.m33 * m.m42)
			) * invDet,
		m13:
			(m.m12 * (m.m23 * m.m44 - m.m24 * m.m43) -
				m.m13 * (m.m22 * m.m44 - m.m24 * m.m42) +
				m.m14 * (m.m22 * m.m43 - m.m23 * m.m42)) *
			invDet,
		m14:
			-(
				m.m12 * (m.m23 * m.m34 - m.m24 * m.m33) -
				m.m13 * (m.m22 * m.m34 - m.m24 * m.m32) +
				m.m14 * (m.m22 * m.m33 - m.m23 * m.m32)
			) * invDet,

		m21:
			-(
				m.m21 * (m.m33 * m.m44 - m.m34 * m.m43) -
				m.m23 * (m.m31 * m.m44 - m.m34 * m.m41) +
				m.m24 * (m.m31 * m.m43 - m.m33 * m.m41)
			) * invDet,
		m22:
			(m.m11 * (m.m33 * m.m44 - m.m34 * m.m43) -
				m.m13 * (m.m31 * m.m44 - m.m34 * m.m41) +
				m.m14 * (m.m31 * m.m43 - m.m33 * m.m41)) *
			invDet,
		m23:
			-(
				m.m11 * (m.m23 * m.m44 - m.m24 * m.m43) -
				m.m13 * (m.m21 * m.m44 - m.m24 * m.m41) +
				m.m14 * (m.m21 * m.m43 - m.m23 * m.m41)
			) * invDet,
		m24:
			(m.m11 * (m.m23 * m.m34 - m.m24 * m.m33) -
				m.m13 * (m.m21 * m.m34 - m.m24 * m.m31) +
				m.m14 * (m.m21 * m.m33 - m.m23 * m.m31)) *
			invDet,

		m31:
			(m.m21 * (m.m32 * m.m44 - m.m34 * m.m42) -
				m.m22 * (m.m31 * m.m44 - m.m34 * m.m41) +
				m.m24 * (m.m31 * m.m42 - m.m32 * m.m41)) *
			invDet,
		m32:
			-(
				m.m11 * (m.m32 * m.m44 - m.m34 * m.m42) -
				m.m12 * (m.m31 * m.m44 - m.m34 * m.m41) +
				m.m14 * (m.m31 * m.m42 - m.m32 * m.m41)
			) * invDet,
		m33:
			(m.m11 * (m.m22 * m.m44 - m.m24 * m.m42) -
				m.m12 * (m.m21 * m.m44 - m.m24 * m.m41) +
				m.m14 * (m.m21 * m.m42 - m.m22 * m.m41)) *
			invDet,
		m34:
			-(
				m.m11 * (m.m22 * m.m34 - m.m24 * m.m32) -
				m.m12 * (m.m21 * m.m34 - m.m24 * m.m31) +
				m.m14 * (m.m21 * m.m32 - m.m22 * m.m31)
			) * invDet,

		m41:
			-(
				m.m21 * (m.m32 * m.m43 - m.m33 * m.m42) -
				m.m22 * (m.m31 * m.m43 - m.m33 * m.m41) +
				m.m23 * (m.m31 * m.m42 - m.m32 * m.m41)
			) * invDet,
		m42:
			(m.m11 * (m.m32 * m.m43 - m.m33 * m.m42) -
				m.m12 * (m.m31 * m.m43 - m.m33 * m.m41) +
				m.m13 * (m.m31 * m.m42 - m.m32 * m.m41)) *
			invDet,
		m43:
			-(
				m.m11 * (m.m22 * m.m43 - m.m23 * m.m42) -
				m.m12 * (m.m21 * m.m43 - m.m23 * m.m41) +
				m.m13 * (m.m21 * m.m42 - m.m22 * m.m41)
			) * invDet,
		m44:
			(m.m11 * (m.m22 * m.m33 - m.m23 * m.m32) -
				m.m12 * (m.m21 * m.m33 - m.m23 * m.m31) +
				m.m13 * (m.m21 * m.m32 - m.m22 * m.m31)) *
			invDet,
	};
}
export function CleanMatrix(matrix: Matrix4x4, tolerance: number = 1e-6): Matrix4x4 {
	return {
		m11: Math.abs(matrix.m11) < tolerance ? 0 : matrix.m11,
		m12: Math.abs(matrix.m12) < tolerance ? 0 : matrix.m12,
		m13: Math.abs(matrix.m13) < tolerance ? 0 : matrix.m13,
		m14: Math.abs(matrix.m14) < tolerance ? 0 : matrix.m14,

		m21: Math.abs(matrix.m21) < tolerance ? 0 : matrix.m21,
		m22: Math.abs(matrix.m22) < tolerance ? 0 : matrix.m22,
		m23: Math.abs(matrix.m23) < tolerance ? 0 : matrix.m23,
		m24: Math.abs(matrix.m24) < tolerance ? 0 : matrix.m24,

		m31: Math.abs(matrix.m31) < tolerance ? 0 : matrix.m31,
		m32: Math.abs(matrix.m32) < tolerance ? 0 : matrix.m32,
		m33: Math.abs(matrix.m33) < tolerance ? 0 : matrix.m33,
		m34: Math.abs(matrix.m34) < tolerance ? 0 : matrix.m34,

		m41: Math.abs(matrix.m41) < tolerance ? 0 : matrix.m41,
		m42: Math.abs(matrix.m42) < tolerance ? 0 : matrix.m42,
		m43: Math.abs(matrix.m43) < tolerance ? 0 : matrix.m43,
		m44: Math.abs(matrix.m44) < tolerance ? 0 : matrix.m44,
	};
}
export function PrintMatrix4x4(matrix: Matrix4x4) {
	const mat = CleanMatrix(matrix);
	console.log(mat.m11, mat.m12, mat.m13, mat.m14);
	console.log(mat.m21, mat.m22, mat.m23, mat.m24);
	console.log(mat.m31, mat.m32, mat.m33, mat.m34);
	console.log(mat.m41, mat.m42, mat.m43, mat.m44);
}
