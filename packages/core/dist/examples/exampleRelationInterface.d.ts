/// <reference types="react" />
import { Gestalt } from '../gestalt';
import { Glyph, Relation } from '../compile';
import { BBoxValues, MaybeBBoxValues } from '../kiwiBBoxTransform';
export declare type GlyphArray<T> = {
    data: T[];
    bbox?: MaybeBBoxValues;
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element;
    childGlyphs: (d: T, i: number) => Glyph;
    listGestalt: Gestalt[];
    relations?: Relation[];
};
declare type myData = {
    color1: string;
    color2: string;
    color3: string;
    text: string;
};
export declare const exampleRelationInterface: Glyph;
declare type RelationE2<T> = T[];
declare type RelationInstanceE2<T> = T extends Array<infer _> ? T[number] : T;
declare type AllowedFieldsWithType<Obj, Type> = {
    [K in keyof Obj]: Obj[K] extends Type ? K : never;
};
declare type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj];
declare type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, Ref<any, any>>>;
declare type MarkE2 = {
    bbox: MaybeBBoxValues;
    renderFn: (canvas: BBoxValues, index?: number) => JSX.Element;
};
declare type Id<T> = T extends infer U ? {
    [K in keyof U]: U[K];
} : never;
declare type GlyphE2<T> = ((d: T) => MarkE2) | SimpleTypeComplexGlyph<T>;
declare type SimpleTypeComplexGlyph<T> = {
    glyphs?: Id<{
        [key: string]: Glyph;
    } & {
        [key in keyof T]?: never;
    }>;
    dataGlyphs: {
        [key in keyof OmitRef<T>]: GlyphE2<RelationInstanceE2<T[key]>>;
    };
    relations?: {
        fields: [string | keyof T | "canvas", string | keyof T | "canvas"];
        constraints: Gestalt[];
    }[];
};
declare type myDataE2 = {
    color1: string;
    color2: string;
    color3: string;
};
export declare const exampleRelationInterface2: GlyphE2<myDataE2>;
export declare const exampleRelationInterface2Lowered: (data: myData) => Glyph;
export declare const lowerGlyphE2: <T, K extends string>(g: GlyphE2<T>) => (data: T) => Glyph;
export declare const loweredGlyphTest: Glyph;
declare type StringKeys<O> = Extract<keyof O, string>;
declare type NumberKeys<O> = Extract<keyof O, number>;
declare type Values<O> = O[keyof O];
declare type ObjPath<O> = O extends Array<unknown> ? Values<{
    [K in NumberKeys<O>]: `[${K}]` | `[${K}]${ObjPath<O[K]>}`;
}> : O extends Record<string, unknown> ? Values<{
    [K in StringKeys<O>]: ObjPath<O[K]> extends "" ? `.${K}` : `.${K}${ObjPath<O[K]>}`;
}> : "";
declare type addPrefix<TKey, TPrefix extends string> = TKey extends string ? `${TPrefix}${TKey}` : never;
declare type Ref<Prefix extends string, T> = {
    $ref: true;
    path: addPrefix<ObjPath<T>, Prefix>;
};
declare type myList<T> = {
    elements: RelationE2<T>;
    neighbors: RelationE2<{
        curr: Ref<"elements", RelationE2<T>>;
        next: Ref<"elements", RelationE2<T>>;
    }>;
};
export declare const MyListGlyphE2: GlyphE2<myList<number>>;
export {};
//# sourceMappingURL=exampleRelationInterface.d.ts.map