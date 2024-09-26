import { Vector } from "../math/Vector";
import { Color } from "./Color";
import { Image } from "./Image";

export namespace ColorHelper {
	export function AverageColors(colors: Color[]): Color {
		return colors
			.map((e) => e.removeGammaSRGB())
			.reduce((a, b) => a.plus(b))
			.scale(1 / colors.length)
			.applyGammaSRGB();
	}
	export function Average(image: Image): Color {
		const size = image.getSize().volume();
		return image
			.map((e) => e.removeGammaSRGB())
			.reduce((a, b) => a.plus(b))
			.scale(1 / size)
			.applyGammaSRGB();
	}
	export function NoiseIndex(image: Image, kernelSize?: number, textureSize?: number): Color {
		kernelSize ??= 5;
		textureSize ??= 16;

		const kernelHalf = Math.floor(kernelSize / 2);

		const kernelVectors: Vector[] = [];
		for (let x = -kernelHalf; x <= kernelHalf; x++) {
			for (let y = -kernelHalf; y <= kernelHalf; y++) {
				kernelVectors.push(new Vector(x, y));
			}
		}

		const sqKernelScalar = 1 / kernelVectors.length;
		const sqTextureSize = textureSize ** 2;

		const removedSRGBImage = image.mapClone((e) => e.removeGammaSRGB());

		return removedSRGBImage
			.map((_, index) => {
				return kernelVectors
					.reduce((res, vec) => {
						return res.plus(removedSRGBImage.get(index.plus(vec)));
					}, new Color(0, 0, 0, 0))
					.scale(sqKernelScalar);
			})
			.reduce((a, b) => a.plus(b))
			.scale(1 / sqTextureSize)
			.applyGammaSRGB();
	}
	export function ImageKernelRaw(image: Image, kernel: Color[], offsets: Vector[]): Image {
		return image.mapClone((_, index) => {
			return offsets.reduce((res, vec, i) => {
				return res.plus(image.get(index.plus(vec)).multiply(kernel[i]));
			}, new Color(0, 0, 0, 0));
		});
	}
}
