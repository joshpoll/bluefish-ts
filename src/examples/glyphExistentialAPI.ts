import { Gestalt as Constraint, hSpace, alignCenterY, alignLeft, alignCenterX, vSpace } from '../gestalt';
import { BBoxValues, MaybeBBoxValues } from "../kiwiBBoxTransform";
import { text, nil, rect, ellipse } from '../mark';
import * as Compile from '../compile';
import { objectMap } from "../objectMap";
import _ from "lodash";

/// pre-amble ///
// https://stackoverflow.com/a/49683575. merges record intersection types
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

type GlyphRelation<K extends Key> = { fields: [K, K], constraints: Constraint[] };

type Key = string | number | symbol;

type ReservedKeywords = "$canvas" | "$object"

const KONT = Symbol("KONT");

// https://stackoverflow.com/a/50900933
type AllowedFieldsWithType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never
};

// https://stackoverflow.com/a/50900933
type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj]

type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, Ref<any, any>>>

/// relation semantics stuff ///
type Relation<T> = T[]

// unwraps a Relation into a RelationInstance, and keeps RelationInstances unchanged
type RelationInstance<T> = T extends Array<infer _> ? T[number] : T

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

// K must not use reserved keywords
// https://spin.atomicobject.com/2019/03/25/disjoint-unions-typescript-conditional-types/
export type Glyph_<
  K extends object & Extract<keyof K, Reserved> extends never ? object : never,
  Reserved extends Key,
  > = {
    bbox?: MaybeBBoxValues,
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
    glyphs?: Record<keyof K, Glyph>
    relations?: GlyphRelation<Reserved | keyof K>[],
  }

type Glyph = {
  [KONT]: <R>(kont: <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never, >(_: Glyph_<K, ReservedKeywords>) => R) => R,
}

namespace Glyph {
  export const mk = <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never,>(exRecord_: Glyph_<K, ReservedKeywords>): Glyph => ({
    [KONT]: (kont) => kont(exRecord_)
  });
}

type HostGlyphFn<T> = (d: T) => Glyph;

// ensures T and K have disjoint keys if T is an object type
// https://spin.atomicobject.com/2019/03/25/disjoint-unions-typescript-conditional-types/
type KConstraint<T, K> = T extends object
  ? (Extract<keyof T, keyof K> extends never ? object : never)
  : object

// TODOs:
// - need to test more examples
// - need to implement refs
// - need to implement compiler
export type GlyphFn_<
  T,
  K extends KConstraint<T, K>
  > =
  T extends object ?
  (
    // an arbitrary function taking in data and producing a glyph
    HostGlyphFn<T> |
    // old-style making some arbitrary glyphs and putting some relations between them
    Glyph_<K, ReservedKeywords> |
    // you want to write some old-style glyphs, but also you want a data-driven object
    // supports primitives and records
    // the objectGlyph has a special name that can be used in relations
    // TODO: should objectGlyph only be a HostGlyphFn<T> or a GlyphFn<T> more generally?
    // I will generalize it for now so that everywhere you make a GlyphFn you have to call GlyphFn.mk
    Id<Glyph_<K, ReservedKeywords> & { objectGlyph: GlyphFn<T> }> |
    // you might want to write some old-style glyphs and you want a data-driven record where each
    // field is rendered as a separate glyph
    Id<Glyph_<K, ReservedKeywords | keyof T> & { fieldGlyphs: { [key in keyof OmitRef<T>]: GlyphFn<RelationInstance<T[key]>> } }> |
    // combining both!
    Id<Glyph_<K, ReservedKeywords | keyof T> & { objectGlyph: GlyphFn<T> } & { fieldGlyphs: { [key in keyof OmitRef<T>]: GlyphFn<RelationInstance<T[key]>> } }>
  ) : (
    // same as above except no fieldGlyphs
    HostGlyphFn<T> |
    Glyph_<K, ReservedKeywords> |
    Id<Glyph_<K, ReservedKeywords> & { objectGlyph: GlyphFn<T> }>
  )

type GlyphFn<T> = {
  [KONT]: <R>(kont: <K extends KConstraint<T, K>>(_: GlyphFn_<T, K>) => R) => R,
}

namespace GlyphFn {
  export const mk = <T, K extends KConstraint<T, K>>(exRecord_: GlyphFn_<T, K>): GlyphFn<T> => ({
    [KONT]: (kont) => kont(exRecord_)
  });

  export const inhabited: GlyphFn<{}> = mk({
    fieldGlyphs: {},
    relations: [],
  });
}

namespace GlyphTests {

  const glyphV3Example: GlyphFn<{}> = GlyphFn.mk(
    {
      glyphs: {
        "text": Glyph.mk(text({ contents: "hello world!", fontSize: "24px" })),
      },
      relations: [{
        fields: ["$canvas", "$canvas"],
        constraints: [],
      }]
    }
  );

  const objectGlyphExample: GlyphFn<number> = GlyphFn.mk(
    {
      glyphs: {
        "text": Glyph.mk(text({ contents: "hello world!", fontSize: "24px" })),
      },
      objectGlyph: GlyphFn.mk((d: number) => Glyph.mk(text({ contents: "hello world!", fontSize: "24px" }))),
      relations: [{
        fields: ["$canvas", "text"],
        constraints: [],
      }]
    }
  );

  // const fieldsGlyphExample_: GlyphFn_<number, "text"> = {
  //   glyphs: {
  //     "text": text({ contents: "hello world!", fontSize: "24px" }),
  //   },
  //   relations: [{
  //     fields: ["$canvas", "$canvas"],
  //     constraints: [],
  //   }]
  // }

  // const fieldsGlyphExample: GlyphFn<number> = {
  //   [KONT]: (kont) => kont({
  //     glyphs: {
  //       "text": text({ contents: "hello world!", fontSize: "24px" }),
  //     },
  //     relations: [{
  //       fields: ["$canvas", "$canvas"],
  //       constraints: [],
  //     }]
  //   })
  // }

  const fieldsGlyphExample: GlyphFn<{ item: number }> = GlyphFn.mk({
    glyphs: {
      foo: Glyph.mk(nil()),
    },
    fieldGlyphs: {
      item: GlyphFn.mk((d: number) => Glyph.mk(nil())),
    },
    relations: [
      {
        fields: ["$canvas", "$canvas"],
        constraints: []
      },
      {
        fields: ["foo", "item"],
        constraints: []
      },
    ]
  });
}

/* TODO: this will cause name clashing if someone uses "canvas" in the source program!!!! */
const lowerCanvasName = (s: string) => s === "$canvas" ? "canvas" : s;

const lowerGlyphRelation = <K extends Key>(gr: GlyphRelation<K>): Compile.Relation => ({
  left: lowerCanvasName(gr.fields[0].toString()),
  right: lowerCanvasName(gr.fields[1].toString()),
  gestalt: gr.constraints,
});

export const lowerGlyph = <T>(g: Glyph): Compile.Glyph => {
  const kont = g[KONT];
  const glyph_ = kont((x: Glyph_<any, ReservedKeywords>) => x);
  return {
    bbox: glyph_.bbox,
    renderFn: glyph_.renderFn,
    children: glyph_.glyphs ? objectMap(glyph_.glyphs, (k, v) => lowerGlyph(v)) : {},
    relations: glyph_.relations?.map(lowerGlyphRelation),
  };
};

// loses a bit of type safety b/c we _should_ be able to tell whether the return type is U or U[]
// based on the input, but this type doesn't tell us
// luckily this is only used internally. right???
const mapDataRelation = <T, U>(r: T, f: (d: RelationInstance<T>) => U): U | Relation<U> => {
  if (r instanceof Array) {
    return r.map(f)
  } else {
    // TODO: this cast seems sus, but it might not be b/c we check for array in the first branch
    return f(r as RelationInstance<T>)
  }
}

export const lowerGlyphFn = <T>(gf: GlyphFn<T>): ((data: T) => Compile.Glyph) => {
  const kont = gf[KONT];
  return kont((gf: GlyphFn_<T, any>): ((data: T) => Compile.Glyph) => {
    if (typeof gf === "function") {
      // HostGlyphFn
      return (data: T) => lowerGlyph(gf(data));
    } else {
      return (data: T) => ({
        bbox: gf.bbox,
        renderFn: gf.renderFn,
        children: {
          ...("objectGlyph" in gf ? { "$object": lowerGlyphFn(gf.objectGlyph)(data) } : {}),
          // TODO: is it possible to get rid of this `any`?
          ...("fieldGlyphs" in gf ? objectMap(gf.fieldGlyphs, (k, v: GlyphFn<RelationInstance<T[any]>>) => {
            const loweredGlyphs = mapDataRelation(data[k], lowerGlyphFn(v));
            if (loweredGlyphs instanceof Array) {
              return {
                children: loweredGlyphs.reduce((o, g, i) => ({
                  ...o, [i]: g
                }), {})
              };
            } else {
              return loweredGlyphs;
            }
          }) : {}),
          ...(gf.glyphs ? objectMap(gf.glyphs, (_k, v) => lowerGlyph(v)) : {}),
        },
        relations: gf.relations?.map(lowerGlyphRelation),
      })
    }
  });
}

export namespace GlyphFnLowerTest {
  type myDataE2 = { color1: string, color2: string, color3: string };
  const dataE2: myDataE2 = { color1: "firebrick", color2: "steelblue", color3: "black", /* "text": "hello world!" */ };

  export const exampleRelationInterface2: GlyphFn<myDataE2> = GlyphFn.mk({
    glyphs: {
      "text": Glyph.mk(text({ contents: "hello world!", fontSize: "24px" })),
    },
    fieldGlyphs: {
      "color1": GlyphFn.mk((color1) => Glyph.mk(rect({ width: 500 / 3, height: 200 / 3, fill: color1 }))),
      "color2": GlyphFn.mk((color2) => Glyph.mk(ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }))),
      "color3": GlyphFn.mk((color3) => Glyph.mk(ellipse({ rx: 50, ry: 50, fill: color3 }))),
      // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
    },
    relations: [
      { fields: ["color1", "color2"], constraints: [vSpace(50.), alignCenterX] },
      { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
      { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
      { fields: ["$canvas", "color1"], constraints: [alignLeft] },
    ]
  })

  type MarblesData = {
    elements: Relation<number>,
  };

  const marblesData: MarblesData = {
    elements: [1, 2, 3, 4],
  };

  const element: GlyphFn<number> = GlyphFn.mk({
    glyphs: {
      "circle": Glyph.mk(ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" })),
    },
    objectGlyph: GlyphFn.mk((n) => Glyph.mk(text({ contents: n.toString(), fontSize: "24px" }))),
    relations: [
      // uh oh! no way to write constraints since dataGlyphs is anonymous!!!
    ]
  });

  export const marbles: GlyphFn<MarblesData> = GlyphFn.mk({
    glyphs: {
      // "text": text({ text: "hello world!", fontSize: "24px" }),
    },
    fieldGlyphs: {
      elements: element,
      // "color1": (color1) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 }),
      // "color2": (color2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }),
      // "color3": (color3) => ellipse({ rx: 50, ry: 50, fill: color3 }),
      // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
    },
    relations: [
      // e.g. "color1" refers to the bbox of the "color1" glyph defined above
      // { fields: ["text", "color2"], constraints: [vSpace(50.)] },
      // { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
      // { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
      // // this works b/c canvas can have negative coordinates I think? not really sure
      // { fields: ["canvas", "color1"], constraints: [alignLeft] },
      // { fields: ["color1", "color2"], constraints: [alignCenterX] },
    ]
  })

  export const testLoweredGlyphExample = lowerGlyphFn(exampleRelationInterface2)(dataE2);
  export const testLoweredGlyphMarbles = lowerGlyphFn(marbles)(marblesData);
}