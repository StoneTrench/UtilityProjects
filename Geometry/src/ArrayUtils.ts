import { WrapIndex } from "./MathUtils";

/**
 * Retrieves an element from an array using a potentially out-of-bounds index by wrapping it.
 *
 * @template T
 * @param {T[]} arr - The array to retrieve the element from.
 * @param {number} i - The index to retrieve, which will be wrapped if out of bounds.
 * @returns {T} The element at the wrapped index.
 */
export function WrapGet<T>(arr: T[], i: number): T {
	return arr[WrapIndex(i, arr.length)];
}
/**
 * Inserts an element into an array at a specified index, shifting existing elements to the right.
 * This function modifies the original array.
 *
 * @template T
 * @param {T[]} array - The array to insert into.
 * @param {number} index - The index at which to insert the element.
 * @param {T} element - The element to insert.
 * @returns {T[]} The modified array with the element inserted.
 */
export function InsertIntoArray<T>(array: T[], index: number, element: T): T[] {
	const end = array.splice(index);
	array.push(element, ...end);
	return array;
}

export function ArrayEquals<T>(arrayA: T[], arrayB: T[]) {
    if (!(arrayA instanceof Array)) return false;
    if (!(arrayB instanceof Array)) return false;
    if (arrayA.length != arrayB.length) return false;

    for (let i = 0; i < arrayA.length; i++) {        
        if (arrayA[i] != arrayB[i]) return false;
    }
    return true;
}