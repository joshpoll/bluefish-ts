/// <reference types="react" />
import { Gestalt } from "./gestalt";
import { BBoxValues, MaybeBBoxValues, BBoxTreeValue } from './kiwiBBoxTransform';
export declare type CompiledAST = {
    bboxValues: BBoxTreeValue;
    encoding: GlyphWithPath;
};
export declare type Relation = {
    left: string;
    right: string;
    gestalt: Gestalt[];
};
export declare type Glyph = {
    bbox?: MaybeBBoxValues;
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element;
    children?: {
        [key: string]: Glyph;
    };
    relations?: Relation[];
};
export declare type GlyphWithPath = {
    path: string;
    bbox?: MaybeBBoxValues;
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element;
    children: {
        [key: string]: GlyphWithPath;
    };
    relations?: Relation[];
};
export declare type Mark = {
    bbox: MaybeBBoxValues;
    renderFn: (canvas: BBoxValues, index?: number) => JSX.Element;
};
declare const _default: (encoding: Glyph) => CompiledAST;
export default _default;
//# sourceMappingURL=compile.d.ts.map