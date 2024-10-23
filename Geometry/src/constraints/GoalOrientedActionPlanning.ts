import { GraphSymbol } from "../graph/Graph";

export namespace GOAP {
	export type Status = "success" | "failure" | "timeout";
	export type ActionSymbol = string;
	export type Action<T> = {
		id: ActionSymbol;
		onCallAlteration: (current_state: T) => T;
		cost: number;
	};
	export type PlanResult<T> = {
		status: Status;
		actions: ActionSymbol[];
		lastState: T;
		edges: Map<GraphSymbol, [GraphSymbol, ActionSymbol][]>;
	};
	export interface Goal<T> {
		actions: Action<T>[];
		startingState: T;

		ActionHeuristic(current_state: T, next_state: T, action?: Action<T>): number;
		CanTakeAction(current_state: T, next_state: T, action?: Action<T>): boolean;
		HasBeenReached(current_state: T): boolean;

		HashState(state: T): string;
	}

	export function FindPlan<T>(
		goal: Goal<T>,
		maxCycles?: number,
		bestPlanCallback?: (state: T, heuristic: number) => void
	): PlanResult<T> {
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

		maxCycles ??= Number.POSITIVE_INFINITY;

		const generateResult = (id: GraphSymbol, state: T, status: Status) => {
			const result: ActionSymbol[] = [];
			let curr = id;
			while (true) {
				const prev = cameFrom.get(curr);
				if (prev == undefined) break;
				result.unshift(actionSpace_edges.get(prev).find((e) => e[0] == curr)[1]);
				curr = prev;
			}
			return {
				status: status,
				actions: result,
				lastState: state,
				edges: actionSpace_edges,
			};
		};

		const actionSpace_edges = new Map<GraphSymbol, [GraphSymbol, ActionSymbol][]>();
		const actionSpace_nodes = new Map<GraphSymbol, T>();
		const startId = goal.HashState(goal.startingState);
		actionSpace_nodes.set(startId, goal.startingState);

		const openSet: GraphSymbol[] = [startId];

		const cameFrom = new Map<GraphSymbol, GraphSymbol>();

		// Cost of cheapest path to the node on the graph
		const gCost = new Map<GraphSymbol, number>();
		gCost.set(startId, 0);
		const get_gCost = (key: GraphSymbol) => gCost.get(key) ?? Number.POSITIVE_INFINITY;

		// Cost of cheapest path to the node on the graph
		const fCost = new Map<GraphSymbol, number>();
		gCost.set(startId, 0);
		// const get_fCost = (key: GraphSymbol) => fCost.get(key) ?? Number.POSITIVE_INFINITY;

		let last_id = undefined;
		let last_state = undefined;

		while (openSet.length > 0) {
			const current_id = openSet.reduce((a, b) => (fCost.get(a) < fCost.get(b) ? a : b));
			const current_state = actionSpace_nodes.get(current_id);
			last_id = current_id;
			last_state = current_state;

			if (bestPlanCallback !== undefined)
				bestPlanCallback(current_state, fCost.get(current_id));

			maxCycles--;
			if (maxCycles <= 0) {
				return generateResult(current_id, current_state, "timeout");
			}

			if (goal.HasBeenReached(current_state)) {
				return generateResult(current_id, current_state, "success");
			}

			openSet.splice(openSet.indexOf(current_id), 1);
			const curr_gCost = get_gCost(current_id);

			// Loop through each action
			for (const action of goal.actions) {
				const neigh_state = action.onCallAlteration(current_state);
				if (!goal.CanTakeAction(current_state, neigh_state, action)) continue;
				const neigh_id = goal.HashState(neigh_state);
				actionSpace_nodes.set(neigh_id, neigh_state);

				const curr_edges = actionSpace_edges.get(current_id) ?? [];
				curr_edges.push([neigh_id, action.id]);
				actionSpace_edges.set(current_id, curr_edges);

				const tentative_gScore = curr_gCost + action.cost;
				if (tentative_gScore < get_gCost(neigh_id)) {
					cameFrom.set(neigh_id, current_id);

					gCost.set(neigh_id, tentative_gScore);
					fCost.set(neigh_id, tentative_gScore + goal.ActionHeuristic(current_state, neigh_state, action));

					if (!openSet.includes(neigh_id)) openSet.push(neigh_id);
				}
			}

			actionSpace_nodes.delete(current_id);
		}

		return generateResult(last_id, last_state, "failure");
	}

	export function ExecutePlan<T>(goal: Goal<T>, plan: ActionSymbol[]): PlanResult<T> {
		return {
			actions: plan,
			edges: undefined,
			lastState: plan.reduce((res, e) => goal.actions.find((a) => a.id === e).onCallAlteration(res), goal.startingState),
			status: "success",
		};
	}
}
