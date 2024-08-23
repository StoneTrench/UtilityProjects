import Grid from "../Grid3D";
import Vector from "../Vector";
import { Pathfinder } from "./Pathfinder";

export namespace Goals {
	export class Goal2D implements Pathfinder.Goal<Vector> {
		private target: Vector;
		private start: Vector;
		private world: Grid<number>;

		constructor(world: Grid<number>, start: Vector, target: Vector) {
			this.startingState = start.clone();
			this.start = start.clone();
			this.target = target.clone();
			this.world = world;
		}
		startingState: Vector;
		actions: Pathfinder.Action<Vector>[] = [
			{
				id: "up",
				cost: 0,
				onCallAlteration: (curr) => curr.offset(0, 1),
			},
			{
				id: "down",
				cost: 0,
				onCallAlteration: (curr) => curr.offset(0, -1),
			},
			{
				id: "left",
				cost: 0,
				onCallAlteration: (curr) => curr.offset(-1, 0),
			},
			{
				id: "right",
				cost: 0,
				onCallAlteration: (curr) => curr.offset(1, 0),
			},
			{
				id: "up-right",
				cost: 1,
				onCallAlteration: (curr) => curr.offset(1, 1),
			},
			{
				id: "up-left",
				cost: 1,
				onCallAlteration: (curr) => curr.offset(1, -1),
			},
			{
				id: "down-right",
				cost: 1,
				onCallAlteration: (curr) => curr.offset(-1, 1),
			},
			{
				id: "down-left",
				cost: 1,
				onCallAlteration: (curr) => curr.offset(-1, -1),
			},
		];

		ActionHeuristic(current_state: Vector, next_state: Vector, action?: Pathfinder.Action<Vector>): number {
			return this.target.minus(next_state).lengthMax() - this.start.minus(next_state).lengthMax() / 2;
		}
		CanTakeAction(current_state: Vector, next_state: Vector, action?: Pathfinder.Action<Vector>): boolean {
			if (this.world.get(next_state) == 1) return false;
			return true;
		}
		HasBeenReached(state: Vector): boolean {
			return this.target.equals(state);
		}
		HashState(state: Vector): string {
			return state.toString();
		}
	}
}
