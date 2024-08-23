import Graph, { GraphSymbol } from "../Graph";

export namespace Pathfinder {
	export type ActionSymbol = GraphSymbol;
	export type Action<T> = { id: ActionSymbol; onCallAlteration: (current_state: T) => T; cost: number };
	export interface Goal<T> {
		actions: Action<T>[];
		startingState: T;

		ActionHeuristic(current_state: T, next_state: T, action?: Action<T>): number;
		CanTakeAction(current_state: T, next_state: T, action?: Action<T>): boolean;
		HasBeenReached(current_state: T): boolean;

		HashState(state: T): string;
	}

	export function FindPath<T>(goal: Goal<T>, maxOpenSet?: number): ActionSymbol[] {
		/**
		 * Action space graph -> Nodes are states, edges are actions
		 *
		 *
		 * We start with a starting state,
		 * From that we extrapolate which actions we can take,
		 * Using the heuristic function we determine the best action,
		 * We take the action, it modifies the state
		 * We return the new state, and start over
		 */

		maxOpenSet ??= 3000;

		const actionSpaceGraph = new Graph<T, ActionSymbol>(true);
		const startId = goal.HashState(goal.startingState);
		actionSpaceGraph.set(startId, {
			id: startId,
			type: 0,
			data: goal.startingState,
			incoming: [],
			outgoing: [],
		});

		const openSet: GraphSymbol[] = [startId];

		const cameFrom = new Map<GraphSymbol, GraphSymbol>();

		// Cost of cheapest path to the node on the graph
		const gCost = new Map<GraphSymbol, number>();
		gCost.set(startId, 0);
		const get_gCost = (key: GraphSymbol) => gCost.get(key) ?? Number.POSITIVE_INFINITY;

		// Cost of cheapest path to the node on the graph
		const fCost = new Map<GraphSymbol, number>();
		gCost.set(startId, 0);
		const get_fCost = (key: GraphSymbol) => fCost.get(key) ?? Number.POSITIVE_INFINITY;

		while (openSet.length > 0) {
			if (openSet.length > maxOpenSet) break;

			const current_id = openSet.reduce((a, b) => (get_fCost(a) < get_fCost(b) ? a : b));
			const current_state = actionSpaceGraph.get(current_id).data;

			openSet.splice(openSet.indexOf(current_id), 1);
			const curr_gCost = get_gCost(current_id);

			// Loop through each action
			for (const action of goal.actions) {
				const neigh_state = action.onCallAlteration(current_state);
				if (!goal.CanTakeAction(current_state, neigh_state, action)) continue;

				if (goal.HasBeenReached(current_state)) {
					const result: ActionSymbol[] = [];
					let curr = current_id;
					while (true) {
						const prev = cameFrom.get(curr);
						if (prev == undefined) break;
						result.unshift(actionSpaceGraph.getEdge(prev, curr).data);
						curr = prev;
					}
					return result;
				}

				const neigh_id = goal.HashState(neigh_state);
				actionSpaceGraph.set(neigh_id, {
					id: neigh_id,
					data: neigh_state,
					incoming: [],
					outgoing: [],
					type: 1,
				});
				actionSpaceGraph.addEdge(current_id, neigh_id, action.id);

				const tentative_gScore = curr_gCost + action.cost;
				if (tentative_gScore < get_gCost(neigh_id)) {
					cameFrom.set(neigh_id, current_id);

					gCost.set(neigh_id, tentative_gScore);
					fCost.set(neigh_id, tentative_gScore + goal.ActionHeuristic(current_state, neigh_state, action));

					if (!openSet.includes(neigh_id)) openSet.push(neigh_id);
				}
			}
		}

		return undefined;
	}
}
