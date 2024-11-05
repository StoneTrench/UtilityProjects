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

	export function Ranked(
		graph: Graph<any, any>,
		stepSize: number,
		placementMode?: "middle" | "low_middle_bias",
		initial?: GraphSymbol
	): Map<GraphSymbol, Vector> {
		// https://crinkles.dev/writing/auto-graph-layout-algorithm
		const result = new Map<GraphSymbol, Vector>();

		// Choose initial node
		const nodes = [...graph.values()];
		// Rank nodes (shortest distance (in n number of edges to initial node) length)
		initial ??= nodes[0].id;
		const distanceMap = GraphHelper.CalculateShortestEdgeDistance(graph, initial);
		const rankGroups: [GraphSymbol, number][][] = [];
		for (const node of nodes) {
			const rank = distanceMap.get(node.id);
			rankGroups[rank] ??= [];
			rankGroups[rank].push([node.id, node.incoming.length + node.outgoing.length]);
		}
		// Sort nodes in each rank, to minimize edge crossings

		for (const [rank, group] of rankGroups.entries()) {
			SortGreatestToCenter(group, true); // Sort it so the one with the most connections is at the center for aesthetics

			const prevGroup = rankGroups[rank - 1];
			// Calculate edge crossing heuristic
			const ECHeuristic = () => {
				let total = 0;

				// Count how many are not next to each other in the same rank
				group.forEach((selfE, selfI) => {
					const selfNode = graph.get(selfE[0]);
					const neighs = GraphHelper.GetNeighbors(selfNode);
					group.forEach((otherE, otherI) => {
						if (selfI === otherI) return;
						if (neighs.some((n) => n === otherE[0])) return; // child exists in group
						total += Math.abs(selfI - otherI) - 1; // If they're not next to each other then increase score
					});
				});

				if (prevGroup == undefined) return total;

				group.forEach((selfE, selfI) => {
					const selfNode = graph.get(selfE[0]);
					const neighs = GraphHelper.GetNeighbors(selfNode);
					prevGroup.forEach((otherE, otherI) => {
						if (neighs.some((n) => n === otherE[0])) return; // child exists in group
						total -= Math.abs(selfI / group.length - otherI / prevGroup.length); // If they're not next to each other then increase score
					});
				});

				return total;
			};
			// Flip elements, keep variations that improve heuristic

			for (let itter = 0; itter < 15; itter++) {
				let prevScore = ECHeuristic();
				for (let g = 0; g < group.length - 1; g++) {
					SwapElements(group, g, g + 1);

					const newScore = ECHeuristic();
					if (prevScore < newScore) {
						// If it's worse then reverse the change
						SwapElements(group, g, g + 1);
					} else prevScore = newScore; // If new score is smaller
				}
			}
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
