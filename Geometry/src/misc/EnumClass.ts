export class EnumClass<T> {
	protected constructor(private readonly key: string, public readonly value: T) {}

	toString() {
		return this.key;
	}
}
