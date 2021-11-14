import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignTop, Gestalt } from '../gestalt';
import { ellipse, nil, rect, text } from '../mark';
import { Glyph, Mark, Relation } from '../compile';
import { BBoxValues, MaybeBBoxValues } from '../kiwiBBoxTransform';
import { zipWith } from 'lodash';
import _ from 'lodash';
import { objectMap } from '../objectMap';

type RelationE2<T> = T[]

// unwraps a Relation into a RelationInstance, and keeps RelationInstances unchanged
type RelationInstanceE2<T> = T extends Array<infer _> ? T[number] : T

// https://stackoverflow.com/a/50900933
type AllowedFieldsWithType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never
};

// https://stackoverflow.com/a/50900933
type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj]

type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, Ref<any, any>>>

type MarkE2 = {
  bbox: MaybeBBoxValues,
  renderFn: (canvas: BBoxValues, index?: number) => JSX.Element,
}

// https://stackoverflow.com/a/49683575. merges record intersection types
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

type GlyphE2<T> =
  ((d: T) => MarkE2) |
  // complex glyph spec
  // {
  //   // TODO: idk why wrapping this type in Id works so well, but it seems to help TypeScript out
  //   glyphs?: Id<{ [key: string]: Glyph } & { [key in keyof T]?: never }>
  //   dataGlyphs: { [key in keyof OmitRef<T>]: GlyphE2<RelationInstanceE2<T[key]>> },
  //   relations?: { fields: [keyof T | "canvas", keyof T | "canvas"], constraints: Gestalt[] }[]
  // }
  SimpleTypeComplexGlyph<T>
// ComplexGlyph<T>
// ComplexGlyph_<T, Id<unknown & string>>
// ComplexGlyphRecord<T, Id<unknown & { [key: string]: Glyph }>>

type ComplexGlyphRecord<T, G extends { [key: string]: Glyph }> = {
  // TODO: idk why wrapping this type in Id works so well, but it seems to help TypeScript out
  glyphs?: Id<G & { [key in keyof T]?: never }>
  dataGlyphs: { [key in keyof OmitRef<T>]: GlyphE2<RelationInstanceE2<T[key]>> },
  relations?: { fields: [keyof G | keyof T | "canvas", keyof G | keyof T | "canvas"], constraints: Gestalt[] }[]
}

/* TODO: typing is lost for relation fields!!! */
type SimpleTypeComplexGlyph<T> = {
  // TODO: idk why wrapping this type in Id works so well, but it seems to help TypeScript out
  glyphs?: Id<{ [key: string]: Glyph } & { [key in keyof T]?: never }>
  dataGlyphs: { [key in keyof OmitRef<T>]: GlyphE2<RelationInstanceE2<T[key]>> },
  relations?: { fields: [string | keyof T | "canvas", string | keyof T | "canvas"], constraints: Gestalt[] }[]
};

// https://unsafe-perform.io/posts/2020-02-21-existential-quantification-in-typescript
type ComplexGlyph_<T, K extends string> = {
  // TODO: idk why wrapping this type in Id works so well, but it seems to help TypeScript out
  glyphs?: Id<{ [key in K]: Glyph } & { [key in keyof T]?: never }>,
  dataGlyphs: { [key in keyof OmitRef<T>]: GlyphE2<RelationInstanceE2<T[key]>> },
  relations?: { fields: [K | keyof T | "canvas", K | keyof T | "canvas"], constraints: Gestalt[] }[]
}

type ComplexGlyph<T> = <R>(cont: <K extends string>(_: ComplexGlyph_<T, K>) => R) => R;

const mkComplexGlyph = <T, K extends string>(complexGlyph_: ComplexGlyph_<T, K>): ComplexGlyph<T> => (cont) => cont(complexGlyph_);

// loses a bit of type safety b/c we _should_ be able to tell whether the return type is U or U[]
// based on the input, but this type doesn't tell us
// luckily this is only used internally. right???
const mapRelation = <T, U>(r: T, f: (d: RelationInstanceE2<T>) => U): U | RelationE2<U> => {
  if (r instanceof Array) {
    return r.map(f)
  } else {
    // TODO: this cast seems sus, but it might not be b/c we check for array in the first branch
    return f(r as RelationInstanceE2<T>)
  }
}

export const lowerGlyphE2 = <T, K extends string>(g: GlyphE2<T>): ((data: T) => Glyph) => {
  if (typeof g === "function") {
    // mark case
    return g;
  } else {
    return (data: T): Glyph => ({
      children: {
        ...g.glyphs,
        ...objectMap(g.dataGlyphs, (k, v) => {
          // apply the appropriate data function (mark or glyph)
          // then if the input is an array, group its elements
          // TODO: is there a simpler way to do this?
          if (typeof v === "function") {
            // mark case. just apply the mark function to the data
            const relationMarks = mapRelation(data[k], v);
            if (relationMarks instanceof Array) {
              return {
                children: relationMarks.reduce((o, m, i) => ({
                  ...o, [i]: m
                }), {})
              }
            } else {
              return relationMarks;
            }
          } else {
            // glyphe2 case. lower the glyphe2 to a glyph function, then apply it to the data
            const relationGlyphs = mapRelation(data[k], lowerGlyphE2(v));
            if (relationGlyphs instanceof Array) {
              return {
                children: relationGlyphs.reduce((o, g, i) => ({
                  ...o, [i]: g
                }), {})
              }
            } else {
              return relationGlyphs;
            }
          }
        }),
      },
      /* {
        // map over g's dataGlyphs fields and apply the corresponding functions to data[field] (unwrapping
        // array as necessary)
        // if it's an array, make a new glyph with "0", "1", "2", ... as fields
      }, */
      relations: g.relations?.map((r) => ({
        left: r.fields[0].toString(),
        right: r.fields[1].toString(),
        gestalt: r.constraints,
      }))
    })
  }
}

// let ref: any = {};

// // probably want to be able to specify a key for equality just like in D3?
// let _ =
//   [
//     { curr: ref("elms[0]"), next: ref("elms[1]") },
//     { curr: ref("elms[1]"), next: ref("elms[2]") },
//     { curr: ref("elms[2]"), next: ref("elms[3]") },
//   ]

// maybe have a special data field? and then relations always reference that?
// that wouldn't work with labels I don't think, since they need to refer to one existing set and also have a
// label set

// ObjPath based on: https://twitter.com/SferaDev/status/1413761483213783045
type StringKeys<O> = Extract<keyof O, string>;
type NumberKeys<O> = Extract<keyof O, number>;

type Values<O> = O[keyof O]

type ObjPath<O> = O extends Array<unknown>
  ? Values<{ [K in NumberKeys<O>]: `[${K}]` | `[${K}]${ObjPath<O[K]>}` }>
  : O extends Record<string, unknown>
  ? Values<{
    [K in StringKeys<O>]: ObjPath<O[K]> extends "" ? `.${K}` : `.${K}${ObjPath<O[K]>}`
  }>
  : ""

// https://stackoverflow.com/a/68487744
type addPrefix<TKey, TPrefix extends string> = TKey extends string
  ? `${TPrefix}${TKey}`
  : never;

type Ref<Prefix extends string, T> = { $ref: true, path: addPrefix<ObjPath<T>, Prefix> }

const ref = <Prefix extends string, T>(prefix: Prefix, path: ObjPath<T>): Ref<Prefix, T> => ({ $ref: true, path: (prefix + path) as addPrefix<ObjPath<T>, Prefix> });

// not sure how to get TypeScript to infer the Prefix properly
// const ref2 = <Prefix extends string, T>(path: addPrefix<ObjPath<T>, Prefix>): Ref<Prefix, T> => ({ $ref: true, path });

type myList<T> = {
  elements: RelationE2<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: RelationE2<{
    curr: Ref<"elements", RelationE2<T>>, next: Ref<"elements", RelationE2<T>>
  }>
}

export const MyListGlyphE2: GlyphE2<myList<number>> = ({
  dataGlyphs: {
    "elements": (element) => rect({ width: element, height: 200 / 3, fill: "black" }),
    "neighbors": ({
      /* TODO: not sure if/how refs should be rendered */
      /* for now we will say it shouldn't be rendered */
      dataGlyphs: {},
      relations: [{
        fields: ["curr", "next"],
        constraints: [vSpace(10.)]
      }]
    }),
  }
})

const myListExample: myList<number> = {
  elements: [1, 2, 4, 1],
  neighbors: [
    { curr: ref("elements", "[0]"), next: ref("elements", "[1]") },
    { curr: ref("elements", "[1]"), next: ref("elements", "[2]") },
    { curr: ref("elements", "[2]"), next: ref("elements", "[3]") },
  ],
}



/* BEGIN STARTER CODE */
type myDataE2 = { obj1: RelationE2<string>, obj2: string, obj3: string };
const dataE2: myDataE2 = { obj1: ["firebrick"], obj2: "steelblue", obj3: "black", };

export const exampleRelationInterface2: GlyphE2<myDataE2> = ({
  glyphs: {
    "text": text({ contents: "hello world!", fontSize: "calc(10px + 2vmin)" }),
  },
  dataGlyphs: {
    "obj1": (obj1) => rect({ width: 500 / 3, height: 200 / 3, fill: obj1 }),
    "obj2": (obj2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: obj2 }),
    "obj3": (obj3) => ellipse({ rx: 50, ry: 50, fill: obj3 }),
  },
  relations: [
    // e.g. "color1" refers to the bbox of the "color1" glyph defined above
    { fields: ["obj1", "obj2"], constraints: [vSpace(50.)] },
    { fields: ["obj1", "obj3"], constraints: [hSpace(50.), alignCenterY] },
    { fields: ["obj3", "text"], constraints: [vSpace(50.), alignCenterX] },
    { fields: ["canvas", "obj1"], constraints: [alignLeft] },
  ]
})

export const loweredGlyphTest = lowerGlyphE2(exampleRelationInterface2)(dataE2);
