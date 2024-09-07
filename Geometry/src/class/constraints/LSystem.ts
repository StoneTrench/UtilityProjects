import { GenerateTimestampID } from "../../GenerateUUID";
import { Graph, TNodeGraphML, TEdgeGraphML } from "../Graph";
import { Vector } from "../Vector";

/**
 * [Lindenmayer system](https://en.wikipedia.org/wiki/L-system)
 */
export namespace LSystem {
	export type char = string;
	export type Rule = { predecessor: char; successor: string };
	const CONSTANTS = {
		OPEN_SQUARE_BRACKET: "[",
		CLOSED_SQUARE_BRACKET: "]",
		OPEN_BRACKET: "(",
		CLOSED_BRACKET: ")"
	} as const;
	enum PARSING_TYPE {
		DEFAULT,
		ARGUMENT,
	}

	/**
	 * Generates a string based on a set of rewriting rules applied to an initial axiom over a specified number of iterations.
	 * This function simulates a Lindenmayer system (L-system) where each symbol in the axiom is replaced or preserved based on the rules.
	 * If a symbol matches multiple rules, one rule is chosen randomly for replacement.
	 *
	 * @param {string} axiom - The initial string from which the L-system starts.
	 * @param {Rule[]} rules - The set of rules defining how each character is replaced. Each rule must have a predecessor (a single character) and a successor (a string).
	 * @param {number} iterations - The number of iterations to apply the rules to the axiom.
	 * @throws {Error} If a rule's predecessor is not a single character.
	 * @returns {string} The generated string after applying the rules over the specified number of iterations.
	 */
	export function GenerateString(axiom: string, rules: Rule[], iterations: number) {
		rules.forEach((e) => {
			if (e.predecessor.length !== 1) throw new Error("LSystem Rule predecessors can only be a single character long!");
		});

		let result: string = axiom;

		for (let n = 0; n < iterations; n++) {
			let newString: string = "";
			for (let i = 0; i < result.length; i++) {
				const symbol: char = result[i];
				const foundRules = rules.filter((e) => e.predecessor === symbol);

				if (foundRules.length == 0) {
					newString += symbol;
					continue;
				}
				if (foundRules.length == 1) {
					newString += foundRules[0].successor;
					continue;
				}

				newString += foundRules[Math.floor(Math.random() * foundRules.length)].successor;
			}
			result = newString;
		}

		return result;
	}
	/**
	 * Converts a string into a graph structure. The function parses bracketed sections within the string 
	 * and constructs a directed graph using nodes and edges based on the parsing type. 
	 * Square brackets are treated as grouping elements, and characters outside of brackets are added as labeled nodes.
	 *
	 * @param {string} str - The string to convert into a graph. It may contain nested brackets.
	 * @returns {Graph<TNodeGraphML, TEdgeGraphML>} A directed graph where nodes are created based on the parsed string.
	 */
	export function ConvertToGraph(str: string) {
		const result = new Graph<TNodeGraphML, TEdgeGraphML>();

		function ParseBracket(start: number, prevNode: number, parsingType: PARSING_TYPE) {
			let i: number = start;
			let currentNode: number = prevNode;
			while (i < str.length) {
				const char = str[i];
				if (char == CONSTANTS.OPEN_SQUARE_BRACKET) i = ParseBracket(i + 1, currentNode, parsingType);
				else if (char == CONSTANTS.CLOSED_SQUARE_BRACKET) return i;
				else if (char == CONSTANTS.OPEN_BRACKET) {
					result.get(currentNode).data.label += CONSTANTS.OPEN_BRACKET;
					i = ParseBracket(i + 1, currentNode, PARSING_TYPE.ARGUMENT);
				} else if (char == CONSTANTS.CLOSED_BRACKET) {
					result.get(currentNode).data.label += CONSTANTS.CLOSED_BRACKET;
					return i;
				} else {
					switch (parsingType) {
						case PARSING_TYPE.DEFAULT:
							var nextNode = currentNode + Math.random();
							result.addNode(nextNode, { label: char });
							result.addEdge(currentNode, nextNode, {});
							currentNode = nextNode;
							break;
						case PARSING_TYPE.ARGUMENT:
							result.get(currentNode).data.label += char;
							break;
					}
				}
				i++;
			}
			return str.length;
		}

		result.addNode(0, { label: "root" });
		ParseBracket(0, 0, PARSING_TYPE.DEFAULT);
		return result;
	}

	/**
	 * Parses a string and processes symbols to simulate movement in a virtual space using a turtle graphics-style system.
	 * The function supports stack operations for saving and restoring states, and applies transformations based on the parsed symbols.
	 * It allows specifying a custom starting direction and triggers callbacks for each symbol processed and for each line generated between states.
	 *
	 * @param {string} str - The input string to parse, which may include commands for movement and stack operations.
	 * @param {Vector} startingDirection - The initial direction of the virtual "turtle" in space.
	 * @param {(pos: Vector, dir: Vector, symbol: char, args: number[], id: number) => [Vector, Vector] | undefined} callback - 
	 * A callback function invoked for each symbol in the string. It receives the current position, direction, symbol, parsed arguments, and state ID. 
	 * Returns the new position and direction or `undefined` to skip the symbol.
	 * @param {(source: Vector, target: Vector, sourceId: number, targetId: number) => void} lineCallback - 
	 * A callback function invoked when a line is generated between two states. It receives the source and target positions, along with their respective state IDs.
	 */
	export function ParseString(
		str: string,
		startingDirection: Vector,
		callback: (pos: Vector, dir: Vector, symbol: char, args: number[], id: string) => [Vector, Vector] | undefined,
		lineCallback: (source: Vector, target: Vector, sourceId: string, targetId: string) => void
	) {
		// position, direction
		const stack: [Vector, Vector, string][] = [];

		let currentState: [Vector, Vector, string] = [new Vector(), startingDirection.clone(), GenerateTimestampID()];
		let argumentIndentation: number = 0;
		let currentArgument: string = "";
		for (let i = 0; i < str.length; i++) {
			const char: char = str[i];
			switch (char) {
				case CONSTANTS.OPEN_SQUARE_BRACKET:
					stack.push([currentState[0].clone(), currentState[1].clone(), currentState[2]]);
					break;
				case CONSTANTS.CLOSED_SQUARE_BRACKET:
					currentState = stack.pop();
					break;
				case CONSTANTS.OPEN_BRACKET:
					argumentIndentation++;
					break;
				case CONSTANTS.CLOSED_BRACKET:
					argumentIndentation--;
					break;
				default:
					if (argumentIndentation != 0) currentArgument += char;
					else {
						const newState = callback(
							currentState[0].clone(),
							currentState[1].clone(),
							char,
							currentArgument
								.split(",")
								.map((e) => parseInt(e))
								.filter((e) => !isNaN(e)),
							currentState[2]
						);
						currentArgument = "";
						if (newState == undefined) break;
						const newStateId = GenerateTimestampID();
						lineCallback(currentState[0].clone(), newState[0].clone(), currentState[2], newStateId);
						currentState = [newState[0].clone(), newState[1].clone(), newStateId];
					}
					break;
			}
		}
	}

	/**
	 * Parses a set of rules from a string, where each rule is represented on a separate line.
	 * Rules are defined in the format `A => B`, where `A` is a single character (the predecessor) and `B` is a string (the successor).
	 * Lines starting with `//` are ignored as comments, and empty lines or malformed lines are skipped.
	 *
	 * @param {string} str - The string containing rules, with each rule on a new line.
	 * @returns {Rule[]} An array of parsed rules, where each rule has a predecessor and a successor.
	 */
	export function ParseRules(str: string) {
		return str
			.replace(/ /g, "")
			.split(/\r?\n/)
			.filter((e) => e != undefined && e.length > 3 && !e.startsWith("//"))
			.map<Rule>((e) => {
				return {
					predecessor: e[0],
					successor: e.substring(e.indexOf("=>") + 2),
				};
			});
	}
}