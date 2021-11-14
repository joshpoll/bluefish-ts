/// <reference types="react" />
import { Glyph } from './examples/glyphExistentialAPI';
import { BBoxValues } from './kiwiBBoxTransform';
declare type RectParams = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
};
export declare const rect: ({ x, y, width, height, fill, stroke, strokeWidth }: RectParams) => Glyph;
declare type EllipseParams = {
    cx?: number;
    cy?: number;
    rx?: number;
    ry?: number;
    fill?: string;
};
export declare const ellipse: ({ cx, cy, rx, ry, fill }: EllipseParams) => Glyph;
declare type TextParams = {
    x?: number;
    y?: number;
    contents: string;
    fontFamily?: string;
    fontSize: string;
    fontStyle?: string;
    fontWeight?: string;
    fill?: string;
};
export declare const text: ({ x, y, contents, fontFamily, fontSize, fontStyle, fontWeight, fill }: TextParams) => Glyph;
declare type LineParams = {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    stroke?: string;
    strokeWidth?: number;
};
export declare const line: ({ x1, y1, x2, y2, stroke, strokeWidth }: LineParams) => Glyph;
export declare const nil: () => Glyph;
declare type HTMLParams = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    html: JSX.Element;
};
export declare const html: ({ x, y, width, height, html }: HTMLParams) => Glyph;
export declare const debug: (canvas: BBoxValues) => JSX.Element;
export {};
//# sourceMappingURL=markExistential.d.ts.map