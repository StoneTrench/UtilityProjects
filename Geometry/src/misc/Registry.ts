export class Registry<T> {
	private static registries: Map<string, Registry<any>> = new Map();
	private elements: Map<string, T> = new Map();

	constructor(public readonly name: string) {
		if (Registry.registries.has(name)) throw new Error(`Registry with name "${name}" already exists!`);
		Registry.registries.set(this.name, this);
	}

	static GetRegistryByName<T>(name: string) {
		return Registry.registries.get(name) as Registry<T>;
	}

	Register<M extends T>(name: string, value: M) {
		if (this.elements.has(name)) throw new Error(`Element with name "${name}" already exists inside registry ${this.name}!!`);
		this.elements.set(name, value);
		return value;
	}
	GetByName<M extends T>(name: string) {
		if (!this.elements.has(name)) throw new Error(`Couldn't find element with name "${name}" inside registry ${this.name}!`);
		return this.elements.get(name) as M
	}
}
