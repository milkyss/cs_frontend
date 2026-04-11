import {
    TraverseMode,
    RGBA,
    PixelStream,
    FlatArrayPixelStream,
    ArrayOfArraysPixelStream,
    ArrayOfObjectsPixelStream, Uint8ArrayPixelStream,
} from './index';

interface BenchmarkResult {
    name: string;
    operation: string;
    timeMs: number;
    operationsPerSecond: number;
}

class PixelStreamBenchmark {
    private sizes: Array<{width: number; height: number; name: string}> = [
        {width: 100, height: 100, name: "10K пикселей"},
        {width: 500, height: 500, name: "250K пикселей"},
        {width: 1000, height: 1000, name: "1M пикселей"},
        {width: 2000, height: 2000, name: "4M пикселей"}
    ];

    private testColor: RGBA = [255, 128, 64, 255];
    private newColor: RGBA = [64, 128, 255, 255];

    async runAll(): Promise<void> {
        console.log("🚀 Запуск бенчмарков PixelStream\n");
        console.log("=" .repeat(80));

        for (const size of this.sizes) {
            console.log(`\n📐 Размер: ${size.width}x${size.height} (${size.name})`);
            console.log("-".repeat(80));

            await this.benchmarkSize(size.width, size.height);
        }
    }

    private async benchmarkSize(width: number, height: number): Promise<void> {
        const implementations = [
            { name: "FlatArrayPixelStream", create: () => new FlatArrayPixelStream(this.testColor, width, height) },
            { name: "ArrayOfArraysPixelStream", create: () => new ArrayOfArraysPixelStream(this.testColor, width, height) },
            { name: "ArrayOfObjectsPixelStream", create: () => new ArrayOfObjectsPixelStream(this.testColor, width, height) },
            { name: "Uint8ArrayPixelStream", create: () => new Uint8ArrayPixelStream(this.testColor, width, height) }
        ];

        const operations = [
            { name: "setPixel (один пиксель)", fn: (stream: PixelStream) => this.benchmarkSetPixel(stream, width, height) },
            { name: "getPixel (один пиксель)", fn: (stream: PixelStream) => this.benchmarkGetPixel(stream, width, height) },
            { name: "forEach - RowMajor", fn: (stream: PixelStream) => this.benchmarkForEach(stream, TraverseMode.RowMajor) },
            { name: "forEach - ColMajor", fn: (stream: PixelStream) => this.benchmarkForEach(stream, TraverseMode.ColMajor) },
            { name: "setPixel (все пиксели)", fn: (stream: PixelStream) => this.benchmarkSetAllPixels(stream, width, height) },
            { name: "getPixel (все пиксели)", fn: (stream: PixelStream) => this.benchmarkGetAllPixels(stream, width, height) },
            { name: "Смешанная нагрузка (70% get, 30% set)", fn: (stream: PixelStream) => this.benchmarkMixedLoad(stream, width, height) },
            { name: "Увеличение яркости (+50 к каналу)", fn: (stream: PixelStream) => this.increaseBrightness(stream, width, height) },
            { name: "Увеличение яркости в forEach (+50 к каналу)", fn: (stream: PixelStream) => this.increaseBrightnessForEach(stream, TraverseMode.RowMajor) },
        ];

        for (const impl of implementations) {
            console.log(`\n  📦 ${impl.name}:`);

            for (const op of operations) {
                const stream = impl.create();
                const result = await this.measurePerformance(() => op.fn(stream));
                console.log(`    ${op.name.padEnd(35)}: ${result.timeMs.toFixed(2)}ms (${result.operationsPerSecond.toFixed(0)} ops/sec)`);
            }
        }
    }

    private async measurePerformance(fn: () => void): Promise<BenchmarkResult> {
        // Прогрев
        for (let i = 0; i < 3; i++) {
            fn();
        }

        const sampleStart = performance.now();
        fn();
        const sampleEnd = performance.now();
        const singleTime = Math.max(0.0001, sampleEnd - sampleStart);

        const neededIterations = Math.floor(500 / singleTime);

        let iterations = 5;
        iterations = Math.max(iterations, neededIterations);
        iterations = Math.min(iterations, 10000000); // Максимум 10 млн

        // Измерение
        const start = performance.now();

        for (let i = 0; i < iterations; i++) {
            fn();
        }

        const end = performance.now();
        const totalTimeMs = end - start;
        const avgTime = totalTimeMs / iterations;
        const operationsPerSecond = (iterations / totalTimeMs) * 1000;

        return {
            name: "",
            operation: "",
            timeMs: avgTime,
            operationsPerSecond,
        };
    }

    // Бенчмарк: установка одного пикселя
    private benchmarkSetPixel(stream: PixelStream, width: number, height: number): void {
        const x = Math.floor(width / 2);
        const y = Math.floor(height / 2);
        stream.setPixel(x, y, this.newColor);
    }

    // Бенчмарк: получение одного пикселя
    private benchmarkGetPixel(stream: PixelStream, width: number, height: number): void {
        const x = Math.floor(width / 2);
        const y = Math.floor(height / 2);
        stream.getPixel(x, y);
    }

    // Бенчмарк: forEach обход
    private benchmarkForEach(stream: PixelStream, mode: TraverseMode): void {
        let sum = 0;
        stream.forEach(mode, (rgba) => {
            sum += rgba[0] + rgba[1] + rgba[2] + rgba[3];
        });
    }

    // Бенчмарк: установка всех пикселей
    private benchmarkSetAllPixels(stream: PixelStream, width: number, height: number): void {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                stream.setPixel(x, y, this.newColor);
            }
        }
    }

    // Бенчмарк: получение всех пикселей
    private benchmarkGetAllPixels(stream: PixelStream, width: number, height: number): void {
        let sum = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixel = stream.getPixel(x, y);
                sum += pixel[0] + pixel[1] + pixel[2] + pixel[3];
            }
        }
    }

    // Бенчмарк: смешанная нагрузка
    private benchmarkMixedLoad(stream: PixelStream, width: number, height: number): void {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (Math.random() < 0.7) {
                    // 70% get операций
                    stream.getPixel(x, y);
                } else {
                    // 30% set операций
                    stream.setPixel(x, y, this.newColor);
                }
            }
        }
    }

    private increaseBrightness(stream: PixelStream, width: number, height: number) {
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixel = stream.getPixel(x, y);
                const brighter: RGBA = [
                    Math.min(255, pixel[0] + 50),
                    Math.min(255, pixel[1] + 50),
                    Math.min(255, pixel[2] + 50),
                    pixel[3]
                ];
                stream.setPixel(x, y, brighter);
            }
        }
    }

    private increaseBrightnessForEach(stream: PixelStream, mode: TraverseMode) {
        stream.forEach(mode, (rgba, x: number, y: number) => {
            const brighter: RGBA = [
                Math.min(255, rgba[0] + 50),
                Math.min(255, rgba[1] + 50),
                Math.min(255, rgba[2] + 50),
                rgba[3],
            ];
            stream.setPixel(x, y, brighter);
        });
    }
}

// ============ Тест кэш-локальности ============

class CacheLocalityBenchmark {
    async run(): Promise<void> {
        console.log("\n💾 Тест кэш-локальности (4K изображение):");
        console.log("=" .repeat(80));

        const width = 3840;
        const height = 2160;
        const implementations = [
            { name: "FlatArrayPixelStream", create: () => new FlatArrayPixelStream([0,0,0,1], width, height) },
            { name: "Uint8ArrayPixelStream", create: () => new Uint8ArrayPixelStream([0,0,0,1], width, height) }
        ];

        for (const impl of implementations) {
            const stream = impl.create();

            // Row-major обход
            const startRow = performance.now();
            stream.forEach(TraverseMode.RowMajor, (rgba) => {const sum = rgba[0] + rgba[1] + rgba[2]; return sum;});
            const rowTime = performance.now() - startRow;

            // Col-major обход (плохая локальность)
            const startCol = performance.now();
            stream.forEach(TraverseMode.ColMajor, (rgba) => {const sum = rgba[0] + rgba[1] + rgba[2]; return sum;});
            const colTime = performance.now() - startCol;

            console.log(`\n  ${impl.name}:`);
            console.log(`    Row-major: ${rowTime.toFixed(2)}ms`);
            console.log(`    Col-major: ${colTime.toFixed(2)}ms`);
            console.log(`    Разница: ${((colTime / rowTime) * 100 - 100).toFixed(1)}% медленнее`);
        }
    }
}

// ============ Запуск всех тестов ============

async function runAllBenchmarks() {
    console.clear();

    const mainBenchmark = new PixelStreamBenchmark();
    await mainBenchmark.runAll();

    const cacheBenchmark = new CacheLocalityBenchmark();
    await cacheBenchmark.run();

    console.log("\n✅ Бенчмарки завершены!");
}

// Запуск
runAllBenchmarks().catch(console.error);
