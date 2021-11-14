/// <reference types="react" />
import { Gestalt } from '../gestalt';
import { BBoxValues, MaybeBBoxValues } from '../kiwiBBoxTransform';
declare type myData = {
    color1: string;
    color2: string;
    color3: string;
    text: string;
};
declare type Relation<T> = T[];
declare type RelationInstance<T> = T extends Array<unknown> ? T[number] : T;
declare type AllowedFieldsWithType<Obj, Type> = {
    [K in keyof Obj]: Obj[K] extends Type ? K : never;
};
declare type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj];
declare type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, Ref<any>>>;
declare type Mark = {
    bbox: MaybeBBoxValues;
    renderFn: (canvas: BBoxValues, index?: number) => JSX.Element;
};
declare type Id<T> = T extends infer U ? {
    [K in keyof U]: U[K];
} : never;
declare type Glyph<T> = ((d: T) => Mark) | Id<Partial<Mark> & {
    glyphs: {
        [key in keyof OmitRef<T>]: Glyph<RelationInstance<T[key]>>;
    };
    gestalt?: {
        left: keyof T | "canvas";
        right: keyof T | "canvas";
        rels: Gestalt[];
    }[];
}>;
export declare const exampleRelationInterface2: Glyph<myData>;
declare type StringKeys<O> = Extract<keyof O, string>;
declare type NumberKeys<O> = Extract<keyof O, number>;
declare type Values<O> = O[keyof O];
declare type ObjPath<O> = O extends Array<unknown> ? Values<{
    [K in NumberKeys<O>]: `[${K}]` | `[${K}].${ObjPath<O[K]>}`;
}> : O extends Record<string, unknown> ? Values<{
    [K in StringKeys<O>]: ObjPath<O[K]> extends "" ? K : `${K}.${ObjPath<O[K]>}`;
}> : "";
declare type Ref<T> = {
    $ref: true;
    path: ObjPath<T>;
};
declare type myList<T> = {
    elements: Relation<T>;
    neighbors: Relation<{
        curr: Ref<myList<T>>;
        next: Ref<myList<T>>;
    }>;
};
export declare const MyListGlyphE2: Glyph<myList<number>>;
declare type Label<Ctxt> = {
    object: Ref<Ctxt>;
    text: string;
};
export declare const label: Glyph<Label<unknown>>;
export {};
//# sourceMappingURL=exampleRelationInterfaceSeparateObjectRelation.d.ts.map