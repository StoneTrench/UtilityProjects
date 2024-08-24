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

	type GoalStateWFC = {
		values: { [hash: number]: number };
		counter: number;
		cursor: Vector;
		superPositions: Pathfinder.ActionSymbol[];
	};
	type GoalTileWFC = { value: string; edges: string[]; id: string };
	export class GoalWFC implements Pathfinder.Goal<GoalStateWFC> {
		/**
		 * 	State
		 * 		Has a map of the
		 */
		private readonly directions: Vector[] = [new Vector(0, 1), new Vector(1, 0), new Vector(0, -1), new Vector(-1, 0)];
		private readonly directions_inverse: number[] = [2, 3, 0, 1];
		size: Vector;
		maxCount: number;

		constructor(size: Vector, tiles?: { value: string; edges: string[] }[]) {
			tiles ??= [
				{
					value: "--",
					edges: [" ", "#", " ", "#"],
				},
				{
					value: "| ",
					edges: ["#", " ", "#", " "],
				},
				{
					value: "+-",
					edges: ["#", "#", "#", "#"],
				},
				{
					value: "  ",
					edges: [" ", " ", " ", " "],
				},
			];

			this.tiles = tiles.map((e, i) => {
				return {
					value: e.value,
					edges: e.edges,
					id: `set_tile_${i}`,
				};
			});
			for (let index = 0; index < this.tiles.length; index++) {
				this.actions.push({
					id: `set_tile_${index}`,
					onCallAlteration: (state) => this.setTile(state, index),
					cost: 1,
				});
			}
			this.size = size.clone();
			this.maxCount = size.volume();
			this.startingState = {
				values: {},
				counter: 0,
				cursor: size.mapClone((e) => 0),
				superPositions: this.tiles.map((e) => e.id),
			};
		}

		getValueFromState(state: GoalStateWFC, vec: Vector): number {
			return state.values[vec.toString()] ?? -1;
		}
		setValueToState(state: GoalStateWFC, vec: Vector, value: number) {
			state.values[vec.toString()] = value;
		}
		cloneState(state: GoalStateWFC): GoalStateWFC {
			return {
				values: Object.fromEntries(Object.entries(state.values)),
				counter: state.counter,
				cursor: state.cursor.clone(),
				superPositions: [...state.superPositions],
			};
		}

		setTile(state: GoalStateWFC, index: number): GoalStateWFC {
			const clone = this.cloneState(state);
			this.setValueToState(clone, clone.cursor, index);
			clone.counter++;
			return clone;
		}
		moveCursor(state: GoalStateWFC): GoalStateWFC {
			const clone = this.cloneState(state);
			clone.cursor.translate(1).forEach((e, i, self) => {
				if (e >= this.size.get(i)) {
					self.set(i, 0);
					if (i + 1 < self.getDimensions()) self.set(i + 1, self.get(i + 1) + 1);
				}
			});
			const neighs = this.directions.map((e) => this.tiles[this.getValueFromState(clone, clone.cursor.plus(e))]);
			clone.superPositions = this.tiles
				.filter((self) =>
					self.edges.every((edge, i) => neighs[i] == undefined || edge == neighs[i].edges[this.directions_inverse[i]])
				)
				.map((e) => e.id);
			return clone;
		}

		tiles: GoalTileWFC[] = [];

		startingState: GoalStateWFC;
		actions: Pathfinder.Action<GoalStateWFC>[] = [
			{
				id: "move_cursor",
				cost: 1,
				onCallAlteration: (state) => this.moveCursor(state),
			},
		];

		ActionHeuristic(current_state: GoalStateWFC, next_state: GoalStateWFC, action?: Pathfinder.Action<GoalStateWFC>): number {
			return Math.random() * 2 - (next_state.counter * 10);
		}
		CanTakeAction(current_state: GoalStateWFC, next_state: GoalStateWFC, action?: Pathfinder.Action<GoalStateWFC>): boolean {
			if (this.getValueFromState(current_state, current_state.cursor) != -1) {
				if (action.id == "move_cursor") return true;
				return false;
			}

			if (action.id == "move_cursor") return false;
			if (current_state.superPositions.includes(action.id)) return true;
			return false;
		}
		HasBeenReached(state: GoalStateWFC): boolean {
			return state.counter >= this.maxCount;
		}
		HashState(state: GoalStateWFC): string {
			const valuesString = Object.entries(state.values)
				.map(([key, value]) => `${key}:${value}`)
				.join("|");

			const cursorString = `${state.cursor.x},${state.cursor.y},${state.cursor.z}`;

			return `${valuesString}|${state.counter}|${cursorString}`;
		}
	}
}
