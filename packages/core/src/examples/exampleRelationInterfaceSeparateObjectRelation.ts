import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignTop, Gestalt } from '../gestalt';
import { ellipse, nil, rect, text } from '../mark';
import { Glyph as GlyphCompile, Mark as MarkCompile, Relation as RelationCompile } from '../compile';
import { BBoxValues, MaybeBBoxValues } from '../kiwiBBoxTransform';
import { zipWith } from 'lodash';
import _ from 'lodash';

type myData = { color1: string, color2: string, color3: string, text: string };

type Relation<T> = T[]

// unwraps a Relation into a RelationInstance, and keeps RelationInstances unchanged
type RelationInstance<T> = T extends Array<unknown> ? T[number] : T

// https://stackoverflow.com/a/50900933
type AllowedFieldsWithType<Obj, Type> = {
  [K in keyof Obj]: Obj[K] extends Type ? K : never
};

// https://stackoverflow.com/a/50900933
type ExtractFieldsOfType<Obj, Type> = AllowedFieldsWithType<Obj, Type>[keyof Obj]

type OmitRef<T> = Omit<T, ExtractFieldsOfType<T, Ref<any>>>

type Mark = {
  bbox: MaybeBBoxValues,
  renderFn: (canvas: BBoxValues, index?: number) => JSX.Element,
}

// https://stackoverflow.com/a/49683575. merges record intersection types
type Id<T> = T extends infer U ? { [K in keyof U]: U[K] } : never

type ObjectGlyph<T> = (d: T) => Mark;

type RelationGlyph<T> = Id<
  // optional mark on a complex glyph
  Partial<Mark> &
  // complex glyph spec
  {
    glyphs: { [key in keyof OmitRef<T>]: Glyph<RelationInstance<T[key]>> },
    gestalt?: { left: keyof T | "canvas", right: keyof T | "canvas", rels: Gestalt[] }[]
  }
>

type Glyph<T> =
  ((d: T) => Mark) |
  Id<
    // optional mark on a complex glyph
    Partial<Mark> &
    // complex glyph spec
    {
      glyphs: { [key in keyof OmitRef<T>]: Glyph<RelationInstance<T[key]>> },
      gestalt?: { left: keyof T | "canvas", right: keyof T | "canvas", rels: Gestalt[] }[]
    }
  >

export const exampleRelationInterface2: Glyph<myData> = ({
  glyphs: {
    "color1": (color1) => rect({ width: 500 / 3, height: 200 / 3, fill: color1 }),
    "color2": (color2) => ellipse({ rx: 300 / 6, ry: 200 / 6, fill: color2 }),
    "color3": (color3) => ellipse({ rx: 50, ry: 50, fill: color3 }),
    "text": (textData) => text({ contents: textData, fontSize: "calc(10px + 2vmin)" }),
  },
  gestalt: [
    // e.g. "color1" refers to the bbox of the "color1" glyph defined above
    { left: "color1", right: "color2", rels: [vSpace(50.)] },
    { left: "color1", right: "color3", rels: [hSpace(50.), alignCenterY] },
    { left: "color3", right: "text", rels: [vSpace(50.), alignCenterX] },
    { left: "canvas", right: "color1", rels: [alignLeft] },
  ]
})


// maybe have a special data field? and then relations always reference that?
// that wouldn't work with labels I don't think, since they need to refer to one existing set and also have a
// label set

// ObjPath: https://twitter.com/SferaDev/status/1413761483213783045
type StringKeys<O> = Extract<keyof O, string>;
type NumberKeys<O> = Extract<keyof O, number>;

type Values<O> = O[keyof O]

type ObjPath<O> = O extends Array<unknown>
  ? Values<{ [K in NumberKeys<O>]: `[${K}]` | `[${K}].${ObjPath<O[K]>}` }>
  : O extends Record<string, unknown>
  ? Values<{
    [K in StringKeys<O>]: ObjPath<O[K]> extends "" ? K : `${K}.${ObjPath<O[K]>}`
  }>
  : ""

type Ref<T> = { $ref: true, path: ObjPath<T> }

type myList<T> = {
  elements: Relation<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: Relation<{ curr: Ref<myList<T>>, next: Ref<myList<T>> }>
}

export const MyListGlyphE2: Glyph<myList<number>> = ({
  glyphs: {
    "elements": (element) => rect({ width: element, height: 200 / 3, fill: "black" }),
    "neighbors": ({
      /* TODO: not sure if/how refs should be rendered */
      /* for now we will say it shouldn't be rendered */
      glyphs: {},
      gestalt: [{
        left: "curr",
        right: "next",
        rels: [vSpace(10.)]
      }]
    }),
  }
})

type Label<Ctxt> = { object: Ref<Ctxt>, text: string };

export const label: Glyph<Label<unknown>> = ({
  glyphs: {
    "text": (textData) => text({ contents: textData, fontSize: "calc(10px + 2vmin)" }),
  },
  gestalt: [{
    left: "object",
    right: "text",
    rels: [vSpace(5.)]
  }]
})
