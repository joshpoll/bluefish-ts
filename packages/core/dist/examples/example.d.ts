import { Gestalt } from '../gestalt';
import { Glyph, Mark } from '../compile';
export declare const example: Glyph;
declare type ExampleData2 = {
    color1: string;
    color2: string;
    color3: string;
    textData: {
        text: string;
        fontSize: string;
    };
};
export declare const data2: ExampleData2;
declare type MyRelation2<L, R> = {
    left: L | "canvas";
    right: R | "canvas";
    gestalt: Gestalt[];
};
declare type MyEncoding2<T> = {
    canvas?: {
        width?: number;
        height?: number;
    };
    encodings: {
        [key in keyof T & string]?: (data: T[key]) => Mark;
    };
    relations: MyRelation2<keyof T, keyof T>[];
};
export declare const example2: MyEncoding2<ExampleData2>;
export {};
//# sourceMappingURL=example.d.ts.map