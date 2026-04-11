export type RGBA = [red: number, green: number, blue: number, alpha: number];
type RGBAModel = { r: number; g: number; b: number; a: number };

export enum TraverseMode {
    RowMajor,
    ColMajor
}

export interface PixelStream {
    getPixel(x: number, y: number): RGBA;
    setPixel(x: number, y: number, rgba: RGBA): RGBA;
    forEach(mode: TraverseMode, callback: (rgba: RGBA, x: number, y: number) => void): void;
}

// Один `Array` чисел длины `width*height*4`
export class FlatArrayPixelStream implements PixelStream {
    private data: Array<number>;
    private width: number;
    private height: number;

    constructor(data: RGBA, width: number, height: number) {
        this.width = width;
        this.height = height;

        const size = width * height * 4;
        this.data = Array(size).fill(0);
    }

    setPixel(x: number, y: number, rgba: RGBA): RGBA {
        const index = (y * this.width + x) * 4;
        this.data[index] = rgba[0];
        this.data[index + 1] = rgba[1];
        this.data[index + 2] = rgba[2];
        this.data[index + 3] = rgba[3];

        return this.getPixel(x, y);
    }

    getPixel(x: number, y: number): RGBA {
        const index = (y * this.width + x) * 4;

        return [this.data[index], this.data[index + 1], this.data[index + 2], this.data[index + 3]];
    }

    forEach(mode: TraverseMode, callback: (rgba: RGBA, x: number, y: number) => void) {
        if (mode === TraverseMode.RowMajor) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    callback(this.getPixel(x, y), x, y);
                }
            }
        }
        else {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    callback(this.getPixel(x, y), x, y);
                }
            }
        }
    }
}

// Массив массивов: `[[r,g,b,a], ...]`
export class ArrayOfArraysPixelStream implements PixelStream {
    private data: Array<RGBA>;
    private width: number;
    private height: number;

    constructor(data: RGBA, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.data = Array(height).fill(null).map(() => [...data] as RGBA);
    }

    setPixel(x: number, y: number, rgba: RGBA): RGBA {
        this.data[y] = [...rgba];

        return this.getPixel(x, y);
    }

    getPixel(_x: number, y: number): RGBA {
        return [...this.data[y]] as RGBA;
    }

    forEach(mode: TraverseMode, callback: (rgba: RGBA, x: number, y: number) => void) {
        if (mode === TraverseMode.RowMajor) {
            for (let y = 0; y < this.height; y++) {
                const pixel = this.getPixel(0, y);
                for (let x = 0; x < this.width; x++) {
                    callback(pixel, x, y);
                }
            }
        }
        else {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    callback(this.getPixel(x, y), x, y);
                }
            }
        }
    }
}

// Массив объектов: `[{r,g,b,a}, ...]`
export class ArrayOfObjectsPixelStream implements PixelStream {
    private data: Array<RGBAModel>;
    private width: number;
    private height: number;

    constructor(data: RGBA, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.data = Array.from({ length: width * height }, () => {
            return {r: data[0], g: data[1], b: data[2], a: data[3]};
        });
    }

    setPixel(x: number, y: number, rgba: RGBA): RGBA {
        const currPixel = this.getPixel(x, y);
        this.data[y] = { r: rgba[0], g: rgba[1], b: rgba[2], a: rgba[3] };

        return currPixel;
    }

    getPixel(_x: number, y: number): RGBA {
        const currPixel = this.data[y];
        return [currPixel.r, currPixel.g, currPixel.b, currPixel.a];
    }

    forEach(mode: TraverseMode, callback: (rgba: RGBA, x: number, y: number) => void) {
        if (mode === TraverseMode.RowMajor) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    callback(this.getPixel(x, y), x, y);
                }
            }
        }
        else {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    callback(this.getPixel(x, y), x, y);
                }
            }
        }
    }
}

// Один `Uint8Array` длины `width*height*4`
export class Uint8ArrayPixelStream implements PixelStream {
    private data: Uint8Array;
    private width: number;
    private height: number;

    constructor(data: RGBA, width: number, height: number) {
        this.width = width;
        this.height = height;
        this.data = Uint8Array.from(
            { length: width * height * 4 },
            (_val, key) => data[key % 4]
        );
    }

    setPixel(x: number, y: number, rgba: RGBA): RGBA {
        const currPixel = this.getPixel(x, y);

        const index = (y * this.width + x) * 4;
        this.data[index] = rgba[0];
        this.data[index + 1] = rgba[1];
        this.data[index + 2] = rgba[2];
        this.data[index + 3] = rgba[3];

        return currPixel;
    }

    getPixel(x: number, y: number): RGBA {
        const index = (y * this.width + x) * 4;

        return [this.data[index], this.data[index + 1], this.data[index + 2], this.data[index + 3]];
    }

    forEach(mode: TraverseMode, callback: (rgba: RGBA, x: number, y: number) => void) {
        if (mode === TraverseMode.RowMajor) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    callback(this.getPixel(x, y), x, y);
                }
            }
        }
        else {
            for (let x = 0; x < this.width; x++) {
                for (let y = 0; y < this.height; y++) {
                    callback(this.getPixel(x, y), x, y);
                }
            }
        }
    }
}
