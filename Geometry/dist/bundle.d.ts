/// <reference types="node" />
declare module "IArrayFunctions" {
    export type ForEachFunction<T, I, self = IArrayLike<T, I>> = (element: T, index: I, self: self) => void;
    export type PredicateFunction<T, I, self = IArrayLike<T, I>> = (element: T, index: I, self: self) => boolean;
    export type BreakPredicateFunction<T, I, self = IArrayLike<T, I>> = (element: T, index: I, self: self) => SHOULD_BREAK;
    export type MapFunction<T, I, t, self = IArrayLike<T, I>> = (element: T, index: I, self: self) => t;
    export type ReduceFunction<T, I, t, self = IArrayLike<T, I>> = (previous: t, current: T, currentIndex: I, self: self) => t;
    export enum SHOULD_BREAK {
        NO = 0,
        YES = 1
    }
    export interface IArrayLike<Element, Index> {
        get(index: Index): Element | undefined;
        set(index: Index, value: Element): this;
    }
    export interface IArrayLikeDelete<Element, Index> extends IArrayLike<Element, Index> {
        deleteAt(index?: Index): Element | undefined;
    }
    export interface IArrayLikeStack<Element, Index> extends IArrayLike<Element, Index> {
        push(value: Element): this;
        unshift(value: Element): this;
        pop(): Element | undefined;
        shift(): Element | undefined;
        get length(): number;
        get first(): Element | undefined;
        get last(): Element | undefined;
    }
    export interface IArrayLikeLoop<Element, Index> extends IArrayLike<Element, Index> {
        forEach(func: ForEachFunction<Element, Index, this>): this;
        forEachBreak(func: BreakPredicateFunction<Element, Index, this>): Index | undefined;
    }
    export interface IArrayLikeFiltering<Element, Index> extends IArrayLikeLoop<Element, Index> {
        reduce<t>(func: ReduceFunction<Element, Index, t, this>, initialValue: t): t;
        filter(predicate: PredicateFunction<Element, Index, this>): IArrayLike<Element, Index>;
    }
    export interface IArrayLikeMapping<Element, Index> extends IArrayLikeLoop<Element, Index> {
        mapClone<t>(func: MapFunction<Element, Index, t, this>): any;
        map<t>(func: MapFunction<Element, Index, t, this>): t[];
    }
    export interface IArrayLikeComparison<Element, Index> extends IArrayLikeLoop<Element, Index> {
        every(predicate: PredicateFunction<Element, Index, this>): boolean;
        some(predicate: PredicateFunction<Element, Index, this>): boolean;
    }
    export interface IArrayLikeSearch<Element, Index> extends IArrayLikeLoop<Element, Index> {
        find(predicate: PredicateFunction<Element, Index, this>): [Index, Element];
        findElement(predicate: PredicateFunction<Element, Index, this>): Element;
        findIndex(predicate: PredicateFunction<Element, Index, this>): Index | undefined;
    }
    export namespace IArrayLikeHelper {
        function Reduce<T, I, t>(self: IArrayLikeFiltering<T, I>, initialValue: t, func: ReduceFunction<T, I, t>): t;
        function FilterSet<T, I>(self: IArrayLikeFiltering<T, I>, result: IArrayLike<T, I>, predicate: PredicateFunction<T, I>): any;
        function FilterPush<T, I>(self: IArrayLikeFiltering<T, I>, result: IArrayLikeStack<T, I>, predicate: PredicateFunction<T, I>): any;
        function MapClone<T, I, t, res>(self: IArrayLikeMapping<T, I>, result: res, func: MapFunction<T, I, t>): res;
        function Map<T, I, t>(self: IArrayLikeMapping<T, I>, func: MapFunction<T, I, t>): t[];
        function Every<T, I>(self: IArrayLikeComparison<T, I>, predicate: PredicateFunction<T, I>): boolean;
        function Some<T, I>(self: IArrayLikeComparison<T, I>, predicate: PredicateFunction<T, I>): boolean;
        function Find<T, I>(self: IArrayLikeSearch<T, I>, predicate: PredicateFunction<T, I>): [I, T | undefined] | undefined;
        function FindElement<T, I>(self: IArrayLikeSearch<T, I>, predicate: PredicateFunction<T, I>): T | undefined;
        function FindIndex<T, I>(self: IArrayLikeSearch<T, I>, predicate: PredicateFunction<T, I>): I | undefined;
    }
}
declare module "math/AdvancedMatrix" {
    export class AdvancedMatrix {
        n: number;
        m: number;
        matrix: number[];
        constructor(m: number, n: number, numbers?: number[]);
        getElement(i: number, j: number): number;
        setElement(i: number, j: number, e: number): void;
        getHarbinger(i: number, j: number): 1 | -1;
        getIJ(index: number): number[];
        isIdentity(error?: number): boolean;
        forEachBreak(callback: (value: number, i: number, j: number) => boolean): this;
        forEach(callback: (value: number, i: number, j: number) => void): this;
        every(callback: (value: number, i: number, j: number) => boolean): boolean;
        some(callback: (value: number, i: number, j: number) => boolean): boolean;
        plus(other: AdvancedMatrix): AdvancedMatrix;
        multiplied(other: AdvancedMatrix): AdvancedMatrix;
        transposed(): AdvancedMatrix;
        mainDiagonal(): number[];
        antiDiagonal(): number[];
        getMinorMatix(i: number, j: number): AdvancedMatrix;
        determinant(): number;
        scale(value: number): AdvancedMatrix;
        adjugated(): AdvancedMatrix;
        invert(): AdvancedMatrix;
        toString(): string;
        equals(other: AdvancedMatrix, error?: number): boolean;
        clone(): AdvancedMatrix;
        gaussElliminate(row: number, number: number): AdvancedMatrix;
        gaussEllimination(): AdvancedMatrix;
        cramerLaw(b: number[]): number[];
    }
}
declare module "math/Vector" {
    import { IArrayLikeMapping, MapFunction, ForEachFunction, BreakPredicateFunction } from "IArrayFunctions";
    import { AdvancedMatrix } from "math/AdvancedMatrix";
    export type Axes = "x" | "y" | "z" | "w";
    export class Vector implements IArrayLikeMapping<number, number> {
        private values;
        get x(): number;
        set x(value: number);
        get y(): number;
        set y(value: number);
        get z(): number;
        set z(value: number);
        get w(): number;
        set w(value: number);
        getDimensions(): number;
        isZero(error?: number): boolean;
        equals(other: Vector, error?: number): boolean;
        toString(): string;
        get(i: number): number;
        set(index: number, value: number): this;
        update(values: number[]): this;
        add(other: Vector): this;
        plus(other: Vector): Vector;
        subtract(other: Vector): this;
        minus(other: Vector): Vector;
        scale(scalar: number): this;
        scaled(scalar: number): Vector;
        dot(other: Vector): number;
        cross(other: Vector): Vector | undefined;
        length(): number;
        lengthSqrt(): number;
        lengthManhattan(): number;
        lengthMax(): number;
        unit(): Vector;
        clone(): Vector;
        multMatrix(matrix: AdvancedMatrix): AdvancedMatrix | undefined;
        translate(...args: number[]): this;
        offset(...args: number[]): Vector;
        floor(): this;
        floored(): Vector;
        ceil(): this;
        ceiled(): Vector;
        round(): this;
        rounded(): Vector;
        multiply(other: Vector): this;
        multiplied(other: Vector): Vector;
        divide(other: Vector): this;
        divided(other: Vector): Vector;
        modulus(other: Vector): Vector;
        min(other: Vector): Vector;
        max(other: Vector): Vector;
        abs(): Vector;
        distanceTo(other: Vector): number;
        distanceSquared(other: Vector): number;
        projectedOnto(other: Vector): Vector;
        rejectOnto(other: Vector): Vector;
        static fromVec3(vec: {
            x: number;
            y: number;
            z: number;
        }): Vector;
        constructor(...args: number[]);
        mapClone<t>(func: MapFunction<number, number, t, this>): Vector;
        map<t>(func: MapFunction<number, number, t, this>): t[];
        forEach(func: ForEachFunction<number, number, this>): this;
        forEachBreak(func: BreakPredicateFunction<number, number, this>): number | undefined;
        toArray(): number[];
        closestAxisUnit(): Vector;
        cloneWithDimensions(dimensions: number): Vector;
        getAngle2D(other: Vector): number;
        hash(): number;
        volume(): number;
        sum(): number;
    }
}
declare module "MathUtils" {
    import { Vector } from "math/Vector";
    export function WrapIndex(i: number, length: number): number;
    export function WrapVector(vec: Vector, min: Vector, size: Vector): Vector;
    export function TriangleArea(p1: Vector, p2: Vector, p3: Vector): number;
    export function Clamp(value: number, min: number, max: number): number;
    export namespace MConst {
        const rad360: number;
        const rad270: number;
        const rad180: number;
        const rad90: number;
        const rad60: number;
        const rad45: number;
        const rad36: number;
        const rad30: number;
        const rad15: number;
        const rad5: number;
        const rad1: number;
        const phi = 1.618033988749894;
        const tau: number;
    }
}
declare module "ArrayUtils" {
    export function WrapGet<T>(arr: T[], i: number): T;
    export function InsertIntoArray<T>(array: T[], index: number, element: T): T[];
    export function ArrayEquals<T>(arrayA: T[], arrayB: T[]): boolean;
}
declare module "BoundingBox" {
    import { Vector } from "math/Vector";
    export type BoundingBox = {
        min: Vector;
        max: Vector;
    };
    export namespace BoundingBoxHelper {
        function IsInside(box: BoundingBox, vec: Vector): boolean;
    }
}
declare module "GenerateUUID" {
    export function GetDateString(): string;
    export function GenerateTimestampID(): string;
    export function GenerateSnowflakeID(): string;
    export function GenerateRandomUUID(): string;
    export function GenerateHashID(data: string): string;
}
declare module "Segment" {
    import { Vector } from "math/Vector";
    export namespace Segment {
        function Intersection2D(startA: Vector, endA: Vector, startB: Vector, endB: Vector, error?: number): Vector | undefined;
        function IsLeftOfLine2D(line1: Vector, line2: Vector, point: Vector): boolean;
        function CutSegmentsAtIntersections2D(segments: [Vector, Vector][], error?: number): [Vector, Vector][];
    }
}
declare module "Polygon" {
    import { BreakPredicateFunction, ForEachFunction, IArrayLike, IArrayLikeComparison, IArrayLikeDelete, IArrayLikeFiltering, IArrayLikeMapping, IArrayLikeSearch, IArrayLikeStack, MapFunction, PredicateFunction, ReduceFunction } from "IArrayFunctions";
    import { Vector } from "math/Vector";
    export class Polygon implements IArrayLikeMapping<Vector, number>, IArrayLikeStack<Vector, number>, IArrayLikeFiltering<Vector, number>, IArrayLikeComparison<Vector, number>, IArrayLikeDelete<Vector, number>, IArrayLikeSearch<Vector, number> {
        private points;
        private max;
        private min;
        constructor(points: Vector[]);
        find(predicate: PredicateFunction<Vector, number, this>): [number, Vector];
        findElement(predicate: PredicateFunction<Vector, number, this>): Vector;
        findIndex(predicate: PredicateFunction<Vector, number, this>): number | undefined;
        every(predicate: PredicateFunction<Vector, number, this>): boolean;
        some(predicate: PredicateFunction<Vector, number, this>): boolean;
        reduce<t>(func: ReduceFunction<Vector, number, t, this>, initialValue: t): t;
        filter(predicate: PredicateFunction<Vector, number, this>): IArrayLike<Vector, number>;
        mapClone<t>(func: MapFunction<Vector, number, t, this>): Polygon;
        map<t>(func: MapFunction<Vector, number, t, this>): t[];
        forEach(func: ForEachFunction<Vector, number, this>): this;
        forEachBreak(func: BreakPredicateFunction<Vector, number, this>): number | undefined;
        push(value: Vector): this;
        unshift(value: Vector): this;
        pop(): Vector | undefined;
        shift(): Vector | undefined;
        get length(): number;
        get first(): Vector | undefined;
        get last(): Vector | undefined;
        deleteAt(index?: number): Vector;
        get(index: number): Vector;
        set(index: number, value: Vector): this;
        forEachSide(func: ForEachFunction<[Vector, Vector], number, this>): this;
        forEachTriplet(func: ForEachFunction<[Vector, Vector, Vector], number, this>): this;
        getMeanVector(): Vector;
        getArea(): number;
        getCircumference(): number;
        get aabb_min(): Vector;
        get aabb_max(): Vector;
        get aabb_size(): Vector;
        isInsideBoundingBox(point: Vector): boolean;
        isInternal(point: Vector, error?: number): boolean;
        splitLargeSides(max_length: number): Polygon;
        getSegments(): [Vector, Vector][];
        findSharedSegment(other: Polygon, error?: number): [number, number] | undefined;
        mergedAtSharedSegment(other: Polygon, error?: number): Polygon | undefined;
        removeInternalPoints(): this;
    }
}
declare module "grid/Grid" {
    import { IArrayLikeSearch, IArrayLikeDelete, SHOULD_BREAK, IArrayLikeMapping } from "IArrayFunctions";
    import { Axes, Vector } from "math/Vector";
    export function HashVector(vec: Vector): string;
    export class Grid<T> implements IArrayLikeMapping<T | undefined, Vector>, IArrayLikeSearch<T | undefined, Vector>, IArrayLikeDelete<T | undefined, Vector> {
        private grid;
        private min;
        private max;
        private firstElement;
        private defaultElement;
        private doesWrap;
        private cloningFunction?;
        cloneValue(value?: T): T | undefined;
        constructor(defaultElement?: T);
        static FromMatrix<T>(values: T[][], defaultValue?: T): Grid<T>;
        static FromStringArray(values: string[], defaultValue?: string): Grid<string>;
        static GenerateNeighboursMap(axes: Axes[], size?: number, axisAligned?: boolean): Vector[];
        setWrapping(value: boolean): this;
        setValueCloningFunction(func: (value: T) => T): this;
        values(): T[];
        getSize(): Vector;
        getMin(): Vector;
        getMax(): Vector;
        get(pos: Vector): T;
        set(pos: Vector, value?: T): this;
        forEach(func: (value: T | undefined, pos: Vector, grid: this) => void): this;
        forEachBreak(predicate: (value: T | undefined, pos: Vector, grid: this) => SHOULD_BREAK): Vector;
        mapClone<t>(func: (val: T, pos: Vector, grid: this) => t, defaultValue?: t): any;
        map<t>(func: (val: T, pos: Vector, grid: this) => t, defaultValue?: t): any;
        find(predicate: (value: T, pos: Vector, grid: this) => boolean): any;
        findElement(predicate: (value: T, pos: Vector, grid: this) => boolean): any;
        findIndex(predicate: (value: T, pos: Vector, grid: this) => boolean): any;
        deleteAt(pos: Vector): T;
        forVolume(pos1: Vector, pos2: Vector, func: (value: T, pos: Vector, grid: this) => void): this;
        isInside(pos: Vector): boolean;
        getNeighbours(pos: Vector, neighbourLookupTable: readonly Vector[]): T[];
        findNeighbourIndex(pos: Vector, predicate: (value: T, pos: Vector, grid: Grid<T>) => boolean, neighbourLookupTable: readonly Vector[]): number;
        alterGridPositions(func: (pos: Vector) => Vector): this;
        realign(): this;
        clone(): Grid<T>;
        copy(pos1: Vector, pos2: Vector): Grid<T>;
        paste(pos: Vector, other: Grid<T>): Grid<T>;
        printY(y?: number, pretty?: boolean, stringify?: (v: T) => string): void;
        print(xAxis?: Axes, yAxis?: Axes, zAxis?: Axes, zSlice?: number, drawAxisArrows?: boolean, stringify?: (v: T) => string): this;
        equals(other: Grid<T>): boolean;
    }
}
declare module "grid/GridHelper" {
    import { Vector } from "math/Vector";
    import { Grid } from "grid/Grid";
    export namespace GridHelper {
        const ASCII_GRADIENT_FULL: " .-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
        const ASCII_GRADIENT_SHORT10: " .:-=+*#%@";
        function FloodFill<T>(grid: Grid<T>, startingPoint: Vector, value: T, neighbourLookupTable: readonly Vector[]): Grid<T>;
        function GetNeighboursSum(grid: Grid<number>, pos: Vector, neighbourLookupTable: readonly Vector[]): number;
        function GetNeighboursMean(grid: Grid<number>, pos: Vector, neighbourLookupTable: readonly Vector[]): number;
        function GetGradient(grid: Grid<number>, pos: Vector, delta?: number): Vector;
        function GetNormals(grid: Grid<number>, neighbourLookupTable: readonly Vector[]): any;
        function RotateCCW_YAxis<T>(grid: Grid<T>): Grid<T>;
        function RotateCW_YAxis<T>(grid: Grid<T>): Grid<T>;
        function Rotate180_YAxis<T>(grid: Grid<T>): Grid<T>;
        function FlipX_YAxis<T>(grid: Grid<T>): Grid<T>;
        function FlipZ_YAxis<T>(grid: Grid<T>): Grid<T>;
        function GetSideValues<T>(grid: Grid<T>, side: Vector, trim?: number): T[];
        function PrintGraph(values: number[]): void;
        function ForEachSubGrid<T>(grid: Grid<T>, size: Vector, callback: (values: T[], sub_pos: Vector, poss: Vector[], original: Grid<T>) => void): Grid<T>;
    }
}
declare module "grid/Neighbours" {
    import { Vector } from "math/Vector";
    export const neighboursCheckY: readonly Vector[];
    export const neighboursCheckAxisY: readonly Vector[];
    export const neighboursCheck3D: readonly Vector[];
}
declare module "graph/GraphTypes" {
    export type GraphSymbol = string | number | symbol;
    export type GraphEdge<T> = {
        from: GraphSymbol;
        to: GraphSymbol;
        data: T;
    };
    export type GraphNode<TNode, TEdge> = {
        id: GraphSymbol;
        data: TNode;
        incoming: GraphEdge<TEdge>[];
        outgoing: GraphEdge<TEdge>[];
    };
    export type TNodeGraphML = {
        label?: string;
        shape?: "rectangle" | "hexagon" | "ellipse" | "roundrectangle";
        alignment?: "center" | "left" | "right";
        fillColor?: string;
        borderColor?: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    };
    export type TEdgeGraphML = {
        label?: string;
        fillColor?: string;
        borderColor?: string;
        type?: "line" | "dashed";
        width?: number;
        arrows?: {
            source?: "none" | "standard";
            target?: "none" | "standard";
        };
    };
}
declare module "graph/Graph" {
    import { BreakPredicateFunction, ForEachFunction, IArrayLikeFiltering, IArrayLikeMapping, MapFunction, PredicateFunction, ReduceFunction } from "IArrayFunctions";
    import { GraphEdge, GraphNode, GraphSymbol } from "graph/GraphTypes";
    export class Graph<TNode, TEdge> implements IArrayLikeFiltering<GraphNode<TNode, TEdge>, GraphSymbol>, IArrayLikeMapping<GraphNode<TNode, TEdge>, GraphSymbol> {
        private nodes;
        constructor();
        mapClone<t>(func: MapFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>): Graph<TNode, TEdge>;
        map<t>(func: MapFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>): t[];
        reduce<t>(func: ReduceFunction<GraphNode<TNode, TEdge>, GraphSymbol, t, this>, initialValue: t): t;
        filter(predicate: PredicateFunction<GraphNode<TNode, TEdge>, GraphSymbol, this>): Graph<TNode, TEdge>;
        forEach(func: ForEachFunction<GraphNode<TNode, TEdge>, GraphSymbol, this>): this;
        forEachBreak(func: BreakPredicateFunction<GraphNode<TNode, TEdge>, GraphSymbol, this>): GraphSymbol;
        get(index: GraphSymbol): GraphNode<TNode, TEdge>;
        set(index: GraphSymbol, value: GraphNode<TNode, TEdge>): this;
        addNode(id: GraphSymbol, data: TNode): this;
        addEdge(from: GraphSymbol, to: GraphSymbol, data: TEdge): this;
        getEdge(from: GraphSymbol, to: GraphSymbol): GraphEdge<TEdge>;
        removeEdge(from: GraphSymbol, to: GraphSymbol): this;
        removeNode(id: GraphSymbol): this;
        getOutgoingNeighbors(id: GraphSymbol): GraphEdge<TEdge>[] | undefined;
        getIncomingNeighbors(id: GraphSymbol): GraphEdge<TEdge>[] | undefined;
        printNetwork(): this;
        toString(): string;
        serialize(): {
            nodes: [GraphSymbol, GraphNode<TNode, TEdge>][];
        };
        static deserialize<TNode, TEdge>(obj: any): Graph<TNode, TEdge>;
        exportToGraphML(): string;
    }
}
declare module "graph/GraphHelper" {
    import { Vector } from "math/Vector";
    import { Polygon } from "Polygon";
    import { Graph } from "graph/Graph";
    export namespace GraphHelper {
        function GraphFromSegments(segments: [Vector, Vector][], error?: number): Graph<Vector, any>;
        function GraphToPolygons(graph: Graph<Vector, any>): Polygon[];
    }
}
declare module "graph/TreeMap" {
    import { BreakPredicateFunction, ForEachFunction, IArrayLike, IArrayLikeFiltering, IArrayLikeMapping, IArrayLikeSearch, MapFunction, PredicateFunction, ReduceFunction } from "IArrayFunctions";
    export type TreeMapValue<K, V> = TreeMap<K, V> | V;
    export class TreeMap<K, V> implements IArrayLikeSearch<V, K[]>, IArrayLikeMapping<V, K[]>, IArrayLikeFiltering<V, K[]> {
        children: Map<K, TreeMapValue<K, V>>;
        private recursionLimit;
        constructor(recursionLimit?: number);
        reduce<t>(func: ReduceFunction<V, K[], t, this>, initialValue: t): t;
        filter(predicate: PredicateFunction<V, K[], this>): IArrayLike<V, K[]>;
        mapClone<t>(func: MapFunction<V, K[], t, this>): any;
        map<t>(func: MapFunction<V, K[], t, this>): t[];
        find(predicate: PredicateFunction<V, K[], this>): [K[], V];
        findElement(predicate: PredicateFunction<V, K[], this>): V;
        findIndex(predicate: PredicateFunction<V, K[], this>): K[];
        forEach(func: ForEachFunction<V, K[], this>, parentKeys?: K[]): this;
        forEachBreak(func: BreakPredicateFunction<V, K[], this>, parentKeys?: K[]): K[];
        set(index: K[], value: TreeMapValue<K, V>): this;
        get(index: K[]): any;
    }
}
declare module "math/SimpleMatrix" {
    import { Vector } from "math/Vector";
    export type Matrix3x3 = {
        m11: number;
        m12: number;
        m13: number;
        m21: number;
        m22: number;
        m23: number;
        m31: number;
        m32: number;
        m33: number;
    };
    export type Matrix4x4 = {
        m11: number;
        m12: number;
        m13: number;
        m14: number;
        m21: number;
        m22: number;
        m23: number;
        m24: number;
        m31: number;
        m32: number;
        m33: number;
        m34: number;
        m41: number;
        m42: number;
        m43: number;
        m44: number;
    };
    export function MatrixMultiplyVector3x3(vec: Vector, mat: Matrix3x3): Vector;
    export function MatrixMultiplyVector4x4(vec: Vector, mat: Matrix4x4): Vector;
    export function MultiplyMatrix4x4(a: Matrix4x4, b: Matrix4x4): Matrix4x4;
    export function ArrayToMatrix3x3(matrix: number[][]): Matrix3x3;
    export function ArrayToMatrix4x4(matrix: number[][]): Matrix4x4;
    export function Create3DRotationMatrix3x3(x: number, y: number, z: number): Matrix3x3;
    export function CreateTransformMatrix4x4(trans_x?: number, trans_y?: number, trans_z?: number, rot_x?: number, rot_y?: number, rot_z?: number): Matrix4x4;
    export function CreatePerspectiveProjectionMatrix4x4(fieldOfView: number, z_far: number, z_near: number, aspect: number): Matrix4x4;
    export function InvertMatrix4x4(matrix: Matrix4x4): Matrix4x4 | null;
    export function CleanMatrix(matrix: Matrix4x4, tolerance?: number): Matrix4x4;
    export function PrintMatrix4x4(matrix: Matrix4x4): void;
}
declare module "math/TensorGrid" {
    import { BreakPredicateFunction, ForEachFunction, IArrayLikeMapping, MapFunction } from "IArrayFunctions";
    import { Vector } from "math/Vector";
    export class TensorGrid<T> implements IArrayLikeMapping<T, Vector> {
        private values;
        private defaultValue;
        private min?;
        private max?;
        constructor(defaultValue: T);
        getMin(): Vector;
        getMax(): Vector;
        getSize(): Vector;
        getDimensions(): number;
        private hashVector;
        mapClone<t>(func: MapFunction<T, Vector, t, this>, defaultValue?: t): TensorGrid<t>;
        map<t>(func: MapFunction<T, Vector, t, this>): t[];
        forEach(func: ForEachFunction<T, Vector, this>): this;
        forEachBreak(func: BreakPredicateFunction<T, Vector, this>): Vector;
        get(index: Vector): T;
        set(index: Vector, value: T): this;
    }
}
declare module "rasterization/Bezier" {
    import { Vector } from "math/Vector";
    export namespace Bezier {
        function Splines(splinePoints: Vector[], t: number): Vector;
        function SplinesWithDerivative(splinePoints: Vector[], t: number): [Vector, Vector];
        function Cubic(n0: number, n1: number, n2: number, n3: number, t: number): number;
        function CubicWithDerivative(n0: number, n1: number, n2: number, n3: number, t: number): number;
        function VectorCubic(n0: Vector, n1: Vector, n2: Vector, n3: Vector, t: number): Vector;
        function VectorCubicWithDerivative(n0: Vector, n1: Vector, n2: Vector, n3: Vector, t: number): Vector;
    }
}
declare module "rasterization/Interpolation" {
    import { Vector } from "math/Vector";
    export function Lerp(a: number, b: number, t: number): number;
    export function LerpVector(a: Vector, b: Vector, t: number): Vector;
}
declare module "rasterization/Bresenham" {
    import { Vector } from "math/Vector";
    export namespace Bresenham {
        function Line3D(a: Vector, b: Vector): Vector[];
    }
}
declare module "rasterization/SubdivisionRasterize" {
    import { Vector } from "math/Vector";
    export function SubdivisionRasterize(func: (t: number) => Vector): Vector[];
}
declare module "benchmark/Benchmark" {
    export function Benchmark(name: string, iter: number, func: (...args: any[]) => any, ...args: any[]): void;
    export function BenchmarkSilent(iter: number, func: (...args: any[]) => any, ...args: any[]): Promise<number>;
    export function WaitForKeypress(): Promise<void>;
}
declare module "color/Color" {
    import { IArrayLikeMapping, MapFunction, ForEachFunction, BreakPredicateFunction } from "IArrayFunctions";
    export type ColorChannels = "r" | "g" | "b" | "a";
    export class Color implements IArrayLikeMapping<number, ColorChannels> {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(r: number, g: number, b: number, a: number);
        mapClone<t>(func: MapFunction<number, ColorChannels, t, this>): Color;
        map<t>(func: MapFunction<number, ColorChannels, t, this>): t[];
        forEach(func: ForEachFunction<number, ColorChannels, this>): this;
        forEachBreak(func: BreakPredicateFunction<number, ColorChannels, this>): ColorChannels;
        get(index: ColorChannels): number;
        set(index: ColorChannels, value: number): this;
        applyGammaSRGB(): Color;
        removeGammaSRGB(): Color;
        plus(other: Color): Color;
        minus(other: Color): Color;
        scale(scalar: number): Color;
        multiply(scalar: Color): Color;
    }
}
declare module "color/Image" {
    import { BreakPredicateFunction, ForEachFunction, IArrayLikeMapping, MapFunction } from "IArrayFunctions";
    import { Vector } from "math/Vector";
    import { Color } from "color/Color";
    export type Bitmap = {
        width: number;
        height: number;
        data: Buffer;
    };
    export class Image implements IArrayLikeMapping<Color, Vector> {
        private pixels;
        private size;
        constructor(w: number, h: number);
        mapClone<t>(func: MapFunction<Color, Vector, t, this>): Image;
        map<t>(func: MapFunction<Color, Vector, t, this>): t[];
        forEach(func: ForEachFunction<Color, Vector, this>): this;
        forEachBreak(func: BreakPredicateFunction<Color, Vector, this>): Vector;
        get(index: Vector): Color;
        set(index: Vector, value: Color): this;
        getSize(): Vector;
        static fromBitmap(bitmap: Bitmap): Promise<Image>;
    }
}
declare module "color/ColorHelper" {
    import { Vector } from "math/Vector";
    import { Color } from "color/Color";
    import { Image } from "color/Image";
    export namespace ColorHelper {
        function AverageColors(colors: Color[]): Color;
        function Average(image: Image): Color;
        function NoiseIndex(image: Image, kernelSize?: number, textureSize?: number): Color;
        function ImageKernelRaw(image: Image, kernel: Color[], offsets: Vector[]): Image;
    }
}
declare module "constraints/Pathfinder" {
    import { GraphSymbol } from "graph/GraphTypes";
    export namespace Pathfinder {
        type ActionSymbol = string;
        type Action<T> = {
            id: ActionSymbol;
            onCallAlteration: (current_state: T) => T;
            cost: number;
        };
        type PathResult<T> = {
            actions?: ActionSymbol[];
            lastState?: T;
            edges: Map<GraphSymbol, [GraphSymbol, ActionSymbol][]>;
        };
        interface Goal<T> {
            actions: Action<T>[];
            startingState: T;
            ActionHeuristic(current_state: T, next_state: T, action?: Action<T>): number;
            CanTakeAction(current_state: T, next_state: T, action?: Action<T>): boolean;
            HasBeenReached(current_state: T): boolean;
            HashState(state: T): string;
        }
        function FindPath<T>(goal: Goal<T>): PathResult<T>;
    }
}
declare module "constraints/Goals" {
    import { Grid } from "grid/Grid";
    import { Vector } from "math/Vector";
    import { Pathfinder } from "constraints/Pathfinder";
    export namespace Goals {
        export class Goal2D implements Pathfinder.Goal<Vector> {
            private target;
            private start;
            private world;
            constructor(world: Grid<number>, start: Vector, target: Vector);
            startingState: Vector;
            actions: Pathfinder.Action<Vector>[];
            ActionHeuristic(current_state: Vector, next_state: Vector, action?: Pathfinder.Action<Vector>): number;
            CanTakeAction(current_state: Vector, next_state: Vector, action?: Pathfinder.Action<Vector>): boolean;
            HasBeenReached(state: Vector): boolean;
            HashState(state: Vector): string;
        }
        type GoalStateWFC = {
            values: {
                [hash: number]: number;
            };
            counter: number;
            cursor: Vector;
            superPositions: Pathfinder.ActionSymbol[];
        };
        type GoalTileWFC = {
            value: string;
            edges: string[];
            id: string;
        };
        export class GoalWFC implements Pathfinder.Goal<GoalStateWFC> {
            private readonly directions;
            private readonly directions_inverse;
            size: Vector;
            maxCount: number;
            constructor(size: Vector, tiles: {
                value: string;
                edges: string[];
            }[], directions?: Vector[]);
            getValueFromState(state: GoalStateWFC, vec: Vector): number;
            setValueToState(state: GoalStateWFC, vec: Vector, value: number): void;
            cloneState(state: GoalStateWFC): GoalStateWFC;
            setTile(state: GoalStateWFC, index: number): GoalStateWFC;
            tiles: GoalTileWFC[];
            startingState: GoalStateWFC;
            actions: Pathfinder.Action<GoalStateWFC>[];
            ActionHeuristic(current_state: GoalStateWFC, next_state: GoalStateWFC, action?: Pathfinder.Action<GoalStateWFC>): number;
            CanTakeAction(current_state: GoalStateWFC, next_state: GoalStateWFC, action?: Pathfinder.Action<GoalStateWFC>): boolean;
            HasBeenReached(state: GoalStateWFC): boolean;
            HashState(state: GoalStateWFC): string;
        }
        export {};
    }
}
declare module "constraints/LSystem" {
    import { Graph } from "graph/Graph";
    import { TNodeGraphML, TEdgeGraphML } from "graph/GraphTypes";
    import { Vector } from "math/Vector";
    export namespace LSystem {
        type char = string;
        type Rule = {
            predecessor: char;
            successor: string;
        };
        function GenerateString(axiom: string, rules: Rule[], iterations: number): string;
        function ConvertToGraph(str: string): Graph<TNodeGraphML, TEdgeGraphML>;
        function ParseString(str: string, startingDirection: Vector, callback: (pos: Vector, dir: Vector, symbol: char, args: number[], id: string) => [Vector, Vector] | undefined, lineCallback: (source: Vector, target: Vector, sourceId: string, targetId: string) => void): void;
        function ParseRules(str: string): Rule[];
    }
}
declare module "geometry" {
    export * from "IArrayFunctions";
    export * from "MathUtils";
    export * from "ArrayUtils";
    export * from "GenerateUUID";
    export * from "Segment";
    export * from "BoundingBox";
    export * from "Polygon";
    export * from "grid/Grid";
    export * from "grid/GridHelper";
    export * from "grid/Neighbours";
    export * from "graph/GraphHelper";
    export * from "graph/Graph";
    export * from "graph/GraphTypes";
    export * from "graph/TreeMap";
    export * from "math/Vector";
    export * from "math/AdvancedMatrix";
    export * from "math/SimpleMatrix";
    export * from "math/TensorGrid";
    export * from "rasterization/Bezier";
    export * from "rasterization/Interpolation";
    export * from "rasterization/Bresenham";
    export * from "rasterization/SubdivisionRasterize";
    export * from "benchmark/Benchmark";
    export * from "color/Color";
    export * from "color/ColorHelper";
    export * from "color/Image";
    export * from "constraints/Goals";
    export * from "constraints/Pathfinder";
    export * from "constraints/LSystem";
}
