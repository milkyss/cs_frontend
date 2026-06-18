type TArray = Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array;
type Constructor<T extends TArray> = new (length: number) => T;

export interface Node<T> {
	id: number;
	weight: number | undefined;
}

class Matrix<T extends TArray> {
	readonly width: number;
	readonly height: number;

	readonly buffer: T;

	constructor(ArrType: Constructor<T>, width: number, height: number) {
		this.width = width;
		this.height = height;

		this.buffer = new ArrType(width * height);
	}

	get(x: number, y: number): number {
		return this.buffer[x * this.width + y];
	}

	set(x: number, y: number, value: number) {
		this.buffer[x * this.width + y] = value;
	}
}

class Graph<T extends TArray> {
	constructor(readonly matrix: Matrix<T>) {}

	hasEdge(vertexA: number, vertexB: number): boolean {
		return this.matrix.get(vertexA, vertexB) !== 0 && this.matrix.get(vertexB, vertexA) !== 0;
	}

	addEdge(vertexA: number, vertexB: number, weight: number = 1): void {
		this.matrix.set(vertexA, vertexB, weight);
		this.matrix.set(vertexB, vertexA, weight);
	}

	removeEdge(vertexA: number, vertexB: number): void {
		this.matrix.set(vertexA, vertexB, 0);
		this.matrix.set(vertexB, vertexA, 0);
	}

	hasArc(from: number, to: number): boolean {
		return this.matrix.get(from, to) !== 0;
	}

	addArc(from: number, to: number, weight: number = 1): void {
		this.matrix.set(from, to, weight);
	}

	removeArc(from: number, to: number): void {
		this.matrix.set(from, to, 0);
	}

	traverseDFS(id: number, cb: (node: Node<T>, depth: number) => void): void {
		const visited = new Set<number>();
		const stack: Array<Node<T> & { depth: number }> = [
			{ id, depth: 0, weight: undefined }
		];

		console.log('=== DFS (Обход в глубину) ===');

		while (stack.length > 0) {
			const { id: currentId, depth, weight: edgeWeight } = stack.pop()!;

			if (visited.has(currentId)) {
				continue;
			}

			visited.add(currentId);

			const node: Node<T> = {
				id: currentId,
				weight: edgeWeight,
			};

			cb(node, depth);

			for (let neighbor = this.matrix.width - 1; neighbor >= 0; neighbor--) {
				const weight = this.matrix.get(currentId, neighbor);
				if (weight !== 0 && !visited.has(neighbor)) {
					stack.push({
						id: neighbor,
						depth: depth + 1,
						weight,
					});
				}
			}
		}
	}

	traverseBFS(id: number, cb: (node: Node<T>, depth: number) => void): void {
		const visited = new Set<number>();
		const queue: Array<Node<T> & { depth: number }> = [
			{ id, depth: 0, weight: undefined }
		];

		console.log('=== BFS (Обход в ширину) ===');

		while (queue.length > 0) {
			const { id: currentId, depth, weight: edgeWeight } = queue.shift()!;

			if (visited.has(currentId)) {
				continue;
			}

			visited.add(currentId);

			const node: Node<T> = {
				id: currentId,
				weight: edgeWeight,
			};

			cb(node, depth);

			for (let neighbor = 0; neighbor < this.matrix.width; neighbor++) {
				const weight = this.matrix.get(currentId, neighbor);
				if (weight !== 0 && !visited.has(neighbor)) {
					queue.push({
						id: neighbor,
						depth: depth + 1,
						weight,
					});
				}
			}
		}
	}
}

const matrix = new Matrix(Uint8Array, 10, 10);
const graph = new Graph(matrix);

graph.addEdge(1, 2, 1);
graph.addEdge(1, 7, 2);
graph.addEdge(7, 2, 2);
graph.addEdge(7, 3, 4);

console.log('hasEdge 1 -> 2', graph.hasEdge(1, 2));
console.log('hasArc 1 -> 2', graph.hasArc(1, 2));
console.log('hasEdge 7 -> 2', graph.hasEdge(7, 2));

graph.removeEdge(7, 2);
console.log('hasEdge after remove 7 -> 2', graph.hasEdge(7, 2), '\n');

function createDirectedMockGraph(): Graph<Uint8Array> {
	const matrix = new Matrix(Uint8Array, 6, 6);
	const graph = new Graph(matrix);

	graph.addArc(0, 1, 1);
	graph.addArc(0, 3, 4);
	graph.addArc(1, 2, 3);
	graph.addArc(1, 4, 1);
	graph.addArc(2, 5, 2);
	graph.addArc(3, 4, 1);
	graph.addArc(4, 5, 3);
	graph.addArc(4, 2, 5);

	return graph;
}

function testDirectedTraversals() {
	const graph = createDirectedMockGraph();

	console.log('Матрица смежности (орграф)');
	console.log('   ' + Array.from({ length: 6 }, (_, i) => i).join('  '));
	for (let i = 0; i < 6; i++) {
		let row = `${i}  `;
		for (let j = 0; j < 6; j++) {
			row += `${graph.matrix.get(i, j)}  `;
		}
		console.log(row);
	}
	console.log('\n');

	const printNode = (node: Node<Uint8Array>, depth: number) => {
		const weight = node.weight ? `, вес: ${node.weight}` : '';
		console.log(`  Узел: ${node.id}, глубина: ${depth}${weight}`);
	};

	console.log('Обход орграфа\n');
	graph.traverseDFS(0, printNode);
	console.log('\n');
	graph.traverseBFS(0, printNode);
}

testDirectedTraversals();
