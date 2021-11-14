import { Gestalt as Constraint, hSpace, alignCenterY, alignLeft, alignCenterX, vSpace, vAlignCenter } from '../gestalt';
import { BBoxValues, MaybeBBoxValues } from "../kiwiBBoxTransform";
import { text, nil, rect, ellipse } from '../mark';
import * as Compile from '../compileWithRef';
import { objectMap, objectFilter } from "../objectMap";
import _ from "lodash";

/// pre-amble ///
// https://stackoverflow.com/a/49683575. merges record intersection types
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

type GlyphRelation<K extends Key> = { fields: K[], constraints: Constraint[] };

type Key = string | number | symbol;

type ReservedKeywords = "$canvas" | "$object"

const KONT = Symbol("KONT");

// https://stackoverflow.com/a/50900933
type AllowedFieldsWithType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never
};

// https://stackoverflow.com/a/50900933
type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj]

type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, MyRef>>
type ExtractRefKeys<T> = keyof T[ExtractFieldsOfType<T, MyRef>]

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

type Ref<T, Field extends string & keyof T> = { $ref: true, path: addPrefix<ObjPath<T[Field]>, Field> }

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

export type Glyph = {
  [KONT]: <R>(kont: <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never, >(_: Glyph_<K, ReservedKeywords>) => R) => R,
}

export namespace Glyph {
  export const mk = <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never,>(exRecord_: Glyph_<K, ReservedKeywords>): Glyph => ({
    [KONT]: (kont) => kont(exRecord_)
  });

  export const fromCompileGlyph = (g: Compile.GlyphNoRef): Glyph => mk({
    bbox: g.bbox,
    renderFn: g.renderFn,
    glyphs: objectMap(g.children, (k, v) => fromCompileGlyph(v)),
    relations: g.relations?.map(({ left, right, gestalt }) => ({ fields: [left, right], constraints: gestalt }))
  })
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
export type GlyphFn_<
  T,
  K extends KConstraint<T, K>
  > =
  T extends object ?
  (
    // an arbitrary function taking in data and producing a glyph
    HostGlyphFn<T> |
    // old-style making some arbitrary glyphs and putting some relations between them
    // TODO: Adding the ExtractRefKeys<T> breaks the type inference for the other unions???
    Glyph_<K, ReservedKeywords/*  | ExtractRefKeys<T> */> |
    // you want to write some old-style glyphs, but also you want a data-driven object
    // supports primitives and records
    // the objectGlyph has a special name that can be used in relations
    // TODO: should objectGlyph only be a HostGlyphFn<T> or a GlyphFn<T> more generally?
    // I will generalize it for now so that everywhere you make a GlyphFn you have to call GlyphFn.mk
    Id<Glyph_<K, ReservedKeywords/*  | ExtractRefKeys<T> */> & { objectGlyph: GlyphFn<T> }> |
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

export type GlyphFn<T> = {
  [KONT]: <R>(kont: <K extends KConstraint<T, K>>(_: GlyphFn_<T, K>) => R) => R,
}

export namespace GlyphFn {
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

const lowerGlyphRelation = <K extends Key>(gr: GlyphRelation<K>): Compile.Relation => ({
  left: gr.fields[0].toString(),
  right: gr.fields[1].toString(),
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

// for a given relation instance, gather its ref fields so that we can lower them through the
// relation visualizations
// TODO: implementing refs properly will take a bit of thought!!!

// TODO: this function is kind of unsafe b/c it doesn't maintain the relations fields invariant and
// it introduces a $object glyph
export const glyphFnToHostGlyphFn = <T>(gf: GlyphFn<T>): HostGlyphFn<T> => {
  const kont = gf[KONT];
  return kont((gf: GlyphFn_<T, any>): HostGlyphFn<T> => {
    if (typeof gf === "function") {
      return gf;
    } else {
      return (data: T): Glyph => Glyph.mk({
        bbox: gf.bbox,
        renderFn: gf.renderFn,
        glyphs: {
          // fieldGlyphs
          // TODO: is it possible to get rid of this `any`?
          ...("fieldGlyphs" in gf ? objectMap(gf.fieldGlyphs, (k, v: GlyphFn<RelationInstance<T[any]>>) => {
            const loweredGlyphs = mapDataRelation(data[k], glyphFnToHostGlyphFn(v));
            if (loweredGlyphs instanceof Array) {
              return Glyph.mk({
                glyphs: loweredGlyphs.reduce((o, g, i) => ({
                  ...o, [i]: g
                }), {})
              });
            } else {
              return loweredGlyphs;
            }
          }) : {}),
          /* TODO: this is wrong, but removing it is wrong, too */
          // refs
          ...(typeof data === "object" ? objectFilter(data, (k, v) => (typeof v === "object") && ("$ref" in v)) : {}),
          // glyphs
          ...gf.glyphs,
          // objectGlyph
          ...("objectGlyph" in gf ? { "$object": glyphFnToHostGlyphFn(gf.objectGlyph)(data) } as any : {}),
        },
        relations: gf.relations as any,
      });
    }
  })
}

// TODO: maybe want to use RelationInstances here, but it seems like it's subtle to do that well so
// we will defer it
export const lowerGlyphFn = <T>(gf: GlyphFn<T>): ((data: T) => Compile.Glyph) => {
  const kont = gf[KONT];
  return kont((gf: GlyphFn_<T, any>): ((data: T) => Compile.Glyph) =>
    (data: T) => {
      if (typeof gf === "function") {
        // HostGlyphFn
        return lowerGlyph(gf(data));
      } else {
        return {
          bbox: gf.bbox,
          renderFn: gf.renderFn,
          children: {
            // fieldGlyphs
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
            // refs
            ...(typeof data === "object" ? objectFilter(data, (k, v) => (typeof v === "object") && ("$ref" in v)) : {}),
            // glyphs
            ...(gf.glyphs ? objectMap(gf.glyphs, (_k, v) => lowerGlyph(v)) : {}),
            // objectGlyph
            ...("objectGlyph" in gf ? { "$object": lowerGlyphFn(gf.objectGlyph)(data) } : {}),
          },
          relations: gf.relations?.map(lowerGlyphRelation),
        }
      }
    })
};

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

export type MyListOld<T> = {
  elements: Relation<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: Relation<{
    curr: Ref<MyListOld<T>, "elements">,
    next: Ref<MyListOld<T>, "elements">,
  }>
}

type Ref2<T, U> = any;
type Ref3<T> = any;

type MyListRef2<T> = {
  elements: Relation<Ref2<T, "">>,
  neighbors: Relation<{
    curr: Ref2<MyListOld<T>, "elements">,
    next: Ref2<MyListOld<T>, "elements">,
  }>
}

type MyListRef3<T> = {
  elements: Relation<Ref3<T>>,
  neighbors: Relation<{
    curr: Ref3<T>,
    next: Ref3<T>,
  }>
}

type RIWithRef<T> = any;

const mkRef = <T>(foo: RIWithRef<T>) => foo.$ref;

type MyList2<T> = {
  elements: Relation<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: Relation<Ref<MyList2<T>, "elements">>
}

// TODO: placeholder!
let ref = <T, Field extends string & keyof T>(field: Field, path: ObjPath<T[Field]>): Ref<T, Field> => ({
  $ref: true,
  // TODO: can I remove this typecast by inlining addPrefix definition?
  path: `${field}${path}` as addPrefix<ObjPath<T[Field]>, Field>,
});

export type MyRef = {
  $ref: true,
  path: string,
}

export const mkMyRef = (path: string): MyRef => ({
  $ref: true,
  path,
})

//     { curr: ref("elms[0]"), next: ref("elms[1]") },
//     { curr: ref("elms[1]"), next: ref("elms[2]") },
//     { curr: ref("elms[2]"), next: ref("elms[3]") },

const myListExample: MyListOld<number> = {
  elements: [10, 20, 30, 40],
  neighbors: [
    { curr: ref("elements", "[0]"), next: ref("elements", "[1]") },
    { curr: ref("elements", "[1]"), next: ref("elements", "[2]") },
    { curr: ref("elements", "[2]"), next: ref("elements", "[3]") },
  ]
}

const G = Glyph;
const GF = GlyphFn;

const myListGlyphFn: GlyphFn<MyListOld<number>> = GF.mk({
  fieldGlyphs: {
    "elements": GF.mk((element) => G.mk(rect({ width: element, height: 200 / 3, fill: "black" }))),
    "neighbors": GF.mk({
      /* TODO: not sure if/how refs should be rendered */
      /* for now we will say it shouldn't be rendered */
      relations: [
        // TODO: not sure why type safety is lost!
        {
          fields: ["curr", "next"],
          constraints: [vSpace(10.)],
        }
      ]
    }),
  }
})

export const loweredListGlyphTest = lowerGlyphFn(myListGlyphFn)(myListExample);

// TODO: to get refs to work, I think all I need to do is push them into the relations as paths!!
// ok but maybe instead resolve all paths to absolute paths from top-level input
// then push those absolute paths into the relations
// then resolve those absolute paths in the compiler?

type BluefishData =
  | string
  | number
  | boolean
  | null
  | BluefishData[]
  | { [key: string]: BluefishData }
// | Ref<any, any>

const parsePath = (path: string): (number | string)[] => path.split('/').map((s) => s === ".." ? -1 : !isNaN(parseFloat(s)) ? +s : s);

// O extends Array<unknown>
//   ? Values<{ [K in NumberKeys<O>]: `[${K}]` | `[${K}]${ObjPath<O[K]>}` }>
//   : O extends Record<string, unknown>
//   ? Values<{
//     [K in StringKeys<O>]: ObjPath<O[K]> extends "" ? `.${K}` : `.${K}${ObjPath<O[K]>}`
//   }>
//   : ""

// type PathTree = any;

// type PathTree<T extends BluefishData> = T extends Array<infer _>
//   ? { [key: number]: PathTree<T[number]> }
//   : T extends object
//   ? { [key in keyof T]: PathTree<T[key]> } : T;

// const makePathTree = (data: BluefishData): PathTree => {
//   if (Array.isArray(data)) {
//     return data.reduce((o: PathTree, v, i) => ({
//       ...o, [i]: makePathTree(v)
//     }), {});
//   } else if (typeof data === "object") {
//     return objectMap(data, (k, v) => makePathTree(v));
//   } else {
//     return data;
//   }
// }

// takes a relative path and makes it absolute
// relative path must be of the form (more or less): (../)*([a-z0-9]+/)*
// basically we allow ../, but only at the beginning (for simplicity of implementation)
// and the rest is a local absolute path. neither piece is required
const resolvePath = (pathList: (number | string)[], pathFromRoot: Key[]): string[] => {
  if (pathList.length === 0) {
    return pathFromRoot as string[];
  } else {
    const [hd, ...tl] = pathList;
    if (hd === -1) {
      // step up
      return resolvePath(tl, pathFromRoot.slice(1));
    } else {
      // step down
      return resolvePath(tl, [hd, ...pathFromRoot]);
    }
  }
}

const makePathsAbsolute = (data: BluefishData, pathFromRoot: Key[] = []): BluefishData => {
  console.log("current path from root", pathFromRoot);
  if (data === null) {
    return data
  } else if (Array.isArray(data)) { // array/relation
    return data.map((d, i) => makePathsAbsolute(d, [i, ...pathFromRoot]));
  } else if (typeof data === "object" && !("$ref" in data)) { // object/record/instance
    return objectMap(data, (k, v) => makePathsAbsolute(v, [k, ...pathFromRoot]))
  } else if (typeof data === "object") { // ref (where the actual work is done!)
    const ref = data as unknown as Ref<any, any>;
    console.log("making this ref absolute", ref, pathFromRoot);
    const pathList = parsePath(ref.path);
    // automatically bump one level up when resolving paths
    const absolutePath = resolvePath(pathList, pathFromRoot.slice(1));
    console.log("absolute path", absolutePath);
    return { $ref: true, path: absolutePath };
  } else {
    return data;
  }
}

// TODO: make refs to refs work???
// TODO: 
// TODO: makePathsAbsolute should be called in the compiler I think.
// using this, bounding boxes can be looked up easily

// like lowerGlyphFn, but makes paths absolute
export const compileGlyphFn = <T>(gf: GlyphFn<T>) =>
  (data: T): Compile.Glyph => lowerGlyphFn(gf)(makePathsAbsolute(data as unknown as BluefishData) as unknown as T)

export type MyList<T> = {
  elements: Relation<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: Relation<{
    curr: MyRef,
    next: MyRef,
  }>
}

export namespace GlyphFnCompileTest {
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
      { fields: ["$object", "circle"], constraints: [alignCenterX, alignCenterY] }
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

  export const testCompiledGlyphFnExample = compileGlyphFn(exampleRelationInterface2)(dataE2);
  export const testCompiledGlyphFnMarbles = compileGlyphFn(marbles)(marblesData);

  type MarblesList = MyList<number>;

  const marblesList: MarblesList = {
    elements: [1, 2, 3, 4],
    neighbors: [
      { curr: mkMyRef("../../elements/0"), next: mkMyRef("../../elements/1") },
      { curr: mkMyRef("../../elements/1"), next: mkMyRef("../../elements/2") },
      { curr: mkMyRef("../../elements/2"), next: mkMyRef("../../elements/3") },
    ]
  };

  export const marblesListGlyphFn: GlyphFn<MarblesList> = GlyphFn.mk({
    glyphs: {
      // "text": text({ text: "hello world!", fontSize: "24px" }),
    },
    fieldGlyphs: {
      elements: element,
      neighbors: GF.mk({
        relations: [{ fields: ["curr", "next"], constraints: [hSpace(5), alignCenterY] }]
      })
    },
  })

  export const testMarblesList = compileGlyphFn(marblesListGlyphFn)(marblesList);

  type MarblesListReduced = {
    marble1: number,
    marble2: number,
    marble1Ref: MyRef,
  };

  const marblesListReduced: MarblesListReduced = {
    marble1: 1,
    marble2: 2,
    marble1Ref: mkMyRef("marble1"),
  };

  export const marblesListReducedGlyphFn: GlyphFn<MarblesListReduced> = GlyphFn.mk({
    fieldGlyphs: {
      marble1: Glyph.mk(ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" })),
      marble2: Glyph.mk(ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" })),
    },
    relations: [{
      fields: ["marble1Ref", "marble2"],
      constraints: [hSpace(5), alignCenterY]
    }]
  })

  export const testMarblesListReduced = compileGlyphFn(marblesListReducedGlyphFn)(marblesListReduced);

  type MarblesListMoreComplex = {
    marbles: Relation<number>,
    // marble1: number,
    // marble2: number,
    neighbor: Relation<{
      curr: MyRef,
      next: MyRef,
    }>,
  };

  const marblesListMoreComplex: MarblesListMoreComplex = {
    marbles: [1, 2, 3],
    neighbor: [
      {
        curr: mkMyRef("../../marbles/0"),
        next: mkMyRef("../../marbles/1"),
      },
      {
        curr: mkMyRef("../../marbles/1"),
        next: mkMyRef("../../marbles/2"),
      }
    ]
  };

  export const marblesListMoreComplexGlyphFn: GlyphFn<MarblesListMoreComplex> = GlyphFn.mk({
    fieldGlyphs: {
      marbles: element,
      neighbor: Glyph.mk({
        relations: [{
          fields: ["curr", "next"],
          constraints: [hSpace(5.) /* TODO: not sure how to remove the specific value here and instead control the size of the entire thing */, alignCenterY]
        }]
      })
    },
  })

  export const testMarblesListMoreComplex = compileGlyphFn(marblesListMoreComplexGlyphFn)(marblesListMoreComplex);

  export const twoSetsOfMarbles: GlyphFn<{
    one: MarblesListMoreComplex,
    two: MarblesListMoreComplex
  }> = GlyphFn.mk({
    fieldGlyphs: {
      one: marblesListMoreComplexGlyphFn,
      two: marblesListMoreComplexGlyphFn,
    },
    relations: [
      {
        fields: ["one", "two"],
        constraints: [vAlignCenter, vSpace(20)],
      }
    ]
  })

  const twoSetsOfMarblesData: {
    one: MarblesListMoreComplex,
    two: MarblesListMoreComplex
  } = {
    one: {
      marbles: [1, 2, 3],
      neighbor: [
        {
          curr: mkMyRef("../../marbles/0"),
          next: mkMyRef("../../marbles/1"),
        },
        {
          curr: mkMyRef("../../marbles/1"),
          next: mkMyRef("../../marbles/2"),
        }
      ]
    },
    two: {
      marbles: [10, 20, 30],
      neighbor: [
        {
          curr: mkMyRef("../../marbles/0"),
          next: mkMyRef("../../marbles/1"),
        },
        {
          curr: mkMyRef("../../marbles/1"),
          next: mkMyRef("../../marbles/2"),
        }
      ]
    },
  };

  export const testTwoMarbleSets = compileGlyphFn(twoSetsOfMarbles)(twoSetsOfMarblesData);
}