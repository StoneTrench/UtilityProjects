import { Create2DRotationMatrix2x2, GOAP, GraphHelper, MatrixMultiplyVector2x2, MConst, Vector } from "../geometry";
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
				(next_state.childQueue[0]?.conn.length ?? -1) +
				(this.doesOverlap(next_state) ? 10 : -10) +
				this.getArea(next_state)
			);
		}
		CanTakeAction(current_state: LayoutState, next_state: LayoutState, action?: GOAP.Action<LayoutState>): boolean {
			if (this.HashState(current_state) === this.HashState(next_state)) return false;

			return true;
		}
		HasBeenReached(current_state: LayoutState): boolean {
			console.log(current_state.childQueue.map((e) => e.id).join(", "));
			if (current_state.childQueue.length > 1) return false;
			if (current_state.childQueue.length > 0 && current_state.childQueue[0].conn.length > 0) return false;
			if (this.doesHaveOverlap(current_state)) return false;
			return true;
		}
		HashState(state: LayoutState): string {
			return `${state.childQueue.length}|${state.direction}|${Array.from(state.positions.entries())
				.map((e) => e[0]?.toString() + e[1]?.toString())
				// .sort()
				.join(",")}`;
		}
	}

	export function LayoutOrthogonal(graph: Graph<any, any>, stepSize: number) {
		const result = GOAP.FindPlan(new LayoutGoal(graph, stepSize));
		// writeFileSync(
		// 	"./debug_layout_graph.graphml",
		// 	Array.from(result.edges.entries())
		// 		.reduce((res, e) => {
		// 			res.addNode(e[0], { label: e[0] as any });
		// 			// console.log("debugger", e);

		// 			e[1].forEach((n) => {
		// 				res.addNode(n[0], { label: n[0] as any });
		// 				res.addEdge(e[0], n[0], { label: n[1] });
		// 			});

		// 			return res;
		// 		}, new Graph<TNodeGraphML, TEdgeGraphML>())
		// 		.exportToGraphML()
		// );
		console.log("GOAP STATUS", result.status, result.actions);

		return result.lastState.positions;
	}
}
