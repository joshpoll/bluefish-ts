import { Gestalt as Constraint, hSpace, alignCenterY, alignLeft, alignCenterX, vSpace, vAlignCenter } from './gestalt';
import { BBoxValues, MaybeBBoxValues } from "./kiwiBBoxTransform";
import * as Compile from './compileWithRef';
import compileWithRef from './compileWithRef';
import { objectMap, objectFilter } from "./objectMap";
import _ from "lodash";
import renderAST from './render';
import { makePathsAbsolute, RelativeBFValue, RelativeBFRef, BFRef } from './absoluteDataPaths';

/// pre-amble ///
// https://stackoverflow.com/a/49683575. merges record intersection types
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

// type ShapeRelation<K extends Key> = { [key in `${K & (string | number)}->${K & (string | number)}`]?: Constraint[] };
type ShapeRelation<K extends string> = { [key in `${K}->${K}`]?: Constraint[] };

type Key = string | number | symbol;

type ReservedKeywords = "$canvas" | "$object"

const KONT = "KONT";

// https://stackoverflow.com/a/50900933
type AllowedFieldsWithType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never
};

// https://stackoverflow.com/a/50900933
type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj]

type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, RelativeBFRef>>
type ExtractRefKeys<T> = keyof T[ExtractFieldsOfType<T, RelativeBFRef>]

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

export type Mark_ = {
  debugBBox?: boolean,
  inheritFrame?: boolean,
  bbox?: MaybeBBoxValues,
  renderFn: (canvas: BBoxValues, index?: number) => JSX.Element,
}

export type Mark = {
  type: 'mark',
  debugBBox?: boolean,
  inheritFrame?: boolean,
  bbox?: MaybeBBoxValues,
  renderFn: (canvas: BBoxValues, index?: number) => JSX.Element,
  rels?: ShapeRelation<"$canvas">,
}

// https://stackoverflow.com/a/57422677
type ShapeRecord<Shapes, ShapeFns> =
  /* should really be the instance thingy instead of T[key] */
  { [key in keyof ShapeFns]: Shape<ShapeFns[key]> } &
  { [key in keyof Shapes]: key extends keyof ShapeFns ? Shape<ShapeFns[key]> : ShapeValue }

export type Group_<Shapes extends ShapeRecord<Shapes, T>, T> = {
  debugBBox?: boolean,
  inheritFrame?: boolean,
  bbox?: MaybeBBoxValues,
  shapes?: Shapes,
  // TODO: kinda a hack to restrict to strings here.
  rels?: ShapeRelation<(keyof Shapes & string) | "$canvas">,
}

export type Group<T> = {
  type: 'group',
  [KONT]: <R>(kont: <Shapes extends ShapeRecord<Shapes, T>>(_: Group_<Shapes, T>) => R) => R,
}

export const createGroup = <Shapes extends ShapeRecord<Shapes, T>, T>(exRecord_: Group_<Shapes, T>): Group<T> => ({
  type: 'group',
  [KONT]: (kont) => kont(exRecord_)
});

export const createMark = (mark: Mark_): Mark => ({ type: 'mark', ...mark })

export const lowerGroup = <T>(g: Group<T>): keyof T extends never ? Group<{}> : ShapeFn<T> => {
  const kont = g[KONT];
  return kont(<Shapes extends ShapeRecord<Shapes, T>>(g: Group_<Shapes, T>) => {
    // recursively visit sub-groups
    g = { ...g, shapes: g.shapes ? objectMap(g.shapes, (_, g) => typeof g !== `function` && g.type === 'group' ? lowerGroup(g) : g) : {} } as Group_<Shapes, T>;
    const shapeFns = objectFilter(g.shapes, (_name, shape) => {
      return typeof shape === "function";
    });
    if (Object.keys(shapeFns).length === 0) {
      // group value
      return createGroup(g) as unknown as keyof T extends never ? Group<{}> : ShapeFn<T>;
    } else {
      // group function
      return ((data: T): ShapeValue => createGroup({
        bbox: g.bbox,
        inheritFrame: g.inheritFrame,
        shapes: g.shapes ? objectMap(g.shapes, (name, shape) => {
          // TODO: need to lower child groups first
          if (typeof shape === "function") {
            // TODO: not sure whether these casts are safe
            const loweredShapes = mapDataRelation(data[name as keyof T], shape as ((d: RelationInstance<T[keyof T]>) => ShapeValue));
            if (loweredShapes instanceof Array) {
              return createGroup({
                inheritFrame: true,
                shapes: loweredShapes.reduce((o, g, i) => ({
                  ...o, [i]: g
                }), {})
              });
            } else {
              return loweredShapes;
            }
          } else {
            return shape
          }
        }) : {},
        rels: g.rels,
      })) as keyof T extends never ? Group<{}> : ShapeFn<T>
    }
  });
};

export function createShape<Shapes extends ShapeRecord<Shapes, T>, T>(mark: Mark_): Mark
// TODO: refine this type? can determine which one of the two will be output
export function createShape<Shapes extends ShapeRecord<Shapes, T>, T>(group: Group_<Shapes, T>): keyof T extends never ? Group<{}> : ShapeFn<T>
export function createShape<Shapes extends ShapeRecord<Shapes, T>, T>(fn: ShapeFn<T>): ShapeFn<T>
export function createShape<Shapes extends ShapeRecord<Shapes, T>, T>(preShape: PreShape<Shapes, T>): Shape<T> {
  if (typeof preShape === 'function') {
    return preShape;
  } else if ('renderFn' in preShape) {
    return createMark(preShape);
  } else {
    return lowerGroup(createGroup(preShape));
  }
}

export type PreShape<Shapes extends ShapeRecord<Shapes, T>, T> = Mark_ | Group_<Shapes, T> | ShapeFn<T>

export type Shape<T> = ShapeValue | ShapeFn<T>

export type ShapeValue = Mark | Group<{}>
export type ShapeFn<T> = (data: T) => ShapeValue

const exampleMark: Mark = createShape({
  renderFn: (_a: any, _b: any) => ({}) as any
})

const exampleGroup: Shape<{ "bar": number }> = createShape({
  shapes: {
    "foo": exampleMark,
    "bar": (_x: number) => exampleMark,
  },
  rels: {
    "foo->bar": [],
    // "foo->baz": [],
  }
})

const exampleGroupInferredType: Shape<{ "bar": number }> = createShape({
  shapes: {
    "foo": exampleMark,
    "bar": (_x) => exampleMark,
  },
})

// const BADexampleGroup: Shape<{ "bar": number }> = createShape({
//   shapes: {
//     "foo": exampleMark,
//     "bar": (_x: string) => exampleMark,
//   },
// })

// const BADexampleGroup2: Shape<{ "bar": number }> = createShape({
//   shapes: {
//     "foo": (_x: number) => exampleMark,
//     "bar": (_x: number) => exampleMark,
//   },
// })

const exampleGroupValue: ShapeValue = createShape({
  shapes: {
    "foo": exampleMark,
    "bar": exampleMark,
  },
})

// const BADexampleGroupValue: Shape<{}> = createShape({
//   shapes: {
//     "foo": exampleMark,
//     "bar": (_x: number) => exampleMark,
//   },
// })

const exampleGroup2: Shape<{ "bar": number }> = createShape({
  shapes: {
    "foo": exampleMark,
    "bar": (_x: number) => exampleGroupValue,
  },
})

const lowerShapeRelation = <K extends string>(gr: ShapeRelation<K>): Compile.Relation[] => {
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

export const compileShapeValue = (g: ShapeValue | BFRef): Compile.Glyph => {
  if ("$ref" in g) {
    console.log("shape", g);
    return { $ref: true, path: g.path };
  } else {
    if (g.type === 'mark') {
      return {
        inheritFrame: g.inheritFrame ?? false,
        bbox: g.bbox,
        renderFn: g.renderFn,
        children: {},
        relations: undefined,
      };
    } else if (g.type === 'group') {
      const kont = g[KONT];
      return kont((g) => ({
        inheritFrame: g.inheritFrame ?? false,
        bbox: g.bbox,
        children: g.shapes ? objectMap(g.shapes, (_k, v) => compileShapeValue(v)) : {},
        relations: g.rels ? lowerShapeRelation(g.rels) : undefined,
      }))
    } else {
      throw "impossible"
    }
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

export function render(shape: ShapeValue): JSX.Element;
export function render<T extends RelativeBFValue>(data: T, shapeFn: ShapeFn<T>): JSX.Element;
export function render<T extends RelativeBFValue>(shapeOrData: ShapeValue | T, shapeFn?: ShapeFn<T>): JSX.Element {
  const shape = shapeFn ? shapeFn(makePathsAbsolute(shapeOrData as T) as T) : shapeOrData as ShapeValue;
  return renderAST(compileWithRef(compileShapeValue(shape)));
}
