import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignRight, alignTop, Gestalt, contains, alignBottomStrong, alignLeftStrong, alignTopStrong, alignRightStrong } from '../gestalt';
import { ellipse, nil, rect, text } from '../mark';
import { Glyph, Relation } from '../compile';
import _ from 'lodash';
import { zipWith } from 'lodash';
import { MaybeBBoxValues, BBoxValues } from '../kiwiBBoxTransform';

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
  Id<
    // optional mark on a complex glyph
    Partial<MarkE2> &
    // complex glyph spec
    {
      glyphs: { [key in keyof OmitRef<T>]: GlyphE2<RelationInstanceE2<T[key]>> },
      gestalt?: { left: keyof T | "canvas", right: keyof T | "canvas", rels: Gestalt[] }[]
    }
  >

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

// type Ref<Prefix extends string, T> = { $ref: true, path: addPrefix<ObjPath<T>, Prefix> }

type Ref<T, Field extends string & keyof T> = { $ref: true, path: addPrefix<ObjPath<T[Field]>, Field> }

// TypeScript doesn't seem to be able to infer the type properlyi.
const ref = <T, Field extends string & keyof T>(field: Field, path: ObjPath<T[Field]>): Ref<T, Field> => ({ $ref: true, path: (field + path) as addPrefix<ObjPath<T[Field]>, Field> });


// export type GlyphData<T> = {
//   data: T,
//   bbox?: MaybeBBoxValues,
//   renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
//   children?: { [key: string]: (data: T) => Glyph },
//   relations?: Relation[]
// }

export type GlyphArray<T> = {
  data: T[],
  bbox?: MaybeBBoxValues,
  renderFn?: (canvas: BBoxValues, index?: number) => JSX.Element,
  childGlyphs: (d: T, i: number) => Glyph,
  listGestalt: Gestalt[],
  relations?: Relation[]
}

// TODO: is there a nicer way to handle 0-length lists?
const glyphArrayToGlyph = <T>(glyphArray: GlyphArray<T>): Glyph => {
  if (glyphArray.data.length === 0) {
    return nil();
  } else {
    return {
      bbox: glyphArray.bbox,
      renderFn: glyphArray.renderFn,
      children: glyphArray.data
        .reduce((o: { [key: string]: Glyph }, data: T, i) => ({ ...o, [i]: glyphArray.childGlyphs(data, i) }),
          {}),
      relations: [
        ...zipWith(
          _.range(glyphArray.data.length - 1),
          _.range(1, glyphArray.data.length),
          (curr, next) => ({ left: curr.toString(), right: next.toString(), gestalt: glyphArray.listGestalt })
        ),
        ...glyphArray.relations ?? [],
      ]
    }
  }
}


// const glyphDataToGlyph = <T>(glyphData: GlyphData<T>): Glyph => {
//   const glyphDataChildren = glyphData.children ?? {};
//   const keys = Object.keys(glyphDataChildren);
//   const children = keys.reduce((o: { [key: string]: Glyph }, key) => ({
//     ...o, [key]: glyphDataChildren[key](glyphData.data)
//   }), {});
//   return {
//     bbox: glyphData.bbox,
//     renderFn: glyphData.renderFn,
//     children,
//     relations: glyphData.relations,
//   };
// }

type Marks = {
  strong?: { active: boolean },
  em?: { active: boolean },
  comment?: { active: boolean },
};

type TextData = {
  char: string,
  marks: Marks,
  spanBoundary?: boolean,
};

const splitTextData = (textData: TextData): TextData[] =>
  textData.char.split('')
    .map((char) => ({
      char,
      marks: textData.marks,
    }));

const splitTextDataArray = (textData: TextData[]): TextData[] => textData.flatMap((td) => {
  const splitTD = splitTextData(td);
  splitTD[0].spanBoundary = true;
  return splitTD;
});

// input: split array of chars
// output: indices of spanBoundaries
const computeSpanBoundaries = (textData: TextData[]): number[] => textData.flatMap((d, i) => d.spanBoundary ? [i] : []);

// input: array of boundary indices
// output: array of array of indices for each span
const computeSpanRanges = (spanBoundaries: number[], end: number) => zipWith(
  spanBoundaries,
  [...spanBoundaries.slice(1), end],
  (curr, next) => _.range(curr, next),
);

const textData: TextData[] = [
  {
    char: "Intro. ",
    marks: {
      em: { active: true },
    },
  },
  {
    char: "The ",
    marks: {},
  },
  {
    char: "RS ",
    marks: {
      strong: { active: true },
    },
  },
  {
    char: "Titanic",
    marks: {
      strong: { active: true },
      em: { active: true },
    },
  },
  {
    char: " was",
    marks: {},
  },
];

const update = {
  // inclusive, exclusive
  span: [9, 19],
  marks: {
    comment: { active: true },
  }
};

const newTextData: TextData[] = [
  {
    char: "Intro. ",
    marks: {
      em: { active: true },
    },
  },
  {
    char: "Th",
    marks: {},
  },
  {
    char: "e ",
    marks: {
      comment: { active: true },
    },
  },
  {
    char: "RS ",
    marks: {
      strong: { active: true },
      comment: { active: true },
    },
  },
  {
    char: "Tita",
    marks: {
      strong: { active: true },
      em: { active: true },
      comment: { active: true },
    },
  },
  {
    char: "nic",
    marks: {
      strong: { active: true },
      em: { active: true },
    },
  },
  {
    char: " was",
    marks: {},
  },
]

const charData = splitTextDataArray(textData);
const spanBoundaries = computeSpanBoundaries(charData);
const spanRanges = computeSpanRanges(spanBoundaries, charData.length);
const newCharData = splitTextDataArray(newTextData);
const newSpanBoundaries = computeSpanBoundaries(newCharData);
const newSpanRanges = computeSpanRanges(newSpanBoundaries, newCharData.length);
console.log("charData", charData);
console.log("newSpanRanges", newSpanRanges, newSpanRanges[newSpanRanges.length - 1][newSpanRanges[newSpanRanges.length - 1].length - 1]);

const charNumber = (i: number, strong: boolean): Glyph => (text({ contents: i.toString(), fontSize: "12px", fill: "rgb(127,223,255)", fontWeight: (strong ? "bold" : "") }))

// TODO: hack using _ instead of <space> so height is correct. not sure what a better solution is
const styledChar = ({ char, marks }: TextData): Glyph => text({ contents: char === " " ? "_" : char, fontSize: "24px", fontWeight: (marks.strong ? "bold" : ""), fontStyle: (marks.em ? "italic" : ""), fill: char === " " ? "none" : "black" })

const marksToList = (marks: Marks): string[] => {
  const strong = marks.strong ? ["strong"] : [];
  const em = marks.em ? ["em"] : [];
  const comment = marks.comment ? ["comment"] : [];

  return [...strong, ...em, ...comment];
}

const spanDescriptionList = (marks: Marks): GlyphArray<string> => ({
  data: marksToList(marks),
  childGlyphs: (d) => {
    switch (d) {
      case "strong":
        return text({ contents: "B", fontSize: "16px", fontWeight: "bold", fill: "black" });
      case "em":
        return text({ contents: "I", fontSize: "16px", fontStyle: "italic", fontFamily: "serif", fill: "black" });
      case "comment":
        return text({ contents: "C", fontSize: "16px", fontWeight: "bold", fill: "rgb(248,208,56)" });
      default:
        throw "unreachable"
    }
  },
  listGestalt: [alignCenterY, hSpace(5.)],
});

const spanDescription = (marks: Marks): Glyph => {
  if (Object.keys(marks).length !== 0) {
    return {
      // renderFn: debug,
      children: {
        "{": text({ contents: "{", fontSize: "16px", fill: "gray" }),
        "spanDescriptionList": glyphArrayToGlyph(spanDescriptionList(marks)),
        "}": text({ contents: "}", fontSize: "16px", fill: "gray" }),
      },
      relations: [
        {
          left: "{",
          right: "spanDescriptionList",
          gestalt: [alignCenterY, hSpace(2.)],
        },
        {
          left: "spanDescriptionList",
          right: "}",
          gestalt: [alignCenterY, hSpace(2.)],
        },
      ]
    }
  } else {
    return nil();
  }
};

const charBlock = (i: number, data: TextData): Glyph => ({
  children: {
    "idx": charNumber(i, data.spanBoundary || false),
    "char": styledChar(data),
  },
  relations: [
    {
      left: "idx",
      right: "char",
      gestalt: [alignCenterX, vSpace(5.)],
    },
  ]
});

const styledTextArray = (data: TextData[]): GlyphArray<TextData> => ({
  data,
  childGlyphs: (d, i) => charBlock(i, d),
  listGestalt: [alignTop, hSpace(5.)],
})

const span = (data: TextData): Glyph => ({
  children: {
    "tick": rect({ height: 10., width: 1, fill: "gray" }),
    "axis": rect({ height: 1, fill: "gray" }),
    "spanDescription": spanDescription(data.marks),
  },
  relations: [
    {
      left: "tick",
      right: "axis",
      gestalt: [alignLeft, vSpace(0.)],
    },
    {
      left: "axis",
      right: "spanDescription",
      gestalt: [alignLeft, vSpace(5.)],
    }
  ]
})

const spanHighlight = (highlight: boolean): Glyph => rect({ fill: highlight ? "rgb(248,208,56)" : "none" });

const spanArray = (data: TextData[]): GlyphArray<TextData> => ({
  data,
  childGlyphs: (d) => span(d),
  listGestalt: [hSpace(0.)],
})

const spanHighlightArray = (data: TextData[]): GlyphArray<TextData> => ({
  data,
  childGlyphs: (d) => spanHighlight(d.marks.comment ? true : false),
  listGestalt: [hSpace(0.)], // closes up gaps between spans, but not sure how to deterministically pick a direction
})

type BFList<T> = {
  elements: RelationE2<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: RelationE2<{
    curr: Ref<BFList<T>, "elements">, next: Ref<BFList<T>, "elements">
  }>
}

declare function bfList<T>(set: RelationE2<T>): BFList<T>

type BFSet<T> = RelationE2<T>;

type Char = { char: string, marks: Marks };
type Chars = BFList<Char>;

// TODO: these brackets really seem like they should belong to the enclosing object, because they
// are "containing" the elements in the same way that the record contains its elements
// and if you want to change the representation you would probably use a different sort of
// containment. so the container is a collection of glyphs that are related to the children
// this seems like some form of escape hatch, and it seems like strictly more expressive like a
// virus that takes over the expressiveness of the language
// so you have (d: Data) => Mark, which gets generalized to (d: Data) => EscapeHatchGlyph, where
// EscapeHatchGlyph acts like the more expressive version where the glyphs aren't tied to data
// ok but what about this compromise: allow an expressive Glyph that _isn't_ driven by any data!
// thus its purpose is to visualize a container and nothing else basically
// idkkkkk
type Span<Data, CharSource extends string & keyof Data> = { text: RelationE2<Ref<Data, CharSource>>, spanBoundary: true, markDescription: { leftBrack: true, marks: Marks, rightBrack: true } };
type Spans<Data, CharSource extends string & keyof Data> = RelationE2<Span<Data, CharSource>>;

type Data = {
  /* TODO: add reelation between spanIdxs and chars? */
  spanIdxs: RelationE2<{ idx: number, spanStart: boolean }>,
  chars: Chars,
  spans: Spans<Data, "chars">,
  newSpans: Spans<Data, "chars">,
  spanHighlights: RelationE2<{ span: Ref<Data, "newSpans">, highlightColor: string }>,
  comments: RelationE2<{ span: Ref<Data, "newSpans">, commentColor: string }>,
}

const myData: Data = {
  spanIdxs: [{ idx: 0, spanStart: true }, { idx: 1, spanStart: false }, { idx: 2, spanStart: false }, /* ... */],
  chars: bfList([{ char: "I", marks: { em: { active: true } } }, /* ... */]),
  spans: [
    { text: [ref("chars", ".elements[0]"), ref("chars", ".elements[1]"), /* ... */], markDescription: { leftBrack: true, marks: { em: { active: true } }, rightBrack: true }, spanBoundary: true }, /* ... */],
  newSpans: [{ text: [ref("chars", ".elements[0]"), ref("chars", ".elements[1]"), /* ... */], markDescription: { leftBrack: true, marks: { em: { active: true } }, rightBrack: true }, spanBoundary: true }, /* ... */],
  spanHighlights: [{ span: ref("newSpans", "[0]"), highlightColor: "green" }],
  comments: [{ span: ref("newSpans", "[2]"), commentColor: "yellow" }],
}

// const myDataGlyph: GlyphE2<Data> = {
//   glyphs: {
//     "spanIdxs": ({ idx, spanStart }) => text({ text: idx.toString(), fontSize: "12px", fill: "rgb(127,223,255)", "fontWeight": (spanStart ? "bold" : "") }),
//     "chars": {
//       glyphs: {
//         "elements": ({ char, marks }) => text({ text: char === " " ? "_" : char, fontSize: "24px", fontWeight: (marks.strong ? "bold" : ""), fontStyle: (marks.em ? "italic" : ""), fill: char === " " ? "none" : "black" }),
//         "neighbors": {
//           glyphs: {},
//           gestalt: [{
//             left: "curr",
//             right: "next",
//             rels: [alignTop, hSpace(5.)],
//           }]
//         },
//       }
//     },
//     "spans": {
//       glyphs: {
//         text: (_) => nil(),
//         /* TODO */
//         marks: (_) => nil(),
//       }
//     },
//     "newSpans": {
//       glyphs: {
//         text: (_) => nil(),
//         /* TODO */
//         marks: (_) => nil(),
//       }
//     },
//     "spanHighlights": {
//       glyphs: {
//         /* TODO */
//         highlightColor: (_) => nil(),
//       },
//       gestalt: [/* TODO */]
//     },
//     "comments": {
//       glyphs: {
//         /* TODO */
//         commentColor: (_) => nil(),
//       },
//       gestalt: [/* TODO */]
//     },
//   },
//   gestalt: [/* TODO */],
// }

export const textspans: Glyph = {
  children: {
    // "text": glyphArrayToGlyph(styledTextArray(charData)),
    // "spans": glyphArrayToGlyph(spanArray(textData)),
    "spanHighlights": glyphArrayToGlyph(spanHighlightArray(newTextData)),
    "text": glyphArrayToGlyph(styledTextArray(newCharData)),
    "spans": glyphArrayToGlyph(spanArray(textData)),
    "newSpans": glyphArrayToGlyph(spanArray(newTextData)),
  },
  relations:
    [
      {
        left: "text",
        right: `spans/${spanBoundaries.length - 1}`,
        gestalt: [alignRight],
      },
      ...spanBoundaries.map((d, i) => ({
        left: `text/${d}`,
        right: `spans/${i}`,
        gestalt: [alignLeft, vSpace(5.)],
      })),
      {
        left: "text",
        right: `newSpans/${newSpanBoundaries.length - 1}`,
        gestalt: [alignRight],
      },
      ...newSpanBoundaries.map((d, i) => ({
        left: `text/${d}`,
        right: `newSpans/${i}`,
        gestalt: [alignLeft, vSpace(85.)],
      })),
      ...newSpanRanges.flatMap((spanRange, i) => spanRange.map((span) => {
        console.log("spanRanges", i, span);
        return {
          left: `spanHighlights/${i}`,
          right: `text/${span}/char`,
          gestalt: [...contains, alignLeftStrong, alignTopStrong, alignBottomStrong],
        }
      })),
      {
        left: `spanHighlights/${newSpanRanges.length - 1}`,
        right: `text/${newSpanRanges[newSpanRanges.length - 1][newSpanRanges[newSpanRanges.length - 1].length - 1]}/char`,
        gestalt: [alignRightStrong],
      }
    ],
}

type BFTable<T> = {
  elements: RelationE2<T>,
  rows: BFList<RelationE2<{ curr: Ref<BFTable<T>, "elements">, next: Ref<BFTable<T>, "elements"> }>>,
  cols: BFList<RelationE2<{ curr: Ref<BFTable<T>, "elements">, next: Ref<BFTable<T>, "elements"> }>>,
}

/* 
type BFList<T> = {
  elements: RelationE2<T>,
  // TODO: can refine Ref type even more to say what it refers to
  neighbors: RelationE2<{
    curr: Ref<BFList<T>, "elements">, next: Ref<BFList<T>, "elements">
  }>
}
*/

type BFTableInline<T> = {
  elements: RelationE2<T>,
  rows: RelationE2<RelationE2<Ref<BFTableInline<T>, "elements">>>,
  cols: RelationE2<RelationE2<Ref<BFTableInline<T>, "elements">>>,
  rowNeighbors: RelationE2<{
    curr: Ref<BFTableInline<T>, "rows">, next: Ref<BFTableInline<T>, "rows">
  }>
  colNeighbors: RelationE2<{
    curr: Ref<BFTableInline<T>, "cols">, next: Ref<BFTableInline<T>, "cols">
  }>
  // rowsInline: {
  //   elements: RelationE2<{
  //     elements: RelationE2<Ref<BFTableInline<T>, "elements">>, neighbors: RelationE2<{
  //       curr: Ref<BFList<Ref<BFTableInline<T>, "elements">>, "elements">, next: Ref<BFList<Ref<BFTableInline<T>, "elements">>, "elements">,
  //     }>
  //   }>, neighbors: RelationE2<{
  //     curr: Ref<BFList<{
  //       elements: RelationE2<Ref<BFTableInline<T>, "elements">>, neighbors: RelationE2<{
  //         curr: Ref<BFList<Ref<BFTableInline<T>, "elements">>, "elements">, next: Ref<BFList<{
  //           elements: RelationE2<Ref<BFTableInline<T>, "elements">>, neighbors: RelationE2<{
  //             curr: Ref<BFList<Ref<BFTableInline<T>, "elements">>, "elements">, next: Ref<BFList<Ref<BFTableInline<T>, "elements">>, "elements">,
  //           }>
  //         }>, "elements">,
  //       }>
  //     }>, "elements">, next: Ref<BFList<Ref<BFTableInline<T>, "elements">>, "elements">,
  //   }>
  // }
  // rows: BFList<RelationE2<{ curr: Ref<BFTable<T>, "elements">, next: Ref<BFTable<T>, "elements"> }>>,
  // cols: BFList<RelationE2<{ curr: Ref<BFTable<T>, "elements">, next: Ref<BFTable<T>, "elements"> }>>,
}