/// <reference types="react" />
import { Gestalt as Constraint } from '../gestalt';
import { BBoxValues, MaybeBBoxValues } from "../kiwiBBoxTransform";
import * as Compile from '../compileWithRef';
declare type Id<T> = T extends infer U ? {
    [K in keyof U]: U[K];
} : never;
declare type GlyphRelation<K extends Key> = {
    fields: K[];
    constraints: Constraint[];
};
declare type Key = string | number | symbol;
declare type ReservedKeywords = "$canvas" | "$object";
declare const KONT: unique symbol;
declare type AllowedFieldsWithType<Obj, Type> = {
    [K in keyof Obj]: Obj[K] extends Type ? K : never;
};
declare type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj];
declare type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, MyRef>>;
declare type Relation<T> = T[];
declare type RelationInstance<T> = T extends Array<infer _> ? T[number] : T;
declare type StringKeys<O> = Extract<keyof O, string>;
declare type NumberKeys<O> = Extract<keyof O, number>;
declare type Values<O> = O[keyof O];
declare type ObjPath<O> = O extends Array<unknown> ? Values<{
    [K in NumberKeys<O>]: `[${K}]` | `[${K}]${ObjPath<O[K]>}`;
}> : O extends Record<string, unknown> ? Values<{
    [K in StringKeys<O>]: ObjPath<O[K]> extends "" ? `.${K}` : `.${K}${ObjPath<O[K]>}`;
}> : "";
declare type addPrefix<TKey, TPrefix extends string> = TKey extends string ? `${TPrefix}${TKey}` : never;
declare type Ref<T, Field extends string & keyof T> = {
    $ref: true;
    path: addPrefix<ObjPath<T[Field]>, Field>;
};
export declare type Glyph_<K extends object & Extract<keyof K, Reserved> extends never ? object : never, Reserved extends Key> = {
    bbox?: MaybeBBoxValues;
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element;
    glyphs?: Record<keyof K, Glyph>;
    relations?: GlyphRelation<Reserved | keyof K>[];
};
export declare type Glyph = {
    [KONT]: <R>(kont: <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never>(_: Glyph_<K, ReservedKeywords>) => R) => R;
};
export declare namespace Glyph {
    const mk: <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never>(exRecord_: Glyph_<K, ReservedKeywords>) => Glyph;
    const fromCompileGlyph: (g: Compile.GlyphNoRef) => Glyph;
}
declare type HostGlyphFn<T> = (d: T) => Glyph;
declare type KConstraint<T, K> = T extends object ? (Extract<keyof T, keyof K> extends never ? object : never) : object;
export declare type GlyphFn_<T, K extends KConstraint<T, K>> = T extends object ? (HostGlyphFn<T> | Glyph_<K, ReservedKeywords> | Id<Glyph_<K, ReservedKeywords> & {
    objectGlyph: GlyphFn<T>;
}> | Id<Glyph_<K, ReservedKeywords | keyof T> & {
    fieldGlyphs: {
        [key in keyof OmitRef<T>]: GlyphFn<RelationInstance<T[key]>>;
    };
}> | Id<Glyph_<K, ReservedKeywords | keyof T> & {
    objectGlyph: GlyphFn<T>;
} & {
    fieldGlyphs: {
        [key in keyof OmitRef<T>]: GlyphFn<RelationInstance<T[key]>>;
    };
}>) : (HostGlyphFn<T> | Glyph_<K, ReservedKeywords> | Id<Glyph_<K, ReservedKeywords> & {
    objectGlyph: GlyphFn<T>;
}>);
export declare type GlyphFn<T> = {
    [KONT]: <R>(kont: <K extends KConstraint<T, K>>(_: GlyphFn_<T, K>) => R) => R;
};
export declare namespace GlyphFn {
    const mk: <T, K extends KConstraint<T, K>>(exRecord_: GlyphFn_<T, K>) => GlyphFn<T>;
    const inhabited: GlyphFn<{}>;
}
export declare const lowerGlyph: <T>(g: Glyph) => Compile.Glyph;
export declare const glyphFnToHostGlyphFn: <T>(gf: GlyphFn<T>) => HostGlyphFn<T>;
export declare const lowerGlyphFn: <T>(gf: GlyphFn<T>) => (data: T) => Compile.Glyph;
export declare namespace GlyphFnLowerTest {
    type myDataE2 = {
        color1: string;
        color2: string;
        color3: string;
    };
    export const exampleRelationInterface2: GlyphFn<myDataE2>;
    type MarblesData = {
        elements: Relation<number>;
    };
    export const marbles: GlyphFn<MarblesData>;
    export const testLoweredGlyphExample: Compile.Glyph;
    export const testLoweredGlyphMarbles: Compile.Glyph;
    export {};
}
export declare type MyListOld<T> = {
    elements: Relation<T>;
    neighbors: Relation<{
        curr: Ref<MyListOld<T>, "elements">;
        next: Ref<MyListOld<T>, "elements">;
    }>;
};
export declare type MyRef = {
    $ref: true;
    path: string;
};
export declare const mkMyRef: (path: string) => MyRef;
export declare const loweredListGlyphTest: Compile.Glyph;
export declare const compileGlyphFn: <T>(gf: GlyphFn<T>) => (data: T) => Compile.Glyph;
export declare type MyList<T> = {
    elements: Relation<T>;
    neighbors: Relation<{
        curr: MyRef;
        next: MyRef;
    }>;
};
export declare namespace GlyphFnCompileTest {
    type myDataE2 = {
        color1: string;
        color2: string;
        color3: string;
    };
    export const exampleRelationInterface2: GlyphFn<myDataE2>;
    type MarblesData = {
        elements: Relation<number>;
    };
    export const marbles: GlyphFn<MarblesData>;
    export const testCompiledGlyphFnExample: Compile.Glyph;
    export const testCompiledGlyphFnMarbles: Compile.Glyph;
    type MarblesList = MyList<number>;
    export const marblesListGlyphFn: GlyphFn<MarblesList>;
    export const testMarblesList: Compile.Glyph;
    type MarblesListReduced = {
        marble1: number;
        marble2: number;
        marble1Ref: MyRef;
    };
    export const marblesListReducedGlyphFn: GlyphFn<MarblesListReduced>;
    export const testMarblesListReduced: Compile.Glyph;
    type MarblesListMoreComplex = {
        marbles: Relation<number>;
        neighbor: Relation<{
            curr: MyRef;
            next: MyRef;
        }>;
    };
    export const marblesListMoreComplexGlyphFn: GlyphFn<MarblesListMoreComplex>;
    export const testMarblesListMoreComplex: Compile.Glyph;
    export const twoSetsOfMarbles: GlyphFn<{
        one: MarblesListMoreComplex;
        two: MarblesListMoreComplex;
    }>;
    export const testTwoMarbleSets: Compile.Glyph;
    export {};
}
export {};
//# sourceMappingURL=glyphExistentialAPI.d.ts.map