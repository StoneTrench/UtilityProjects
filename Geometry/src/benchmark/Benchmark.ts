export function Benchmark(name: string, iter: number, func: (...args: any[]) => any, ...args: any[]) {
	console.log(`Benchmarking ${name}...`);
	console.log(`Result: ${BenchmarkSilent(iter, func, ...args)} ms`);
}
export function BenchmarkSilent(iter: number, func: (...args: any[]) => any, ...args: any[]) {
	return new Promise<number>((resolve) => {
		const startTime = Date.now();
		for (let i = 0; i < iter; i++) func(...args);
		const final = (Date.now() - startTime) / iter;
		resolve(final);
	});
}

export async function WaitForKeypress() {
	// process.stdin.setRawMode(true)
	console.log("Press any key to continue...");
	return new Promise<void>((resolve) =>
		process.stdin.once("data", (data) => {
			const byteArray = [...data];
			if (byteArray.length > 0 && byteArray[0] === 3) {
				console.log("^C");
				process.exit(1);
			}
			// process.stdin.setRawMode(false)
			resolve();
		})
	);
}
