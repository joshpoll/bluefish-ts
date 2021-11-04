import { hSpace, vSpace, alignCenterY, alignCenterX, alignLeft, alignBottom, alignRight, alignTop, Gestalt, containsShrinkWrap, contains, alignBottomStrong, alignLeftStrong, alignTopStrong, alignRightStrong } from '../gestalt';
import { debug, ellipse, line, nil, rect, text } from '../mark';
import { Glyph, Relation } from '../compile';
import _, { split } from 'lodash';
import { zipWith } from 'lodash';
import { MaybeBBoxValues, BBoxValues } from '../kiwiBBoxTransform';
import { emitKeypressEvents } from 'readline';

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
    char: "R ",
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
    char: "R ",
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
