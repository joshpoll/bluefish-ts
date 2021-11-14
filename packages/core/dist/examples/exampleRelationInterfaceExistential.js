// const data = { color1: "firebrick", color2: "steelblue", color3: "black" };
// const example: Glyph = {
//   /* bbox: {
//     width: 800,
//     height: 700,
//   }, */
//   children: {
//     /* TODO: maybe make RHS a _list_ of glyphs? */
//     "topRect": rect({ width: 500 / 3, height: 200 / 3, fill: data.color1 }),
//     "bottomEllipse": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: data.color2 }),
//     "rightEllipse": ellipse({ rx: 50, ry: 50, fill: data.color3 }),
//     "some text": text({ contents: "hello world!", fontSize: "calc(10px + 2vmin)" }),
//   },
//   relations: [
//     // e.g. "topRect" refers to the bbox of the "topRect" glyph defined above
//     { left: "topRect", right: "bottomEllipse", gestalt: [vSpace(50.)] },
//     { left: "topRect", right: "rightEllipse", gestalt: [hSpace(50.), alignCenterY] },
//     { left: "rightEllipse", right: "some text", gestalt: [vSpace(50.), alignCenterX] },
//     { left: "canvas", right: "topRect", gestalt: [alignLeft] },
//   ]
// }
// /* 
// {
//   data: Relation
//   glyphs?: (d: RelationInstance) => Glyph[]
//   relations?: (d: RelationInstance) => Gestalt[]
// }
// {
//   data: Relation,
//   render: (d: RelationInstance) => {glyphs: Glyph[], gestalts: Gestalt[]}
// }
// {
//   data: Relation,
//   // maybe keys are glyph names or maybe they are fields in the relation
//   // the problem is what do you do in the base case when you want multiple fields to drive the same glyph?
//   // e.g. content of text as well as its styling
//   // maybe either use the whole record for one glyph or have one glyph per field?
//   // maybe instead the inputs to the Glyph are field accessors? but why. I guess it's easier to reason about
//   // because an instance is an object (which is a complex glyph of its fields)
//   // you can use a complex field to drive a single glyph here
//   // but what about just having the whole instance drive a single glyph?
//   // "simple" glyph: entire instance generates one glyph
//   // "complex" glyph: each field generates one glyph
//   glyphs?: (d: RelationInstance) => Glyph | { glyphs: { [key: string]: Glyph }, relations: Gestalt[] }
//   // because an instance is a relation between its fields
//   // relations?: (d: RelationInstance) => Gestalt[]
// }
// */
// type RelationInstanceE = { [key: string]: RelationInstanceE | Relation | number | string }
// // each instance must have the same type
// type RelationE<T> = T[];
// type GestaltE = Relation;
// type GlyphE<T> = { glyphs: { [key in keyof T]: Mark/* GlyphE */ }, gestalt: GestaltE[] };
// // E for experimental!
// type GlyphRelationE<T> = {
//   data: RelationE<T>,
//   // render?: (ri: T) => Mark | { glyphs: { [key: string]: Glyph/* E */ }, gestalt: GestaltE[] }
//   render?: (ri: T) => /* Mark | */ GlyphE<T>
// }
// export type GlyphArray<T> = {
//   data: T[],
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   childGlyphs: (d: T, i: number) => Glyph,
//   listGestalt: Constraint[],
//   relations?: Relation[]
// }
// // TODO: is there a nicer way to handle 0-length lists?
// const glyphArrayToGlyph = <T>(glyphArray: GlyphArray<T>): Glyph => {
//   if (glyphArray.data.length === 0) {
//     return nil();
//   } else {
//     return {
//       bbox: glyphArray.bbox,
//       renderFn: glyphArray.renderFn,
//       children: glyphArray.data
//         .reduce((o: { [key: string]: Glyph }, data: T, i) => ({ ...o, [i]: glyphArray.childGlyphs(data, i) }),
//           {}),
//       relations: [
//         ...zipWith(
//           _.range(glyphArray.data.length - 1),
//           _.range(1, glyphArray.data.length),
//           (curr, next) => ({ left: curr.toString(), right: next.toString(), gestalt: glyphArray.listGestalt })
//         ),
//         ...glyphArray.relations ?? [],
//       ]
//     }
//   }
// }
// const glyphEToGlyph = <T>(ge: GlyphE<T>): Glyph => ({
//   children: ge.glyphs,
//   relations: ge.gestalt,
// });
// const glyphRelationEToGlyphArray = <T>(ge: GlyphRelationE<T>): GlyphArray<T> => ({
//   data: ge.data,
//   childGlyphs: (d: T) => {
//     if (ge.render === undefined) {
//       return nil()
//     } else {
//       const rendered = ge.render(d);
//       return glyphEToGlyph(rendered);
//     }
//   },
//   listGestalt: [],
// })
// type myData = { color1: string, color2: string, color3: string, text: string };
// export const exampleRelationInterface: Glyph = glyphArrayToGlyph(glyphRelationEToGlyphArray({
//   data: [{ color1: "firebrick", color2: "steelblue", color3: "black", text: "hello world!" }],
//   render: (ri: myData) => (
//     {
//       glyphs: {
//         "color1": rect({ width: 500 / 3, height: 200 / 3, fill: ri.color1 }),
//         "color2": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: ri.color2 }),
//         "color3": ellipse({ rx: 50, ry: 50, fill: ri.color3 }),
//         "text": text({ contents: ri.text, fontSize: "calc(10px + 2vmin)" }),
//       },
//       gestalt: [
//         // e.g. "color1" refers to the bbox of the "color1" glyph defined above
//         { left: "color1", right: "color2", gestalt: [vSpace(50.)] },
//         { left: "color1", right: "color3", gestalt: [hSpace(50.), alignCenterY] },
//         { left: "color3", right: "text", gestalt: [vSpace(50.), alignCenterX] },
//         { left: "canvas", right: "color1", gestalt: [alignLeft] },
//       ]
//     }
//   )
// }))
// type RelationE2<T> = T[]
// // unwraps a Relation into a RelationInstance, and keeps RelationInstances unchanged
// type RelationInstanceE2<T> = T extends Array<infer _> ? T[number] : T
// // https://stackoverflow.com/a/50900933
// type AllowedFieldsWithType<Obj, Type> = {
//   [K in keyof Obj]: Obj[K] extends Type ? K : never
// };
// // https://stackoverflow.com/a/50900933
// type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj]
// type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, Ref<any, any>>>
// type MarkE2 = {
//   bbox: MaybeBBoxValues,
//   renderFn: (canvas: BBoxValues, index?: number) => JSX.Element,
// }
// // https://stackoverflow.com/a/49683575. merges record intersection types
// type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never
// type GlyphE2<T> = /* Glyph |  */SimpleGlyph<T> | ComplexGlyph<T>
// type HostGlyphFn<T> = (d: T) => Glyph;
// type BanKeys<T, K extends string | number | symbol> = Id<Omit<T, K> & { [key in K]?: never }>
// type GlyphRelation<K extends Key> = { fields: [K, K], constraints: Constraint[] };
// type Key = string | number | symbol;
// // https://spin.atomicobject.com/2019/03/25/disjoint-unions-typescript-conditional-types/
// type DisjointKeys<K1, K2> = Extract<K1, K2> extends never ? Key : never;
// // TODO: should be existential!!
// export type GlyphV2<K extends Key> = {
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   glyphs?: Id<Omit<{ [key in K]: GlyphV2<K> }, "$canvas">>,
//   relations?: GlyphRelation<K>[]
// }
// type ReservedKeywords = "$canvas" | "$object"
// // https://spin.atomicobject.com/2019/03/25/disjoint-unions-typescript-conditional-types/
// export type GlyphV3<
//   // K cannot contain reserved keywords or other keywords we define
//   K extends /* DisjointKeys<K, ReservedKeywords> &  */DisjointKeys<K, Reserved>,
//   Reserved extends Key,
//   R extends K | Reserved,
//   > = {
//     bbox?: MaybeBBoxValues,
//     renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//     // glyphs?: Id<Omit<{ [key in K]: GlyphV3<K, "$canvas"> }, Reserved>>,
//     // TODO: K should _change_ on the recursive call, which means it must be existential!!!
//     glyphs?: BanKeys<{ [key in K]: GlyphV3<K & DisjointKeys<K, ReservedKeywords>, ReservedKeywords, K & DisjointKeys<K, ReservedKeywords> | ReservedKeywords> }, Reserved>,
//     // glyphs?: { [key in K]: GlyphV3<K & DisjointKeys<K, ReservedKeywords>, ReservedKeywords> },
//     relations?: GlyphRelation<R>[],
//   }
// type Foo = Extract<"$canvas", "$canvas">
// export type GlyphV4<
//   // K extends R,
//   // // K extends Extract<"$canvas", "$canvas"> extends never ? Key : never,
//   // Reserved extends Key,
//   // R extends Key,
//   // K extends object,
//   K extends object & Extract<keyof K, Reserved> extends never ? {} : never,
//   // Reserved extends Key & DisjointKeys<keyof K, Reserved>,
//   Reserved extends Key,
//   > = {
//     bbox?: MaybeBBoxValues,
//     renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//     glyphs?: Record<keyof K, GlyphV4<string, ReservedKeywords>> /* TODO: fix this! it needs to be existential */,
//     // glyphs?: BanKeys<{ [key in K]: GlyphV4<K, Reserved, R> /* TODO: fix this! */ }, Reserved>,
//     relations?: GlyphRelation<Reserved | keyof K>[],
//   }
// // // TODO: this type looks like it has good bones! now make the types better so it can match the power
// // //   of GlyphE2
// // type GlyphFnOld<T, K extends Key> =
// //   // an arbitrary function taking in data and producing a glyph
// //   HostGlyphFn<T> |
// //   // old-style making some arbitrary glyphs and putting some relations between them
// //   GlyphV3<K & DisjointKeys<K, "$canvas">, "$canvas"> |
// //   Id<GlyphV3<K & DisjointKeys<K, "$canvas" | "$object">, "$canvas" | "$object"> & { objectGlyph: HostGlyphFn<T> }> |
// //   Id<{
// //     bbox?: MaybeBBoxValues,
// //     renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
// //   } & (
// //       // you want to write some old-style glyphs, but also you want a data-driven object
// //       // supports primitives and records
// //       // the objectGlyph has a special name that can be used in relations
// //       // TODO: maybe keep glyphs optional here even though it's redundant with SimpleGlyph<T>?
// //       {
// //         glyphs: Id<Omit<{ [key in K]: Glyph }, "$canvas" | "$object">>,
// //         objectGlyph: HostGlyphFn<T>,
// //         relations?: GlyphRelation<K | "$canvas" | "$object">[],
// //         // relations?: { fields: [K | "$canvas" | "$object", K | "$canvas" | "$object"], constraints: Constraint[] }[]
// //       } |
// //       // you might want to write some old-style glyphs and you want a data-driven record where each
// //       // field is rendered as a separate glyph
// //       {
// //         glyphs: Id<Omit<{ [key in K]: Glyph }, keyof T | "$canvas">>,
// //         fieldGlyphs: { [key in keyof OmitRef<T>]: GlyphE2<RelationInstanceE2<T[key]>> },
// //         relations?: GlyphRelation<K | keyof T | "$canvas">[],
// //         // relations?: { fields: [K | keyof T | "$canvas", K | keyof T | "$canvas"], constraints: Constraint[] }[]
// //       } |
// //       {
// //         glyphs: Id<Omit<{ [key in K]: Glyph }, keyof T | "$canvas" | "$object">>,
// //         objectGlyph: HostGlyphFn<T>,
// //         fieldGlyphs: { [key in keyof OmitRef<T>]: GlyphE2<RelationInstanceE2<T[key]>> },
// //         relations?: GlyphRelation<K | keyof T | "$canvas" | "$object">[],
// //         // relations?: { fields: [K | keyof T | "$canvas" | "$object", K | keyof T | "$canvas" | "$object"], constraints: Constraint[] }[]
// //       }
// //     )>
// // type Reserved<T> = ReservedKeywords | (T extends object ? keyof T : never)
// // TODO: this type looks like it has good bones! now make the types better so it can match the power
// //   of GlyphE2
// type GlyphFn_<
//   T,
//   // K extends
//   // Key &
//   // DisjointKeys<K, "$canvas"> &
//   // DisjointKeys<K, "$object"> &
//   // DisjointKeys<K, T extends object ? keyof T : never>
//   K extends object,
//   > =
//   T extends object ?
//   (
//     // an arbitrary function taking in data and producing a glyph
//     HostGlyphFn<T> |
//     // old-style making some arbitrary glyphs and putting some relations between them
//     GlyphV4<K, ReservedKeywords> |
//     // you want to write some old-style glyphs, but also you want a data-driven object
//     // supports primitives and records
//     // the objectGlyph has a special name that can be used in relations
//     // TODO: should objectGlyph only be a HostGlyphFn<T> or a GlyphFn<T> more generally?
//     // I will generalize it for now so that everywhere you make a GlyphFn you have to call GlyphFn.mk
//     Id<GlyphV4<K, ReservedKeywords> & { objectGlyph: GlyphFn<T> }> |
//     // you might want to write some old-style glyphs and you want a data-driven record where each
//     // field is rendered as a separate glyph
//     Id<GlyphV4<K, ReservedKeywords | keyof T> & { fieldGlyphs: { [key in keyof OmitRef<T>]: GlyphFn<RelationInstanceE2<T[key]>> } }> |
//     // combining both!
//     Id<GlyphV4<K, ReservedKeywords | keyof T> & { objectGlyph: GlyphFn<T> } & { fieldGlyphs: { [key in keyof OmitRef<T>]: GlyphFn<RelationInstanceE2<T[key]>> } }>
//   )
//   : (
//     // an arbitrary function taking in data and producing a glyph
//     HostGlyphFn<T> |
//     // old-style making some arbitrary glyphs and putting some relations between them
//     GlyphV4<K, ReservedKeywords> |
//     // you want to write some old-style glyphs, but also you want a data-driven object
//     // supports primitives and records
//     // the objectGlyph has a special name that can be used in relations
//     // TODO: should objectGlyph only be a HostGlyphFn<T> or a GlyphFn<T> more generally?
//     // I will generalize it for now so that everywhere you make a GlyphFn you have to call GlyphFn.mk
//     Id<GlyphV4<K, ReservedKeywords> & { objectGlyph: GlyphFn<T> }>
//     // {
//     //   glyphs: Id<Omit<{ [key in K]: Glyph }, "$canvas"> & { [key in "$canvas"]?: never }>,
//     //   objectGlyph: GlyphFn<T>,
//     //   relations?: { fields: [K | "$canvas", K | "$canvas"], constraints: Constraint[] }[]
//     // }
//   )
// // use `unknown` for old-style case
// // `unknown` is "top": https://blog.logrocket.com/when-to-use-never-and-unknown-in-typescript-5e4d6c5799ad/
// // const foo: GlyphE3<unknown> = {
// //   glyphs: {},
// // }
// // simple glyph OR complex glyph OR simple data-driven glyph OR complex data-driven glyph
// // simple glyph U complex glyph ~ old interface (might be _exactly_ the old interface)
// // more generally, a complex glyph is a collection of glyphs of all sorts
// // simple data-driven glyph = data -> glyph
// // complex data-driven glyph = data -> collection of glyphs of all sorts
// // simple glyph, complex glyph, simple glyph function, complex glyph function
// // simple glyph = (simple glyph function)(data)
// // complex glyph = (complex glyph function)(data)
// // (do simple and complex glyphs have the same type? (Glyph?))
// // complex glyph function can pass data to its child functions in a structured way
// // complex glyph function has a "constant" glyph portion and a "function" glyph portion, which
// // contains sub-glyph functions for each part of its data
// // simple glyph function just passes data directly to renderer
// // map from data to a mark
// type SimpleGlyph<T> = (d: T) => Glyph
// // TODO: making glyphs optional causes bad things to happen!
// // https://unsafe-perform.io/posts/2020-02-21-existential-quantification-in-typescript
// type ComplexGlyph_<T, K extends string> = T extends object ? {
//   // TODO: idk why wrapping this type in Id works so well, but it seems to help TypeScript out
//   // glyphs: Id<Omit<{ [key in K]: Glyph }, keyof T> & { [key in keyof T]?: never }>,
//   glyphs: Id<Omit<{ [key in K]: Glyph }, keyof T>>,
//   dataGlyphs: SimpleGlyph<T> | { [key in keyof OmitRef<T>]: GlyphE2<RelationInstanceE2<T[key]>> },
//   relations?: { fields: [K | keyof T | "canvas", K | keyof T | "canvas"], constraints: Constraint[] }[]
// } : {
//   glyphs: { [key in K]: Glyph },
//   dataGlyphs: SimpleGlyph<T>,
//   relations?: { fields: [K | "canvas", K | "canvas"], constraints: Constraint[] }[]
// }
// const KONT = Symbol("KONT");
// type ComplexGlyph<T> = {
//   [KONT]: <R>(kont: <K extends string>(_: ComplexGlyph_<T, K>) => R) => R,
// }
// namespace ComplexGlyph {
//   export const mk = <T, K extends string>(complexGlyph_: ComplexGlyph_<T, K>): ComplexGlyph<T> => ({
//     [KONT]: (kont) => kont(complexGlyph_)
//   });
// }
// type GlyphFn<T> = {
//   [KONT]: <R>(kont: <K extends string>(_: GlyphFn_<T, K>) => R) => R,
// }
// namespace GlyphFn {
//   export const mk = <T, K extends string>(glyphFn_: GlyphFn_<T, K>): GlyphFn<T> => ({
//     [KONT]: (kont) => kont(glyphFn_)
//   });
// }
// // const hostGlyphFnExample: GlyphFn<{ item: string, value: number }> = GlyphFn.mk(
// //   (d: { item: string, value: number }) => nil()
// // )
// const glyphV3Example: GlyphFn<unknown> = GlyphFn.mk(
//   {
//     glyphs: {
//       "text": text({ contents: "hello world!", fontSize: "24px" }),
//     },
//     relations: [{
//       fields: ["$canvas", "$canvas"],
//       constraints: [],
//     }]
//   }
// );
// const objectGlyphExample: GlyphFn<number> = GlyphFn.mk(
//   {
//     glyphs: {
//       "text": text({ contents: "hello world!", fontSize: "24px" }),
//     },
//     objectGlyph: GlyphFn.mk((d: number) => text({ contents: "hello world!", fontSize: "24px" })),
//     relations: [{
//       fields: ["$canvas", "text"],
//       constraints: [],
//     }]
//   }
// );
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
// const dataGlyphsExample: GlyphFn<{ item: number }> = {
//   fieldGlyphs: {
//     item: nil(),
//   },
//   relations: [{
//     fields: ["$canvas", "$canvas"],
//     constraints: [],
//   }]
// }
// type GlyphV5 = {
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   glyphs?: Record<Key/* TODO */, GlyphV5>,
//   relations?: GlyphRelation<Key /* TODO */>[],
// }
// type GlyphRecord<K> = K extends Record<infer _, number> ? object : never
// type WorkingExistentialRecord_<T extends object, K extends object> = {
//   privateFields: Record<keyof K, number>,
//   publicFields: Record<keyof T, number>,
//   relations: [{
//     fields: [keyof K | keyof T | "$reserved", keyof K | keyof T | "$reserved"],
//     uses: number[]
//   }]
// }
// type WorkingExistentialRecord<T extends object> = {
//   [KONT]: <R>(kont: <K extends object>(_: WorkingExistentialRecord_<T, K>) => R) => R,
// }
// namespace WorkingExistentialRecord {
//   export const mk = <T extends object, K extends object>(exRecord_: WorkingExistentialRecord_<T, K>): WorkingExistentialRecord<T> => ({
//     [KONT]: (kont) => kont(exRecord_)
//   });
// }
// /********GOOD SECTION********/
// // K must not use reserved keywords
// export type GlyphV6_<
//   K extends object & Extract<keyof K, Reserved> extends never ? object : never,
//   Reserved extends Key,
//   > = {
//     bbox?: MaybeBBoxValues,
//     renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//     glyphs?: Record<keyof K, GlyphV6>
//     relations?: GlyphRelation<Reserved | keyof K>[],
//   }
// type GlyphV6 = {
//   [KONT]: <R>(kont: <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never, >(_: GlyphV6_<K, ReservedKeywords>) => R) => R,
// } | Mark /* TODO: escape hatch for now */
// namespace GlyphV6 {
//   export const mk = <K extends object & Extract<keyof K, ReservedKeywords> extends never ? object : never,>(exRecord_: GlyphV6_<K, ReservedKeywords>): GlyphV6 => ({
//     [KONT]: (kont) => kont(exRecord_)
//   });
// }
// type HostGlyphFnV6<T> = (d: T) => GlyphV6;
// // ensures T and K have disjoint keys if T is an object type
// type KConstraint<T, K> = T extends object
//   ? (Extract<keyof T, keyof K> extends never ? object : never)
//   : object
// // TODOs:
// // - need to remove Mark escape hatch(es?)
// // - need to test more examples
// type GlyphFnV6_<
//   T,
//   K extends KConstraint<T, K>
//   > =
//   T extends object ?
//   (
//     // an arbitrary function taking in data and producing a glyph
//     HostGlyphFnV6<T> |
//     // old-style making some arbitrary glyphs and putting some relations between them
//     GlyphV6_<K, ReservedKeywords> |
//     // you want to write some old-style glyphs, but also you want a data-driven object
//     // supports primitives and records
//     // the objectGlyph has a special name that can be used in relations
//     // TODO: should objectGlyph only be a HostGlyphFn<T> or a GlyphFn<T> more generally?
//     // I will generalize it for now so that everywhere you make a GlyphFn you have to call GlyphFn.mk
//     Id<GlyphV6_<K, ReservedKeywords> & { objectGlyph: GlyphFnV6<T> }> |
//     // you might want to write some old-style glyphs and you want a data-driven record where each
//     // field is rendered as a separate glyph
//     Id<GlyphV6_<K, ReservedKeywords | keyof T> & { fieldGlyphs: { [key in keyof OmitRef<T>]: GlyphFnV6<RelationInstanceE2<T[key]>> } }> |
//     // combining both!
//     Id<GlyphV6_<K, ReservedKeywords | keyof T> & { objectGlyph: GlyphFnV6<T> } & { fieldGlyphs: { [key in keyof OmitRef<T>]: GlyphFnV6<RelationInstanceE2<T[key]>> } }>
//   ) : (
//     // same as above except no fieldGlyphs
//     HostGlyphFnV6<T> |
//     GlyphV6_<K, ReservedKeywords> |
//     Id<GlyphV6_<K, ReservedKeywords> & { objectGlyph: GlyphFnV6<T> }>
//   )
// type GlyphFnV6<T> = {
//   [KONT]: <R>(kont: <K extends KConstraint<T, K>>(_: GlyphFnV6_<T, K>) => R) => R,
// }
// namespace GlyphFnV6 {
//   export const mk = <T, K extends KConstraint<T, K>>(exRecord_: GlyphFnV6_<T, K>): GlyphFnV6<T> => ({
//     [KONT]: (kont) => kont(exRecord_)
//   });
//   export const inhabited: GlyphFnV6<{}> = mk({
//     fieldGlyphs: {},
//     relations: [],
//   });
// }
// namespace GlyphV6Tests {
//   const glyphV3Example: GlyphFnV6<{}> = GlyphFnV6.mk(
//     {
//       glyphs: {
//         "text": text({ contents: "hello world!", fontSize: "24px" }),
//       },
//       relations: [{
//         fields: ["$canvas", "$canvas"],
//         constraints: [],
//       }]
//     }
//   );
//   const objectGlyphExample: GlyphFnV6<number> = GlyphFnV6.mk(
//     {
//       glyphs: {
//         "text": text({ contents: "hello world!", fontSize: "24px" }),
//       },
//       objectGlyph: GlyphFnV6.mk((d: number) => text({ contents: "hello world!", fontSize: "24px" })),
//       relations: [{
//         fields: ["$canvas", "text"],
//         constraints: [],
//       }]
//     }
//   );
//   // const fieldsGlyphExample_: GlyphFn_<number, "text"> = {
//   //   glyphs: {
//   //     "text": text({ contents: "hello world!", fontSize: "24px" }),
//   //   },
//   //   relations: [{
//   //     fields: ["$canvas", "$canvas"],
//   //     constraints: [],
//   //   }]
//   // }
//   // const fieldsGlyphExample: GlyphFn<number> = {
//   //   [KONT]: (kont) => kont({
//   //     glyphs: {
//   //       "text": text({ contents: "hello world!", fontSize: "24px" }),
//   //     },
//   //     relations: [{
//   //       fields: ["$canvas", "$canvas"],
//   //       constraints: [],
//   //     }]
//   //   })
//   // }
//   const fieldsGlyphExample: GlyphFnV6<{ item: number }> = GlyphFnV6.mk({
//     glyphs: {
//       foo: nil(),
//     },
//     fieldGlyphs: {
//       item: GlyphFnV6.mk((d: number) => nil()),
//     },
//     relations: [
//       {
//         fields: ["$canvas", "$canvas"],
//         constraints: []
//       },
//       {
//         fields: ["foo", "item"],
//         constraints: []
//       },
//     ]
//   });
// }
// // should succeed
// const exRecordExample: GlyphFnV6<{ "foo": number }> = GlyphFnV6.mk(
//   {
//     glyphs: {
//       "text": 5,
//     },
//     fieldGlyphs: {
//       "foo": GlyphFnV6.inhabited,
//     },
//     relations: [{
//       fields: ["$reserved", "text"],
//       constraints: [],
//     }]
//   }
// );
// // should succeed
// const exRecordExample2: GlyphFnV6<{ "foo": number }> = GlyphFnV6.mk(
//   {
//     glyphs: {
//       "text": 5,
//     },
//     fieldGlyphs: {
//       "foo": GlyphFnV6.inhabited,
//     },
//     relations: [{
//       fields: ["$reserved", "$reserved"],
//       constraints: [],
//     }]
//   }
// );
// // should succeed
// const exRecordExample3: GlyphFnV6<{ "foo": number }> = GlyphFnV6.mk(
//   {
//     glyphs: {
//       "text": 5,
//     },
//     fieldGlyphs: {
//       "foo": GlyphFnV6.inhabited,
//     },
//     relations: [{
//       fields: ["$reserved", "text"],
//       constraints: [],
//     }]
//   }
// );
// // should fail
// const exRecordExample4: GlyphFnV6<{ "foo": number }> = GlyphFnV6.mk(
//   {
//     glyphs: {
//       "text": 5,
//     },
//     fieldGlyphs: {
//       "foo": GlyphFnV6.inhabited,
//     },
//     relations: [{
//       fields: ["$reserved", "$text"],
//       constraints: [],
//     }]
//   }
// );
// type myDataE2 = { color1: string, color2: string, color3: string };
// const dataE2: myDataE2 = { color1: "firebrick", color2: "steelblue", color3: "black", /* "text": "hello world!" */ };
// export const exampleRelationInterface2: GlyphE2<myDataE2> = ComplexGlyph.mk({
//   glyphs: {
//     "text": text({ contents: "hello world!", fontSize: "24px" }),
//   },
//   dataGlyphs: {
//     "color1": (color1) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 }),
//     "color2": (color2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }),
//     "color3": (color3) => ellipse({ rx: 50, ry: 50, fill: color3 }),
//     // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
//   },
//   relations: [
//     // e.g. "color1" refers to the bbox of the "color1" glyph defined above
//     // { fields: ["text", "color2"], constraints: [vSpace(50.)] },
//     { fields: ["text", "color3"], constraints: [hSpace(50.), alignCenterY] },
//     // { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
//     // this works b/c canvas can have negative coordinates I think? not really sure
//     { fields: ["canvas", "color1"], constraints: [alignLeft] },
//     { fields: ["color1", "color2"], constraints: [alignCenterX] },
//   ]
// })
// type MarblesData = {
//   elements: RelationE2<number>,
// };
// const marblesData: MarblesData = {
//   elements: [1, 2, 3, 4],
// };
// const element: GlyphE2<number> = ComplexGlyph.mk({
//   glyphs: {
//     "circle": ellipse({ rx: 300 / 6, ry: 200 / 6, fill: "coral" }),
//   },
//   dataGlyphs: (n) => text({ contents: n.toString(), fontSize: "24px" }),
//   relations: [
//     // uh oh! no way to write constraints since dataGlyphs is anonymous!!!
//   ]
// });
// export const marbles: GlyphE2<MarblesData> = ComplexGlyph.mk({
//   glyphs: {
//     // "text": text({ text: "hello world!", fontSize: "24px" }),
//   },
//   dataGlyphs: {
//     elements: element,
//     // "color1": (color1) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 }),
//     // "color2": (color2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }),
//     // "color3": (color3) => ellipse({ rx: 50, ry: 50, fill: color3 }),
//     // "text": (textData) => text({ text: textData, fontSize: "calc(10px + 2vmin)" }),
//   },
//   relations: [
//     // e.g. "color1" refers to the bbox of the "color1" glyph defined above
//     // { fields: ["text", "color2"], constraints: [vSpace(50.)] },
//     // { fields: ["color1", "color3"], constraints: [hSpace(50.), alignCenterY] },
//     // { fields: ["color3", "text"], constraints: [vSpace(50.), alignCenterX] },
//     // // this works b/c canvas can have negative coordinates I think? not really sure
//     // { fields: ["canvas", "color1"], constraints: [alignLeft] },
//     // { fields: ["color1", "color2"], constraints: [alignCenterX] },
//   ]
// })
// // loses a bit of type safety b/c we _should_ be able to tell whether the return type is U or U[]
// // based on the input, but this type doesn't tell us
// // luckily this is only used internally. right???
// const mapRelation = <T, U>(r: T, f: (d: RelationInstanceE2<T>) => U): U | RelationE2<U> => {
//   if (r instanceof Array) {
//     return r.map(f)
//   } else {
//     // TODO: this cast seems sus, but it might not be b/c we check for array in the first branch
//     return f(r as RelationInstanceE2<T>)
//   }
// }
// export const lowerGlyphE2 = <T>(g: GlyphE2<T>): ((data: T) => Glyph) => {
//   if (typeof g === "function") {
//     // mark case
//     return g;
//   } else {
//     return (data: T): Glyph => {
//       const kont = g[KONT];
//       return kont((g) => {
//         let loweredDataGlyphs;
//         if (typeof g.dataGlyphs === "function") {
//           loweredDataGlyphs = g.dataGlyphs(data);
//         } else {
//           loweredDataGlyphs = objectMap(g.dataGlyphs, (k, v) => {
//             // apply the appropriate data function (mark or glyph)
//             // then if the input is an array, group its elements
//             // TODO: is there a simpler way to do this?
//             if (typeof v === "function") {
//               // mark case. just apply the mark function to the data
//               const relationMarks = mapRelation(data[k], v);
//               if (relationMarks instanceof Array) {
//                 return {
//                   children: relationMarks.reduce((o, m, i) => ({
//                     ...o, [i]: m
//                   }), {})
//                 }
//               } else {
//                 return relationMarks;
//               }
//             } else {
//               // glyphe2 case. lower the glyphe2 to a glyph function, then apply it to the data
//               const relationGlyphs = mapRelation(data[k], lowerGlyphE2(v));
//               if (relationGlyphs instanceof Array) {
//                 return {
//                   children: relationGlyphs.reduce((o, g, i) => ({
//                     ...o, [i]: g
//                   }), {})
//                 }
//               } else {
//                 return relationGlyphs;
//               }
//             }
//           });
//         };
//         return {
//           children: {
//             ...g.glyphs,
//             ...loweredDataGlyphs,
//           },
//           /* {
//             // map over g's dataGlyphs fields and apply the corresponding functions to data[field] (unwrapping
//             // array as necessary)
//             // if it's an array, make a new glyph with "0", "1", "2", ... as fields
//           }, */
//           relations: g.relations?.map((r) => ({
//             left: r.fields[0].toString(),
//             right: r.fields[1].toString(),
//             gestalt: r.constraints,
//           }))
//         }
//       })
//     }
//   }
// }
// export const loweredGlyphTest = lowerGlyphE2(exampleRelationInterface2)(dataE2);
// export const loweredGlyphMarbles = lowerGlyphE2(marbles)(marblesData);
// // let ref: any = {};
// // // probably want to be able to specify a key for equality just like in D3?
// // let _ =
// //   [
// //     { curr: ref("elms[0]"), next: ref("elms[1]") },
// //     { curr: ref("elms[1]"), next: ref("elms[2]") },
// //     { curr: ref("elms[2]"), next: ref("elms[3]") },
// //   ]
// // maybe have a special data field? and then relations always reference that?
// // that wouldn't work with labels I don't think, since they need to refer to one existing set and also have a
// // label set
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
// type Ref<Prefix extends string, T> = { $ref: true, path: addPrefix<ObjPath<T>, Prefix> }
// const ref = <Prefix extends string, T>(prefix: Prefix, path: ObjPath<T>): Ref<Prefix, T> => ({ $ref: true, path: (prefix + path) as addPrefix<ObjPath<T>, Prefix> });
// // not sure how to get TypeScript to infer the Prefix properly
// // const ref2 = <Prefix extends string, T>(path: addPrefix<ObjPath<T>, Prefix>): Ref<Prefix, T> => ({ $ref: true, path });
// type myList<T> = {
//   elements: RelationE2<T>,
//   // TODO: can refine Ref type even more to say what it refers to
//   neighbors: RelationE2<{
//     curr: Ref<"elements", RelationE2<T>>, next: Ref<"elements", RelationE2<T>>
//   }>
// }
// // export const MyListGlyphE2: GlyphE2<myList<number>> = ({
// //   dataGlyphs: {
// //     "elements": (element) => rect({ width: element, height: 200 / 3, fill: "black" }),
// //     "neighbors": ({
// //       /* TODO: not sure if/how refs should be rendered */
// //       /* for now we will say it shouldn't be rendered */
// //       dataGlyphs: {},
// //       relations: [{
// //         fields: ["curr", "next"],
// //         constraints: [vSpace(10.)]
// //       }]
// //     }),
// //   }
// // })
// const myListExample: myList<number> = {
//   elements: [1, 2, 4, 1],
//   neighbors: [
//     { curr: ref("elements", "[0]"), next: ref("elements", "[1]") },
//     { curr: ref("elements", "[1]"), next: ref("elements", "[2]") },
//     { curr: ref("elements", "[2]"), next: ref("elements", "[3]") },
//   ],
// }
// // declare function render<T>(data: T, glyph: GlyphE2<T>): JSX.Element
// // render(myListExample, MyListGlyphE2);
// // type myTable<T> = {
// //   elements: RelationE2<T>,
// //   rows: RelationE2<{
// //     curr: Ref<"elements", RelationE2<T>>, next: Ref<"elements", RelationE2<T>>
// //   }>,
// //   cols: RelationE2<{
// //     curr: Ref<"elements", RelationE2<T>>, next: Ref<"elements", RelationE2<T>>
// //   }>,
// // }
// // export const MyTableGlyphE2: GlyphE2<myTable<number>> = ({
// //   glyphs: {
// //     "elements": (element) => rect({ width: element, height: 200 / 3, fill: "black" }),
// //     "rows": ({
// //       glyphs: {},
// //       gestalt: [{
// //         left: "curr",
// //         right: "next",
// //         rels: [hSpace(10.)]
// //       }]
// //     }),
// //     "cols": ({
// //       glyphs: {},
// //       gestalt: [{
// //         left: "curr",
// //         right: "next",
// //         rels: [vSpace(10.)]
// //       }]
// //     }),
// //   }
// // })
// // const myTableExample: myTable<number> = {
// //   elements: [1, 2, 4, 1],
// //   rows: [
// //     { curr: ref("elements", "[0]"), next: ref("elements", "[1]") },
// //     { curr: ref("elements", "[2]"), next: ref("elements", "[3]") },
// //   ],
// //   cols: [
// //     { curr: ref("elements", "[0]"), next: ref("elements", "[2]") },
// //     { curr: ref("elements", "[1]"), next: ref("elements", "[3]") },
// //   ],
// // }
// // render(myTableExample, MyTableGlyphE2);
export default 5;
//# sourceMappingURL=exampleRelationInterfaceExistential.js.map