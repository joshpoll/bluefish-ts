import { Glyph } from "../compile";
import { Gestalt } from '../gestalt';
export declare const bar: (data: number) => Glyph;
export declare const groupedBar: (data: number[]) => Glyph;
export declare const groupedBars: (data: {
    [key: number]: number[];
}) => Glyph;
export declare const listTest: (gestalt: Gestalt[]) => Glyph;
export declare const listSugared: (gestalt: Gestalt[]) => any;
export declare const listSugared2: (gestalt: Gestalt[]) => any;
export declare const setSugared: (gestalt: Gestalt[]) => any;
export declare const xAxis: (ticks: number[]) => Glyph;
export declare const yAxis: (ticks: number[]) => Glyph;
export declare const dataGlyph: Glyph;
export declare const chart: Glyph;
export default chart;
//# sourceMappingURL=groupedbarchart.d.ts.map