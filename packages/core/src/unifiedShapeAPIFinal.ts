import { Gestalt as Constraint, hSpace, alignCenterY, alignLeft, alignCenterX, vSpace, vAlignCenter } from './gestalt';
import { BBoxValues, MaybeBBoxValues } from "./kiwiBBoxTransform";
import * as Compile from './compileWithRef';
import compileWithRef from './compileWithRef';
import { objectMap, objectFilter, objectMapKV } from "./objectMap";
import _ from "lodash";
import renderAST from './render';
import { makePathsAbsolute, RelativeBFValue, RelativeBFRef, BFRef, Ref } from './absoluteDataPaths';

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

type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, RelativeBFRef>>
type ExtractRefKeys<T> = keyof T[ExtractFieldsOfType<T, RelativeBFRef>]

/// relation semantics stuff ///
export type Relation<T> = T[]

// unwraps a Relation into a RelationInstance, and keeps RelationInstances unchanged
export type RelationInstance<T> = T extends Array<infer _> ? T[number] : T

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

// type Ref<T, Field extends string & keyof T> = { $ref: true, path: addPrefix<ObjPath<T[Field]>, Field> }

/* 
    // obj (nothing between $'s)
    $$foo: (obj) => M.nil(),
    // bar (pass bar between $'s)
    $bar$foo: (bar) => M.nil(),
    // foo (pun for $foo$foo)
    $foo$: (foo) => M.nil(),
    // not using this one so that obj and field are harder to mix up. can give error/warning about this one
    $foo: (foo) => M.nil(),
*/

type FunctionName = `$${string}$${string}`

const exampleFunctionName1: FunctionName = '$$foo';
const exampleFunctionName2: FunctionName = '$bar$foo';
const exampleFunctionName3: FunctionName = '$foo$';

const parseFunctionName = (s: string): FunctionName | null => {
  const splitString = s.split('$');
  if (splitString.length === 3 &&
    splitString[0] === "" &&
    (splitString[1] !== "" || splitString[2] !== "")) {
    return s as FunctionName;
  } else {
    return null;
  }
}

const getDataAndShapeNames = (s: FunctionName): [string | null, string] => {
  const splitString = s.split('$');
  if (isObjFunction(s)) {
    return [null, splitString[2]];
  } else if (isFieldFunction(s)) {
    return [splitString[1], splitString[2]];
  } else if (isFieldPunFunction(s)) {
    return [splitString[1], splitString[1]];
  } else {
    throw `Exception: unrecognized function name ${s}`
  }
}

const isObjFunction = (s: FunctionName): boolean => s.split('$')[1] === ""

const isFieldFunction = (s: FunctionName): boolean => !isObjFunction(s) && s.split('$')[2] !== ""

const isFieldPunFunction = (s: FunctionName): boolean => !isObjFunction(s) && s.split('$')[2] === ""

// doesn't typecheck!
// const exampleFunctionName4: FunctionName = '$foo';

type ShapeRecord2<Shapes, ShapeFns extends Record<FunctionName, any>> =
  /* should really be the instance thingy instead of T[key] */
  ({ [key in keyof ShapeFns]: ShapeEx<RelationInstance<ShapeFns[key]>> } &
    {
      [key in keyof Shapes]:
      // key extends "$data" ? Shape<RelationInstance<ShapeFns>> :
      key extends keyof ShapeFns ? ShapeEx<RelationInstance<ShapeFns[key]>> : ShapeValue }
  )

// TODO: read about how this works
// https://flut1.medium.com/deep-flatten-typescript-types-with-finite-recursion-cb79233d93ca
// https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type/50375286#50375286
type UnionToIntersection<U> = (U extends any
  ? (k: U) => void
  : never) extends ((k: infer I) => void)
  ? I
  : never;

// https://stackoverflow.com/a/54911272
type IsUnion<T> =
  [T] extends [UnionToIntersection<T>] ? false : true
type DisjointUnion<T extends { key: string }> =
  { [k in T["key"]]: IsUnion<Extract<T, { key: k }>> } extends { [k in T["key"]]: false } ? T : never;

// TODO: read about how this works
// https://flut1.medium.com/deep-flatten-typescript-types-with-finite-recursion-cb79233d93ca
type ValuesOf<T> = T[keyof T];
type ObjectValuesOf<T> = Exclude<
  Extract<ValuesOf<T>, object>,
  Array<any>
>;

type foo = {
  foo: {
    bar: string
  }
}

type fooFlattened = {
  bar: string
}

type Flatten<T> = UnionToIntersection<ObjectValuesOf<T>>;

type ShapeRecord3<Shapes, T> =
  /* TODO: add shape values back */
  /* TODO: add object functions using $$foo syntax  */
  (
    Flatten<{ [keyOuter in (string & keyof T)]: { [keyInner in `$${(keyOuter)}$${string}`]: T[keyOuter] extends Ref<any> ? 'ref' : ShapeEx<RelationInstance<T[keyOuter]>> } }>
    // { [key in `$${(keyof ShapeFns & string) | ""}$${string}`]: Shape<RelationInstance<ShapeFns[key]>> }

    & { [key in `$$${string}`]: ShapeEx<RelationInstance<T>> }

    /* TODO: add back */
    // &
    // { [key in keyof Shapes]:
    //   // key extends "$data" ? Shape<RelationInstance<ShapeFns>> :
    //   key extends keyof ShapeFns ? Shape<RelationInstance<ShapeFns[key]>> : ShapeValue }
  )

/* https://stackoverflow.com/a/57117594 (comments copied from there, too) */
// First, define a type that, when passed a union of keys, creates an object which 
// cannot have those properties. I couldn't find a way to use this type directly,
// but it can be used with the below type.
type Impossible<K extends keyof any> = {
  [P in K]: never;
};

// The secret sauce! Provide it the type that contains only the properties you want,
// and then a type that extends that type, based on what the caller provided
// using generics.
type NoExtraProperties<T, U extends T = T> = U & Impossible<Exclude<keyof U, keyof T>>;

type Foo = Exclude<string, `$${string}$${string}`>

import type { Except, Merge, SetRequired, Simplify } from 'type-fest';

type FooExcept = {
  unicorn: string;
  rainbow: boolean;
};

type FooWithoutRainbow = Except<FooExcept, 'rainbow'>;

type ShapeRecord4<Shapes, T> =
  (

    Simplify<Merge<
      // shapes
      { [key in Exclude<keyof Shapes, `$${string}$${string}`>]: ShapeValue },
      Simplify<Merge<
        // fields
        // Id<Merge<
        { [field in (string & keyof T) as`$${field}$${string}`]?: 'ref' | ShapeFn<RelationInstance<T[field]>> },
        // { [field in (string & keyof T) as`$${field}$`]?: 'ref' | ShapeFn<RelationInstance<T[field]>> }
        // >>,
        // objects
        { [key in `$$${string}`]?: 'ref' | ShapeFn<RelationInstance<T>> }
      >>
    >>
    // ensure/encourage that Shapes has the same keys as this record
    & { [key in keyof Shapes]: unknown }
    // & { [key in keyof Shapes]: 'ref' | ShapeValue | ShapeFn<any> }
  )

// like 4 but with stronger types for shape names so they can be enforced in relations
// TODO: this doesn't work with a shared S b/c TS expects _all_ keys with all S strings to be occupied
// e.g. if you have foo and $bar$bar, you must also have $bar$foo
// TODO: it also doesn't work with S, SF, and SO. For some reason they all infer foo. I need to make
// SF and SO more precise somehow...
type ShapeRecord5<
  Shapes,
  S extends string & Exclude<keyof Shapes, `$${string}$${string}`>,
  SF extends {},
  SO extends string,
  T> =
  (
    // shapes
    { [key in S]: Shapes[key] extends ShapeEx<{}> ? Shapes[key] : never }
    // fields
    & { [field in (string & keyof T) as `$${field}$${string & keyof SF}`]: 'ref' | ShapeEx<RelationInstance<T[field]>> }
    // objects
    & { [key in `$$${SO}`]: ShapeEx<RelationInstance<T>> }
    // ensure/encourage that Shapes has the same keys as this record
    & { [key in keyof Shapes]: unknown }
  )

export type Shape_<
  Shapes extends ShapeRecord4<Shapes, T>,
  // S extends string & Exclude<keyof Shapes, `$${string}$${string}`>,
  // SF extends {},
  // SO extends string,
  T> = {
    dataMap?: Compile.DataMap,
    isSet?: boolean,
    inheritFrame?: boolean,
    bbox?: MaybeBBoxValues,
    renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
    // shapes?: NoExtraProperties<ShapeRecord4<Shapes, T>, Shapes>,
    shapes?: NoExtraProperties<Shapes>,
    rels?: ShapeRelation,
  }

export type ShapeGroup<T> = {
  // maps data names to shape names
  // used to resolve references at shape time
  dataMap?: Compile.DataMap,
  isSet?: boolean,
  inheritFrame?: boolean,
  bbox?: MaybeBBoxValues,
  renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
  shapes?: any, /* TODO */
  rels?: ShapeRelation,
}

export type ShapeEx<T> = ShapeGroup<T> | ({} extends T ? never : ShapeFn<T>)

export type ShapeFn<T> = (data: T) => ShapeValue;

export type ShapeValue = ShapeGroup<{}>

export type Shape<T> = {} extends T ? ShapeValue : ShapeFn<T>;

export function lowerShape<T>(g: 'ref'): T extends Ref<any> ? 'ref' : never
export function lowerShape<T>(g: ShapeEx<T>): Shape<T>
export function lowerShape<T>(g: ShapeEx<T> | 'ref'): T extends Ref<any> ? 'ref' : Shape<T> {
  // TODO: remove this cast?
  // this cast is here b/c the input could be a shape function where T is never
  if (g === 'ref') return 'ref' as T extends Ref<any> ? 'ref' : Shape<T>;
  if (typeof g === 'function') return g as unknown as T extends Ref<any> ? 'ref' : Shape<T>;
  // recursively visit child shapes
  let /* it */ go = {
    ...g,
    shapes: g.shapes ?
      objectMap(g.shapes, (_, g) => {
        return lowerShape(g);
      }) : {}
  };
  const shapeFns = objectFilter(go.shapes, (_name, shape) => {
    return typeof shape === "function" || shape === 'ref';
  });
  // TODO: add some checks here to ensure that function names are correct and that non-function
  // names are correct. Can parse them actually, but might not be necessary.
  if (Object.keys(shapeFns).length === 0) {
    // shape value
    return go as T extends Ref<any> ? 'ref' : Shape<T>;
  } else {
    // remove refs. TODO: maybe add more complex behavior for refs?
    // go = { ...go, shapes: objectFilter(go.shapes, (_k, v) => v !== 'ref') as { [x: string]: ShapeObject<{}> } }
    // shape function
    const dataMap: Compile.DataMap = {};
    return ((data: T): ShapeValue => ({
      dataMap,
      bbox: go.bbox,
      inheritFrame: go.inheritFrame,
      shapes: go.shapes ? objectMapKV(go.shapes, (name, shape: any) => {
        if (typeof shape === "function" || shape === 'ref') {
          // TODO: remove casts
          if (parseFunctionName(name as string) === null) {
            throw `Error: Expected ${name.toString()} to be a function.`
          }
          const [dataName, shapeName] = getDataAndShapeNames(name as FunctionName);
          dataMap[dataName ?? ""] = shapeName;
          console.log("name, data, shape", name, dataName, shapeName);
          const shapeData = dataName === null ? data : data[dataName as keyof T];
          const loweredShapes = mapDataRelation(shapeData, shape as ((d: RelationInstance<T[keyof T] | T>) => ShapeValue));
          if (loweredShapes instanceof Array) {
            return [shapeName, hideShapesType({
              dataMap: Object.fromEntries(_.range(loweredShapes.length).map((i) => [i.toString(), i.toString()])),
              isSet: true,
              inheritFrame: true,
              shapes: loweredShapes.reduce((o, go, i) => ({
                ...o, [i]: go
              }), {}) as any /* TODO: remove */
            })];
          } else {
            return [shapeName, loweredShapes];
          }
        } else {
          // TODO: somewhere is inferring that `name` can be a symbol, which is wrong
          return [name as string | number, shape];
        }
      }) : {},
      rels: go.rels,
    })) as T extends Ref<any> ? 'ref' : Shape<T>
  }
};

// Shapes is inferred by this function. It acts as an existential type.
// Currently Shapes is only used to typecheck `rels` based on field names in `shapes`.
// Well that's what it would be for if that was implemented...
const hideShapesType = <
  Shapes extends ShapeRecord4<Shapes, T>,
  // S extends string & Exclude<keyof Shapes, `$${string}$${string}`>,
  // SF extends {},
  // SO extends string,
  T>(shape_: Shape_<Shapes, T>): ShapeEx<T> => shape_;

export const createShape = <
  Shapes extends ShapeRecord4<Shapes, T>,
  // S extends string & Exclude<keyof Shapes, `$${string}$${string}`>,
  // SF extends {},
  // SO extends string,
  T>(shape_: Shape_<Shapes, T>): Shape<T> => lowerShape(hideShapesType(shape_));

namespace test {
  const newExampleMark: ShapeValue = hideShapesType({
    renderFn: (_a: any, _b: any) => ({}) as any
  })

  type ExampleShapeType = {
    foo: ShapeValue,
    bar: ShapeValue,
    $$foo: ShapeValue;
    $bar$bar: (_x: number) => ShapeValue;
  };

  type IsolateShapeValues<Shapes> = Exclude<keyof Shapes, `$${string}$${string}`>;

  type ExcludedShapeType = IsolateShapeValues<ExampleShapeType>;

  type Foo = ShapeRecord4<{
    foo: (_x: any) => ShapeValue;
    $bar$bar: (_x: number) => ShapeValue;
  }, {
    bar: number;
  }>

  const newExampleGroup: ShapeEx<{ "bar": number }> = hideShapesType({
    shapes: {
      // "foo": (_x) => newExampleMark,
      "foo": newExampleMark,
      "$bar$bar": (_x: number) => newExampleMark,
    },
  })

  const _foo: Shape<{ 'bar': number }> = createShape({
    shapes: {
      "foo": newExampleMark,
      // "$bar$bar": (_x) => newExampleMark,
      "$$baz": (_x: { 'bar': number }) => newExampleMark,
    }
  })

  // fails... makes sense b/c there's no other info.
  // const newExampleGroupInferredFailure = hideShapesType({
  //   shapes: {
  //     // "foo": (_x) => newExampleMark,
  //     "foo": newExampleMark,
  //     "$bar$bar": (_x) => newExampleMark,
  //   },
  // })

  // fails... makes sense I guess.
  // const newExampleGroupInferredFailure2 = hideShapesType({
  //   shapes: {
  //     // "foo": (_x) => newExampleMark,
  //     "foo": newExampleMark,
  //     "$bar$bar": (_x) => { console.log(_x + 5); return newExampleMark },
  //   },
  // })

  // this fails, too so I guess TS can't infer this anyway...
  // const foobar = (x) => x + 5;

  const newExampleGroupObjectFunction: ShapeEx<{ "bar": number }> = hideShapesType({
    shapes: {
      "foo": newExampleMark,
      "$$bar": (_x) => newExampleMark,
    },
  })

  const newExampleGroupFieldFunctionPunning: ShapeEx<{ "bar": number }> = hideShapesType({
    shapes: {
      "foo": newExampleMark,
      "$bar$": (_x) => newExampleMark,
    },
  })

  // const exampleGroupInferredType: Shape<{ "bar": number }> = createShape({
  //   shapes: {
  //     "foo": newExampleMark,
  //     "bar": (_x) => newExampleMark,
  //   },
  // })

  // const BADexampleGroup: Shape<{ "bar": number }> = createShape({
  //   shapes: {
  //     "foo": newExampleMark,
  //     "$bar$": (_x: string) => newExampleMark,
  //   },
  // })

  // const BADexampleGroup2: Shape<{ "bar": number }> = createShape({
  //   shapes: {
  //     "$foo$": (_x) => newExampleMark,
  //     "$bar$": (_x) => newExampleMark,
  //   },
  // })

  // const exampleGroupValue: ShapeValue = createShape({
  //   shapes: {
  //     "foo": exampleMark,
  //     "bar": exampleMark,
  //   },
  // })

  // const BADexampleGroupValue: Shape<{}> = createShape({
  //   shapes: {
  //     "foo": exampleMark,
  //     "bar": (_x: number) => exampleMark,
  //   },
  // })

  // const exampleGroup2: Shape<{ "bar": number }> = createShape({
  //   shapes: {
  //     "foo": exampleMark,
  //     "bar": (_x: number) => exampleGroupValue,
  //     // "$data": (_x: { "bar": number }) => exampleGroupValue,
  //   },
  // })
}

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

export const compileShapeValue = (g: ShapeValue | BFRef): Compile.Glyph => {
  if ("$ref" in g) {
    console.log("shape", g);
    return { $ref: true, path: g.path };
  } else {
    return {
      dataMap: g.dataMap ?? {},
      isSet: g.isSet ?? false,
      inheritFrame: g.inheritFrame ?? false,
      bbox: g.bbox,
      renderFn: g.renderFn,
      children: g.shapes ? objectMap(g.shapes, (_k, v) => compileShapeValue(v)) : {},
      relations: g.rels ? lowerShapeRelation(g.rels) : undefined,
    }
  }
};

// loses a bit of type safety b/c we _should_ be able to tell whether the return type is U or U[]
// based on the input, but this type doesn't tell us
// luckily this is only used internally. right???
const mapDataRelation = <T, U>(r: T, f: 'ref' | ((d: RelationInstance<T>) => U)): U | Relation<U> => {
  if (f === 'ref') {
    return r as unknown as U; /* THIS CAST IS A DUMB HACK */
  } else {
    if (r instanceof Array) {
      return r.map(f)
    } else {
      // TODO: this cast seems sus, but it might not be b/c we check for array in the first branch
      return f(r as RelationInstance<T>)
    }
  }
}

export function render(shape: ShapeValue): JSX.Element;
export function render<T extends RelativeBFValue>(data: T, shapeFn: ShapeFn<T>): JSX.Element;
export function render<T extends RelativeBFValue>(shapeOrData: ShapeValue | T, shapeFn?: ShapeFn<T>): JSX.Element {
  const shape = shapeFn ? shapeFn(makePathsAbsolute(shapeOrData as T) as T) : shapeOrData as ShapeValue;
  return renderAST(compileWithRef(compileShapeValue(shape)));
}
