import Jimp from "jimp";
import {
    BreakPredicateFunction,
    ForEachFunction,
    IArrayLikeHelper,
    IArrayLikeMapping,
    MapFunction,
    SHOULD_BREAK,
} from "../../IArrayFunctions";
import Vector from "../Vector";
import { Color } from "./Color";

export class Image implements IArrayLikeMapping<Color, Vector> {
	private pixels: { [hash: number]: Color };
	private size: Vector;

	constructor(size: Vector) {
		this.pixels = {};
		this.size = size.clone();
	}
	mapClone<t>(func: MapFunction<Color, Vector, t, this>): Image {
		return IArrayLikeHelper.MapClone(this, new Image(this.size), func);
	}
	map<t>(func: MapFunction<Color, Vector, t, this>): t[] {
		return IArrayLikeHelper.Map(this, func);
	}
	forEach(func: ForEachFunction<Color, Vector, this>): this {
		for (let x = 0; x < this.size.x; x++) {
			for (let y = 0; y < this.size.y; y++) {
				const key = new Vector(x, y);
				func(this.get(key), key, this);
			}
		}
		return this;
	}
	forEachBreak(func: BreakPredicateFunction<Color, Vector, this>): Vector {
		for (let x = 0; x < this.size.x; x++) {
			for (let y = 0; y < this.size.y; y++) {
				const key = new Vector(x, y);
				if (func(this.get(key), key, this) === SHOULD_BREAK.YES) return key;
			}
		}
		return undefined;
	}
	get(index: Vector): Color {
		return this.pixels[index.hash()];
	}
	set(index: Vector, value: Color): this {
		this.pixels[index.hash()] = value;
		return this;
	}

	static async readFile(filePath: string) {
		const bitmap = (await Jimp.read(filePath)).bitmap;
		const image = new Image(new Vector(bitmap.width, bitmap.height));
		for (let y = 0; y < bitmap.height; y++) {
			for (let x = 0; x < bitmap.width; x++) {
				const idx = (y * bitmap.width + x) * 4;
				const r = bitmap.data[idx];
				const g = bitmap.data[idx + 1];
				const b = bitmap.data[idx + 2];
				const a = bitmap.data[idx + 3];
				image.set(new Vector(x, y), new Color(r, g, b, a));
			}
		}
		return image;
	}
}
