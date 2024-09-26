var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
define("IArrayFunctions", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IArrayLikeHelper = exports.SHOULD_BREAK = void 0;
    var SHOULD_BREAK;
    (function (SHOULD_BREAK) {
        SHOULD_BREAK[SHOULD_BREAK["NO"] = 0] = "NO";
        SHOULD_BREAK[SHOULD_BREAK["YES"] = 1] = "YES";
    })(SHOULD_BREAK || (exports.SHOULD_BREAK = SHOULD_BREAK = {}));
    var IArrayLikeHelper;
    (function (IArrayLikeHelper) {
        function Reduce(self, initialValue, func) {
            let accumulator = initialValue;
            self.forEach((element, index, arr) => {
                accumulator = func(accumulator, element, index, arr);
            });
            return accumulator;
        }
        IArrayLikeHelper.Reduce = Reduce;
        function FilterSet(self, result, predicate) {
            self.forEach((element, index, arr) => {
                if (predicate(element, index, arr)) {
                    result.set(index, element);
                }
            });
            return result;
        }
        IArrayLikeHelper.FilterSet = FilterSet;
        function FilterPush(self, result, predicate) {
            self.forEach((element, index, arr) => {
                if (predicate(element, index, arr)) {
                    result.push(element);
                }
            });
            return result;
        }
        IArrayLikeHelper.FilterPush = FilterPush;
        function MapClone(self, result, func) {
            self.forEach((element, index, arr) => {
                result["set"](index, func(element, index, arr));
            });
            return result;
        }
        IArrayLikeHelper.MapClone = MapClone;
        function Map(self, func) {
            const result = [];
            self.forEach((element, index, arr) => {
                result.push(func(element, index, arr));
            });
            return result;
        }
        IArrayLikeHelper.Map = Map;
        function Every(self, predicate) {
            let result = true;
            self.forEachBreak((element, index, arr) => {
                if (!predicate(element, index, arr)) {
                    result = false;
                    return SHOULD_BREAK.YES;
                }
                return SHOULD_BREAK.NO;
            });
            return result;
        }
        IArrayLikeHelper.Every = Every;
        function Some(self, predicate) {
            let result = false;
            self.forEachBreak((element, index, arr) => {
                if (predicate(element, index, arr)) {
                    result = true;
                    return SHOULD_BREAK.YES;
                }
                return SHOULD_BREAK.NO;
            });
            return result;
        }
        IArrayLikeHelper.Some = Some;
        function Find(self, predicate) {
            const index = self.forEachBreak((element, index, arr) => {
                if (predicate(element, index, arr)) {
                    return SHOULD_BREAK.YES;
                }
                return SHOULD_BREAK.NO;
            });
            if (index == undefined)
                return undefined;
            return [index, self.get(index)];
        }
        IArrayLikeHelper.Find = Find;
        function FindElement(self, predicate) {
            const index = self.forEachBreak((element, index, arr) => {
                if (predicate(element, index, arr)) {
                    return SHOULD_BREAK.YES;
                }
                return SHOULD_BREAK.NO;
            });
            if (index == undefined)
                return undefined;
            return self.get(index);
        }
        IArrayLikeHelper.FindElement = FindElement;
        function FindIndex(self, predicate) {
            return self.forEachBreak((element, index, arr) => {
                if (predicate(element, index, arr)) {
                    return SHOULD_BREAK.YES;
                }
                return SHOULD_BREAK.NO;
            });
        }
        IArrayLikeHelper.FindIndex = FindIndex;
    })(IArrayLikeHelper || (exports.IArrayLikeHelper = IArrayLikeHelper = {}));
});
define("math/AdvancedMatrix", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AdvancedMatrix = void 0;
    class AdvancedMatrix {
        n;
        m;
        matrix;
        constructor(m, n, numbers) {
            this.n = n;
            this.m = m;
            if (numbers == undefined) {
                this.matrix = [];
                this.forEach((i, j) => this.matrix.push(0));
            }
            else {
                this.matrix = [];
                this.forEach((i, j) => numbers[i + j * this.m]);
                for (let j = 0; j < this.n; j++) {
                    for (let i = 0; i < this.m; i++) {
                        this.matrix.push(numbers[i + j * this.m] ?? 0);
                    }
                }
            }
        }
        getElement(i, j) {
            return this.matrix[j + i * this.n];
        }
        setElement(i, j, e) {
            this.matrix[j + i * this.n] = e;
        }
        getHarbinger(i, j) {
            return (i + j) % 2 == 0 ? +1 : -1;
        }
        getIJ(index) {
            return [Math.floor(index / this.m), Math.floor(index % this.m)];
        }
        isIdentity(error = 0) {
            return this.every((v, i, j) => {
                if (i === j)
                    return Math.abs(v - 1) <= error;
                return Math.abs(v) <= error;
            });
        }
        forEachBreak(callback) {
            for (let j = 0; j < this.n; j++) {
                for (let i = 0; i < this.m; i++) {
                    if (callback(this.getElement(i, j), i, j) === true)
                        break;
                }
            }
            return this;
        }
        forEach(callback) {
            for (let j = 0; j < this.n; j++) {
                for (let i = 0; i < this.m; i++) {
                    callback(this.getElement(i, j), i, j);
                }
            }
            return this;
        }
        every(callback) {
            let bol = true;
            this.forEachBreak((v, i, j) => {
                bol &&= callback(v, i, j);
                if (bol == false)
                    return true;
                return false;
            });
            return bol;
        }
        some(callback) {
            let bol = false;
            this.forEachBreak((v, i, j) => {
                bol ||= callback(v, i, j);
                if (bol == true)
                    return true;
                return false;
            });
            return bol;
        }
        plus(other) {
            if (this.n == other.n && this.m == other.m)
                return new AdvancedMatrix(this.m, this.n, this.matrix.map((e, i) => e + other.matrix[i]));
            else
                return undefined;
        }
        multiplied(other) {
            if (this.n == other.m) {
                let aNumRows = this.m;
                let aNumCols = this.n;
                let bNumCols = other.n;
                let numbers = new Array(aNumRows * bNumCols);
                for (let r = 0; r < aNumRows; r++) {
                    for (let c = 0; c < bNumCols; c++) {
                        numbers[c + r * bNumCols] = 0;
                        for (let i = 0; i < aNumCols; i++) {
                            numbers[c + r * bNumCols] += this.getElement(r, i) * other.getElement(i, c);
                        }
                    }
                }
                return new AdvancedMatrix(aNumRows, bNumCols, numbers);
            }
            else
                return undefined;
        }
        transposed() {
            return new AdvancedMatrix(this.n, this.m, this.matrix.map((e, index) => {
                let [i, j] = this.getIJ(index);
                return this.getElement(j, i);
            }));
        }
        mainDiagonal() {
            return this.matrix.filter((e, index) => {
                let [i, j] = this.getIJ(index);
                return i == j;
            });
        }
        antiDiagonal() {
            return this.matrix.filter((e, index) => {
                let [i, j] = this.getIJ(index);
                return i + j == this.n;
            });
        }
        getMinorMatix(i, j) {
            return new AdvancedMatrix(this.m - 1, this.n - 1, this.matrix.filter((e, index) => {
                let [_i, _j] = this.getIJ(index);
                return !(i == _i || j == _j);
            }));
        }
        determinant() {
            if (this.m == 1 && this.n == 1) {
                return this.matrix[0];
            }
            else if (this.m == 2 && this.n == 2) {
                return this.matrix[0] * this.matrix[3] - this.matrix[1] * this.matrix[2];
            }
            else if (this.m == this.n) {
                let result = 0;
                for (let j = 0; j < this.n; j++) {
                    const A = this.getElement(0, j);
                    const Harbinger = this.getHarbinger(0, j);
                    const Minor = this.getMinorMatix(0, j);
                    result += A * Harbinger * Minor.determinant();
                }
                return result;
            }
            else
                return undefined;
        }
        scale(value) {
            return new AdvancedMatrix(this.m, this.n, this.matrix.map((e) => e * value));
        }
        adjugated() {
            let numbers = new Array(this.m * this.n);
            for (let i = 0; i < this.m; i++) {
                for (let j = 0; j < this.n; j++) {
                    numbers[j + i * this.n] = this.getMinorMatix(i, j).determinant() * this.getHarbinger(i, j);
                }
            }
            return new AdvancedMatrix(this.m, this.n, numbers);
        }
        invert() {
            const Det = this.determinant();
            if (Det == 0)
                return undefined;
            const DJI = this.adjugated().transposed();
            return DJI.scale(1 / Det);
        }
        toString() {
            return (`${this.m}x${this.n}\n` +
                this.matrix.map((e, i) => Math.floor(e * 100) / 100 + (i % this.n == this.n - 1 ? "\t\n" : "\t")).join(""));
        }
        equals(other, error = 0) {
            return this.m == other.m && this.n == other.n && this.matrix.every((e, i) => Math.abs(e - other.matrix[i]) <= error);
        }
        clone() {
            return new AdvancedMatrix(this.m, this.n, [...this.matrix]);
        }
        gaussElliminate(row, number) {
            const result = this.clone();
            if (result.getElement(row, number) == 0)
                return result;
            const starter = result.getElement(row, number);
            const mult = starter / result.getElement(number, number);
            for (let j = number; j < this.n; j++) {
                const subtractor = result.getElement(number, j);
                result.setElement(row, j, result.getElement(row, j) - subtractor * mult);
            }
            return result;
        }
        gaussEllimination() {
            return this.clone().gaussElliminate(1, 0).gaussElliminate(2, 0).gaussElliminate(2, 1);
        }
        cramerLaw(b) {
            const det = this.determinant();
            if (det == 0 || det == undefined)
                return undefined;
            const result = [];
            for (let j = 0; j < this.n; j++) {
                const mx = this.clone();
                for (let i = 0; i < this.m; i++) {
                    mx.setElement(i, j, b[i]);
                }
                result.push(mx.determinant() / det);
            }
            return result;
        }
    }
    exports.AdvancedMatrix = AdvancedMatrix;
});
define("math/Vector", ["require", "exports", "IArrayFunctions", "MathUtils", "math/AdvancedMatrix"], function (require, exports, IArrayFunctions_1, MathUtils_1, AdvancedMatrix_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Vector = void 0;
    class Vector {
        values;
        get x() {
            return this.get(0);
        }
        set x(value) {
            this.set(0, value);
        }
        get y() {
            return this.get(1);
        }
        set y(value) {
            this.set(1, value);
        }
        get z() {
            return this.get(2);
        }
        set z(value) {
            this.set(2, value);
        }
        get w() {
            return this.get(3);
        }
        set w(value) {
            this.set(3, value);
        }
        getDimensions() {
            return this.values.length;
        }
        isZero(error = 0) {
            return this.values.every((e) => Math.abs(e) <= error);
        }
        equals(other, error = 0) {
            if (other == undefined)
                return false;
            if (this.getDimensions() !== other.getDimensions())
                return false;
            return this.values.every((e, i) => Math.abs(e - other.get(i)) <= error);
        }
        toString() {
            return `Vec${this.getDimensions()}(${this.values.map((e, i) => `${e}`).join(", ")})`;
        }
        get(i) {
            return this.values[i] ?? 0;
        }
        set(index, value) {
            while (index >= this.getDimensions())
                this.values.push(0);
            this.values[(0, MathUtils_1.WrapIndex)(index, this.values.length)] = value;
            return this;
        }
        update(values) {
            this.values = [];
            for (let i = 0; i < values.length; i++)
                this.values.push(values[i]);
            return this;
        }
        add(other) {
            return this.update(this.values.map((e, i) => e + other.get(i)));
        }
        plus(other) {
            return new Vector(...this.values.map((e, i) => e + other.get(i)));
        }
        subtract(other) {
            return this.update(this.values.map((e, i) => e - other.get(i)));
        }
        minus(other) {
            return new Vector(...this.values.map((e, i) => e - other.get(i)));
        }
        scale(scalar) {
            return this.update(this.values.map((e, i) => e * scalar));
        }
        scaled(scalar) {
            return new Vector(...this.values.map((e, i) => e * scalar));
        }
        dot(other) {
            return this.values.map((e, i) => e * other.get(i)).reduce((a, b) => a + b);
        }
        cross(other) {
            const size = other.getDimensions();
            const self = this.getDimensions() != size ? this.cloneWithDimensions(size) : this;
            if (size <= 3) {
                return new Vector(self.y * other.z - self.z * other.y, self.z * other.x - self.x * other.z, self.x * other.y - self.y * other.x);
            }
            else if (size <= 7) {
                return self.mapClone((_, i) => {
                    const i2 = (i + 1) % 7;
                    const i3 = (i + 2) % 7;
                    const i4 = (i + 3) % 7;
                    const i5 = (i + 4) % 7;
                    const i6 = (i + 5) % 7;
                    const i7 = (i + 6) % 7;
                    return (self.get(i2) * other.get(i4) -
                        self.get(i4) * other.get(i2) +
                        self.get(i3) * other.get(i7) -
                        self.get(i7) * other.get(i3) +
                        self.get(i5) * other.get(i6) -
                        self.get(i6) * other.get(i5));
                });
            }
            return undefined;
        }
        length() {
            return Math.sqrt(this.lengthSqrt());
        }
        lengthSqrt() {
            return this.values.map((e) => e * e).reduce((a, b) => a + b);
        }
        lengthManhattan() {
            return this.values.reduce((res, e) => res + Math.abs(e), 0);
        }
        lengthMax() {
            return this.values.reduce((res, e) => Math.max(res, Math.abs(e)), 0);
        }
        unit() {
            return this.scaled(1 / this.length());
        }
        clone() {
            return new Vector(...this.values);
        }
        multMatrix(matrix) {
            return matrix.multiplied(new AdvancedMatrix_1.AdvancedMatrix(this.getDimensions(), 1, this.values));
        }
        translate(...args) {
            return this.update(this.values.map((e, i) => e + (args[i] ?? 0)));
        }
        offset(...args) {
            return new Vector(...this.values.map((e, i) => e + (args[i] ?? 0)));
        }
        floor() {
            return this.update(this.values.map((e) => Math.floor(e)));
        }
        floored() {
            return new Vector(...this.values.map((e) => Math.floor(e)));
        }
        ceil() {
            return this.update(this.values.map((e) => Math.ceil(e)));
        }
        ceiled() {
            return new Vector(...this.values.map((e) => Math.ceil(e)));
        }
        round() {
            return this.update(this.values.map((e) => Math.round(e)));
        }
        rounded() {
            return new Vector(...this.values.map((e) => Math.round(e)));
        }
        multiply(other) {
            return this.update(this.values.map((e, i) => e * other.get(i)));
        }
        multiplied(other) {
            return new Vector(...this.values.map((e, i) => e * other.get(i)));
        }
        divide(other) {
            return this.update(this.values.map((e, i) => e / other.get(i)));
        }
        divided(other) {
            return new Vector(...this.values.map((e, i) => e / other.get(i)));
        }
        modulus(other) {
            return new Vector(...this.values.map((e, i) => e % other.get(i)));
        }
        min(other) {
            return new Vector(...this.values.map((e, i) => Math.min(other.get(i), e)));
        }
        max(other) {
            return new Vector(...this.values.map((e, i) => Math.max(other.get(i), e)));
        }
        abs() {
            return new Vector(...this.values.map((e) => Math.abs(e)));
        }
        distanceTo(other) {
            return this.minus(other).length();
        }
        distanceSquared(other) {
            return this.minus(other).lengthSqrt();
        }
        projectedOnto(other) {
            return other.scaled(this.dot(other) / other.dot(other));
        }
        rejectOnto(other) {
            return this.minus(this.projectedOnto(other));
        }
        static fromVec3(vec) {
            return new Vector(vec.x, vec.y, vec.z);
        }
        constructor(...args) {
            this.update([...args]);
        }
        mapClone(func) {
            return new Vector(...this.values.map((a, b) => func(a, b, this)));
        }
        map(func) {
            return IArrayFunctions_1.IArrayLikeHelper.Map(this, func);
        }
        forEach(func) {
            for (let i = 0; i < this.values.length; i++) {
                func(this.values[i], i, this);
            }
            return this;
        }
        forEachBreak(func) {
            for (let i = 0; i < this.values.length; i++) {
                const value = this.values[i];
                if (func(value, i, this) == IArrayFunctions_1.SHOULD_BREAK.YES)
                    return i;
            }
            return undefined;
        }
        toArray() {
            return [...this.values];
        }
        closestAxisUnit() {
            const largest = this.map((e, i) => [i, Math.abs(e), e]).reduce((prev, curr) => prev[1] > curr[1] ? prev : curr);
            return this.mapClone((e, i, s) => (largest[0] == i ? (largest[2] > 0 ? 1 : -1) : 0));
        }
        cloneWithDimensions(dimensions) {
            if (this.getDimensions() > dimensions)
                return new Vector(...this.values.slice(0, dimensions));
            if (this.getDimensions() < dimensions)
                return new Vector(...this.values.concat(new Array(dimensions - this.getDimensions()).fill(0)));
            return this.clone();
        }
        getAngle2D(other) {
            const dot = this.x * other.x + this.y * other.y;
            const det = this.x * other.y - this.y * other.x;
            return (Math.atan2(det, dot) + MathUtils_1.MConst.rad360) % MathUtils_1.MConst.rad360;
        }
        hash() {
            let seed = this.getDimensions();
            this.forEach((x) => {
                x = ((x >> 16) ^ x) * 0x45d9f3b;
                x = ((x >> 16) ^ x) * 0x45d9f3b;
                x = (x >> 16) ^ x;
                seed ^= x + 0x9e3779b9 + (seed << 6) + (seed >> 2);
            });
            return seed;
        }
        volume() {
            return this.map((e) => e).reduce((a, b) => a * b);
        }
        sum() {
            return this.map((e) => e).reduce((a, b) => a + b);
        }
    }
    exports.Vector = Vector;
});
define("MathUtils", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MConst = exports.Clamp = exports.TriangleArea = exports.WrapVector = exports.WrapIndex = void 0;
    function WrapIndex(i, length) {
        return ((i % length) + length) % length;
    }
    exports.WrapIndex = WrapIndex;
    function WrapVector(vec, min, size) {
        return vec.mapClone((e, i) => WrapIndex(e, size.get(i)) + min.get(i));
    }
    exports.WrapVector = WrapVector;
    function TriangleArea(p1, p2, p3) {
        return (p1.x * (p3.y - p2.y) + p2.x * (p1.y - p3.y) + p3.x * (p2.y - p1.y)) / 2;
    }
    exports.TriangleArea = TriangleArea;
    function Clamp(value, min, max) {
        return value < min ? min : value > max ? max : value;
    }
    exports.Clamp = Clamp;
    var MConst;
    (function (MConst) {
        MConst.rad360 = Math.PI * 2;
        MConst.rad270 = Math.PI * 1.5;
        MConst.rad180 = Math.PI;
        MConst.rad90 = Math.PI / 2;
        MConst.rad60 = Math.PI / 3;
        MConst.rad45 = Math.PI / 4;
        MConst.rad36 = Math.PI / 5;
        MConst.rad30 = Math.PI / 6;
        MConst.rad15 = Math.PI / 12;
        MConst.rad5 = Math.PI / 36;
        MConst.rad1 = Math.PI / 180;
        MConst.phi = 1.618033988749894;
        MConst.tau = MConst.rad360;
    })(MConst || (exports.MConst = MConst = {}));
});
define("ArrayUtils", ["require", "exports", "MathUtils"], function (require, exports, MathUtils_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ArrayEquals = exports.InsertIntoArray = exports.WrapGet = void 0;
    function WrapGet(arr, i) {
        return arr[(0, MathUtils_2.WrapIndex)(i, arr.length)];
    }
    exports.WrapGet = WrapGet;
    function InsertIntoArray(array, index, element) {
        const end = array.splice(index);
        array.push(element, ...end);
        return array;
    }
    exports.InsertIntoArray = InsertIntoArray;
    function ArrayEquals(arrayA, arrayB) {
        if (!(arrayA instanceof Array))
            return false;
        if (!(arrayB instanceof Array))
            return false;
        if (arrayA.length != arrayB.length)
            return false;
        for (let i = 0; i < arrayA.length; i++) {
            if (arrayA[i] != arrayB[i])
                return false;
        }
        return true;
    }
    exports.ArrayEquals = ArrayEquals;
});
define("BoundingBox", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.BoundingBoxHelper = void 0;
    var BoundingBoxHelper;
    (function (BoundingBoxHelper) {
        function IsInside(box, vec) {
            return vec.toArray().every((e, i) => box.max.get(i) >= e && box.min.get(i) <= e);
        }
        BoundingBoxHelper.IsInside = IsInside;
    })(BoundingBoxHelper || (exports.BoundingBoxHelper = BoundingBoxHelper = {}));
});
define("GenerateUUID", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GenerateHashID = exports.GenerateRandomUUID = exports.GenerateSnowflakeID = exports.GenerateTimestampID = exports.GetDateString = void 0;
    function GetDateString() {
        const date = new Date();
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, "0");
        const day = `${date.getDate()}`.padStart(2, "0");
        const hour = `${date.getHours()}`.padStart(2, "0");
        const minute = `${date.getMinutes()}`.padStart(2, "0");
        const second = `${date.getSeconds()}`.padStart(2, "0");
        return `${year}_${month}_${day}-${hour}_${minute}_${second}`;
    }
    exports.GetDateString = GetDateString;
    function GenerateTimestampID() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 5);
        return `${timestamp}-${randomPart}`;
    }
    exports.GenerateTimestampID = GenerateTimestampID;
    function GenerateSnowflakeID() {
        const timestamp = BigInt(Date.now()) << BigInt(22);
        const randomPart = BigInt(Math.floor(Math.random() * 1024));
        return (timestamp | randomPart).toString();
    }
    exports.GenerateSnowflakeID = GenerateSnowflakeID;
    function GenerateRandomUUID() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
            const random = (Math.random() * 16) | 0;
            const value = char === "x" ? random : (random & 0x3) | 0x8;
            return value.toString(16);
        });
    }
    exports.GenerateRandomUUID = GenerateRandomUUID;
    function GenerateHashID(data) {
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash |= 0;
        }
        return hash.toString(16);
    }
    exports.GenerateHashID = GenerateHashID;
});
define("Segment", ["require", "exports", "math/Vector"], function (require, exports, Vector_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Segment = void 0;
    var Segment;
    (function (Segment) {
        function Intersection2D(startA, endA, startB, endB, error = 0.05) {
            if (startA.equals(startB, error) || endA.equals(startB, error) || startA.equals(endB, error) || endA.equals(endB, error))
                return undefined;
            const errorMin = -error;
            const errorMax = error;
            function orientation(p, q, r) {
                let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
                if (val > errorMax)
                    return 1;
                else if (val < errorMin)
                    return 2;
                else
                    return 0;
            }
            function onSegment(p, q, r) {
                if (q.x <= Math.max(p.x, r.x) &&
                    q.x >= Math.min(p.x, r.x) &&
                    q.y <= Math.max(p.y, r.y) &&
                    q.y >= Math.min(p.y, r.y)) {
                    return true;
                }
                return false;
            }
            function doIntersect(p1, q1, p2, q2) {
                let o1 = orientation(p1, q1, p2);
                let o2 = orientation(p1, q1, q2);
                let o3 = orientation(p2, q2, p1);
                let o4 = orientation(p2, q2, q1);
                if (o1 !== o2 && o3 !== o4) {
                    return true;
                }
                if (o1 == 0 && onSegment(p1, p2, q1))
                    return true;
                if (o2 == 0 && onSegment(p1, q2, q1))
                    return true;
                if (o3 == 0 && onSegment(p2, p1, q2))
                    return true;
                if (o4 == 0 && onSegment(p2, q1, q2))
                    return true;
                return false;
            }
            const p1 = startA;
            const q1 = endA;
            const p2 = startB;
            const q2 = endB;
            if (!doIntersect(p1, q1, p2, q2)) {
                return undefined;
            }
            const a1 = q1.y - p1.y;
            const b1 = p1.x - q1.x;
            const a2 = q2.y - p2.y;
            const b2 = p2.x - q2.x;
            const determinant = a1 * b2 - a2 * b1;
            if (Math.abs(determinant) <= error) {
                return undefined;
            }
            else {
                const c1 = a1 * p1.x + b1 * p1.y;
                const c2 = a2 * p2.x + b2 * p2.y;
                const x = (b2 * c1 - b1 * c2) / determinant;
                const y = (a1 * c2 - a2 * c1) / determinant;
                const result = new Vector_1.Vector(x, y);
                return result;
            }
        }
        Segment.Intersection2D = Intersection2D;
        function IsLeftOfLine2D(line1, line2, point) {
            return (line2.x - line1.x) * (point.y - line1.y) - (line2.y - line1.y) * (point.x - line1.x) > 0;
        }
        Segment.IsLeftOfLine2D = IsLeftOfLine2D;
        function CutSegmentsAtIntersections2D(segments, error = 0.05) {
            segments = [...segments];
            const result = [];
            while (segments.length > 0) {
                const seg = segments.shift();
                let intersectionPoint = null;
                let intersectionIndex = -1;
                for (let otherI = 0; otherI < segments.length; otherI++) {
                    const intersection = Intersection2D(seg[0], seg[1], segments[otherI][0], segments[otherI][1], error);
                    if (!intersection)
                        continue;
                    intersectionPoint = intersection;
                    intersectionIndex = otherI;
                    break;
                }
                if (intersectionPoint != undefined) {
                    const otherSegment = segments.splice(intersectionIndex, 1)[0];
                    if (!seg[0].equals(intersectionPoint, error))
                        segments.push([seg[0].clone(), intersectionPoint.clone()]);
                    if (!seg[1].equals(intersectionPoint, error))
                        segments.push([intersectionPoint.clone(), seg[1].clone()]);
                    if (!otherSegment[0].equals(intersectionPoint, error))
                        segments.push([otherSegment[0].clone(), intersectionPoint.clone()]);
                    if (!otherSegment[1].equals(intersectionPoint, error))
                        segments.push([intersectionPoint.clone(), otherSegment[1].clone()]);
                }
                else
                    result.push(seg);
            }
            return result;
        }
        Segment.CutSegmentsAtIntersections2D = CutSegmentsAtIntersections2D;
    })(Segment || (exports.Segment = Segment = {}));
});
define("Polygon", ["require", "exports", "ArrayUtils", "IArrayFunctions", "MathUtils", "Segment", "math/Vector"], function (require, exports, ArrayUtils_1, IArrayFunctions_2, MathUtils_3, Segment_1, Vector_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Polygon = void 0;
    const ERROR_INCORRECT_DIMENSIONS = "You can only have 2D vectors in a polygon!";
    class Polygon {
        points;
        max;
        min;
        constructor(points) {
            if (points.some((e) => e.getDimensions() != 2))
                throw new Error(ERROR_INCORRECT_DIMENSIONS);
            this.points = [];
            points.forEach((e) => this.push(e));
        }
        find(predicate) {
            return IArrayFunctions_2.IArrayLikeHelper.Find(this, predicate);
        }
        findElement(predicate) {
            return IArrayFunctions_2.IArrayLikeHelper.FindElement(this, predicate);
        }
        findIndex(predicate) {
            return IArrayFunctions_2.IArrayLikeHelper.FindIndex(this, predicate);
        }
        every(predicate) {
            return IArrayFunctions_2.IArrayLikeHelper.Every(this, predicate);
        }
        some(predicate) {
            return IArrayFunctions_2.IArrayLikeHelper.Some(this, predicate);
        }
        reduce(func, initialValue) {
            return IArrayFunctions_2.IArrayLikeHelper.Reduce(this, initialValue, func);
        }
        filter(predicate) {
            return IArrayFunctions_2.IArrayLikeHelper.FilterPush(this, new Polygon([]), predicate);
        }
        mapClone(func) {
            return IArrayFunctions_2.IArrayLikeHelper.MapClone(this, new Polygon([]), func);
        }
        map(func) {
            return IArrayFunctions_2.IArrayLikeHelper.Map(this, func);
        }
        forEach(func) {
            for (let i = 0; i < this.length; i++) {
                func(this.get(i), i, this);
            }
            return this;
        }
        forEachBreak(func) {
            for (let i = 0; i < this.length; i++) {
                if (func(this.get(i), i, this) == IArrayFunctions_2.SHOULD_BREAK.YES)
                    return i;
            }
            return undefined;
        }
        push(value) {
            this.set(this.length, value);
            return this;
        }
        unshift(value) {
            this.set(-1, value);
            return this;
        }
        pop() {
            return this.deleteAt(-1);
        }
        shift() {
            return this.deleteAt(0);
        }
        get length() {
            return this.points.length;
        }
        get first() {
            return this.get(0);
        }
        get last() {
            return this.get(-1);
        }
        deleteAt(index) {
            return this.points.splice((0, MathUtils_3.WrapIndex)(index, this.points.length), 1)[0];
        }
        get(index) {
            return (0, ArrayUtils_1.WrapGet)(this.points, index).clone();
        }
        set(index, value) {
            if (value.getDimensions() != 2)
                throw new Error(ERROR_INCORRECT_DIMENSIONS);
            if (index == this.length)
                this.points.push(value.clone());
            else if (index == -1)
                this.points.unshift(value.clone());
            else
                this.points[(0, MathUtils_3.WrapIndex)(index, this.points.length)] = value.clone();
            if (this.max == undefined || this.min == undefined) {
                this.max = value.clone();
                this.min = value.clone();
            }
            else {
                this.max.update(this.max.max(value).toArray());
                this.min.update(this.min.min(value).toArray());
            }
            return this;
        }
        forEachSide(func) {
            return this.forEach((e, i, a) => func([e, this.get(i + 1)], i, a));
        }
        forEachTriplet(func) {
            return this.forEach((e, i, a) => func([this.get(i - 1), e, this.get(i + 1)], i, a));
        }
        getMeanVector() {
            return this.reduce((a, b) => a.plus(b), new Vector_2.Vector(0, 0)).scale(1 / this.length);
        }
        getArea() {
            let result = 0;
            this.forEachSide(([curr, next]) => (result += (curr.y + next.y) * (next.x - curr.x)));
            return result / 2;
        }
        getCircumference() {
            let value = 0;
            this.forEachSide(([c, n]) => (value += c.distanceTo(n)));
            return value;
        }
        get aabb_min() {
            return this.min.clone();
        }
        get aabb_max() {
            return this.max.clone();
        }
        get aabb_size() {
            return this.max.minus(this.min);
        }
        isInsideBoundingBox(point) {
            return point.x >= this.min.x && point.x <= this.max.x && point.y >= this.min.y && point.y <= this.max.y;
        }
        isInternal(point, error = 0.05) {
            if (!this.isInsideBoundingBox(point))
                return false;
            const lineEnd = point.offset(this.aabb_size.x, Math.random());
            const intersectionCount = this.reduce((res, curr, i, s) => {
                const next = s.get(i + 1);
                const intersection1 = Segment_1.Segment.Intersection2D(curr, next, point, lineEnd, error);
                if (intersection1 == undefined)
                    return res;
                return res + 1;
            }, 0);
            if (intersectionCount > 0 && intersectionCount % 2 == 1)
                return true;
            return false;
        }
        splitLargeSides(max_length) {
            const max_length2 = max_length * max_length;
            let newPoints = [this.first];
            let new_i = 0;
            let poly_i = 0;
            while (true) {
                const curr = newPoints[new_i];
                let next = newPoints[new_i + 1];
                if (next == undefined) {
                    poly_i++;
                    if (poly_i >= this.length)
                        break;
                    next = this.get(poly_i);
                    newPoints.push(next);
                }
                if (curr.distanceSquared(next) > max_length2)
                    (0, ArrayUtils_1.InsertIntoArray)(newPoints, new_i + 1, curr.plus(next).scale(0.5));
                else
                    new_i++;
            }
            return new Polygon(newPoints);
        }
        getSegments() {
            const segments = this.reduce((res, curr) => {
                res.push([curr, undefined]);
                if (res.length == 1)
                    return res;
                res[res.length - 2][1] = curr.clone();
                return res;
            }, []);
            segments[segments.length - 1][1] = this.first.clone();
            return segments;
        }
        findSharedSegment(other, error = 0.05) {
            let otherIndex = undefined;
            const selfIndex = this.findIndex((curr1, i1, a1) => {
                const next1 = a1.get(i1 + 1);
                otherIndex = other.findIndex((next2, i2, a2) => {
                    const curr2 = a2.get(i2 + 1);
                    return curr1.equals(curr2, error) && next1.equals(next2, error);
                });
                return otherIndex != undefined;
            });
            if (selfIndex == undefined || otherIndex == undefined)
                return undefined;
            return [selfIndex, otherIndex];
        }
        mergedAtSharedSegment(other, error = 0.05) {
            const sharedEdges = this.findSharedSegment(other, error);
            if (sharedEdges == undefined)
                return undefined;
            const points = [
                ...this.points.slice(0, sharedEdges[0]),
                ...other.points.slice(sharedEdges[1] + 1),
                ...other.points.slice(0, sharedEdges[1]),
                ...this.points.slice(sharedEdges[0] + 1),
            ];
            if (points.length != other.points.length + this.points.length - 2)
                throw new Error(`Polygons merged incorrectly!`);
            return new Polygon(points);
        }
        removeInternalPoints() {
            while (true) {
                const internalPoints = [];
                this.forEachTriplet(([prev, curr, next], i) => {
                    if (prev.equals(next))
                        internalPoints.push(i, (0, MathUtils_3.WrapIndex)(i + 1, this.points.length));
                });
                if (internalPoints.length == 0)
                    break;
                internalPoints.sort((a, b) => b - a).forEach((e) => this.deleteAt(e));
            }
            return this;
        }
    }
    exports.Polygon = Polygon;
});
define("grid/Grid", ["require", "exports", "IArrayFunctions", "MathUtils", "math/Vector"], function (require, exports, IArrayFunctions_3, MathUtils_4, Vector_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Grid = exports.HashVector = void 0;
    function HashVector(vec) {
        const n = 46340;
        return `${vec.x + vec.y * n + vec.z * n * n}`;
    }
    exports.HashVector = HashVector;
    class Grid {
        grid;
        min;
        max;
        firstElement;
        defaultElement;
        doesWrap;
        cloningFunction;
        cloneValue(value) {
            if (value === undefined)
                return undefined;
            return this.cloningFunction ? this.cloningFunction(value) : value;
        }
        constructor(defaultElement) {
            this.min = new Vector_3.Vector(0, 0, 0);
            this.max = new Vector_3.Vector(0, 0, 0);
            this.firstElement = true;
            this.defaultElement = defaultElement;
            this.grid = {};
            this.doesWrap = false;
            this.cloningFunction = undefined;
        }
        static FromMatrix(values, defaultValue) {
            return new Grid(defaultValue).forVolume(new Vector_3.Vector(0, 0, 0), new Vector_3.Vector(values.length - 1, 0, values[0].length - 1), (v, p, g) => g.set(p, values[p.x][p.z]));
        }
        static FromStringArray(values, defaultValue) {
            return new Grid(defaultValue).forVolume(new Vector_3.Vector(0, 0, 0), new Vector_3.Vector(values[0].length - 1, 0, values.length - 1), (v, p, g) => g.set(p, values[p.z][p.x]));
        }
        static GenerateNeighboursMap(axes, size = 1, axisAligned = false) {
            const neighborVectors = [];
            if (axisAligned) {
                for (let j = -size; j <= size; j++) {
                    if (j == 0)
                        continue;
                    for (const axis of axes) {
                        const vec = new Vector_3.Vector(0, 0, 0);
                        vec[axis] = j;
                        neighborVectors.push(vec.clone());
                    }
                }
            }
            else {
                const vec = new Vector_3.Vector(0, 0, 0);
                for (let i = -size; i <= size; i++) {
                    for (const axisi of axes) {
                        vec[axisi] = i;
                        for (const axisj of axes) {
                            if (axisi == axisj)
                                continue;
                            for (let j = -size; j <= size; j++) {
                                vec[axisj] = j;
                                if (!vec.isZero() && !neighborVectors.some((a) => a.equals(vec)))
                                    neighborVectors.push(vec.clone());
                            }
                        }
                    }
                }
            }
            return neighborVectors;
        }
        setWrapping(value) {
            this.doesWrap = value;
            return this;
        }
        setValueCloningFunction(func) {
            if (this.cloningFunction)
                throw new Error("You've already defined a cloning function for this grid!");
            this.cloningFunction = func;
            return this;
        }
        values() {
            return Object.values(this.grid);
        }
        getSize() {
            return this.firstElement ? new Vector_3.Vector(0, 0, 0) : this.max.minus(this.min).offset(1, 1, 1);
        }
        getMin() {
            return this.min.clone();
        }
        getMax() {
            return this.max.clone();
        }
        get(pos) {
            if (this.doesWrap && !this.isInside(pos))
                pos = (0, MathUtils_4.WrapVector)(pos, this.min, this.getSize());
            return this.grid[HashVector(pos)] ?? this.defaultElement;
        }
        set(pos, value) {
            if (this.doesWrap && !this.isInside(pos))
                pos = (0, MathUtils_4.WrapVector)(pos, this.min, this.getSize());
            if (this.firstElement) {
                this.firstElement = false;
                this.min = pos.clone();
                this.max = pos.clone();
            }
            else {
                this.max = this.max.max(pos);
                this.min = this.min.min(pos);
            }
            if (value == undefined)
                return this;
            this.grid[HashVector(pos)] = this.cloneValue(value);
            return this;
        }
        forEach(func) {
            for (let x = this.min.x; x <= this.max.x; x++) {
                for (let y = this.min.y; y <= this.max.y; y++) {
                    for (let z = this.min.z; z <= this.max.z; z++) {
                        const pos = new Vector_3.Vector(x, y, z);
                        func(this.get(pos), pos, this);
                    }
                }
            }
            return this;
        }
        forEachBreak(predicate) {
            for (let x = this.min.x; x <= this.max.x; x++) {
                for (let y = this.min.y; y <= this.max.y; y++) {
                    for (let z = this.min.z; z <= this.max.z; z++) {
                        const pos = new Vector_3.Vector(x, y, z);
                        if (predicate(this.get(pos), pos, this) == IArrayFunctions_3.SHOULD_BREAK.YES)
                            return pos;
                    }
                }
            }
            return undefined;
        }
        mapClone(func, defaultValue) {
            return IArrayFunctions_3.IArrayLikeHelper.MapClone(this, new Grid(defaultValue), func);
        }
        map(func, defaultValue) {
            return IArrayFunctions_3.IArrayLikeHelper.Map(this, func);
        }
        find(predicate) {
            return IArrayFunctions_3.IArrayLikeHelper.Find(this, predicate);
        }
        findElement(predicate) {
            return IArrayFunctions_3.IArrayLikeHelper.FindElement(this, predicate);
        }
        findIndex(predicate) {
            return IArrayFunctions_3.IArrayLikeHelper.FindIndex(this, predicate);
        }
        deleteAt(pos) {
            if (this.doesWrap && !this.isInside(pos))
                pos = (0, MathUtils_4.WrapVector)(pos, this.min, this.getSize());
            const value = this.grid[HashVector(pos)];
            delete this.grid[HashVector(pos)];
            return value;
        }
        forVolume(pos1, pos2, func) {
            const min = pos1.min(pos2);
            const max = pos1.max(pos2);
            for (let x = min.x; x <= max.x; x++) {
                for (let y = min.y; y <= max.y; y++) {
                    for (let z = min.z; z <= max.z; z++) {
                        const pos = new Vector_3.Vector(x, y, z);
                        func(this.get(pos), pos, this);
                    }
                }
            }
            return this;
        }
        isInside(pos) {
            return (this.max.x >= pos.x &&
                this.min.x <= pos.x &&
                this.max.y >= pos.y &&
                this.min.y <= pos.y &&
                this.max.z >= pos.z &&
                this.min.z <= pos.z);
        }
        getNeighbours(pos, neighbourLookupTable) {
            return neighbourLookupTable.map((e) => this.get(pos.plus(e)));
        }
        findNeighbourIndex(pos, predicate, neighbourLookupTable) {
            return neighbourLookupTable.findIndex((e) => {
                const npos = pos.plus(e);
                return predicate(this.get(npos), npos, this);
            });
        }
        alterGridPositions(func) {
            const gridCopy = this.grid;
            this.grid = {};
            this.firstElement = true;
            const min = this.getMin();
            const max = this.getMax();
            this.forVolume(min, max, (_, p) => {
                const value = gridCopy[HashVector(p)];
                if (value === undefined || value === this.defaultElement)
                    return;
                this.set(func(p), value);
            });
            return this;
        }
        realign() {
            const min = this.getMin();
            return this.alterGridPositions((p) => p.minus(min));
        }
        clone() {
            return this.copy(this.min, this.max);
        }
        copy(pos1, pos2) {
            const result = new Grid(this.defaultElement).setValueCloningFunction(this.cloningFunction);
            this.forVolume(pos1, pos2, (v, p) => {
                if (v === this.defaultElement)
                    return;
                result.set(p, v);
            });
            return result;
        }
        paste(pos, other) {
            if (this.defaultElement === other.defaultElement) {
                other.forEach((v, p) => {
                    if (v === this.defaultElement)
                        return;
                    this.set(p.plus(pos), v);
                });
            }
            else {
                other.forEach((v, p, g) => {
                    this.set(p.plus(pos), v);
                });
            }
            return this;
        }
        printY(y = 0, pretty = true, stringify) {
            this.print("x", "z", "y", y, pretty, stringify);
        }
        print(xAxis = "x", yAxis = "y", zAxis = "z", zSlice = 0, drawAxisArrows = true, stringify) {
            stringify ??= (v) => {
                if (v.toString)
                    return v.toString();
                return `${v}`;
            };
            const min = this.getMin();
            let result = [];
            this.forEach((v, p, g) => {
                const pof = p.minus(min);
                if (p[zAxis] == zSlice) {
                    result[pof[yAxis]] = result[pof[yAxis]] ?? [];
                    result[pof[yAxis]][pof[xAxis]] = stringify(v);
                }
            });
            result.reverse();
            if (drawAxisArrows) {
                console.log(` -----> ${xAxis}+`);
                const Yaxis1 = `${yAxis}^|| 0 `;
                const Yaxis2 = `+      `;
                const len = Yaxis1.length - 1;
                console.log(result.map((e, i) => `${Yaxis1[Math.min(i, len)]}${Yaxis2[Math.min(i, len)]} ${e.join("")}`).join("\n"));
            }
            else {
                console.log(result.map((e, i) => e.join("")).join("\n"));
            }
            return this;
        }
        equals(other) {
            if (!this.getMin().equals(other.getMin()))
                return false;
            if (!this.getMax().equals(other.getMax()))
                return false;
            if (this.defaultElement != other.defaultElement)
                return false;
            return JSON.stringify(this.grid) === JSON.stringify(other.grid);
        }
    }
    exports.Grid = Grid;
});
define("grid/GridHelper", ["require", "exports", "math/Vector", "grid/Grid"], function (require, exports, Vector_4, Grid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GridHelper = void 0;
    var GridHelper;
    (function (GridHelper) {
        GridHelper.ASCII_GRADIENT_FULL = ` .-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@`;
        GridHelper.ASCII_GRADIENT_SHORT10 = ` .:-=+*#%@`;
        function FloodFill(grid, startingPoint, value, neighbourLookupTable) {
            const parentValue = grid.get(startingPoint);
            if (parentValue == value)
                return grid;
            let points = [startingPoint];
            while (points.length > 0) {
                const current = points.pop();
                if (current == undefined)
                    break;
                grid.set(current, value);
                points.push(...neighbourLookupTable
                    .map((e) => current.plus(e))
                    .filter((e) => grid.isInside(e))
                    .filter((e) => grid.get(e) == parentValue));
            }
            return grid;
        }
        GridHelper.FloodFill = FloodFill;
        function GetNeighboursSum(grid, pos, neighbourLookupTable) {
            return neighbourLookupTable.reduce((res, e) => res + grid.get(pos.plus(e)), 0);
        }
        GridHelper.GetNeighboursSum = GetNeighboursSum;
        function GetNeighboursMean(grid, pos, neighbourLookupTable) {
            return GetNeighboursSum(grid, pos, neighbourLookupTable) / neighbourLookupTable.length;
        }
        GridHelper.GetNeighboursMean = GetNeighboursMean;
        function GetGradient(grid, pos, delta = 1) {
            return new Vector_4.Vector((grid.get(pos.offset(delta, 0, 0)) - grid.get(pos)) / delta, (grid.get(pos.offset(0, delta, 0)) - grid.get(pos)) / delta, (grid.get(pos.offset(0, 0, delta)) - grid.get(pos)) / delta);
        }
        GridHelper.GetGradient = GetGradient;
        function GetNormals(grid, neighbourLookupTable) {
            return grid.mapClone((v, p, g) => v != 0
                ? grid
                    .getNeighbours(p, neighbourLookupTable)
                    .map((e, i) => [e, i])
                    .filter((e) => e[0] != 0)
                    .reduce((res, val) => res.add(neighbourLookupTable[val[1]]), new Vector_4.Vector(0, 0, 0))
                    .unit()
                : new Vector_4.Vector(0, 0, 0));
        }
        GridHelper.GetNormals = GetNormals;
        function RotateCCW_YAxis(grid) {
            return grid.alterGridPositions((p) => new Vector_4.Vector(p.z, p.y, -p.x)).realign();
        }
        GridHelper.RotateCCW_YAxis = RotateCCW_YAxis;
        function RotateCW_YAxis(grid) {
            return grid.alterGridPositions((p) => new Vector_4.Vector(-p.z, p.y, p.x)).realign();
        }
        GridHelper.RotateCW_YAxis = RotateCW_YAxis;
        function Rotate180_YAxis(grid) {
            return grid.alterGridPositions((p) => new Vector_4.Vector(-p.x, p.y, -p.z)).realign();
        }
        GridHelper.Rotate180_YAxis = Rotate180_YAxis;
        function FlipX_YAxis(grid) {
            const size = grid.getSize().offset(-1, -1, -1);
            return grid.alterGridPositions((p) => new Vector_4.Vector(size.x - p.x, p.y, p.z));
        }
        GridHelper.FlipX_YAxis = FlipX_YAxis;
        function FlipZ_YAxis(grid) {
            const size = grid.getSize().offset(-1, -1, -1);
            return grid.alterGridPositions((p) => new Vector_4.Vector(p.x, p.y, size.z - p.z));
        }
        GridHelper.FlipZ_YAxis = FlipZ_YAxis;
        function GetSideValues(grid, side, trim = 0) {
            const tmax = grid.getMax();
            const tmin = grid.getMin();
            const mask = side.abs();
            const offset = side.plus(mask).scale(0.5).multiply(tmax.minus(tmin));
            mask.scale(-1).translate(1, 1, 1);
            const min = tmin.multiply(mask).add(offset);
            const max = tmax.multiply(mask).add(offset);
            mask.scale(trim);
            min.add(mask);
            max.subtract(mask);
            const result = [];
            grid.forVolume(min, max, (e) => result.push(e));
            return result;
        }
        GridHelper.GetSideValues = GetSideValues;
        function PrintGraph(values) {
            const graph = new Grid_1.Grid(" .");
            const min = Math.min(...values);
            const max = Math.max(...values);
            const spread = max - min;
            const sampleCount = 100;
            const scale = 100;
            const roundTo = 4;
            const stepSize = Math.floor(values.length / sampleCount);
            for (let i = 0; i < values.length; i += stepSize) {
                const dist = values[i];
                const value = (dist - min) / spread;
                const xPos = i / stepSize;
                const zPos = Math.round(value * scale);
                graph.set(new Vector_4.Vector(xPos, 0, zPos), "██");
                const axisIndex = `${i}`.padEnd(3).padStart(5);
                for (let a = 0; a < axisIndex.length; a++) {
                    graph.set(new Vector_4.Vector(xPos, 0, -a - 1), axisIndex[a].padStart(2, " "));
                }
            }
            const roundingFactor = Math.pow(10, roundTo);
            const textSize = roundTo + 5;
            for (let i = 0; i <= scale; i++) {
                const value = Math.floor((min + (spread * i) / scale) * roundingFactor) / roundingFactor;
                const axisIndex = `${value}`;
                const text = axisIndex.padEnd(textSize);
                const textReverse = text.length - 1;
                for (let a = 0; a < text.length; a++) {
                    graph.set(new Vector_4.Vector(-a - 1, 0, i), text[textReverse - a].padStart(2, " "));
                }
            }
            return graph.printY(0, true);
        }
        GridHelper.PrintGraph = PrintGraph;
        function ForEachSubGrid(grid, size, callback) {
            size = size.rounded();
            const newSize = grid.getSize().divide(size).ceil();
            const small_min = grid.getMin().divide(size).floor();
            for (let x = 0; x <= newSize.x; x++) {
                for (let y = 0; y <= newSize.y; y++) {
                    for (let z = 0; z <= newSize.z; z++) {
                        const small_pos = small_min.offset(x, y, z);
                        const scaled_pos = small_pos.clone().multiply(size);
                        const values = [];
                        const poss = [];
                        for (let iy = 0; iy < size.y; iy++) {
                            for (let iz = 0; iz < size.z; iz++) {
                                for (let ix = 0; ix < size.x; ix++) {
                                    const self_pos = scaled_pos.offset(ix, iy, iz);
                                    values.push(grid.get(self_pos));
                                    poss.push(self_pos);
                                }
                            }
                        }
                        callback(values, small_pos, poss, grid);
                    }
                }
            }
            return grid;
        }
        GridHelper.ForEachSubGrid = ForEachSubGrid;
    })(GridHelper || (exports.GridHelper = GridHelper = {}));
});
define("grid/Neighbours", ["require", "exports", "math/Vector"], function (require, exports, Vector_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.neighboursCheck3D = exports.neighboursCheckAxisY = exports.neighboursCheckY = void 0;
    exports.neighboursCheckY = [
        new Vector_5.Vector(0, 0, 1),
        new Vector_5.Vector(1, 0, 1),
        new Vector_5.Vector(1, 0, 0),
        new Vector_5.Vector(1, 0, -1),
        new Vector_5.Vector(0, 0, -1),
        new Vector_5.Vector(-1, 0, -1),
        new Vector_5.Vector(-1, 0, 0),
        new Vector_5.Vector(-1, 0, 1),
    ];
    exports.neighboursCheckAxisY = [
        new Vector_5.Vector(0, 0, 1),
        new Vector_5.Vector(1, 0, 0),
        new Vector_5.Vector(0, 0, -1),
        new Vector_5.Vector(-1, 0, 0),
    ];
    exports.neighboursCheck3D = [
        new Vector_5.Vector(-1, -1, 0),
        new Vector_5.Vector(-1, 0, 0),
        new Vector_5.Vector(-1, 1, 0),
        new Vector_5.Vector(-1, 1, -1),
        new Vector_5.Vector(-1, 1, 1),
        new Vector_5.Vector(-1, -1, 1),
        new Vector_5.Vector(0, -1, 1),
        new Vector_5.Vector(1, -1, 1),
        new Vector_5.Vector(1, -1, -1),
        new Vector_5.Vector(1, -1, 0),
        new Vector_5.Vector(-1, -1, -1),
        new Vector_5.Vector(0, -1, -1),
        new Vector_5.Vector(1, 0, -1),
        new Vector_5.Vector(1, 1, -1),
        new Vector_5.Vector(0, 0, -1),
        new Vector_5.Vector(0, 1, -1),
        new Vector_5.Vector(0, 1, 0),
        new Vector_5.Vector(0, 1, 1),
        new Vector_5.Vector(-1, 0, 1),
        new Vector_5.Vector(0, 0, 1),
        new Vector_5.Vector(1, 0, 1),
        new Vector_5.Vector(1, 0, 0),
        new Vector_5.Vector(1, 1, 0),
        new Vector_5.Vector(1, 1, 1),
    ];
});
define("graph/GraphTypes", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("graph/Graph", ["require", "exports", "xmlbuilder2", "IArrayFunctions"], function (require, exports, xmlbuilder2_1, IArrayFunctions_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Graph = void 0;
    class Graph {
        nodes;
        constructor() {
            this.nodes = new Map();
        }
        mapClone(func) {
            return IArrayFunctions_4.IArrayLikeHelper.MapClone(this, new Graph(), func);
        }
        map(func) {
            return IArrayFunctions_4.IArrayLikeHelper.Map(this, func);
        }
        reduce(func, initialValue) {
            return IArrayFunctions_4.IArrayLikeHelper.Reduce(this, initialValue, func);
        }
        filter(predicate) {
            return IArrayFunctions_4.IArrayLikeHelper.FilterSet(this, new Graph(), predicate);
        }
        forEach(func) {
            this.nodes.forEach((value, key) => func(value, key, this));
            return this;
        }
        forEachBreak(func) {
            for (const [key, value] of this.nodes.entries()) {
                if (func(value, key, this) == IArrayFunctions_4.SHOULD_BREAK.YES)
                    return key;
            }
            return undefined;
        }
        get(index) {
            return this.nodes.get(index);
        }
        set(index, value) {
            const exists = this.nodes.get(index);
            if (value.id == undefined)
                throw new Error(`Node must have an id value! Got: ${value}`);
            this.nodes.set(index, {
                id: value.id,
                data: value.data,
                outgoing: (exists?.outgoing ?? []).concat(value.outgoing),
                incoming: (exists?.incoming ?? []).concat(value.incoming),
            });
            return this;
        }
        addNode(id, data) {
            this.set(id, { id, data, outgoing: [], incoming: [] });
            return this;
        }
        addEdge(from, to, data) {
            const fromNode = this.nodes.get(from);
            const toNode = this.nodes.get(to);
            if (fromNode === undefined || toNode === undefined) {
                throw new Error("Both nodes must exist in the network!");
            }
            fromNode.outgoing.some((edge) => edge.to === to);
            if (fromNode.outgoing.some((edge) => edge.to === to)) {
                return this;
            }
            const newEdge = { from, to, data };
            fromNode.outgoing.push(newEdge);
            toNode.incoming.push(newEdge);
            return this;
        }
        getEdge(from, to) {
            return this.get(from)?.outgoing.find((e) => e.to == to);
        }
        removeEdge(from, to) {
            const fromNode = this.nodes.get(from);
            const toNode = this.nodes.get(to);
            if (fromNode === undefined || toNode === undefined) {
                return this;
            }
            const indexOut = fromNode.outgoing.findIndex((edge) => edge.to === to);
            const indexIn = toNode.incoming.findIndex((edge) => edge.from === from);
            if (indexOut != -1)
                fromNode.outgoing.splice(indexOut, 1);
            if (indexIn != -1)
                toNode.incoming.splice(indexIn, 1);
            return this;
        }
        removeNode(id) {
            const node = this.nodes.get(id);
            node.outgoing.forEach((edge) => {
                this.removeEdge(edge.from, edge.to);
            });
            node.incoming.forEach((edge) => {
                this.removeEdge(edge.from, edge.to);
            });
            this.nodes.delete(id);
            return this;
        }
        getOutgoingNeighbors(id) {
            return this.nodes.get(id)?.outgoing;
        }
        getIncomingNeighbors(id) {
            return this.nodes.get(id)?.incoming;
        }
        printNetwork() {
            console.log(this.toString());
            return this;
        }
        toString() {
            return Array.from(this.nodes.values())
                .map((self) => {
                return `${self.outgoing.map((other) => `${self.id.toString()} --> ${other.to.toString()};`).join("\n")}`;
            })
                .join("\n");
        }
        serialize() {
            return {
                nodes: Array.from(this.nodes.entries()),
            };
        }
        static deserialize(obj) {
            const res = new Graph();
            res.nodes = new Map(obj.nodes);
            return res;
        }
        exportToGraphML() {
            const doc = (0, xmlbuilder2_1.create)({ version: "1.0", encoding: "UTF-8", standalone: false })
                .ele("graphml", {
                xmlns: "http://graphml.graphdrawing.org/xmlns",
                "xmlns:java": "http://www.yworks.com/xml/yfiles-common/1.0/java",
                "xmlns:sys": "http://www.yworks.com/xml/yfiles-common/markup/primitives/2.0",
                "xmlns:x": "http://www.yworks.com/xml/yfiles-common/markup/2.0",
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                "xmlns:y": "http://www.yworks.com/xml/graphml",
                "xmlns:yed": "http://www.yworks.com/xml/yed/3",
                "xsi:schemaLocation": "http://graphml.graphdrawing.org/xmlns http://www.yworks.com/xml/schema/graphml/1.1/ygraphml.xsd",
            })
                .ele("key", { id: "d0", for: "port", "yfiles.type": "portgraphics" })
                .up()
                .ele("key", { id: "d1", for: "port", "yfiles.type": "portgeometry" })
                .up()
                .ele("key", { id: "d2", for: "port", "yfiles.type": "portuserdata" })
                .up()
                .ele("key", { id: "d3", "attr.name": "url", "attr.type": "string", for: "node" })
                .up()
                .ele("key", { id: "d4", "attr.name": "description", "attr.type": "string", for: "node" })
                .up()
                .ele("key", { id: "d5", for: "node", "yfiles.type": "nodegraphics" })
                .up()
                .ele("key", { id: "d6", for: "graphml", "yfiles.type": "resources" })
                .up()
                .ele("key", { id: "d7", "attr.name": "url", "attr.type": "string", for: "edge" })
                .up()
                .ele("key", { id: "d8", "attr.name": "description", "attr.type": "string", for: "edge" })
                .up()
                .ele("key", { id: "d9", for: "edge", "yfiles.type": "edgegraphics" })
                .up()
                .ele("key", { id: "d10", "yfiles.type": "edgegraphics", for: "edge" })
                .up()
                .ele("graph", { id: "G", edgedefault: "directed" });
            function AppendEdge(edge) {
                let data = edge.data ?? {};
                const edgeLabel = data["label"] ?? "";
                const fillColor = data["fillColor"] ?? "#000000";
                const borderColor = data["borderColor"] ?? "#000000";
                const type = data["type"] ?? "line";
                const width = data["width"] ?? 3;
                doc.ele("edge", { source: edge.from, target: edge.to })
                    .ele("data", { key: "d10" })
                    .ele("y:GenericEdge", { configuration: "com.yworks.edge.framed" })
                    .ele("y:LineStyle", { color: borderColor, type: type, width: `${width}` })
                    .up()
                    .ele("y:Arrows", { source: "none", target: "standard" })
                    .up()
                    .ele("y:EdgeLabel", { alignment: "center", fontFamily: "Dialog", fontSize: "12", fontStyle: "plain" })
                    .txt(edgeLabel)
                    .up()
                    .ele("y:StyleProperties")
                    .ele("y:Property", { class: "java.awt.Color", name: "FramedEdgePainter.fillColor", value: fillColor });
            }
            this.nodes.forEach((node) => {
                let data = node.data ?? {};
                const label = data["label"] ?? "";
                const shape = data["shape"] ?? "rectangle";
                const alignment = data["alignment"] ?? "center";
                const fillColor = data["fillColor"] ?? "#CCCCFF";
                const borderColor = data["borderColor"] ?? "#000000";
                const x = data["x"] ?? 0;
                const y = data["y"] ?? 0;
                const lines = label.split("\n");
                const nodeWidth = data["width"] ?? lines.reduce((a, b) => (a.length > b.length ? a : b)).length * 6 + 30;
                const nodeHeight = data["height"] ?? lines.length * 16 + 30;
                doc.ele("node", { id: node.id })
                    .ele("data", { key: "d5" })
                    .ele(`y:ShapeNode`)
                    .ele(`y:Geometry`, { height: `${nodeHeight}`, width: `${nodeWidth}`, x: `${x}`, y: `${y}` })
                    .up()
                    .ele("y:NodeLabel", {
                    alignment: alignment,
                    autoSizePolicy: "content",
                    fontFamily: "Dialog",
                    fontSize: "12",
                    fontStyle: "plain",
                })
                    .txt(label)
                    .up()
                    .ele(`y:Shape`, { type: shape })
                    .up()
                    .ele("y:Fill", { color: fillColor, transparent: "false" })
                    .up()
                    .ele("y:BorderStyle", { color: borderColor, type: "line", width: "1.0" });
                node.outgoing.forEach(AppendEdge);
            });
            doc.up().ele("data", { key: "d6" }).ele("y:Resources").up().up();
            return doc.end({ prettyPrint: true });
        }
    }
    exports.Graph = Graph;
});
define("graph/GraphHelper", ["require", "exports", "grid/Grid", "Polygon", "graph/Graph"], function (require, exports, Grid_2, Polygon_1, Graph_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GraphHelper = void 0;
    var GraphHelper;
    (function (GraphHelper) {
        function GraphFromSegments(segments, error = 0.05) {
            const result = new Graph_1.Graph();
            const invError = 1 / error;
            segments.forEach((seg) => {
                const hash0 = (0, Grid_2.HashVector)(seg[0].scaled(invError).floor().scale(error));
                const hash1 = (0, Grid_2.HashVector)(seg[1].scaled(invError).floor().scale(error));
                result.addNode(hash0, seg[0].clone());
                result.addNode(hash1, seg[1].clone());
                result.addEdge(hash0, hash1, undefined);
                result.addEdge(hash1, hash0, undefined);
            });
            return result;
        }
        GraphHelper.GraphFromSegments = GraphFromSegments;
        function GraphToPolygons(graph) {
            const nodeConnectionCount = graph.reduce((res, e) => {
                res[e.id] = e.outgoing.length;
                return res;
            }, {});
            const polygons = [];
            while (true) {
                const nodeKeys = Object.keys(nodeConnectionCount);
                const startNodeId = nodeKeys.find((e) => nodeConnectionCount[e] > 0);
                if (startNodeId == undefined)
                    break;
                let previousId = startNodeId;
                let previousNodeInfo = graph.get(previousId);
                let currentId = previousNodeInfo.outgoing[0].to;
                let currentNodeInfo = graph.get(currentId);
                const points = [];
                while (true) {
                    graph.removeEdge(previousNodeInfo.id, currentNodeInfo.id);
                    nodeConnectionCount[previousNodeInfo.id]--;
                    points.push(currentNodeInfo.data.clone());
                    if (currentId == startNodeId)
                        break;
                    const currentVector = previousNodeInfo.data.minus(currentNodeInfo.data);
                    const directions = currentNodeInfo.outgoing
                        .map((e) => [
                        e.to,
                        currentVector.getAngle2D(graph.get(e.to).data.minus(currentNodeInfo.data)),
                    ])
                        .filter((e) => e[0] !== previousId);
                    const bestDirection = directions.length == 0
                        ? previousId
                        : directions.length == 1
                            ? directions[0][0]
                            : directions.reduce((a, b) => (a[1] < b[1] ? a : b))[0];
                    previousId = currentId;
                    previousNodeInfo = currentNodeInfo;
                    currentId = bestDirection;
                    currentNodeInfo = graph.get(bestDirection);
                }
                const poly = new Polygon_1.Polygon(points);
                if (poly.getArea() > 0)
                    polygons.push(poly);
            }
            return polygons;
        }
        GraphHelper.GraphToPolygons = GraphToPolygons;
    })(GraphHelper || (exports.GraphHelper = GraphHelper = {}));
});
define("graph/TreeMap", ["require", "exports", "IArrayFunctions"], function (require, exports, IArrayFunctions_5) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TreeMap = void 0;
    class TreeMap {
        children;
        recursionLimit;
        constructor(recursionLimit) {
            this.children = new Map();
            this.recursionLimit = recursionLimit ?? 1000;
        }
        reduce(func, initialValue) {
            return IArrayFunctions_5.IArrayLikeHelper.Reduce(this, initialValue, func);
        }
        filter(predicate) {
            return IArrayFunctions_5.IArrayLikeHelper.FilterSet(this, new TreeMap(), predicate);
        }
        mapClone(func) {
            return IArrayFunctions_5.IArrayLikeHelper.MapClone(this, new TreeMap(), func);
        }
        map(func) {
            return IArrayFunctions_5.IArrayLikeHelper.Map(this, func);
        }
        find(predicate) {
            return IArrayFunctions_5.IArrayLikeHelper.Find(this, predicate);
        }
        findElement(predicate) {
            return IArrayFunctions_5.IArrayLikeHelper.FindElement(this, predicate);
        }
        findIndex(predicate) {
            return IArrayFunctions_5.IArrayLikeHelper.FindIndex(this, predicate);
        }
        forEach(func, parentKeys) {
            if (parentKeys.length > this.recursionLimit)
                return this;
            for (const [key, value] of this.children) {
                if (value instanceof TreeMap)
                    value.forEach(func, [...parentKeys, key]);
                else
                    func(value, [...parentKeys, key], this);
            }
            return this;
        }
        forEachBreak(func, parentKeys) {
            if (parentKeys.length > this.recursionLimit)
                return undefined;
            for (const [key, value] of this.children) {
                if (value instanceof TreeMap) {
                    const child_key = value.forEachBreak(func, [...parentKeys, key]);
                    if (child_key != undefined)
                        return;
                }
                else if (func(value, [...parentKeys, key], this) == IArrayFunctions_5.SHOULD_BREAK.YES)
                    return [...parentKeys, key];
            }
            return undefined;
        }
        set(index, value) {
            if (index.length > 1) {
                const child = this.children.get(index[0]);
                if (child instanceof TreeMap) {
                    child.set(index.slice(1), value);
                }
            }
            else if (index.length == 1)
                this.children.set(index[0], value);
            return this;
        }
        get(index) {
            if (index.length > 1) {
                const child = this.children.get(index[0]);
                if (child instanceof TreeMap)
                    return child.get(index.slice(1));
            }
            else if (index.length == 1)
                return this.children.get(index[0]);
            return this;
        }
    }
    exports.TreeMap = TreeMap;
});
define("math/SimpleMatrix", ["require", "exports", "math/Vector"], function (require, exports, Vector_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PrintMatrix4x4 = exports.CleanMatrix = exports.InvertMatrix4x4 = exports.CreatePerspectiveProjectionMatrix4x4 = exports.CreateTransformMatrix4x4 = exports.Create3DRotationMatrix3x3 = exports.ArrayToMatrix4x4 = exports.ArrayToMatrix3x3 = exports.MultiplyMatrix4x4 = exports.MatrixMultiplyVector4x4 = exports.MatrixMultiplyVector3x3 = void 0;
    function MatrixMultiplyVector3x3(vec, mat) {
        return new Vector_6.Vector(vec.x * mat.m11 + vec.y * mat.m12 + vec.z * mat.m13, vec.x * mat.m21 + vec.y * mat.m22 + vec.z * mat.m23, vec.x * mat.m31 + vec.y * mat.m32 + vec.z * mat.m33);
    }
    exports.MatrixMultiplyVector3x3 = MatrixMultiplyVector3x3;
    function MatrixMultiplyVector4x4(vec, mat) {
        return new Vector_6.Vector(vec.x * mat.m11 + vec.y * mat.m12 + vec.z * mat.m13 + vec.get(3) * mat.m14, vec.x * mat.m21 + vec.y * mat.m22 + vec.z * mat.m23 + vec.get(3) * mat.m24, vec.x * mat.m31 + vec.y * mat.m32 + vec.z * mat.m33 + vec.get(3) * mat.m34, vec.x * mat.m41 + vec.y * mat.m42 + vec.z * mat.m43 + vec.get(3) * mat.m44);
    }
    exports.MatrixMultiplyVector4x4 = MatrixMultiplyVector4x4;
    function MultiplyMatrix4x4(a, b) {
        return {
            m11: a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31 + a.m14 * b.m41,
            m12: a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32 + a.m14 * b.m42,
            m13: a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33 + a.m14 * b.m43,
            m14: a.m11 * b.m14 + a.m12 * b.m24 + a.m13 * b.m34 + a.m14 * b.m44,
            m21: a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31 + a.m24 * b.m41,
            m22: a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32 + a.m24 * b.m42,
            m23: a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33 + a.m24 * b.m43,
            m24: a.m21 * b.m14 + a.m22 * b.m24 + a.m23 * b.m34 + a.m24 * b.m44,
            m31: a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31 + a.m34 * b.m41,
            m32: a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32 + a.m34 * b.m42,
            m33: a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33 + a.m34 * b.m43,
            m34: a.m31 * b.m14 + a.m32 * b.m24 + a.m33 * b.m34 + a.m34 * b.m44,
            m41: a.m41 * b.m11 + a.m42 * b.m21 + a.m43 * b.m31 + a.m44 * b.m41,
            m42: a.m41 * b.m12 + a.m42 * b.m22 + a.m43 * b.m32 + a.m44 * b.m42,
            m43: a.m41 * b.m13 + a.m42 * b.m23 + a.m43 * b.m33 + a.m44 * b.m43,
            m44: a.m41 * b.m14 + a.m42 * b.m24 + a.m43 * b.m34 + a.m44 * b.m44,
        };
    }
    exports.MultiplyMatrix4x4 = MultiplyMatrix4x4;
    function ArrayToMatrix3x3(matrix) {
        return {
            m11: matrix[0][0],
            m12: matrix[0][1],
            m13: matrix[0][2],
            m21: matrix[1][0],
            m22: matrix[1][1],
            m23: matrix[1][2],
            m31: matrix[2][0],
            m32: matrix[2][1],
            m33: matrix[2][2],
        };
    }
    exports.ArrayToMatrix3x3 = ArrayToMatrix3x3;
    function ArrayToMatrix4x4(matrix) {
        return {
            m11: matrix[0][0],
            m12: matrix[0][1],
            m13: matrix[0][2],
            m14: matrix[0][3],
            m21: matrix[1][0],
            m22: matrix[1][1],
            m23: matrix[1][2],
            m24: matrix[1][3],
            m31: matrix[2][0],
            m32: matrix[2][1],
            m33: matrix[2][2],
            m34: matrix[2][3],
            m41: matrix[3][0],
            m42: matrix[3][1],
            m43: matrix[3][2],
            m44: matrix[3][3],
        };
    }
    exports.ArrayToMatrix4x4 = ArrayToMatrix4x4;
    function Create3DRotationMatrix3x3(x, y, z) {
        const ca = Math.cos(z);
        const cb = Math.cos(y);
        const cg = Math.cos(x);
        const sa = Math.sin(z);
        const sb = Math.sin(y);
        const sg = Math.sin(x);
        return ArrayToMatrix3x3([
            [ca * cb, ca * sb * sg - sa * cg, ca * sb * cg + sa * sg],
            [sa * cb, sa * sb * sg + ca * cg, sa * sb * cg - ca * sg],
            [-sb, cb * sg, cb * cg],
        ]);
    }
    exports.Create3DRotationMatrix3x3 = Create3DRotationMatrix3x3;
    function CreateTransformMatrix4x4(trans_x, trans_y, trans_z, rot_x, rot_y, rot_z) {
        trans_x ??= 0;
        trans_y ??= 0;
        trans_z ??= 0;
        rot_x ??= 0;
        rot_y ??= 0;
        rot_z ??= 0;
        const ca = Math.cos(rot_z);
        const cb = Math.cos(rot_y);
        const cg = Math.cos(rot_x);
        const sa = Math.sin(rot_z);
        const sb = Math.sin(rot_y);
        const sg = Math.sin(rot_x);
        return ArrayToMatrix4x4([
            [ca * cb, ca * sb * sg - sa * cg, ca * sb * cg + sa * sg, trans_x],
            [sa * cb, sa * sb * sg + ca * cg, sa * sb * cg - ca * sg, trans_y],
            [-sb, cb * sg, cb * cg, trans_z],
            [0, 0, 0, 1],
        ]);
    }
    exports.CreateTransformMatrix4x4 = CreateTransformMatrix4x4;
    function CreatePerspectiveProjectionMatrix4x4(fieldOfView, z_far, z_near, aspect) {
        const f = 1 / Math.tan(fieldOfView / 2);
        const diff = z_far - z_near;
        return ArrayToMatrix4x4([
            [f * aspect, 0, 0, 0],
            [0, f, 0, 0],
            [0, 0, z_far / diff, 1],
            [0, 0, (-z_far * z_near) / diff, 0],
        ]);
    }
    exports.CreatePerspectiveProjectionMatrix4x4 = CreatePerspectiveProjectionMatrix4x4;
    function InvertMatrix4x4(matrix) {
        const m = matrix;
        const det = m.m11 *
            (m.m22 * (m.m33 * m.m44 - m.m34 * m.m43) -
                m.m23 * (m.m32 * m.m44 - m.m34 * m.m42) +
                m.m24 * (m.m32 * m.m43 - m.m33 * m.m42)) -
            m.m12 *
                (m.m21 * (m.m33 * m.m44 - m.m34 * m.m43) -
                    m.m23 * (m.m31 * m.m44 - m.m34 * m.m41) +
                    m.m24 * (m.m31 * m.m43 - m.m33 * m.m41)) +
            m.m13 *
                (m.m21 * (m.m32 * m.m44 - m.m34 * m.m42) -
                    m.m22 * (m.m31 * m.m44 - m.m34 * m.m41) +
                    m.m24 * (m.m31 * m.m42 - m.m32 * m.m41)) -
            m.m14 *
                (m.m21 * (m.m32 * m.m43 - m.m33 * m.m42) -
                    m.m22 * (m.m31 * m.m43 - m.m33 * m.m41) +
                    m.m23 * (m.m31 * m.m42 - m.m32 * m.m41));
        if (det === 0)
            return null;
        const invDet = 1 / det;
        return {
            m11: (m.m22 * (m.m33 * m.m44 - m.m34 * m.m43) -
                m.m23 * (m.m32 * m.m44 - m.m34 * m.m42) +
                m.m24 * (m.m32 * m.m43 - m.m33 * m.m42)) *
                invDet,
            m12: -(m.m12 * (m.m33 * m.m44 - m.m34 * m.m43) -
                m.m13 * (m.m32 * m.m44 - m.m34 * m.m42) +
                m.m14 * (m.m32 * m.m43 - m.m33 * m.m42)) * invDet,
            m13: (m.m12 * (m.m23 * m.m44 - m.m24 * m.m43) -
                m.m13 * (m.m22 * m.m44 - m.m24 * m.m42) +
                m.m14 * (m.m22 * m.m43 - m.m23 * m.m42)) *
                invDet,
            m14: -(m.m12 * (m.m23 * m.m34 - m.m24 * m.m33) -
                m.m13 * (m.m22 * m.m34 - m.m24 * m.m32) +
                m.m14 * (m.m22 * m.m33 - m.m23 * m.m32)) * invDet,
            m21: -(m.m21 * (m.m33 * m.m44 - m.m34 * m.m43) -
                m.m23 * (m.m31 * m.m44 - m.m34 * m.m41) +
                m.m24 * (m.m31 * m.m43 - m.m33 * m.m41)) * invDet,
            m22: (m.m11 * (m.m33 * m.m44 - m.m34 * m.m43) -
                m.m13 * (m.m31 * m.m44 - m.m34 * m.m41) +
                m.m14 * (m.m31 * m.m43 - m.m33 * m.m41)) *
                invDet,
            m23: -(m.m11 * (m.m23 * m.m44 - m.m24 * m.m43) -
                m.m13 * (m.m21 * m.m44 - m.m24 * m.m41) +
                m.m14 * (m.m21 * m.m43 - m.m23 * m.m41)) * invDet,
            m24: (m.m11 * (m.m23 * m.m34 - m.m24 * m.m33) -
                m.m13 * (m.m21 * m.m34 - m.m24 * m.m31) +
                m.m14 * (m.m21 * m.m33 - m.m23 * m.m31)) *
                invDet,
            m31: (m.m21 * (m.m32 * m.m44 - m.m34 * m.m42) -
                m.m22 * (m.m31 * m.m44 - m.m34 * m.m41) +
                m.m24 * (m.m31 * m.m42 - m.m32 * m.m41)) *
                invDet,
            m32: -(m.m11 * (m.m32 * m.m44 - m.m34 * m.m42) -
                m.m12 * (m.m31 * m.m44 - m.m34 * m.m41) +
                m.m14 * (m.m31 * m.m42 - m.m32 * m.m41)) * invDet,
            m33: (m.m11 * (m.m22 * m.m44 - m.m24 * m.m42) -
                m.m12 * (m.m21 * m.m44 - m.m24 * m.m41) +
                m.m14 * (m.m21 * m.m42 - m.m22 * m.m41)) *
                invDet,
            m34: -(m.m11 * (m.m22 * m.m34 - m.m24 * m.m32) -
                m.m12 * (m.m21 * m.m34 - m.m24 * m.m31) +
                m.m14 * (m.m21 * m.m32 - m.m22 * m.m31)) * invDet,
            m41: -(m.m21 * (m.m32 * m.m43 - m.m33 * m.m42) -
                m.m22 * (m.m31 * m.m43 - m.m33 * m.m41) +
                m.m23 * (m.m31 * m.m42 - m.m32 * m.m41)) * invDet,
            m42: (m.m11 * (m.m32 * m.m43 - m.m33 * m.m42) -
                m.m12 * (m.m31 * m.m43 - m.m33 * m.m41) +
                m.m13 * (m.m31 * m.m42 - m.m32 * m.m41)) *
                invDet,
            m43: -(m.m11 * (m.m22 * m.m43 - m.m23 * m.m42) -
                m.m12 * (m.m21 * m.m43 - m.m23 * m.m41) +
                m.m13 * (m.m21 * m.m42 - m.m22 * m.m41)) * invDet,
            m44: (m.m11 * (m.m22 * m.m33 - m.m23 * m.m32) -
                m.m12 * (m.m21 * m.m33 - m.m23 * m.m31) +
                m.m13 * (m.m21 * m.m32 - m.m22 * m.m31)) *
                invDet,
        };
    }
    exports.InvertMatrix4x4 = InvertMatrix4x4;
    function CleanMatrix(matrix, tolerance = 1e-6) {
        return {
            m11: Math.abs(matrix.m11) < tolerance ? 0 : matrix.m11,
            m12: Math.abs(matrix.m12) < tolerance ? 0 : matrix.m12,
            m13: Math.abs(matrix.m13) < tolerance ? 0 : matrix.m13,
            m14: Math.abs(matrix.m14) < tolerance ? 0 : matrix.m14,
            m21: Math.abs(matrix.m21) < tolerance ? 0 : matrix.m21,
            m22: Math.abs(matrix.m22) < tolerance ? 0 : matrix.m22,
            m23: Math.abs(matrix.m23) < tolerance ? 0 : matrix.m23,
            m24: Math.abs(matrix.m24) < tolerance ? 0 : matrix.m24,
            m31: Math.abs(matrix.m31) < tolerance ? 0 : matrix.m31,
            m32: Math.abs(matrix.m32) < tolerance ? 0 : matrix.m32,
            m33: Math.abs(matrix.m33) < tolerance ? 0 : matrix.m33,
            m34: Math.abs(matrix.m34) < tolerance ? 0 : matrix.m34,
            m41: Math.abs(matrix.m41) < tolerance ? 0 : matrix.m41,
            m42: Math.abs(matrix.m42) < tolerance ? 0 : matrix.m42,
            m43: Math.abs(matrix.m43) < tolerance ? 0 : matrix.m43,
            m44: Math.abs(matrix.m44) < tolerance ? 0 : matrix.m44,
        };
    }
    exports.CleanMatrix = CleanMatrix;
    function PrintMatrix4x4(matrix) {
        const mat = CleanMatrix(matrix);
        console.log(mat.m11, mat.m12, mat.m13, mat.m14);
        console.log(mat.m21, mat.m22, mat.m23, mat.m24);
        console.log(mat.m31, mat.m32, mat.m33, mat.m34);
        console.log(mat.m41, mat.m42, mat.m43, mat.m44);
    }
    exports.PrintMatrix4x4 = PrintMatrix4x4;
});
define("math/TensorGrid", ["require", "exports", "IArrayFunctions", "math/Vector"], function (require, exports, IArrayFunctions_6, Vector_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.TensorGrid = void 0;
    class TensorGrid {
        values;
        defaultValue;
        min;
        max;
        constructor(defaultValue) {
            this.values = {};
            this.defaultValue = defaultValue;
        }
        getMin() {
            return this.min?.clone() ?? new Vector_7.Vector();
        }
        getMax() {
            return this.min?.clone() ?? new Vector_7.Vector();
        }
        getSize() {
            return this.getMax()
                .subtract(this.getMin())
                .mapClone((e) => e + 1);
        }
        getDimensions() {
            return this.min?.getDimensions() ?? 0;
        }
        hashVector(vec) {
            return vec.hash();
        }
        mapClone(func, defaultValue) {
            return IArrayFunctions_6.IArrayLikeHelper.MapClone(this, new TensorGrid(defaultValue), func);
        }
        map(func) {
            return IArrayFunctions_6.IArrayLikeHelper.Map(this, func);
        }
        forEach(func) {
            const current = this.min.clone();
            const dimensionCount = this.min.getDimensions();
            while (true) {
                func(this.get(current), current.clone(), this);
                let dimension = 0;
                while (dimension < dimensionCount) {
                    current.set(dimension, current.get(dimension) + 1);
                    if (current.get(dimension) > this.max.get(dimension)) {
                        current[dimension] = this.min.get(dimension);
                        dimension++;
                    }
                    else {
                        break;
                    }
                }
                if (dimension === dimensionCount) {
                    break;
                }
            }
            return this;
        }
        forEachBreak(func) {
            const current = this.min.clone();
            const dimensionCount = this.min.getDimensions();
            while (true) {
                if (func(this.get(current), current.clone(), this) == IArrayFunctions_6.SHOULD_BREAK.YES)
                    return current;
                let dimension = 0;
                while (dimension < dimensionCount) {
                    current.set(dimension, current.get(dimension) + 1);
                    if (current.get(dimension) > this.max.get(dimension)) {
                        current[dimension] = this.min.get(dimension);
                        dimension++;
                    }
                    else {
                        break;
                    }
                }
                if (dimension === dimensionCount) {
                    break;
                }
            }
            return undefined;
        }
        get(index) {
            return this.values[this.hashVector(index)] ?? this.defaultValue;
        }
        set(index, value) {
            if (index == undefined)
                return this;
            if (this.min == undefined || this.max == undefined) {
                this.min = index.clone();
                this.max = index.clone();
            }
            else {
                if (index.getDimensions() > this.min.getDimensions()) {
                    this.min.cloneWithDimensions(index.getDimensions());
                    this.max.cloneWithDimensions(index.getDimensions());
                }
                this.min = this.min.min(index);
                this.max = this.max.max(index);
            }
            if (value == undefined)
                return this;
            this.values[this.hashVector(index)] = value;
            return this;
        }
    }
    exports.TensorGrid = TensorGrid;
});
define("rasterization/Bezier", ["require", "exports", "math/Vector"], function (require, exports, Vector_8) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Bezier = void 0;
    var Bezier;
    (function (Bezier) {
        function Splines(splinePoints, t) {
            if ((splinePoints.length - 1) % 3 != 0)
                throw new Error("Incorrect spline point amount! Please refer to function description!");
            if (t >= 1)
                return splinePoints[splinePoints.length - 1];
            if (t <= 0)
                return splinePoints[0];
            const splineMaxIndex = (splinePoints.length - 1) / 3;
            const totalSplineT = t * splineMaxIndex;
            let splineIndex = Math.floor(totalSplineT);
            const splineT = totalSplineT - splineIndex;
            splineIndex *= 3;
            return VectorCubic(splinePoints[splineIndex], splinePoints[splineIndex + 1], splinePoints[splineIndex + 2], splinePoints[splineIndex + 3], splineT);
        }
        Bezier.Splines = Splines;
        function SplinesWithDerivative(splinePoints, t) {
            if ((splinePoints.length - 1) % 3 != 0)
                throw new Error("Incorrect spline point amount! Please refer to function description!");
            if (t >= 1)
                return [splinePoints[splinePoints.length - 1], new Vector_8.Vector()];
            if (t <= 0)
                return [splinePoints[0], new Vector_8.Vector()];
            const splineMaxIndex = (splinePoints.length - 1) / 3;
            const totalSplineT = t * splineMaxIndex;
            let splineIndex = Math.floor(totalSplineT);
            const splineT = totalSplineT - splineIndex;
            splineIndex *= 3;
            return [
                VectorCubic(splinePoints[splineIndex], splinePoints[splineIndex + 1], splinePoints[splineIndex + 2], splinePoints[splineIndex + 3], splineT),
                VectorCubicWithDerivative(splinePoints[splineIndex], splinePoints[splineIndex + 1], splinePoints[splineIndex + 2], splinePoints[splineIndex + 3], splineT),
            ];
        }
        Bezier.SplinesWithDerivative = SplinesWithDerivative;
        function Cubic(n0, n1, n2, n3, t) {
            const t2 = t * t;
            const t3 = t2 * t;
            return (n0 - n0 * t3 + 3 * t2 * n2 - 3 * t3 * n2 + 3 * t * n1 + 3 * t3 * n1 + t3 * n3 - 3 * t * n0 + 3 * t2 * n0 - 6 * t2 * n1);
        }
        Bezier.Cubic = Cubic;
        function CubicWithDerivative(n0, n1, n2, n3, t) {
            const t2 = t * t;
            return 9 * n1 * t2 + 3 * n3 * t2 - 3 * n0 * t2 - 9 * n2 * t2 + 6 * n0 * t + 6 * n2 * t - 12 * n1 * t + 3 * n1 - 3 * n0;
        }
        Bezier.CubicWithDerivative = CubicWithDerivative;
        function VectorCubic(n0, n1, n2, n3, t) {
            return n0.mapClone((n0e, i) => Cubic(n0e, n1.get(i), n2.get(i), n3.get(i), t));
        }
        Bezier.VectorCubic = VectorCubic;
        function VectorCubicWithDerivative(n0, n1, n2, n3, t) {
            return n0.mapClone((n0e, i) => CubicWithDerivative(n0e, n1.get(i), n2.get(i), n3.get(i), t));
        }
        Bezier.VectorCubicWithDerivative = VectorCubicWithDerivative;
    })(Bezier || (exports.Bezier = Bezier = {}));
});
define("rasterization/Interpolation", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LerpVector = exports.Lerp = void 0;
    function Lerp(a, b, t) {
        return a * (1 - t) + b * t;
    }
    exports.Lerp = Lerp;
    function LerpVector(a, b, t) {
        return a.mapClone((e, i) => Lerp(e, b.get(i), t));
    }
    exports.LerpVector = LerpVector;
});
define("rasterization/Bresenham", ["require", "exports", "math/Vector"], function (require, exports, Vector_9) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Bresenham = void 0;
    var Bresenham;
    (function (Bresenham) {
        function Line3D(a, b) {
            let x0 = a.x;
            let y0 = a.y;
            let z0 = a.z;
            let x1 = b.x;
            let y1 = b.y;
            let z1 = b.z;
            const dx = Math.abs(x1 - x0);
            const sx = x0 < x1 ? 1 : -1;
            const dy = Math.abs(y1 - y0);
            const sy = y0 < y1 ? 1 : -1;
            const dz = Math.abs(z1 - z0);
            const sz = z0 < z1 ? 1 : -1;
            const dm = Math.max(dx, dy, dz);
            const result = [];
            x1 = dm / 2;
            y1 = x1;
            z1 = y1;
            for (let i = dm; i >= 0; i--) {
                result.push(new Vector_9.Vector(x0, y0, z0));
                x1 -= dx;
                if (x1 < 0) {
                    x1 += dm;
                    x0 += sx;
                }
                y1 -= dy;
                if (y1 < 0) {
                    y1 += dm;
                    y0 += sy;
                }
                z1 -= dz;
                if (z1 < 0) {
                    z1 += dm;
                    z0 += sz;
                }
            }
            return result;
        }
        Bresenham.Line3D = Line3D;
    })(Bresenham || (exports.Bresenham = Bresenham = {}));
});
define("rasterization/SubdivisionRasterize", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SubdivisionRasterize = void 0;
    function SubdivisionRasterize(func) {
        const relations = new Map();
        const vectors = new Map();
        const insertVector = (parent, child) => {
            const pHash = parent.hash();
            const cHash = child.hash();
            if (vectors.has(pHash))
                relations.set(cHash, relations.get(pHash));
            relations.set(pHash, cHash);
            vectors.set(pHash, parent);
            vectors.set(cHash, child);
        };
        let minT = 0;
        let maxT = 1;
        let minVector = func(minT).rounded();
        let maxVector = func(maxT).rounded();
        const firstVector = minVector.hash();
        const arr_maxT = [1];
        const arr_maxVec = [maxVector];
        insertVector(minVector, maxVector);
        while (minT <= 1) {
            if (arr_maxT.length == 0)
                break;
            if (maxVector.minus(minVector).lengthMax() > 1) {
                arr_maxT.push(maxT);
                arr_maxVec.push(maxVector);
                maxT = (maxT - minT) * 0.5 + minT;
                maxVector = func(maxT).rounded();
                insertVector(minVector, maxVector);
            }
            else {
                minT = maxT;
                minVector = maxVector;
                maxT = arr_maxT.pop();
                maxVector = arr_maxVec.pop();
            }
        }
        const result = [vectors.get(firstVector)];
        while (true) {
            const next = relations.get(result[result.length - 1].hash());
            if (next == undefined)
                break;
            result.push(vectors.get(next));
        }
        return result;
    }
    exports.SubdivisionRasterize = SubdivisionRasterize;
});
define("benchmark/Benchmark", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WaitForKeypress = exports.BenchmarkSilent = exports.Benchmark = void 0;
    function Benchmark(name, iter, func, ...args) {
        console.log(`Benchmarking ${name}...`);
        console.log(`Result: ${BenchmarkSilent(iter, func, ...args)} ms`);
    }
    exports.Benchmark = Benchmark;
    function BenchmarkSilent(iter, func, ...args) {
        return new Promise((resolve) => {
            const startTime = Date.now();
            for (let i = 0; i < iter; i++)
                func(...args);
            const final = (Date.now() - startTime) / iter;
            resolve(final);
        });
    }
    exports.BenchmarkSilent = BenchmarkSilent;
    async function WaitForKeypress() {
        console.log("Press any key to continue...");
        return new Promise((resolve) => process.stdin.once("data", (data) => {
            const byteArray = [...data];
            if (byteArray.length > 0 && byteArray[0] === 3) {
                console.log("^C");
                process.exit(1);
            }
            resolve();
        }));
    }
    exports.WaitForKeypress = WaitForKeypress;
});
define("color/Color", ["require", "exports", "IArrayFunctions"], function (require, exports, IArrayFunctions_7) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Color = void 0;
    class Color {
        r;
        g;
        b;
        a;
        constructor(r, g, b, a) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        mapClone(func) {
            return IArrayFunctions_7.IArrayLikeHelper.MapClone(this, new Color(0, 0, 0, 0), func);
        }
        map(func) {
            return IArrayFunctions_7.IArrayLikeHelper.Map(this, func);
        }
        forEach(func) {
            func(this.r, "r", this);
            func(this.g, "g", this);
            func(this.b, "b", this);
            func(this.a, "a", this);
            return this;
        }
        forEachBreak(func) {
            if (func(this.r, "r", this) == IArrayFunctions_7.SHOULD_BREAK.YES)
                return "r";
            if (func(this.g, "g", this) == IArrayFunctions_7.SHOULD_BREAK.YES)
                return "g";
            if (func(this.b, "b", this) == IArrayFunctions_7.SHOULD_BREAK.YES)
                return "b";
            if (func(this.a, "a", this) == IArrayFunctions_7.SHOULD_BREAK.YES)
                return "a";
            return undefined;
        }
        get(index) {
            return this[index];
        }
        set(index, value) {
            this[index] = value;
            return this;
        }
        applyGammaSRGB() {
            return this.mapClone((linearValue) => {
                if (linearValue <= 0.0031308) {
                    return 12.92 * linearValue;
                }
                else {
                    return 1.055 * Math.pow(linearValue, 1 / 2.4) - 0.055;
                }
            });
        }
        removeGammaSRGB() {
            return this.mapClone((srgbValue) => {
                if (srgbValue <= 0.04045) {
                    return srgbValue / 12.92;
                }
                else {
                    return Math.pow((srgbValue + 0.055) / 1.055, 2.4);
                }
            });
        }
        plus(other) {
            return this.mapClone((e, i) => e + other.get(i));
        }
        minus(other) {
            return this.mapClone((e, i) => e - other.get(i));
        }
        scale(scalar) {
            return this.mapClone((e, i) => e * scalar);
        }
        multiply(scalar) {
            return this.mapClone((e, i) => e * scalar.get(i));
        }
    }
    exports.Color = Color;
});
define("color/Image", ["require", "exports", "IArrayFunctions", "math/Vector", "color/Color"], function (require, exports, IArrayFunctions_8, Vector_10, Color_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Image = void 0;
    class Image {
        pixels;
        size;
        constructor(w, h) {
            this.pixels = {};
            this.size = new Vector_10.Vector(w, h);
        }
        mapClone(func) {
            return IArrayFunctions_8.IArrayLikeHelper.MapClone(this, new Image(this.size.x, this.size.y), func);
        }
        map(func) {
            return IArrayFunctions_8.IArrayLikeHelper.Map(this, func);
        }
        forEach(func) {
            for (let x = 0; x < this.size.x; x++) {
                for (let y = 0; y < this.size.y; y++) {
                    const key = new Vector_10.Vector(x, y);
                    func(this.get(key), key, this);
                }
            }
            return this;
        }
        forEachBreak(func) {
            for (let x = 0; x < this.size.x; x++) {
                for (let y = 0; y < this.size.y; y++) {
                    const key = new Vector_10.Vector(x, y);
                    if (func(this.get(key), key, this) === IArrayFunctions_8.SHOULD_BREAK.YES)
                        return key;
                }
            }
            return undefined;
        }
        get(index) {
            return this.pixels[index.hash()];
        }
        set(index, value) {
            index = index.cloneWithDimensions(2);
            this.pixels[index.hash()] = value;
            return this;
        }
        getSize() {
            return this.size.clone();
        }
        static async fromBitmap(bitmap) {
            const image = new Image(bitmap.width, bitmap.height);
            for (let y = 0; y < bitmap.height; y++) {
                for (let x = 0; x < bitmap.width; x++) {
                    const idx = (y * bitmap.width + x) * 4;
                    const r = bitmap.data[idx];
                    const g = bitmap.data[idx + 1];
                    const b = bitmap.data[idx + 2];
                    const a = bitmap.data[idx + 3];
                    image.set(new Vector_10.Vector(x, y), new Color_1.Color(r, g, b, a));
                }
            }
            return image;
        }
    }
    exports.Image = Image;
});
define("color/ColorHelper", ["require", "exports", "math/Vector", "color/Color"], function (require, exports, Vector_11, Color_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ColorHelper = void 0;
    var ColorHelper;
    (function (ColorHelper) {
        function AverageColors(colors) {
            return colors
                .map((e) => e.removeGammaSRGB())
                .reduce((a, b) => a.plus(b))
                .scale(1 / colors.length)
                .applyGammaSRGB();
        }
        ColorHelper.AverageColors = AverageColors;
        function Average(image) {
            const size = image.getSize().volume();
            return image
                .map((e) => e.removeGammaSRGB())
                .reduce((a, b) => a.plus(b))
                .scale(1 / size)
                .applyGammaSRGB();
        }
        ColorHelper.Average = Average;
        function NoiseIndex(image, kernelSize, textureSize) {
            kernelSize ??= 5;
            textureSize ??= 16;
            const kernelHalf = Math.floor(kernelSize / 2);
            const kernelVectors = [];
            for (let x = -kernelHalf; x <= kernelHalf; x++) {
                for (let y = -kernelHalf; y <= kernelHalf; y++) {
                    kernelVectors.push(new Vector_11.Vector(x, y));
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
                }, new Color_2.Color(0, 0, 0, 0))
                    .scale(sqKernelScalar);
            })
                .reduce((a, b) => a.plus(b))
                .scale(1 / sqTextureSize)
                .applyGammaSRGB();
        }
        ColorHelper.NoiseIndex = NoiseIndex;
        function ImageKernelRaw(image, kernel, offsets) {
            return image.mapClone((_, index) => {
                return offsets.reduce((res, vec, i) => {
                    return res.plus(image.get(index.plus(vec)).multiply(kernel[i]));
                }, new Color_2.Color(0, 0, 0, 0));
            });
        }
        ColorHelper.ImageKernelRaw = ImageKernelRaw;
    })(ColorHelper || (exports.ColorHelper = ColorHelper = {}));
});
define("constraints/Pathfinder", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Pathfinder = void 0;
    var Pathfinder;
    (function (Pathfinder) {
        function FindPath(goal) {
            const actionSpace_edges = new Map();
            const actionSpace_nodes = new Map();
            const startId = goal.HashState(goal.startingState);
            actionSpace_nodes.set(startId, goal.startingState);
            const openSet = [startId];
            const cameFrom = new Map();
            const gCost = new Map();
            gCost.set(startId, 0);
            const get_gCost = (key) => gCost.get(key) ?? Number.POSITIVE_INFINITY;
            const fCost = new Map();
            gCost.set(startId, 0);
            while (openSet.length > 0) {
                const current_id = openSet.reduce((a, b) => (fCost.get(a) < fCost.get(b) ? a : b));
                const current_state = actionSpace_nodes.get(current_id);
                if (goal.HasBeenReached(current_state)) {
                    const result = [];
                    let curr = current_id;
                    while (true) {
                        const prev = cameFrom.get(curr);
                        if (prev == undefined)
                            break;
                        result.unshift(actionSpace_edges.get(prev).find((e) => e[0] == curr)[1]);
                        curr = prev;
                    }
                    return {
                        actions: result,
                        lastState: current_state,
                        edges: actionSpace_edges,
                    };
                }
                openSet.splice(openSet.indexOf(current_id), 1);
                const curr_gCost = get_gCost(current_id);
                for (const action of goal.actions) {
                    const neigh_state = action.onCallAlteration(current_state);
                    if (!goal.CanTakeAction(current_state, neigh_state, action))
                        continue;
                    const neigh_id = goal.HashState(neigh_state);
                    actionSpace_nodes.set(neigh_id, neigh_state);
                    const curr_edges = actionSpace_edges.get(current_id) ?? [];
                    curr_edges.push([neigh_id, action.id]);
                    actionSpace_edges.set(current_id, curr_edges);
                    const tentative_gScore = curr_gCost + action.cost;
                    if (tentative_gScore < get_gCost(neigh_id)) {
                        cameFrom.set(neigh_id, current_id);
                        gCost.set(neigh_id, tentative_gScore);
                        fCost.set(neigh_id, tentative_gScore + goal.ActionHeuristic(current_state, neigh_state, action));
                        if (!openSet.includes(neigh_id))
                            openSet.push(neigh_id);
                    }
                }
                actionSpace_nodes.delete(current_id);
            }
            return {
                lastState: undefined,
                actions: undefined,
                edges: actionSpace_edges,
            };
        }
        Pathfinder.FindPath = FindPath;
    })(Pathfinder || (exports.Pathfinder = Pathfinder = {}));
});
define("constraints/Goals", ["require", "exports", "math/Vector"], function (require, exports, Vector_12) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Goals = void 0;
    var Goals;
    (function (Goals) {
        class Goal2D {
            target;
            start;
            world;
            constructor(world, start, target) {
                this.startingState = start.clone();
                this.start = start.clone();
                this.target = target.clone();
                this.world = world;
            }
            startingState;
            actions = [
                {
                    id: "up",
                    cost: 0,
                    onCallAlteration: (curr) => curr.offset(0, 1),
                },
                {
                    id: "down",
                    cost: 0,
                    onCallAlteration: (curr) => curr.offset(0, -1),
                },
                {
                    id: "left",
                    cost: 0,
                    onCallAlteration: (curr) => curr.offset(-1, 0),
                },
                {
                    id: "right",
                    cost: 0,
                    onCallAlteration: (curr) => curr.offset(1, 0),
                },
                {
                    id: "up-right",
                    cost: 1,
                    onCallAlteration: (curr) => curr.offset(1, 1),
                },
                {
                    id: "up-left",
                    cost: 1,
                    onCallAlteration: (curr) => curr.offset(1, -1),
                },
                {
                    id: "down-right",
                    cost: 1,
                    onCallAlteration: (curr) => curr.offset(-1, 1),
                },
                {
                    id: "down-left",
                    cost: 1,
                    onCallAlteration: (curr) => curr.offset(-1, -1),
                },
            ];
            ActionHeuristic(current_state, next_state, action) {
                return this.target.minus(next_state).lengthMax() - this.start.minus(next_state).lengthMax() / 2;
            }
            CanTakeAction(current_state, next_state, action) {
                if (this.world.get(next_state) == 1)
                    return false;
                return true;
            }
            HasBeenReached(state) {
                return this.target.equals(state);
            }
            HashState(state) {
                return state.toString();
            }
        }
        Goals.Goal2D = Goal2D;
        class GoalWFC {
            directions;
            directions_inverse;
            size;
            maxCount;
            constructor(size, tiles, directions) {
                this.directions = directions ?? [new Vector_12.Vector(0, 1), new Vector_12.Vector(1, 0), new Vector_12.Vector(0, -1), new Vector_12.Vector(-1, 0)];
                this.directions_inverse = this.directions.map((a) => this.directions.findIndex((b) => b.equals(a.scaled(-1))));
                this.tiles = tiles.map((e, i) => {
                    return {
                        value: e.value,
                        edges: e.edges,
                        id: `set_tile_${i}`,
                    };
                });
                for (let index = 0; index < this.tiles.length; index++) {
                    this.actions.push({
                        id: `set_tile_${index}`,
                        onCallAlteration: (state) => this.setTile(state, index),
                        cost: 1,
                    });
                }
                this.size = size.clone();
                this.maxCount = size.volume();
                this.startingState = {
                    values: {},
                    counter: 0,
                    cursor: size.mapClone((e) => 0),
                    superPositions: this.tiles.map((e) => e.id),
                };
            }
            getValueFromState(state, vec) {
                return state.values[vec.toString()] ?? -1;
            }
            setValueToState(state, vec, value) {
                state.values[vec.toString()] = value;
            }
            cloneState(state) {
                return {
                    values: Object.fromEntries(Object.entries(state.values)),
                    counter: state.counter,
                    cursor: state.cursor.clone(),
                    superPositions: [...state.superPositions],
                };
            }
            setTile(state, index) {
                const clone = this.cloneState(state);
                this.setValueToState(clone, clone.cursor, index);
                clone.counter++;
                clone.cursor.translate(1).forEach((e, i, self) => {
                    if (e >= this.size.get(i)) {
                        self.set(i, 0);
                        if (i + 1 < self.getDimensions())
                            self.set(i + 1, self.get(i + 1) + 1);
                    }
                });
                const neighs = this.directions.map((e) => this.tiles[this.getValueFromState(clone, clone.cursor.plus(e))]);
                clone.superPositions = this.tiles
                    .filter((self) => self.edges.every((edge, i) => neighs[i] == undefined || edge == neighs[i].edges[this.directions_inverse[i]]))
                    .map((e) => e.id);
                return clone;
            }
            tiles = [];
            startingState;
            actions = [];
            ActionHeuristic(current_state, next_state, action) {
                return Math.random() - next_state.counter * 5;
            }
            CanTakeAction(current_state, next_state, action) {
                return current_state.superPositions.includes(action.id);
            }
            HasBeenReached(state) {
                return state.counter >= this.maxCount;
            }
            HashState(state) {
                const valuesString = Object.values(state.values)
                    .map((value) => `${value}`)
                    .join("|");
                return `${valuesString}|${state.cursor.x},${state.cursor.y},${state.cursor.z}`;
            }
        }
        Goals.GoalWFC = GoalWFC;
    })(Goals || (exports.Goals = Goals = {}));
});
define("constraints/LSystem", ["require", "exports", "GenerateUUID", "graph/Graph", "math/Vector"], function (require, exports, GenerateUUID_1, Graph_2, Vector_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.LSystem = void 0;
    var LSystem;
    (function (LSystem) {
        const CONSTANTS = {
            OPEN_SQUARE_BRACKET: "[",
            CLOSED_SQUARE_BRACKET: "]",
            OPEN_BRACKET: "(",
            CLOSED_BRACKET: ")"
        };
        let PARSING_TYPE;
        (function (PARSING_TYPE) {
            PARSING_TYPE[PARSING_TYPE["DEFAULT"] = 0] = "DEFAULT";
            PARSING_TYPE[PARSING_TYPE["ARGUMENT"] = 1] = "ARGUMENT";
        })(PARSING_TYPE || (PARSING_TYPE = {}));
        function GenerateString(axiom, rules, iterations) {
            rules.forEach((e) => {
                if (e.predecessor.length !== 1)
                    throw new Error("LSystem Rule predecessors can only be a single character long!");
            });
            let result = axiom;
            for (let n = 0; n < iterations; n++) {
                let newString = "";
                for (let i = 0; i < result.length; i++) {
                    const symbol = result[i];
                    const foundRules = rules.filter((e) => e.predecessor === symbol);
                    if (foundRules.length == 0) {
                        newString += symbol;
                        continue;
                    }
                    if (foundRules.length == 1) {
                        newString += foundRules[0].successor;
                        continue;
                    }
                    newString += foundRules[Math.floor(Math.random() * foundRules.length)].successor;
                }
                result = newString;
            }
            return result;
        }
        LSystem.GenerateString = GenerateString;
        function ConvertToGraph(str) {
            const result = new Graph_2.Graph();
            function ParseBracket(start, prevNode, parsingType) {
                let i = start;
                let currentNode = prevNode;
                while (i < str.length) {
                    const char = str[i];
                    if (char == CONSTANTS.OPEN_SQUARE_BRACKET)
                        i = ParseBracket(i + 1, currentNode, parsingType);
                    else if (char == CONSTANTS.CLOSED_SQUARE_BRACKET)
                        return i;
                    else if (char == CONSTANTS.OPEN_BRACKET) {
                        result.get(currentNode).data.label += CONSTANTS.OPEN_BRACKET;
                        i = ParseBracket(i + 1, currentNode, PARSING_TYPE.ARGUMENT);
                    }
                    else if (char == CONSTANTS.CLOSED_BRACKET) {
                        result.get(currentNode).data.label += CONSTANTS.CLOSED_BRACKET;
                        return i;
                    }
                    else {
                        switch (parsingType) {
                            case PARSING_TYPE.DEFAULT:
                                var nextNode = currentNode + Math.random();
                                result.addNode(nextNode, { label: char });
                                result.addEdge(currentNode, nextNode, {});
                                currentNode = nextNode;
                                break;
                            case PARSING_TYPE.ARGUMENT:
                                result.get(currentNode).data.label += char;
                                break;
                        }
                    }
                    i++;
                }
                return str.length;
            }
            result.addNode(0, { label: "root" });
            ParseBracket(0, 0, PARSING_TYPE.DEFAULT);
            return result;
        }
        LSystem.ConvertToGraph = ConvertToGraph;
        function ParseString(str, startingDirection, callback, lineCallback) {
            const stack = [];
            let currentState = [new Vector_13.Vector(), startingDirection.clone(), (0, GenerateUUID_1.GenerateTimestampID)()];
            let argumentIndentation = 0;
            let currentArgument = "";
            for (let i = 0; i < str.length; i++) {
                const char = str[i];
                switch (char) {
                    case CONSTANTS.OPEN_SQUARE_BRACKET:
                        stack.push([currentState[0].clone(), currentState[1].clone(), currentState[2]]);
                        break;
                    case CONSTANTS.CLOSED_SQUARE_BRACKET:
                        currentState = stack.pop();
                        break;
                    case CONSTANTS.OPEN_BRACKET:
                        argumentIndentation++;
                        break;
                    case CONSTANTS.CLOSED_BRACKET:
                        argumentIndentation--;
                        break;
                    default:
                        if (argumentIndentation != 0)
                            currentArgument += char;
                        else {
                            const newState = callback(currentState[0].clone(), currentState[1].clone(), char, currentArgument
                                .split(",")
                                .map((e) => parseInt(e))
                                .filter((e) => !isNaN(e)), currentState[2]);
                            currentArgument = "";
                            if (newState == undefined)
                                break;
                            const newStateId = (0, GenerateUUID_1.GenerateTimestampID)();
                            lineCallback(currentState[0].clone(), newState[0].clone(), currentState[2], newStateId);
                            currentState = [newState[0].clone(), newState[1].clone(), newStateId];
                        }
                        break;
                }
            }
        }
        LSystem.ParseString = ParseString;
        function ParseRules(str) {
            return str
                .replace(/ /g, "")
                .split(/\r?\n/)
                .filter((e) => e != undefined && e.length > 3 && !e.startsWith("//"))
                .map((e) => {
                return {
                    predecessor: e[0],
                    successor: e.substring(e.indexOf("=>") + 2),
                };
            });
        }
        LSystem.ParseRules = ParseRules;
    })(LSystem || (exports.LSystem = LSystem = {}));
});
define("index", ["require", "exports", "IArrayFunctions", "MathUtils", "ArrayUtils", "GenerateUUID", "Segment", "BoundingBox", "Polygon", "grid/Grid", "grid/GridHelper", "grid/Neighbours", "graph/GraphHelper", "graph/Graph", "graph/GraphTypes", "graph/TreeMap", "math/Vector", "math/AdvancedMatrix", "math/SimpleMatrix", "math/TensorGrid", "rasterization/Bezier", "rasterization/Interpolation", "rasterization/Bresenham", "rasterization/SubdivisionRasterize", "benchmark/Benchmark", "color/Color", "color/ColorHelper", "color/Image", "constraints/Goals", "constraints/Pathfinder", "constraints/LSystem"], function (require, exports, IArrayFunctions_9, MathUtils_5, ArrayUtils_2, GenerateUUID_2, Segment_2, BoundingBox_1, Polygon_2, Grid_3, GridHelper_1, Neighbours_1, GraphHelper_1, Graph_3, GraphTypes_1, TreeMap_1, Vector_14, AdvancedMatrix_2, SimpleMatrix_1, TensorGrid_1, Bezier_1, Interpolation_1, Bresenham_1, SubdivisionRasterize_1, Benchmark_1, Color_3, ColorHelper_1, Image_1, Goals_1, Pathfinder_1, LSystem_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(IArrayFunctions_9, exports);
    __exportStar(MathUtils_5, exports);
    __exportStar(ArrayUtils_2, exports);
    __exportStar(GenerateUUID_2, exports);
    __exportStar(Segment_2, exports);
    __exportStar(BoundingBox_1, exports);
    __exportStar(Polygon_2, exports);
    __exportStar(Grid_3, exports);
    __exportStar(GridHelper_1, exports);
    __exportStar(Neighbours_1, exports);
    __exportStar(GraphHelper_1, exports);
    __exportStar(Graph_3, exports);
    __exportStar(GraphTypes_1, exports);
    __exportStar(TreeMap_1, exports);
    __exportStar(Vector_14, exports);
    __exportStar(AdvancedMatrix_2, exports);
    __exportStar(SimpleMatrix_1, exports);
    __exportStar(TensorGrid_1, exports);
    __exportStar(Bezier_1, exports);
    __exportStar(Interpolation_1, exports);
    __exportStar(Bresenham_1, exports);
    __exportStar(SubdivisionRasterize_1, exports);
    __exportStar(Benchmark_1, exports);
    __exportStar(Color_3, exports);
    __exportStar(ColorHelper_1, exports);
    __exportStar(Image_1, exports);
    __exportStar(Goals_1, exports);
    __exportStar(Pathfinder_1, exports);
    __exportStar(LSystem_1, exports);
});
//# sourceMappingURL=bundle.js.map