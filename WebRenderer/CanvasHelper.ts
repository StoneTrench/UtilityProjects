import { CanvasRenderingContext2D, CanvasGradient, CanvasPattern } from "canvas";

export namespace CanvasHelper {
	export type Point = { x: number; y: number };
	export function DrawSegment(
		context: CanvasRenderingContext2D,
		a: Point,
		b: Point
	) {
		context.moveTo(a.x, a.y);
		context.lineTo(b.x, b.y);
	}
    export function SetBackground(
		context: CanvasRenderingContext2D,
        fillColor: string | CanvasGradient | CanvasPattern
	) {
        SaveCurrentStyle(context);
        context.fillStyle = fillColor;
		context.fillRect(0, 0, context.canvas.width, context.canvas.height)
        RestoreCurrentStyle(context)
	}
	const savedStyles: any[][] = [];
	export function SaveCurrentStyle(context: CanvasRenderingContext2D) {
		savedStyles.push([context.strokeStyle, context.fillStyle]);
	}
	export function RestoreCurrentStyle(context: CanvasRenderingContext2D) {
		const last = savedStyles.pop();
        if (last == undefined) return;
		context.strokeStyle = last[0];
		context.fillStyle = last[0];
	}
}
