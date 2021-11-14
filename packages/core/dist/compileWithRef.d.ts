/// <reference types="react" />
import { Constraint, Variable } from 'kiwi.js';
import { Gestalt } from "./gestalt";
import { BBoxTree, BBoxValues, MaybeBBoxValues, BBoxTreeValue, bboxVarExprs, Transform } from './kiwiBBoxTransform';
export declare type BBoxTreeVVE = BBoxTree<{
    bboxVars: bboxVarExprs;
    bboxValues?: MaybeBBoxValues;
}, Variable>;
export declare type CompiledAST = {
    bboxValues: BBoxTreeValue;
    encoding: GlyphWithPathNoRef;
};
export declare type Relation = {
    left: string;
    right: string;
    gestalt: Gestalt[];
};
export declare type Ref = {
    $ref: true;
    path: string[];
};
export declare type Glyph = {
    bbox?: MaybeBBoxValues;
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element;
    children?: {
        [key: string]: Glyph;
    };
    relations?: Relation[];
} | Ref;
export declare type GlyphNoRef = {
    bbox?: MaybeBBoxValues;
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element;
    children?: {
        [key: string]: GlyphNoRef;
    };
    relations?: Relation[];
};
export declare type GlyphWithPath = {
    pathList: string[];
    path: string;
    bbox?: MaybeBBoxValues;
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element;
    children?: {
        [key: string]: GlyphWithPath;
    };
    relations?: Relation[];
} | Ref;
export declare type GlyphWithPathNoRef = {
    pathList: string[];
    path: string;
    bbox?: MaybeBBoxValues;
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element;
    children: {
        [key: string]: GlyphWithPathNoRef;
    };
    relations?: Relation[];
};
export declare type Mark = {
    bbox: MaybeBBoxValues;
    renderFn: (canvas: BBoxValues, index?: number) => JSX.Element;
};
declare type BBoxTreeWithRef<T, U> = {
    bbox: T;
    canvas: T;
    transform: Transform<U>;
    children: {
        [key: string]: BBoxTreeWithRef<T, U>;
    };
} | Ref;
export declare type BBoxTreeVVEWithRef = BBoxTreeWithRef<{
    bboxVars: bboxVarExprs;
    bboxValues?: MaybeBBoxValues;
}, Variable>;
export declare const addBBoxValueConstraints: (bboxTree: BBoxTreeVVEWithRef, constraints: Constraint[]) => BBoxTreeVVEWithRef;
export declare const addBBoxConstraintsWithRef: (bboxTree: BBoxTreeVVEWithRef, constraints: Constraint[]) => void;
export declare const addTransformConstraints: (bboxTree: BBoxTreeVVE, constraints: Constraint[]) => void;
declare const _default: (encoding: Glyph) => CompiledAST;
export default _default;
//# sourceMappingURL=compileWithRef.d.ts.map