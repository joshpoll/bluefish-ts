/// <reference types="react" />
import { Gestalt } from '../gestalt';
import { Glyph, Relation } from '../compile';
import { MaybeBBoxValues, BBoxValues } from '../kiwiBBoxTransform';
export declare type GlyphArray<T> = {
    data: T[];
    bbox?: MaybeBBoxValues;
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element;
    childGlyphs: (d: T, i: number) => Glyph;
    listGestalt: Gestalt[];
    relations?: Relation[];
};
export declare const textspans: Glyph;
//# sourceMappingURL=textspans.d.ts.map