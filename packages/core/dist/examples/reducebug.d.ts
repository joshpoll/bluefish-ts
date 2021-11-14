/// <reference types="react" />
import { Glyph } from '../compile';
import { BBoxValues } from '../kiwiBBoxTransform';
declare type Data = {
    category: string;
    value: number;
};
export declare const data: Data[];
export declare const bar: (data: Data) => Glyph;
export declare const bars: (data: Data[]) => Glyph;
export declare const xAxis: (ticks: number[]) => Glyph;
export declare const debug: (bbox: BBoxValues) => JSX.Element;
export declare const yAxis: (ticks: number[]) => Glyph;
export declare const dataGlyph: Glyph;
export {};
//# sourceMappingURL=reducebug.d.ts.map