import { GlyphFn, MyList } from './glyphExistentialAPI';
declare type Data = {
    category: string;
    value: number;
};
export declare const data: Data[];
export declare const bars: GlyphFn<MyList<Data>>;
declare type Input = {
    data: MyList<Data>;
    yTicks: MyList<number>;
};
export declare const barChartGlyphFn: GlyphFn<Input>;
export declare const chartWithThings: GlyphFn<Input>;
export declare const barChart: import("../compileWithRef").Glyph;
export {};
//# sourceMappingURL=barchartExistential.d.ts.map