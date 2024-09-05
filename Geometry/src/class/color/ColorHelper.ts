import { Color } from "./Color";

export namespace ColorHelper {
	export function Average(colors: Color[]): Color {
		return colors
			.map((e) => e.removeGammaSRGB())
			.reduce((a, b) => a.plus(b))
			.scale(1 / colors.length)
			.applyGammaSRGB();
	}
}
