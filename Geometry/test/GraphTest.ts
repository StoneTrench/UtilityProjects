import test, { TestContext } from "node:test";
import { Graph, TNodeGraphML, TEdgeGraphML, SHOULD_BREAK } from "../src/geometry";

type G = Graph<TNodeGraphML, TEdgeGraphML>;

async function checkEquals(test: TestContext, graph: G, other: G) {
	await test.test("Checking equality", async (t0) => {
		if (!graph.reduce((res, curr, i) => JSON.stringify(other.get(i)) === JSON.stringify(curr) && res, true))
			t0.assert.fail("Two graphs were not equal!");
	});
}
async function checkNotEquals(test: TestContext, graph: G, other: G) {
	await test.test("Checking equality", async (t0) => {
		if (graph.reduce((res, curr, i) => JSON.stringify(other.get(i)) === JSON.stringify(curr) && res, true))
			t0.assert.fail("Two graphs were equal!");
	});
}

async function testGraph(test: TestContext, graph: G) {
	await test.test("Testing toString", async (t0) => {
		graph.toString();
	});
	await test.test("Testing exportToGraphML", async (t0) => {
		graph.exportToGraphML();
	});
	await test.test("Testing serialize", async (t0) => {
		graph.serialize();
	});
	await test.test("Testing forEach", async (t0) => {
		graph.forEach(() => {});
	});
	await test.test("Testing forEachBreak", async (t0) => {
		graph.forEachBreak(() => SHOULD_BREAK.NO);
	});
	await test.test("Testing filter", async (t0) => {
		graph.filter(() => true);
	});
	await test.test("Testing mapClone same", async (t0) => {
		const newGraph = graph.mapClone((e) => e);
        checkEquals(t0, graph, newGraph)
	});
	await test.test("Testing mapClone different", async (t0) => {
		const newGraph = graph.mapClone((e) => {
			const newE = structuredClone(e);

			newE.data = {
				label: "New " + e.data.label,
			};

			return newE;
		});
        checkNotEquals(t0, graph, newGraph)
	});
}

test("Graph test", async (t0) => {
	await t0.test("A --> B", async (t1) => {
		const graph: G = new Graph();

		await t1.test("Setup", async (t2) => {
			graph.addNode(0, {
				label: "A",
			});
			graph.addNode(1, {
				label: "B",
			});

			graph.addEdge(0, 1, {
				label: "connection",
			});
		});

		await testGraph(t1, graph);

		await t1.test("removeEdge A --> B", async (t2) => {
			graph.removeEdge(0, 1);
		});
		await t1.test("removeNode A", async (t2) => {
			graph.removeNode(0);
		});
		await t1.test("removeNode B", async (t2) => {
			graph.removeNode(1);
		});
	});

	await t0.test("A <-- B", async (t1) => {
		const graph: G = new Graph();

		await t1.test("Setup", async (t2) => {
			graph.addNode(0, {
				label: "A",
			});
			graph.addNode(1, {
				label: "B",
			});

			graph.addEdge(1, 0, {
				label: "connection",
			});
		});

		await testGraph(t1, graph);

		await t1.test("removeEdge A <-- B", async (t2) => {
			graph.removeEdge(1, 0);
		});
		await t1.test("removeNode A", async (t2) => {
			graph.removeNode(0);
		});
		await t1.test("removeNode B", async (t2) => {
			graph.removeNode(1);
		});
	});

	await t0.test("A <-> B", async (t1) => {
		const graph: G = new Graph();

		await t1.test("Setup", async (t2) => {
			graph.addNode(0, {
				label: "A",
			});
			graph.addNode(1, {
				label: "B",
			});

			graph.addEdge(0, 1, {
				label: "connection A",
			});
			graph.addEdge(1, 0, {
				label: "connection B",
			});
		});

		await testGraph(t1, graph);

		await t1.test("removeEdge A --> B", async (t2) => {
			graph.removeEdge(0, 1);
		});
		await t1.test("removeEdge A <-- B", async (t2) => {
			graph.removeEdge(0, 1);
		});
		await t1.test("removeNode A", async (t2) => {
			graph.removeNode(0);
		});
		await t1.test("removeNode B", async (t2) => {
			graph.removeNode(1);
		});
	});
});
