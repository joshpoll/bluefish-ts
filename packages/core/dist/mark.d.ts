/// <reference types="react" />
import { Mark } from './compile';
import { BBoxValues } from './kiwiBBoxTransform';
declare type RectParams = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    fill?: string;
};
export declare const rect: ({ x, y, width, height, fill }: RectParams) => Mark;
declare type EllipseParams = {
    cx?: number;
    cy?: number;
    rx?: number;
    ry?: number;
    fill?: string;
};
export declare const ellipse: ({ cx, cy, rx, ry, fill }: EllipseParams) => Mark;
declare type TextParams = {
    x?: number;
    y?: number;
    contents: string;
    fontFamily?: string;
    fontSize?: string;
    fontStyle?: string;
    fontWeight?: string;
    fill?: string;
};
export declare const text: ({ x, y, contents, fontFamily, fontSize, fontStyle, fontWeight, fill }: TextParams) => Mark;
declare type LineParams = {
    x1?: number;
    y1?: number;
    x2?: number;
    y2?: number;
    stroke?: string;
    strokeWidth?: number;
};
export declare const line: ({ x1, y1, x2, y2, stroke, strokeWidth }: LineParams) => Mark;
export declare const nil: () => Mark;
declare type HTMLParams = {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    html: JSX.Element;
};
export declare const html: ({ x, y, width, height, html }: HTMLParams) => Mark;
export declare const debug: (canvas: BBoxValues) => JSX.Element;
export {};
//# sourceMappingURL=mark.d.ts.map