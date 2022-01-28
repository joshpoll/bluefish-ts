import { Gestalt as Constraint, hSpace, alignCenterY, alignLeft, alignCenterX, vSpace, vAlignCenter } from './gestalt';
import { BBoxValues, MaybeBBoxValues } from "./kiwiBBoxTransform";
import * as Compile from './compileWithRef';
import compileWithRef from './compileWithRef';
import { objectMap, objectFilter } from "./objectMap";
import _ from "lodash";
import renderAST from './render';
import { makePathsAbsolute, RelativeBFValue, AbsoluteBFValue } from './absoluteDataPaths';

/// pre-amble ///
// https://stackoverflow.com/a/49683575. merges record intersection types
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

// type ShapeRelation<K extends Key> = { [key in `${K & (string | number)}->${K & (string | number)}`]?: Constraint[] };
type ShapeRelation = { [key in `${string}->${string}`]?: Constraint[] };

type Key = string | number | symbol;

type ReservedKeywords = "$canvas" | "$object"

const KONT = "KONT";

// https://stackoverflow.com/a/50900933
type AllowedFieldsWithType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never
};

// https://stackoverflow.com/a/50900933
type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj]

type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, MyRef>>
type ExtractRefKeys<T> = keyof T[ExtractFieldsOfType<T, MyRef>]

/// relation semantics stuff ///
export type Relation<T> = T[]

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
export type Shape_<
  K extends object & Extract<keyof K, Reserved> extends never ? object : never,
  Reserved extends Key,
  > = {
    // inherit parent's coordinate frame. default is false
    // currently used only to make sets' encapsulation more transparent
    // this allows for smoother ramp from single element to set of elements
    inheritFrame?: boolean,
    bbox?: MaybeBBoxValues,
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
    shapes?: Record<keyof K, Shape>
    rels?: ShapeRelation,
  }

export type Shape = {
  [KONT]: <R>(kont: <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never, >(_: Shape_<K, ReservedKeywords>) => R) => R,
}

export namespace Shape {
  export const create = <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never,>(exRecord_: Shape_<K, ReservedKeywords>): Shape => ({
    [KONT]: (kont) => kont(exRecord_)
  });

  export const fromCompileShape = (g: Compile.GlyphNoRef): Shape => create({
    bbox: g.bbox,
    renderFn: g.renderFn,
    shapes: objectMap(g.children, (k, v) => fromCompileShape(v)),
    rels: g.relations?.reduce((o: ShapeRelation, { left, right, gestalt }) => ({
      ...o, [`${left}->${right}`]: gestalt
    }), {} as ShapeRelation)
  })

  export const inhabited: Shape = create({});
}

export type HostShapeFn<T> = (d: T) => Shape;

// ensures T and K have disjoint keys if T is an object type
// https://spin.atomicobject.com/2019/03/25/disjoint-unions-typescript-conditional-types/
type KConstraint<T, K> = T extends object
  ? (Extract<keyof T, keyof K> extends never ? object : never)
  : object

// TODOs:
// - need to test more examples
// - need to implement refs
export type ShapeFn_<
  T,
  K extends KConstraint<T, K>
  > =
  T extends object ?
  (
    // an arbitrary function taking in data and producing a glyph
    HostShapeFn<T> |
    // old-style making some arbitrary glyphs and putting some relations between them
    // TODO: Adding the ExtractRefKeys<T> breaks the type inference for the other unions???
    Shape_<K, ReservedKeywords/*  | ExtractRefKeys<T> */> |
    // you want to write some old-style glyphs, but also you want a data-driven object
    // supports primitives and records
    // the object has a special name that can be used in relations
    // TODO: should object only be a HostShapeFn<T> or a ShapeFn<T> more generally?
    // I will generalize it for now so that everywhere you make a ShapeFn you have to call ShapeFn.mk
    Id<Shape_<K, ReservedKeywords/*  | ExtractRefKeys<T> */> & { object: HostShapeFn<T> }> |
    // you might want to write some old-style glyphs and you want a data-driven record where each
    // field is rendered as a separate glyph
    Id<Shape_<K, ReservedKeywords | keyof T> & { fields: { [key in keyof OmitRef<T>]: HostShapeFn<RelationInstance<T[key]>> } }> |
    // combining both!
    Id<Shape_<K, ReservedKeywords | keyof T> & { object: HostShapeFn<T> } & { fields: { [key in keyof OmitRef<T>]: HostShapeFn<RelationInstance<T[key]>> } }>
  ) : (
    // same as above except no fields
    HostShapeFn<T> |
    Shape_<K, ReservedKeywords> |
    Id<Shape_<K, ReservedKeywords> & { object: HostShapeFn<T> }>
  )

export type ShapeFn<T> = {
  [KONT]: <R>(kont: <K extends KConstraint<T, K>>(_: ShapeFn_<T, K>) => R) => R,
}

export namespace ShapeFn {
  export const mkEx = <T, K extends KConstraint<T, K>>(exRecord_: ShapeFn_<T, K>): ShapeFn<T> => ({
    [KONT]: (kont) => kont(exRecord_)
  });

  // TODO: this function is kind of unsafe b/c it doesn't maintain the relations fields invariant and
  // it introduces a $object glyph
  export const shapeFnToHostShapeFn = <T>(gf: ShapeFn<T>): HostShapeFn<T> => {
    const kont = gf[KONT];
    return kont((gf: ShapeFn_<T, any>): HostShapeFn<T> => {
      if (typeof gf === "function") {
        return gf;
      } else {
        return (data: T): Shape => Shape.create({
          bbox: gf.bbox,
          renderFn: gf.renderFn,
          inheritFrame: gf.inheritFrame,
          shapes: {
            // fields
            // TODO: is it possible to get rid of this `any`?
            ...("fields" in gf ? objectMap(gf.fields, (k, v: HostShapeFn<RelationInstance<T[any]>>) => {
              const loweredShapes = mapDataRelation(data[k], v);
              if (loweredShapes instanceof Array) {
                return Shape.create({
                  inheritFrame: true,
                  shapes: loweredShapes.reduce((o, g, i) => ({
                    ...o, [i]: g
                  }), {})
                });
              } else {
                return loweredShapes;
              }
            }) : {}),
            /* TODO: this is wrong, but removing it is wrong, too */
            // refs
            ...(typeof data === "object" ? objectFilter(data, (k, v) => (typeof v === "object") && ("$ref" in v)) : {}),
            // glyphs
            ...gf.shapes,
            // object
            ...("object" in gf ? { "$object": gf.object(data) } as any : {}),
          },
          rels: gf.rels as any,
        });
      }
    })
  }

  export const create = <T, K extends KConstraint<T, K>>(exRecord_: ShapeFn_<T, K>): HostShapeFn<T> => shapeFnToHostShapeFn(mkEx(exRecord_));
}

export const createShape = Shape.create;
export const createShapeFn = ShapeFn.create;

/* this approach loses type safety so we'll avoid it.
   It may be possible to get around the typesafety issue by making the Shape and ShapeFn types
   closer so I don't need the union in the return. Basically embrace the fact that Shape is a
   ShapeFn with {} as its input type. However, could special case ShapeFn type so that if the input
   is {} it is a shape and not a function.
*/
// type schema = any;

// function createShape<K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never>(spec: Shape_<K, ReservedKeywords>): Shape;
// function createShape<T, K extends KConstraint<T, K>>(schema: schema, spec: ShapeFn_<T, K>): HostShapeFn<T>
// function <T>createShape(schemaOrSpec: any, spec ?: any): Shape | HostShapeFn < T > {
//   return spec ? ShapeFn.create(schemaOrSpec, spec) : Shape.create(spec);
// }

const lowerShapeRelation = (gr: ShapeRelation): Compile.Relation[] => {
  const rels = [];
  for (const [k, gestalt] of Object.entries(gr)) {
    const [left, right] = k.split('->');
    rels.push({
      left,
      right,
      gestalt,
    })
  }
  /* TODO: more type safety */
  return rels as Compile.Relation[];
};

export const lowerShape = <T>(g: Shape | MyRef): Compile.Glyph => {
  if ("$ref" in g) {
    console.log("shape", g);
    // TODO: really sus cast here
    return { $ref: true, path: g.path as any };
  } else {
    const kont = g[KONT];
    const glyph_ = kont((x: Shape_<any, ReservedKeywords>) => x);
    return {
      inheritFrame: glyph_.inheritFrame ?? false,
      bbox: glyph_.bbox,
      renderFn: glyph_.renderFn,
      children: glyph_.shapes ? objectMap(glyph_.shapes, (k, v) => lowerShape(v)) : {},
      relations: glyph_.rels ? lowerShapeRelation(glyph_.rels) : undefined,
    };
  }
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

// TODO: maybe want to use RelationInstances here, but it seems like it's subtle to do that well so
// we will defer it
export const lowerShapeFn = <T>(gf: HostShapeFn<T>): ((data: T) => Compile.Glyph) => {
  return (data: T) => lowerShape(gf(data));
};

export type MyRef = {
  $ref: true,
  path: string,
}

export const mkMyRef = (path: string): MyRef => ({
  $ref: true,
  path,
})

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

// export const makePathsAbsolute = <T>(data: T, pathFromRoot: Key[] = []): T => {
//   console.log("current path from root", pathFromRoot);
//   if (data === null) {
//     return data
//   } else if (Array.isArray(data)) { // array/relation
//     return data.map((d, i) => makePathsAbsolute(d, [i, ...pathFromRoot])) as any as T;
//   } else if (typeof data === "object" && !("$ref" in data)) { // object/record/instance
//     return objectMap(data, (k, v) => makePathsAbsolute(v, [k, ...pathFromRoot])) as any as T;
//   } else if (typeof data === "object") { // ref (where the actual work is done!)
//     const ref = data as unknown as Ref<any, any>;
//     console.log("making this ref absolute", ref, pathFromRoot);
//     const pathList = parsePath(ref.path);
//     // automatically bump one level up when resolving paths
//     const absolutePath = resolvePath(pathList, pathFromRoot.slice(1));
//     console.log("absolute path", absolutePath);
//     return { $ref: true, path: absolutePath } as any as T;
//   } else {
//     return data;
//   }
// }

// TODO: make refs to refs work???
// TODO: 
// TODO: makePathsAbsolute should be called in the compiler I think.
// using this, bounding boxes can be looked up easily

// like lowerShapeFn, but makes paths absolute
export const compileShapeFn = <T>(gf: HostShapeFn<T>) =>
  (data: T): Compile.Glyph => lowerShapeFn(gf)(makePathsAbsolute(data as unknown as BluefishData) as unknown as T)

export type MyList<T> = {
  elements: Relation<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: Relation<{
    curr: MyRef,
    next: MyRef,
  }>
}

export function render(shape: Shape): JSX.Element;
export function render<T extends RelativeBFValue>(data: T, shapeFn: HostShapeFn<T>): JSX.Element;
export function render<T extends RelativeBFValue>(shapeOrData: Shape | T, shapeFn?: HostShapeFn<T>): JSX.Element {
  const shape = shapeFn ? shapeFn(makePathsAbsolute(shapeOrData as T) as T) : shapeOrData as Shape;
  return renderAST(compileWithRef(lowerShape(shape)));
}
