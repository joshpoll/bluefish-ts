import { GlyphFn, MyList } from './glyphExistentialAPI';
declare type Marks = {
    strong?: {
        active: boolean;
    };
    em?: {
        active: boolean;
    };
    comment?: {
        active: boolean;
    };
};
declare type TextData = {
    char: string;
    marks: Marks;
    spanBoundary?: boolean;
};
declare type Data = {
    spanHighlights: MyList<boolean>;
    text: MyList<{
        idx: {
            value: number;
            spanBoundary: boolean;
        };
        data: TextData;
    }>;
    spans: MyList<MyList<string>>;
    newSpans: MyList<MyList<string>>;
};
export declare const textspans: GlyphFn<Data>;
export declare const textspansLoweredApplied: import("../compileWithRef").Glyph;
export {};
//# sourceMappingURL=textspansExistential.d.ts.map