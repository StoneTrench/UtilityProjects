import { GOAP, GraphHelper, MConst, SortGreatestToCenter, SwapElements, Vector } from "../geometry";
import { Graph, GraphSymbol } from "./Graph";

export namespace GraphLayout {
	type LayoutState = {
		positions: Map<GraphSymbol, Vector>;
		childQueue: { id: GraphSymbol; conn: GraphSymbol[] }[];
		direction: number;
	};

	class LayoutGoal<t1, t2> implements GOAP.Goal<LayoutState> {
		constructor(graph: Graph<t1, t2>, public stepSize: number) {
			const queue = graph.map((e) => {
				return { id: e.id, conn: GraphHelper.GetNeighbors(e) };
			});

			this.startingState = {
				positions: queue.reduce((res, e) => res.set(e.id, new Vector(0, 0)), new Map<GraphSymbol, Vector>()),
				childQueue: queue,
				direction: 0,
			};
		}

		actions: GOAP.Action<LayoutState>[] = [
			{
				id: "selectNextChild",
				onCallAlteration: (state) => {
					const clone = this.cloneState(state);

					if (clone.childQueue.length <= 0) return clone;

					// We shift the first child of the current node
					const prev_id = clone.childQueue[0].id;
					const node_id = clone.childQueue[0].conn.shift();

					if (node_id === undefined)
						// We just remove the whole thing, if it has no children
						clone.childQueue.shift();
					else {
						clone.positions.set(node_id, clone.positions.get(prev_id).clone());

						// We move that child to the first position in the array
						const node = clone.childQueue.splice(
							clone.childQueue.findIndex((e) => e.id === node_id),
							1
						)[0];
						node.conn.splice(
							node.conn.findIndex((e) => e === prev_id),
							1
						);
						clone.childQueue.unshift(node);
					}
					if (this.doesOverlap(clone)) this.moveInDirection(clone);

					return clone;
				},
				cost: 1,
			},
			{
				id: "rotate",
				onCallAlteration: (state) => {
					const clone = this.cloneState(state);

					clone.direction += 90;
					// this.moveInDirection(clone);

					return clone;
				},
				cost: 1,
			},
			// {
			// 	id: "move",
			// 	onCallAlteration: (state) => {
			// 		const clone = this.cloneState(state);

			// 		this.moveInDirection(clone);

			// 		return clone;
			// 	},
			// 	cost: 1,
			// },
		];
		startingState: LayoutState;

		getArea(current_state: LayoutState) {
			const nodes = Array.from(current_state.positions.values());
			const min = nodes.reduce((res, e) => res.min(e), new Vector(0, 0));
			const max = nodes.reduce((res, e) => res.min(e), new Vector(0, 0));
			return max.minus(min).volume();
		}
		moveInDirection(current_state: LayoutState) {
			if (current_state.childQueue.length <= 0) return;
			const angle = current_state.direction * MConst.rad1;
			const angleVector = new Vector(Math.cos(angle), Math.sin(angle)).scale(this.stepSize);
			current_state.positions.get(current_state.childQueue[0].id).add(angleVector).round();
		}
		doesHaveOverlap(current_state: LayoutState) {
			const nodes = Array.from(current_state.positions.entries());
			return nodes.some((a) => nodes.some((b) => a[0] !== b[0] && a[1].equals(b[1], 1)));
		}
		doesOverlap(current_state: LayoutState) {
			if (current_state.childQueue.length <= 0) return true;
			const id = current_state.childQueue[0].id;
			const pos = current_state.positions.get(id);
			return current_state.childQueue.some((e) => e.id !== id && current_state.positions.get(e.id).equals(pos));
		}
		cloneState(state: LayoutState): LayoutState {
			return {
				childQueue: structuredClone(state.childQueue),
				direction: state.direction,
				positions: Array.from(state.positions.entries()).reduce((res, e) => res.set(e[0], e[1].clone()), new Map()),
			};
		}

		ActionHeuristic(current_state: LayoutState, next_state: LayoutState, action?: GOAP.Action<LayoutState>): number {
			return (
				next_state.childQueue.length +
				(next_state.childQueue[0]?.conn.length ?? 0) +
				(this.doesOverlap(next_state) ? 10 : -10) +
				this.getArea(next_state)
			);
		}
		CanTakeAction(current_state: LayoutState, next_state: LayoutState, action?: GOAP.Action<LayoutState>): boolean {
			// if (this.HashState(current_state) === this.HashState(next_state)) return false;
			return true;
		}
		HasBeenReached(current_state: LayoutState): boolean {
			if (current_state.childQueue.length > 1) return false;
			if (current_state.childQueue.length > 0 && current_state.childQueue[0].conn.length > 0) return false;
			if (this.doesHaveOverlap(current_state)) return false;
			return true;
		}
		HashState(state: LayoutState): string {
			return `${state.childQueue.length}|${state.direction}|${Array.from(state.positions.entries())
				.map((e) => e[0]?.toString() + e[1]?.toString())
				.sort()
				.join(",")}`;
		}
	}

	export function OrthogonalGOAP(graph: Graph<any, any>, stepSize: number): Map<GraphSymbol, Vector> {
		const result = GOAP.FindPlan(new LayoutGoal(graph, stepSize));
		return result.lastState.positions;
	}

	// Evaluate edge crossing between two edges
	function EvaluateEdgeCrossing(edge1, edge2) {
		if (edge1[0] < edge2[0] && edge1[1] > edge2[1]) {
			return true;
		} else if (edge1[0] > edge2[0] && edge1[1] < edge2[1]) {
			return true;
		}
		return false;
	}
	// Heuristic to minimize edge crossings within each rank
	function MinimizeEdgeCrossings(rankGroup: [GraphSymbol, number][]) {
		// THIS CODE WAS WRITTEN BY CHAT GPT, PLEASE BEWARE
		let hasImproved = true;
		const maxIterations = 10; // Maximum number of times to repeat the process
		let iterations = 0;

		while (hasImproved && iterations < maxIterations) {
			hasImproved = false;
			iterations++;

			for (let i = 0; i < rankGroup.length - 1; i++) {
				const currentNode = rankGroup[i];
				const nextNode = rankGroup[i + 1];

				// Count current crossings
				let currentCrossings = 0;
				for (let j = 0; j < rankGroup.length; j++) {
					if (j !== i && j !== i + 1) {
						const otherNode = rankGroup[j];
						if (EvaluateEdgeCrossing([i, currentNode[1]], [j, otherNode[1]])) {
							currentCrossings++;
						}
						if (EvaluateEdgeCrossing([i + 1, nextNode[1]], [j, otherNode[1]])) {
							currentCrossings++;
						}
					}
				}

				// Swap nodes and evaluate new crossings
				[rankGroup[i], rankGroup[i + 1]] = [rankGroup[i + 1], rankGroup[i]];
				let newCrossings = 0;
				for (let j = 0; j < rankGroup.length; j++) {
					if (j !== i && j !== i + 1) {
						const otherNode = rankGroup[j];
						if (EvaluateEdgeCrossing([i, rankGroup[i][1]], [j, otherNode[1]])) {
							newCrossings++;
						}
						if (EvaluateEdgeCrossing([i + 1, rankGroup[i + 1][1]], [j, otherNode[1]])) {
							newCrossings++;
						}
					}
				}

				// If the new arrangement reduces crossings, keep it; otherwise, revert
				if (newCrossings < currentCrossings) {
					hasImproved = true;
				} else {
					// Revert the swap
					[rankGroup[i], rankGroup[i + 1]] = [rankGroup[i + 1], rankGroup[i]];
				}
			}
		}
	}

	export function Ranked(
		graph: Graph<any, any>,
		stepSize: number,
		placementMode?: "middle" | "low_middle_bias"
	): Map<GraphSymbol, Vector> {
		// https://crinkles.dev/writing/auto-graph-layout-algorithm
		const result = new Map<GraphSymbol, Vector>();

		// Choose initial node
		const nodes = [...graph.values()];
		// Rank nodes (shortest distance (in n number of edges to initial node) length)
		const distanceMap = GraphHelper.CalculateShortestEdgeDistance(graph, nodes[0].id);
		const rankGroups: [GraphSymbol, number][][] = [];
		for (const node of nodes) {
			const rank = distanceMap.get(node.id);
			rankGroups[rank] ??= [];
			rankGroups[rank].push([node.id, node.incoming.length + node.outgoing.length]);
		}
		// Sort nodes in each rank, to minimize edge crossings

		for (const group of rankGroups.values()) {
			SortGreatestToCenter(group); // Sort it so the one with the most connections is at the center for aesthetics
			MinimizeEdgeCrossings(group);
		}

		placementMode ??= "middle";

		// Place nodes
		switch (placementMode) {
			case "middle":
				for (const [rank, group] of rankGroups.entries()) {
					const halfLen = group.length / 2;
					for (const [index, [id, _]] of group.entries()) {
						result.set(id, new Vector(rank, index - halfLen).scale(stepSize));
					}
				}
				break;
			case "low_middle_bias":
				for (const [rank, group] of rankGroups.entries()) {
					const middleIndex = Math.ceil(group.length / 2) - 1;
					for (const [index, [id, _]] of group.entries()) {
						const y = index - middleIndex;
						result.set(id, new Vector(rank - Math.abs(y), y).scale(stepSize));
					}
				}
				break;
		}

		return result;
	}
}
