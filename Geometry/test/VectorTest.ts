import Vector from "../src/Vector";

export function TestVector() {
	function assert(condition: boolean, message: string) {
		if (!condition) throw new Error(`Assertion failed: ${message}`);
	}

	console.log("Vector testing started!");

	// Test vector creation
	const vector1 = new Vector(1, 2, 3);
	assert(vector1.toString() === "vec3(x:1; y:2; z:3)", "Vector 1 creation failed");

	const vector2 = new Vector(4, 5, 6);
	assert(vector2.toString() === "vec3(x:4; y:5; z:6)", "Vector 2 creation failed");

	// Test vector addition
	const sumVector = vector1.plus(vector2);
	assert(sumVector.toString() === "vec3(x:5; y:7; z:9)", "Vector addition failed");

	// Test vector subtraction
	const differenceVector = vector1.minus(vector2);
	assert(differenceVector.toString() === "vec3(x:-3; y:-3; z:-3)", "Vector subtraction failed");

	// Test vector scaling
	const scaledVector = vector1.scaled(2);
	assert(scaledVector.toString() === "vec3(x:2; y:4; z:6)", "Vector scaling failed");

	// Test vector dot product
	const dotProduct = vector1.dot(vector2);
	assert(dotProduct === 32, "Vector dot product failed");

	// Test vector cross product
	const crossProduct = vector1.cross(vector2);
	assert(crossProduct.toString() === "vec3(x:-3; y:6; z:-3)", "Vector cross product failed");

	// Test vector length
	const length = vector1.length();
	assert(Math.abs(length - 3.741) < 0.001, "Vector length calculation failed");

	// Test unit vector
	const unitVector = vector1.unit();
	const expectedUnitVector = "vec3(x:0.267; y:0.534; z:0.801)";
	assert(unitVector.toString().startsWith("vec3(x:0.267"), "Vector unit calculation failed");

	console.log("Vector testing finished!");
}