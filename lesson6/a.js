function createPackedArray(width) {
	return Array.from({length: width}, (_v, k) => k);
}

function createHoleyArray(width) {
	const holeyArray = [];

	for (let i = width; i--;) {
		holeyArray[i] = i;
	}

	return holeyArray;
}

function createRealHoleyArray(width) {
	const arr = new Array(width);
	for (let i = 0; i < width; i += 2) {
		arr[i] = i;
	}
	return arr;
}

const ARRAY_SIZES = [100/*, 100 1000, 10_000, 100_000*/];
const OPERATIONS_COUNT = 1000;
const WARMUP_COUNT = 100;

const measurePerf = (cb) => {
	globalThis.gc?.();
	for (let i = 0; i < WARMUP_COUNT; i++) {
		cb();
	}

	globalThis.gc?.();

	const stats = [];
	for(let i = 0; i < OPERATIONS_COUNT; i++) {
		const sampleStart = performance.now();

		cb();

		stats.push((performance.now() - sampleStart) * 1000);
	}

	stats.sort((a, b) => a - b);
	const trimmed = stats.slice(
		Math.floor(stats.length * 0.1),
		Math.floor(stats.length * 0.9)
	);

	const avg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
	return { avg: avg.toFixed(2), unit: 'μs' };
}

const benchmarkPush = (size, createFn) => {
	return measurePerf(() => {
		const arr = createFn(0);
		for (let i = 0; i < size; i++) {
			arr.push(i);
		}
	});
};

const benchmarkPop = (size, createFn) => {
	return measurePerf(() => {
		const arr = createFn(size);
		for (let i = 0; i < size; i++) {
			arr.pop();
		}
	});
};

const benchmarkUnshift = (size, createFn) => {
	return measurePerf(() => {
		const arr = createFn(0);

		for (let i = 0; i < size; i++) {
			arr.unshift(i);
		}
	});
};

const benchmarkShift = (size, createFn) => {
	return measurePerf(() => {
		const arr = createFn(size);
		for (let i = 0; i < size; i++) {
			arr.shift();
		}
	});
};

const benchmarkMixedPushShift = (size, createFn) => {
	return measurePerf(() => {
		const arr = createFn(0);
		for (let i = 0; i < size; i++) {
			if (i % 2 === 0) {
				arr.push(i);
			} else {
				arr.unshift(i);
			}
		}
	});
}

const benchmarkAlternating = (size, createFn) => {
	return measurePerf(() => {
		const arr = createFn(size);
		for (let i = 0; i < size; i++) {
			if (i % 4 === 0) {
				arr.push(i);
				//arr.pop();
			} else if (i % 4 === 1) {
				arr.pop();
				//arr.push(i);
			} else if (i % 4 === 2) {
				arr.unshift(i);
				//arr.shift();
			} else {
				arr.shift();
				//arr.unshift(i);
			}
		}
	});
}

const runTest = () => {
	const results = [];
	const implementations = [
		//{name: 'Holey', create: createRealHoleyArray},
		{name: 'Packed', create: createPackedArray},
		{name: 'Holey', create: createHoleyArray},
	];

	console.log('Запуск бенчмарков\n');
	console.log('-'.repeat(50));

	for (let size of ARRAY_SIZES) {
		console.log(`\nРазмер массива: ${size}`);
		console.log('-'.repeat(50));

		for (let impl of implementations) {
			console.log(`\n🔷 ${impl.name} массив:`);

			const pushResult = benchmarkPush(size, impl.create);
			console.log(`  📌 push (добавление в конец):             ${pushResult.avg} ${pushResult.unit}`);
			results.push({ impl: impl.name, operation: 'push', size, ...pushResult });

			const popResult = benchmarkPop(size, impl.create);
			console.log(`  ✂️  pop (удаление из конца):              ${popResult.avg} ${popResult.unit}`);
			results.push({ impl: impl.name, operation: 'pop', size, ...popResult });

			const unshiftResult = benchmarkUnshift(size, impl.create);
			console.log(`  📌 unshift (добавление в начало):         ${unshiftResult.avg} ${unshiftResult.unit}`);
			results.push({ impl: impl.name, operation: 'unshift', size, ...unshiftResult });

			const shiftResult = benchmarkShift(size, impl.create);
			console.log(`  ✂️  shift (удаление из начала):           ${shiftResult.avg} ${shiftResult.unit}`);
			results.push({ impl: impl.name, operation: 'shift', size, ...shiftResult });

			const mixedResult = benchmarkMixedPushShift(size, impl.create);
			console.log(`  🔄 mixed (push / shift):                  ${mixedResult.avg} ${mixedResult.unit}`);
			results.push({ impl: impl.name, operation: 'mixed', size, ...mixedResult });

			const altResult = benchmarkAlternating(size, impl.create);
			console.log(`  🎭 чередование:                           ${altResult.avg} ${altResult.unit}`);
			results.push({ impl: impl.name, operation: 'alternating', size, ...altResult });
		}
	}

	console.log('\n' + '='.repeat(50));
	console.log('\n📈 Сводная статистика (разница между Packed и Holey):');
	console.log('-'.repeat(50));

	const operations = ['push', 'pop', 'unshift', 'shift', 'mixed', 'alternating'];
	operations.forEach(op => {
		const packedResults = results.filter(r => r.impl === 'Packed' && r.operation === op);
		const holeyResults = results.filter(r => r.impl === 'Holey' && r.operation === op);

		if (packedResults.length > 0 && holeyResults.length > 0) {
			const avgPacked = packedResults.reduce((sum, r) => sum + parseFloat(r.avg), 0) / packedResults.length;
			const avgHoley = holeyResults.reduce((sum, r) => sum + parseFloat(r.avg), 0) / holeyResults.length;
			const diff = ((avgHoley - avgPacked) / avgPacked * 100).toFixed(1);

			console.log(`  ${op.padEnd(12)}: Packed=${avgPacked.toFixed(2)}μs, Holey=${avgHoley.toFixed(2)}μs, Holey ${diff > 0 ? 'медленнее' : 'быстрее'} на ${Math.abs(diff)}%`);
		}
	});

	console.log('\n✅ Бенчмарки завершены\n');
}

runTest();