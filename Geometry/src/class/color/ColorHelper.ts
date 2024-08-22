import { Color } from "./Color";

export namespace ColorHelper {
	export function Average(colors: Color[]): Color {
		return colors
			.map((e) => e.linearizeGammaSRGB())
			.reduce((a, b) => a.plus(b))
			.scale(1 / colors.length)
			.unlinearizeGammaSRGB();
	}
}
