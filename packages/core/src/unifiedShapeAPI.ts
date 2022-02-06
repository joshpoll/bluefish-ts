// import { Gestalt as Constraint, hSpace, alignCenterY, alignLeft, alignCenterX, vSpace, vAlignCenter } from './gestalt';
// import { BBoxValues, MaybeBBoxValues } from "./kiwiBBoxTransform";
// import * as Compile from './compileWithRef';
// import compileWithRef from './compileWithRef';
// import { objectMap, objectFilter } from "./objectMap";
// import _ from "lodash";
// import renderAST from './render';
// import { makePathsAbsolute, RelativeBFValue, RelativeBFRef } from './absoluteDataPaths';

// /// pre-amble ///
// // https://stackoverflow.com/a/49683575. merges record intersection types
// type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

// // type ShapeRelation<K extends Key> = { [key in `${K & (string | number)}->${K & (string | number)}`]?: Constraint[] };
// type ShapeRelation = { [key in `${string}->${string}`]?: Constraint[] };

// type Key = string | number | symbol;

// type ReservedKeywords = "$canvas" | "$object"

// const KONT = "KONT";

// // https://stackoverflow.com/a/50900933
// type AllowedFieldsWithType<Obj, Type> = {
//   [K in keyof Obj]: Obj[K] extends Type ? K : never
// };

// // https://stackoverflow.com/a/50900933
// type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj]

// type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, RelativeBFRef>>
// type ExtractRefKeys<T> = keyof T[ExtractFieldsOfType<T, RelativeBFRef>]

// /// relation semantics stuff ///
// export type Relation<T> = T[]

// // unwraps a Relation into a RelationInstance, and keeps RelationInstances unchanged
// type RelationInstance<T> = T extends Array<infer _> ? T[number] : T

// // ObjPath based on: https://twitter.com/SferaDev/status/1413761483213783045
// type StringKeys<O> = Extract<keyof O, string>;
// type NumberKeys<O> = Extract<keyof O, number>;

// type Values<O> = O[keyof O]

// type ObjPath<O> = O extends Array<unknown>
//   ? Values<{ [K in NumberKeys<O>]: `[${K}]` | `[${K}]${ObjPath<O[K]>}` }>
//   : O extends Record<string, unknown>
//   ? Values<{
//     [K in StringKeys<O>]: ObjPath<O[K]> extends "" ? `.${K}` : `.${K}${ObjPath<O[K]>}`
//   }>
//   : ""

// // https://stackoverflow.com/a/68487744
// type addPrefix<TKey, TPrefix extends string> = TKey extends string
//   ? `${TPrefix}${TKey}`
//   : never;

// type Ref<T, Field extends string & keyof T> = { $ref: true, path: addPrefix<ObjPath<T[Field]>, Field> }

// export type Mark = {
//   type: 'mark',
//   debugBBox?: boolean,
//   inheritFrame?: boolean,
//   bbox?: MaybeBBoxValues,
//   renderFn: (canvas: BBoxValues, index?: number) => JSX.Element,
// }

// export type Group = {
//   type: 'group',
//   debugBBox?: boolean,
//   inheritFrame?: boolean,
//   bbox?: MaybeBBoxValues,
//   shapes?: { [key: string]: ShapeValue | ShapeFn<RelationInstance<any>> },
//   rels?: ShapeRelation,
// }

// export type GroupValue = {
//   type: 'group',
//   debugBBox?: boolean,
//   inheritFrame?: boolean,
//   bbox?: MaybeBBoxValues,
//   shapes?: { [key: string]: ShapeValue },
//   rels?: ShapeRelation,
// }

// export type Shape = Mark | Group

// export type ShapeValue = Mark | GroupValue

// export type ShapeFn<T> = (d: T) => ShapeValue;

// /* TODO: make this better! */
// export const createShape = (s: any): Shape => ({
//   type: s.shapes ? 'group' : 'mark',
//   ...s
// })

// const exampleMark: Shape = {
//   type: 'mark',
//   renderFn: (_a: any, _b: any) => ({}) as any
// }

// const exampleGroup: Shape = {
//   type: 'group',
//   shapes: {
//     "foo": exampleMark,
//     "bar": (_x) => exampleMark,
//   },
// }

// const exampleGroupValue: Shape = {
//   type: 'group',
//   shapes: {
//     "foo": exampleMark,
//     "bar": exampleMark,
//   },
// }

// const exampleGroup2: Shape = {
//   type: 'group',
//   shapes: {
//     "foo": exampleMark,
//     "bar": (_x) => exampleGroupValue,
//   },
// }

// // // K must not use reserved keywords
// // // https://spin.atomicobject.com/2019/03/25/disjoint-unions-typescript-conditional-types/
// // export type Shape_<
// //   K extends object & Extract<keyof K, Reserved> extends never ? object : never,
// //   Reserved extends Key,
// //   > = {
// //     // inherit parent's coordinate frame. default is false
// //     // currently used only to make sets' encapsulation more transparent
// //     // this allows for smoother ramp from single element to set of elements
// //     inheritFrame?: boolean,
// //     bbox?: MaybeBBoxValues,
// //     renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
// //     [KONT]: (kont) => kont(exRecord_)
// //   });
// // }
// //     // shapes?: Record<keyof K, Shape>
// //     shapes?: { [key in keyof K]: Shape | HostShapeFn<RelationInstance<K[key]>> },
// //     rels?: ShapeRelation,
// //   }

// // export type Shape = {
// //   [KONT]: <R>(kont: <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never, >(_: Shape_<K, ReservedKeywords>) => R) => R,
// // }

// // export namespace Shape {
// //   export const create = <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never,>(exRecord_: Shape_<K, ReservedKeywords>): Shape => ({

// // ensures T and K have disjoint keys if T is an object type
// // https://spin.atomicobject.com/2019/03/25/disjoint-unions-typescript-conditional-types/
// type KConstraint<T, K> = T extends object
//   ? (Extract<keyof T, keyof K> extends never ? object : never)
//   : object

// // TODO: make a better type!
// export const lowerShape = (s: Shape): ShapeValue | ShapeFn<any> => {
//   if (s.type === 'mark') {
//     return s
//   }
//   const shapeFns = objectFilter(s.shapes, (_name, shape) => {
//     return typeof shape === "function";
//   });
//   if (Object.keys(shapeFns).length === 0) {
//     // shape value
//     return s as ShapeValue;
//   } else {
//     // shape function
//     return (data: any): ShapeValue => ({
//       type: 'group',
//       bbox: s.bbox,
//       inheritFrame: s.inheritFrame,
//       shapes: s.shapes ? objectMap(s.shapes, (name, shape) => {
//         if (typeof shape === "function") {
//           const loweredShapes = mapDataRelation(data[name], shape);
//           if (loweredShapes instanceof Array) {
//             return {
//               type: 'group',
//               inheritFrame: true,
//               shapes: loweredShapes.reduce((o, g, i) => ({
//                 ...o, [i]: g
//               }), {}) as { [key: string]: ShapeValue }
//             } as GroupValue;
//           } else {
//             return loweredShapes;
//           }
//         } else {
//           return shape
//         }
//       }) : {},
//       rels: s.rels,
//     })
//   }
// };

// const lowerShapeRelation = (gr: ShapeRelation): Compile.Relation[] => {
//   const rels = [];
//   for (const [k, gestalt] of Object.entries(gr)) {
//     const [left, right] = k.split('->');
//     rels.push({
//       left,
//       right,
//       gestalt,
//     })
//   }
//   /* TODO: more type safety */
//   return rels as Compile.Relation[];
// };

// export const compileShapeValue = <T>(g: ShapeValue | RelativeBFRef): Compile.Glyph => {
//   if ("$ref" in g) {
//     console.log("shape", g);
//     // TODO: really sus cast here
//     return { $ref: true, path: g.path as any };
//   } else {
//     if (g.type === 'mark') {
//       return {
//         inheritFrame: g.inheritFrame ?? false,
//         bbox: g.bbox,
//         renderFn: g.renderFn,
//         children: {},
//         relations: undefined,
//       };
//     } else if (g.type === 'group') {
//       return {
//         inheritFrame: g.inheritFrame ?? false,
//         bbox: g.bbox,
//         children: g.shapes ? objectMap(g.shapes, (k, v) => compileShapeValue(v)) : {},
//         relations: g.rels ? lowerShapeRelation(g.rels) : undefined,
//       };
//     } else {
//       throw "impossible"
//     }
//   }
// };

// // loses a bit of type safety b/c we _should_ be able to tell whether the return type is U or U[]
// // based on the input, but this type doesn't tell us
// // luckily this is only used internally. right???
// const mapDataRelation = <T, U>(r: T, f: (d: RelationInstance<T>) => U): U | Relation<U> => {
//   if (r instanceof Array) {
//     return r.map(f)
//   } else {
//     // TODO: this cast seems sus, but it might not be b/c we check for array in the first branch
//     return f(r as RelationInstance<T>)
//   }
// }

// type BluefishData =
//   | string
//   | number
//   | boolean
//   | null
//   | BluefishData[]
//   | { [key: string]: BluefishData }
// // | Ref<any, any>

// const parsePath = (path: string): (number | string)[] => path.split('/').map((s) => s === ".." ? -1 : !isNaN(parseFloat(s)) ? +s : s);

// // O extends Array<unknown>
// //   ? Values<{ [K in NumberKeys<O>]: `[${K}]` | `[${K}]${ObjPath<O[K]>}` }>
// //   : O extends Record<string, unknown>
// //   ? Values<{
// //     [K in StringKeys<O>]: ObjPath<O[K]> extends "" ? `.${K}` : `.${K}${ObjPath<O[K]>}`
// //   }>
// //   : ""

// // type PathTree = any;

// // type PathTree<T extends BluefishData> = T extends Array<infer _>
// //   ? { [key: number]: PathTree<T[number]> }
// //   : T extends object
// //   ? { [key in keyof T]: PathTree<T[key]> } : T;

// // const makePathTree = (data: BluefishData): PathTree => {
// //   if (Array.isArray(data)) {
// //     return data.reduce((o: PathTree, v, i) => ({
// //       ...o, [i]: makePathTree(v)
// //     }), {});
// //   } else if (typeof data === "object") {
// //     return objectMap(data, (k, v) => makePathTree(v));
// //   } else {
// //     return data;
// //   }
// // }

// // takes a relative path and makes it absolute
// // relative path must be of the form (more or less): (../)*([a-z0-9]+/)*
// // basically we allow ../, but only at the beginning (for simplicity of implementation)
// // and the rest is a local absolute path. neither piece is required
// const resolvePath = (pathList: (number | string)[], pathFromRoot: Key[]): string[] => {
//   if (pathList.length === 0) {
//     return pathFromRoot as string[];
//   } else {
//     const [hd, ...tl] = pathList;
//     if (hd === -1) {
//       // step up
//       return resolvePath(tl, pathFromRoot.slice(1));
//     } else {
//       // step down
//       return resolvePath(tl, [hd, ...pathFromRoot]);
//     }
//   }
// }

// // TODO: make refs to refs work???
// // TODO: 
// // TODO: makePathsAbsolute should be called in the compiler I think.
// // using this, bounding boxes can be looked up easily

// export type MyList<T> = {
//   elements: Relation<T>,
//   // TODO: can refine Ref type even more to say what it refers to
//   neighbors: Relation<{
//     curr: RelativeBFRef,
//     next: RelativeBFRef,
//   }>
// }

// export function render(shape: ShapeValue): JSX.Element;
// export function render<T extends RelativeBFValue>(data: T, shapeFn: ShapeFn<T>): JSX.Element;
// export function render<T extends RelativeBFValue>(shapeOrData: ShapeValue | T, shapeFn?: ShapeFn<T>): JSX.Element {
//   const shape = shapeFn ? shapeFn(makePathsAbsolute(shapeOrData as T) as T) : shapeOrData as ShapeValue;
//   return renderAST(compileWithRef(compileShapeValue(shape)));
// }

export { }
