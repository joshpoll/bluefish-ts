export { }
// import { Gestalt as Constraint, hSpace, alignCenterY, alignLeft, alignCenterX, vSpace, vAlignCenter } from './gestalt';
// import { BBoxValues, MaybeBBoxValues } from "./kiwiBBoxTransform";
// import * as Compile from './compileWithRef';
// import { objectMap, objectFilter } from "./objectMap";
// import _ from "lodash";

// /// pre-amble ///
// // https://stackoverflow.com/a/49683575. merges record intersection types
// type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

// type GlyphRelation<K extends Key> = { fields: K[], constraints: Constraint[] };

// type Key = string | number | symbol;

// type ReservedKeywords = "$canvas" | "$object"

// const KONT = "KONT";

// // https://stackoverflow.com/a/50900933
// type AllowedFieldsWithType<Obj, Type> = {
//   [K in keyof Obj]: Obj[K] extends Type ? K : never
// };

// // https://stackoverflow.com/a/50900933
// type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj]

// type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, MyRef>>
// type ExtractRefKeys<T> = keyof T[ExtractFieldsOfType<T, MyRef>]

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

// // K must not use reserved keywords
// // https://spin.atomicobject.com/2019/03/25/disjoint-unions-typescript-conditional-types/
// export type Glyph_<
//   K extends object & Extract<keyof K, Reserved> extends never ? object : never,
//   Reserved extends Key,
//   > = {
//     bbox?: MaybeBBoxValues,
//     renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//     glyphs?: Record<keyof K, Glyph>
//     relations?: GlyphRelation<Reserved | keyof K>[],
//   }

// export type Glyph = {
//   [KONT]: <R>(kont: <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never, >(_: Glyph_<K, ReservedKeywords>) => R) => R,
// }

// export namespace Glyph {
//   export const mk = <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never,>(exRecord_: Glyph_<K, ReservedKeywords>): Glyph => ({
//     [KONT]: (kont) => kont(exRecord_)
//   });

//   export const fromCompileGlyph = (g: Compile.GlyphNoRef): Glyph => mk({
//     bbox: g.bbox,
//     renderFn: g.renderFn,
//     glyphs: objectMap(g.children, (k, v) => fromCompileGlyph(v)),
//     relations: g.relations?.map(({ left, right, gestalt }) => ({ fields: [left, right], constraints: gestalt }))
//   })

//   export const inhabited: Glyph = mk({});
// }

// type HostGlyphFn<T> = (d: T) => Glyph;

// // ensures T and K have disjoint keys if T is an object type
// // https://spin.atomicobject.com/2019/03/25/disjoint-unions-typescript-conditional-types/
// type KConstraint<T, K> = T extends object
//   ? (Extract<keyof T, keyof K> extends never ? object : never)
//   : object

// // TODOs:
// // - need to test more examples
// // - need to implement refs
// export type GlyphFn_<
//   T,
//   K extends KConstraint<T, K>
//   > =
//   T extends object ?
//   (
//     // an arbitrary function taking in data and producing a glyph
//     HostGlyphFn<T> |
//     // old-style making some arbitrary glyphs and putting some relations between them
//     // TODO: Adding the ExtractRefKeys<T> breaks the type inference for the other unions???
//     Glyph_<K, ReservedKeywords/*  | ExtractRefKeys<T> */> |
//     // you want to write some old-style glyphs, but also you want a data-driven object
//     // supports primitives and records
//     // the objectGlyph has a special name that can be used in relations
//     // TODO: should objectGlyph only be a HostGlyphFn<T> or a GlyphFn<T> more generally?
//     // I will generalize it for now so that everywhere you make a GlyphFn you have to call GlyphFn.mk
//     Id<Glyph_<K, ReservedKeywords/*  | ExtractRefKeys<T> */> & { objectGlyph: GlyphFn<T> }> |
//     // you might want to write some old-style glyphs and you want a data-driven record where each
//     // field is rendered as a separate glyph
//     Id<Glyph_<K, ReservedKeywords | keyof T> & { fieldGlyphs: { [key in keyof OmitRef<T>]: GlyphFn<RelationInstance<T[key]>> } }> |
//     // combining both!
//     Id<Glyph_<K, ReservedKeywords | keyof T> & { objectGlyph: GlyphFn<T> } & { fieldGlyphs: { [key in keyof OmitRef<T>]: GlyphFn<RelationInstance<T[key]>> } }>
//   ) : (
//     // same as above except no fieldGlyphs
//     HostGlyphFn<T> |
//     Glyph_<K, ReservedKeywords> |
//     Id<Glyph_<K, ReservedKeywords> & { objectGlyph: GlyphFn<T> }>
//   )

// export type GlyphFn<T> = {
//   [KONT]: <R>(kont: <K extends KConstraint<T, K>>(_: GlyphFn_<T, K>) => R) => R,
// }

// export namespace GlyphFn {
//   export const mk = <T, K extends KConstraint<T, K>>(exRecord_: GlyphFn_<T, K>): GlyphFn<T> => ({
//     [KONT]: (kont) => kont(exRecord_)
//   });

//   export const inhabited: GlyphFn<{}> = mk({
//     fieldGlyphs: {},
//     relations: [],
//   });
// }

// const lowerGlyphRelation = <K extends Key>(gr: GlyphRelation<K>): Compile.Relation => ({
//   left: gr.fields[0].toString(),
//   right: gr.fields[1].toString(),
//   gestalt: gr.constraints,
// });

// export const lowerGlyph = <T>(g: Glyph): Compile.Glyph => {
//   const kont = g[KONT];
//   const glyph_ = kont((x: Glyph_<any, ReservedKeywords>) => x);
//   return {
//     bbox: glyph_.bbox,
//     renderFn: glyph_.renderFn,
//     children: glyph_.glyphs ? objectMap(glyph_.glyphs, (k, v) => lowerGlyph(v)) : {},
//     relations: glyph_.relations?.map(lowerGlyphRelation),
//   };
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

// // for a given relation instance, gather its ref fields so that we can lower them through the
// // relation visualizations
// // TODO: implementing refs properly will take a bit of thought!!!

// // TODO: this function is kind of unsafe b/c it doesn't maintain the relations fields invariant and
// // it introduces a $object glyph
// export const glyphFnToHostGlyphFn = <T>(gf: GlyphFn<T>): HostGlyphFn<T> => {
//   const kont = gf[KONT];
//   return kont((gf: GlyphFn_<T, any>): HostGlyphFn<T> => {
//     if (typeof gf === "function") {
//       return gf;
//     } else {
//       return (data: T): Glyph => Glyph.mk({
//         bbox: gf.bbox,
//         renderFn: gf.renderFn,
//         glyphs: {
//           // fieldGlyphs
//           // TODO: is it possible to get rid of this `any`?
//           ...("fieldGlyphs" in gf ? objectMap(gf.fieldGlyphs, (k, v: GlyphFn<RelationInstance<T[any]>>) => {
//             const loweredGlyphs = mapDataRelation(data[k], glyphFnToHostGlyphFn(v));
//             if (loweredGlyphs instanceof Array) {
//               return Glyph.mk({
//                 glyphs: loweredGlyphs.reduce((o, g, i) => ({
//                   ...o, [i]: g
//                 }), {})
//               });
//             } else {
//               return loweredGlyphs;
//             }
//           }) : {}),
//           /* TODO: this is wrong, but removing it is wrong, too */
//           // refs
//           ...(typeof data === "object" ? objectFilter(data, (k, v) => (typeof v === "object") && ("$ref" in v)) : {}),
//           // glyphs
//           ...gf.glyphs,
//           // objectGlyph
//           ...("objectGlyph" in gf ? { "$object": glyphFnToHostGlyphFn(gf.objectGlyph)(data) } as any : {}),
//         },
//         relations: gf.relations as any,
//       });
//     }
//   })
// }

// // TODO: maybe want to use RelationInstances here, but it seems like it's subtle to do that well so
// // we will defer it
// export const lowerGlyphFn = <T>(gf: GlyphFn<T>): ((data: T) => Compile.Glyph) => {
//   const kont = gf[KONT];
//   return kont((gf: GlyphFn_<T, any>): ((data: T) => Compile.Glyph) =>
//     (data: T) => {
//       if (typeof gf === "function") {
//         // HostGlyphFn
//         return lowerGlyph(gf(data));
//       } else {
//         return {
//           bbox: gf.bbox,
//           renderFn: gf.renderFn,
//           children: {
//             // fieldGlyphs
//             // TODO: is it possible to get rid of this `any`?
//             ...("fieldGlyphs" in gf ? objectMap(gf.fieldGlyphs, (k, v: GlyphFn<RelationInstance<T[any]>>) => {
//               const loweredGlyphs = mapDataRelation(data[k], lowerGlyphFn(v));
//               if (loweredGlyphs instanceof Array) {
//                 return {
//                   children: loweredGlyphs.reduce((o, g, i) => ({
//                     ...o, [i]: g
//                   }), {})
//                 };
//               } else {
//                 return loweredGlyphs;
//               }
//             }) : {}),
//             // refs
//             ...(typeof data === "object" ? objectFilter(data, (k, v) => (typeof v === "object") && ("$ref" in v)) : {}),
//             // glyphs
//             ...(gf.glyphs ? objectMap(gf.glyphs, (_k, v) => lowerGlyph(v)) : {}),
//             // objectGlyph
//             ...("objectGlyph" in gf ? { "$object": lowerGlyphFn(gf.objectGlyph)(data) } : {}),
//           },
//           relations: gf.relations?.map(lowerGlyphRelation),
//         }
//       }
//     })
// };

// export type MyRef = {
//   $ref: true,
//   path: string,
// }

// export const mkMyRef = (path: string): MyRef => ({
//   $ref: true,
//   path,
// })

// // TODO: to get refs to work, I think all I need to do is push them into the relations as paths!!
// // ok but maybe instead resolve all paths to absolute paths from top-level input
// // then push those absolute paths into the relations
// // then resolve those absolute paths in the compiler?

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

// const makePathsAbsolute = (data: BluefishData, pathFromRoot: Key[] = []): BluefishData => {
//   console.log("current path from root", pathFromRoot);
//   if (data === null) {
//     return data
//   } else if (Array.isArray(data)) { // array/relation
//     return data.map((d, i) => makePathsAbsolute(d, [i, ...pathFromRoot]));
//   } else if (typeof data === "object" && !("$ref" in data)) { // object/record/instance
//     return objectMap(data, (k, v) => makePathsAbsolute(v, [k, ...pathFromRoot]))
//   } else if (typeof data === "object") { // ref (where the actual work is done!)
//     const ref = data as unknown as Ref<any, any>;
//     console.log("making this ref absolute", ref, pathFromRoot);
//     const pathList = parsePath(ref.path);
//     // automatically bump one level up when resolving paths
//     const absolutePath = resolvePath(pathList, pathFromRoot.slice(1));
//     console.log("absolute path", absolutePath);
//     return { $ref: true, path: absolutePath };
//   } else {
//     return data;
//   }
// }

// // TODO: make refs to refs work???
// // TODO: 
// // TODO: makePathsAbsolute should be called in the compiler I think.
// // using this, bounding boxes can be looked up easily

// // like lowerGlyphFn, but makes paths absolute
// export const compileGlyphFn = <T>(gf: GlyphFn<T>) =>
//   (data: T): Compile.Glyph => lowerGlyphFn(gf)(makePathsAbsolute(data as unknown as BluefishData) as unknown as T)

// export type MyList<T> = {
//   elements: Relation<T>,
//   // TODO: can refine Ref type even more to say what it refers to
//   neighbors: Relation<{
//     curr: MyRef,
//     next: MyRef,
//   }>
// }
